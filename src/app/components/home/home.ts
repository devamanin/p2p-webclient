import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { AuthService } from '../../services/auth.service';
import { SignalingService } from '../../services/signaling.service';
import { FriendService, Friend, FriendRequest } from '../../services/friend.service';
import { ChatService, ChatPreview, ChatMessage } from '../../services/chat.service';
import { Subscription } from 'rxjs';

declare var adsbygoogle: any;

// States: 'idle' | 'searching' | 'connected'
type AppState = 'idle' | 'searching' | 'connected';
type FriendStatus = 'none' | 'sent' | 'received' | 'friends';

import { AdCoinPill } from '../ad-coin-pill/ad-coin-pill';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdCoinPill],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('localPreview') localPreview!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('chatScroll') chatScroll!: ElementRef<HTMLDivElement>;

  // UI state
  public state: AppState = 'idle';
  public showFilters = false;
  public showProfileDrawer = false;
  public isEditingProfile = false;
  public localStream: MediaStream | null = null;
  public isConnected = false;
  public isMuted = false;
  public isCameraOff = false;
  public isFullScreen = false;
  public remoteMetadata: any = null;
  public dots = '';
  private dotsTimer: any = null;

  // Friend logic
  public friendStatus: FriendStatus = 'none';

  // In-call Chat
  public isInCallChatOpen = false;
  public inCallMessages: {sender: 'me' | 'peer', text: string}[] = [];
  public inCallChatInput = '';
  public hasUnreadInCallMessages = false;

  // Social panel
  public showSocialPanel = false;
  public socialTab: 'chats' | 'friends' | 'requests' = 'chats';
  public friends: Friend[] = [];
  public pendingRequests: FriendRequest[] = [];
  public activeChats: ChatPreview[] = [];
  public showAddFriendDialog = false;
  public addFriendUid = '';
  public addFriendStatus = '';
  public activeChatFriend: { uid: string; name: string; photoUrl?: string } | null = null;
  public chatMessages: ChatMessage[] = [];
  public chatInput = '';

  // Matching
  public tipIndex = 0;
  public tips = [
    "Be respectful to your matches!",
    "Good lighting makes a huge difference.",
    "Use interests to find similar people.",
  ];

  // Filter state
  public genders = ['Any Gender', 'Male', 'Female'];
  public selfGenders = ['Male', 'Female'];
  public availableInterests = ['Gaming', 'Movies', 'Fitness', 'Music', 'Travel', 'Art', 'Tech'];
  public availableLocations = ['Global', 'India', 'USA', 'UK', 'Australia', 'Canada', 'Europe'];
  public currentMyGender = 'Male';
  public currentAge = 18;
  public currentTargetGender = 'Any Gender';
  public currentInterests: string[] = [];
  public currentLocations: string[] = ['Global'];

  private subscriptions: Subscription[] = [];
  private tipInterval: any = null;
  private matchRetryTimeout: any = null;
  private isSearching = false;
  private coinCost = 10;
  private searchNonce = 0;

  constructor(
    public prefs: UserPreferencesService,
    private authService: AuthService,
    private signalingService: SignalingService,
    private friendService: FriendService,
    private chatService: ChatService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.authService.user$.subscribe(user => {
        console.log('[Home] Auth User:', user ? user.email : 'No user');
        if (user) {
          if (user.displayName) {
            this.prefs.setName(user.displayName);
          }
          if (user.photoURL) {
            console.log('[Home] Setting Profile Picture:', user.photoURL);
            this.prefs.setProfilePicture(user.photoURL);
          }
          this.cdr.detectChanges();

          this.friendService.syncUserProfile(
            this.prefs.name,
            this.prefs.profilePicture || '',
            this.prefs.age,
            this.prefs.myGender,
            this.prefs.detectedLocation
          );
        }
      })
    );

    // Initial load from prefs
    this.currentMyGender = this.prefs.myGender;
    this.currentAge = this.prefs.age;
    this.currentTargetGender = this.prefs.targetGender;
    this.currentInterests = [...this.prefs.interests];
    this.currentLocations = [...this.prefs.locations];

    // Load social data once
    this.loadSocialData();
  }

  async ngAfterViewInit() {
    await this.startLocalCamera();
    this.setupSignalingSubscriptions();
    
    document.addEventListener('fullscreenchange', () => {
      this.isFullScreen = !!document.fullscreenElement;
      this.cdr.detectChanges();
    });

    // Initialize Google AdSense units
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.warn('[Home] AdSense initialization failed:', e);
    }
  }

  private async startLocalCamera() {
    try {
      // Use SignalingService to get the camera to prevent duplicate requests
      this.localStream = await this.signalingService.openUserMedia();
      if (this.localPreview?.nativeElement) {
        this.localPreview.nativeElement.srcObject = this.localStream;
        this.localPreview.nativeElement.muted = true;
        this.localPreview.nativeElement.play().catch(() => {});
      }
    } catch (e) {
      console.warn('[Home] Camera preview not available:', e);
    }
  }

  private setupSignalingSubscriptions() {
    // Peer joined (creator gets this)
    this.subscriptions.push(
      this.signalingService.peerJoined$.subscribe(() => {
        this.ngZone.run(() => {
          console.log('[Home] Peer joined, updating UI...');
          this.remoteMetadata = this.signalingService.remoteMetadata;
          this.onMatched(); // Deduct coins and update state
        });
      })
    );

    // Remote stream arrived
    this.subscriptions.push(
      this.signalingService.remoteStream$.subscribe(stream => {
        this.ngZone.run(() => {
          if (stream) {
            console.log('[Home] Remote stream received');
            this.isConnected = true;
            this.state = 'connected'; // Ensure state is connected if we have video
            this.remoteMetadata = this.signalingService.remoteMetadata;
            if (this.remoteVideo?.nativeElement) {
              this.remoteVideo.nativeElement.srcObject = stream;
              this.remoteVideo.nativeElement.play().catch(() => {});
            }
            this.cdr.detectChanges();
          } else {
            console.log('[Home] Remote stream cleared');
            if (this.remoteVideo?.nativeElement) {
              this.remoteVideo.nativeElement.srcObject = null;
            }
            this.cdr.detectChanges();
          }
        });
      })
    );

    // Session ended
    this.subscriptions.push(
      this.signalingService.sessionEnded$.subscribe(() => {
        this.ngZone.run(() => {
          console.log('[Home] Session ended by remote peer');
          this.friendStatus = 'none'; // Reset friend status on disconnect
          if (this.state === 'connected') {
            this.signalingService.hangUp().then(() => {
              if (this.isConnected) {
                console.log('[Home] Partner disconnected, automatically finding next match...');
                this.stopMatchingTimers();
                this.isConnected = false;
                this.remoteMetadata = null;
                this.isMuted = false;
                this.isCameraOff = false;
                this.friendStatus = 'none';
                this.inCallMessages = [];
                this.inCallChatInput = '';
                this.isInCallChatOpen = false;
                this.hasUnreadInCallMessages = false;
                this.isSearching = false;
                
                this.state = 'idle';
                this.startMatching();
              } else {
                console.log('[Home] Partner dropped during connection, resuming search...');
                this.state = 'searching';
                this.isSearching = false;
                this.scheduleMatchmaking(1000);
              }
            });
          } else if (this.state === 'searching') {
            this.isSearching = false;
            this.signalingService.stopWaiting().then(() => {
              if (this.state === 'searching') {
                this.scheduleMatchmaking(1000);
              }
            });
          }
        });
      })
    );

    // Messages (for system friend requests and in-call chat)
    this.subscriptions.push(
      this.signalingService.message$.subscribe(msg => {
        if (!msg) return;
        
        if (msg === 'SYS:FRIEND_REQUEST') {
          this.ngZone.run(() => {
            if (this.friendStatus === 'none') {
              this.friendStatus = 'received';
            }
          });
        } else if (msg === 'SYS:FRIEND_ACCEPTED') {
          this.ngZone.run(() => {
            this.friendStatus = 'friends';
          });
        } else {
          // Regular text message
          this.ngZone.run(() => {
            this.inCallMessages.push({ sender: 'peer', text: msg });
            if (!this.isInCallChatOpen) {
              this.hasUnreadInCallMessages = true;
            }
            this.scrollToBottom();
            this.cdr.detectChanges();
          });
        }
      })
    );
  }

  // ─── MATCHING LOGIC ───

  async startMatching() {
    if (this.state !== 'idle') return;

    this.coinCost = this.calculateCost();
    if (this.prefs.coins < this.coinCost) {
      alert(`Insufficient coins! You need ${this.coinCost} coins to start a match. Watch an ad to earn more.`);
      return;
    }

    this.state = 'searching';
    this.isConnected = false;
    this.remoteMetadata = null;
    this.signalingService.isMatched = false;
    this.searchNonce++;
    const myNonce = this.searchNonce;

    // Start dots animation
    let count = 0;
    this.dotsTimer = setInterval(() => {
      count = (count + 1) % 4;
      this.dots = '.'.repeat(count);
      this.cdr.detectChanges();
    }, 500);

    // Start tip rotation
    this.tipInterval = setInterval(() => {
      this.tipIndex = (this.tipIndex + 1) % this.tips.length;
    }, 5000);

    // Get audio+video for WebRTC
    try {
      this.localStream = await this.signalingService.openUserMedia();
      if (this.localPreview && this.localPreview.nativeElement) {
        if (this.localPreview.nativeElement.srcObject !== this.localStream) {
          this.localPreview.nativeElement.srcObject = this.localStream;
        }
        this.localPreview.nativeElement.muted = true;
        this.localPreview.nativeElement.play().catch(() => {});
      }
      if (this.searchNonce !== myNonce) return;
      this.cdr.detectChanges(); // Ensure UI updates to searching state
    } catch (e) {
      alert('Camera and microphone access are required.');
      if (this.searchNonce === myNonce) this.resetToIdle();
      return;
    }

    // Start searching with random delay
    const delay = 1000 + Math.floor(Math.random() * 2000);
    this.scheduleMatchmaking(delay);
  }

  private scheduleMatchmaking(delayMs: number) {
    if (this.state !== 'searching') return;
    if (this.matchRetryTimeout) {
      clearTimeout(this.matchRetryTimeout);
    }
    const myNonce = this.searchNonce;
    this.matchRetryTimeout = setTimeout(() => {
      this.matchRetryTimeout = null;
      if (this.state === 'searching' && this.searchNonce === myNonce) {
        this.performMatchmaking(myNonce);
      }
    }, delayMs);
  }

  private async performMatchmaking(myNonce: number) {
    if (this.isSearching || this.state !== 'searching' || this.signalingService.isNegotiating || this.searchNonce !== myNonce) return;

    // Already matched
    if (this.signalingService.roomId && this.signalingService.remoteMetadata) {
      this.onMatched();
      return;
    }

    this.isSearching = true;
    const metadata = {
      uid: this.authService.currentUser?.uid,
      myGender: this.prefs.myGender,
      age: this.prefs.age,
      interests: this.prefs.interests,
      locations: this.prefs.locations,
      name: this.prefs.name,
      location: this.prefs.detectedLocation,
      targetGender: this.prefs.targetGender
    };

    try {
      const availableRoom = await this.signalingService.findAvailableRoom(metadata);
      if (this.state !== 'searching' || this.searchNonce !== myNonce) return;

      if (availableRoom) {
        if (this.signalingService.roomId) {
          await this.signalingService.stopWaiting();
        }
        if (this.state !== 'searching' || this.searchNonce !== myNonce) return;

        const success = await this.signalingService.joinRoom(availableRoom, metadata);
        if (this.state !== 'searching' || this.searchNonce !== myNonce) return;

        if (success) {
          this.onMatched();
          return;
        } else {
          if (!this.signalingService.roomId) {
            await this.signalingService.createRoom(metadata);
          }
        }
      } else if (!this.signalingService.roomId) {
        await this.signalingService.createRoom(metadata);
      }
    } catch (e) {
      console.error('[Home] Search error:', e);
    } finally {
      if (this.searchNonce === myNonce) {
        this.isSearching = false;
        if (this.state === 'searching') {
          const nextDelay = 6000 + Math.floor(Math.random() * 4000);
          this.scheduleMatchmaking(nextDelay);
        }
      }
    }
  }

  private onMatched() {
    if (this.state === 'connected') return;
    
    console.log('[Home] *** MATCH FOUND ***');
    
    // Deduct coins only when a real match is found
    const success = this.prefs.spendCoins(this.coinCost);
    if (!success) {
      console.error('[Home] Coin deduction failed on match.');
      this.cancelSearch();
      return;
    }

    this.state = 'connected';
    this.friendStatus = 'none'; // Reset for new match
    this.inCallMessages = []; // Reset in-call chat
    this.inCallChatInput = '';
    this.isInCallChatOpen = false;
    this.hasUnreadInCallMessages = false;
    this.signalingService.isMatched = true;
    this.remoteMetadata = this.signalingService.remoteMetadata;
    this.stopMatchingTimers();
    this.cdr.detectChanges();
  }

  toggleInCallChat() {
    this.isInCallChatOpen = !this.isInCallChatOpen;
    if (this.isInCallChatOpen) {
      this.hasUnreadInCallMessages = false;
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatScroll && this.chatScroll.nativeElement) {
        this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
      }
    }, 50);
  }

  sendInCallMessage() {
    if (!this.inCallChatInput.trim() || !this.isConnected) return;
    
    const text = this.inCallChatInput.trim();
    this.inCallChatInput = '';
    
    // Add to local UI
    this.inCallMessages.push({ sender: 'me', text });
    
    // Send via socket
    this.signalingService.sendMessage(text);
    this.scrollToBottom();
  }

  async handleFriendAction() {
    if (!this.remoteMetadata?.uid) return;

    if (this.friendStatus === 'none') {
      try {
        await this.friendService.sendFriendRequest(this.remoteMetadata.uid);
        this.friendStatus = 'sent';
        this.signalingService.sendMessage('SYS:FRIEND_REQUEST');
      } catch (e) {
        console.error('Error sending friend request:', e);
      }
    } else if (this.friendStatus === 'received') {
      try {
        // We need to find the request ID. This is a bit simplified here.
        // In a real app, you might want to fetch the request ID from firestore first.
        // For now, we'll just send the acceptance signal.
        this.signalingService.sendMessage('SYS:FRIEND_ACCEPTED');
        this.friendStatus = 'friends';
        
        // Find the pending request to accept it in Firestore
        const requests = await new Promise<FriendRequest[]>((resolve) => {
          const sub = this.friendService.getPendingRequests().subscribe(reqs => {
            sub.unsubscribe();
            resolve(reqs);
          });
        });
        
        const req = requests.find(r => r.fromUid === this.remoteMetadata.uid);
        if (req) {
          await this.friendService.acceptFriendRequest(req.id, req.fromUid);
        }
      } catch (e) {
        console.error('Error accepting friend request:', e);
      }
    }
  }

  cancelSearch() {
    this.stopMatchingTimers();
    this.isSearching = false;
    this.signalingService.stopWaiting();
    this.resetToIdle();
  }

  // ─── VIDEO CHAT CONTROLS ───

  toggleMute() {
    this.isMuted = !this.isMuted;
    const stream = this.signalingService.localStream;
    if (stream) {
      stream.getAudioTracks().forEach(t => t.enabled = !this.isMuted);
    }
  }

  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
    const stream = this.signalingService.localStream;
    if (stream) {
      stream.getVideoTracks().forEach(t => t.enabled = !this.isCameraOff);
    }
  }

  handleNext() {
    console.log('[Home] Next match...');
    this.signalingService.hangUp().then(() => {
      this.ngZone.run(() => {
        this.stopMatchingTimers();
        this.isConnected = false;
        this.remoteMetadata = null;
        this.isMuted = false;
        this.isCameraOff = false;

        // Ensure tracks are re-enabled if they were turned off during a call
        if (this.signalingService.localStream) {
          this.signalingService.localStream.getAudioTracks().forEach(t => t.enabled = true);
          this.signalingService.localStream.getVideoTracks().forEach(t => t.enabled = true);
        }

        this.friendStatus = 'none';
        this.inCallMessages = [];
        this.inCallChatInput = '';
        this.isInCallChatOpen = false;
        this.hasUnreadInCallMessages = false;
        this.isSearching = false;
        
        // Immediately start searching without showing the idle screen
        this.state = 'idle'; // Reset state temporarily so startMatching passes its check
        this.startMatching();
      });
    });
  }

  handleEnd() {
    console.log('[Home] Ending call...');
    this.signalingService.hangUp().then(() => {
      this.resetToIdle();
    });
  }

  private resetToIdle() {
    this.state = 'idle';
    this.isConnected = false;
    this.isSearching = false;
    this.remoteMetadata = null;
    this.isMuted = false;
    this.isCameraOff = false;
    
    // Ensure tracks are re-enabled if they were turned off during a call
    if (this.signalingService.localStream) {
      this.signalingService.localStream.getAudioTracks().forEach(t => t.enabled = true);
      this.signalingService.localStream.getVideoTracks().forEach(t => t.enabled = true);
    }
    
    this.friendStatus = 'none';
    this.inCallMessages = [];
    this.inCallChatInput = '';
    this.isInCallChatOpen = false;
    this.hasUnreadInCallMessages = false;
    this.stopMatchingTimers();
    this.cdr.detectChanges();
  }

  private stopMatchingTimers() {
    if (this.tipInterval) { clearInterval(this.tipInterval); this.tipInterval = null; }
    if (this.dotsTimer) { clearInterval(this.dotsTimer); this.dotsTimer = null; }
    if (this.matchRetryTimeout) { clearTimeout(this.matchRetryTimeout); this.matchRetryTimeout = null; }
  }

  // ─── FILTERS ───

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  toggleProfileEdit() {
    this.isEditingProfile = !this.isEditingProfile;
    if (this.isEditingProfile) {
      this.currentAge = this.prefs.age;
      this.currentMyGender = this.prefs.myGender;
    } else {
      this.prefs.setAge(this.currentAge);
      this.prefs.setMyGender(this.currentMyGender);
    }
  }

  openFilters() {
    this.currentMyGender = this.prefs.myGender;
    this.currentAge = this.prefs.age;
    this.currentTargetGender = this.prefs.targetGender;
    this.currentInterests = [...this.prefs.interests];
    this.currentLocations = [...this.prefs.locations];
    this.showFilters = true;
    this.cdr.detectChanges();
  }

  closeFilters(save: boolean) {
    if (save) {
      console.log('[Home] Saving Preferences:', {
        gender: this.currentMyGender,
        age: this.currentAge,
        target: this.currentTargetGender,
        interests: this.currentInterests,
        locations: this.currentLocations
      });
      this.prefs.setMyGender(this.currentMyGender);
      this.prefs.setAge(this.currentAge);
      this.prefs.setTargetGender(this.currentTargetGender);
      this.prefs.setInterests(this.currentInterests);
      if (this.currentLocations.length === 0) this.currentLocations = ['Global'];
      this.prefs.setLocations(this.currentLocations);

      this.friendService.syncUserProfile(
        this.prefs.name,
        this.prefs.profilePicture || '',
        this.prefs.age,
        this.prefs.myGender,
        this.prefs.detectedLocation
      );
    }
    this.showFilters = false;
    this.cdr.detectChanges();
  }

  setMyGender(g: string) { this.currentMyGender = g; }
  setTargetGender(g: string) { this.currentTargetGender = g; }

  toggleInterest(interest: string) {
    if (this.currentInterests.includes(interest)) {
      this.currentInterests = this.currentInterests.filter(i => i !== interest);
    } else if (this.currentInterests.length < 5) {
      this.currentInterests.push(interest);
    }
  }

  toggleLocation(location: string) {
    if (location === 'Global') { this.currentLocations = ['Global']; return; }
    if (this.currentLocations.includes('Global')) this.currentLocations = [];
    if (this.currentLocations.includes(location)) {
      this.currentLocations = this.currentLocations.filter(l => l !== location);
      if (!this.currentLocations.length) this.currentLocations = ['Global'];
    } else if (this.currentLocations.length < 3) {
      this.currentLocations.push(location);
    }
  }

  calculateCost(): number {
    // Normal match: Any Gender, Global Location, Default Interests
    const isNormalMatch = 
      this.prefs.targetGender === 'Any Gender' &&
      (this.prefs.locations.length === 0 || (this.prefs.locations.length === 1 && this.prefs.locations.includes('Global'))) &&
      this.isDefaultInterests();

    return isNormalMatch ? 10 : 20;
  }

  private isDefaultInterests(): boolean {
    const defaults = ['Gaming', 'Movies', 'Fitness'];
    if (this.prefs.interests.length !== defaults.length) return false;
    return this.prefs.interests.every(i => defaults.includes(i));
  }

  logout() { this.authService.logout().then(() => this.router.navigate(['/'])); }

  // ─── SOCIAL PANEL ───
  public toggleSocialPanel() {
    this.showSocialPanel = !this.showSocialPanel;
    if (this.showSocialPanel) {
      this.showProfileDrawer = false;
    } else {
      this.activeChatFriend = null;
    }
  }

  public toggleProfileDrawer() {
    this.showProfileDrawer = !this.showProfileDrawer;
    if (this.showProfileDrawer) {
      this.showSocialPanel = false;
    }
  }

  setSocialTab(tab: 'chats' | 'friends' | 'requests') {
    this.socialTab = tab;
    this.activeChatFriend = null;
  }

  private loadSocialData() {
    this.subscriptions.push(
      this.friendService.getFriends().subscribe(f => {
        this.ngZone.run(() => { this.friends = f; this.cdr.detectChanges(); });
      })
    );
    this.subscriptions.push(
      this.friendService.getPendingRequests().subscribe(r => {
        this.ngZone.run(() => { this.pendingRequests = r; this.cdr.detectChanges(); });
      })
    );
    this.subscriptions.push(
      this.chatService.getActiveChats().subscribe(c => {
        this.ngZone.run(() => { this.activeChats = c; this.cdr.detectChanges(); });
      })
    );
  }

  openAddFriendDialog() {
    this.addFriendUid = '';
    this.addFriendStatus = '';
    this.showAddFriendDialog = true;
  }

  async sendFriendRequest() {
    if (!this.addFriendUid.trim()) return;
    this.addFriendStatus = 'Sending...';
    try {
      await this.friendService.sendFriendRequest(this.addFriendUid.trim());
      this.addFriendStatus = 'Request sent!';
      setTimeout(() => { this.showAddFriendDialog = false; this.cdr.detectChanges(); }, 1500);
    } catch (e: any) {
      this.addFriendStatus = e.message || 'Error sending request';
    }
    this.cdr.detectChanges();
  }

  async acceptRequest(req: FriendRequest) {
    try {
      await this.friendService.acceptFriendRequest(req.id, req.fromUid);
    } catch (e) {
      console.error('Error accepting request:', e);
    }
  }

  async rejectRequest(req: FriendRequest) {
    try {
      await this.friendService.rejectFriendRequest(req.id);
    } catch (e) {
      console.error('Error rejecting request:', e);
    }
  }

  openChat(friendUid: string, friendName: string, friendPhotoUrl?: string) {
    this.activeChatFriend = { uid: friendUid, name: friendName, photoUrl: friendPhotoUrl };
    this.chatMessages = [];
    this.chatInput = '';
    this.subscriptions.push(
      this.chatService.getMessages(friendUid).subscribe(msgs => {
        this.ngZone.run(() => { this.chatMessages = msgs; this.cdr.detectChanges(); });
      })
    );
  }

  async sendChatMessage() {
    if (!this.chatInput.trim() || !this.activeChatFriend) return;
    const text = this.chatInput.trim();
    this.chatInput = '';
    try {
      await this.chatService.sendMessage(this.activeChatFriend.uid, text);
    } catch (e) {
      console.error('Error sending message:', e);
    }
  }

  formatChatTime(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  isMyMessage(msg: ChatMessage): boolean {
    return msg.senderId === this.authService.currentUser?.uid;
  }

  async promptDeleteAccount() {
    const confirmed = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (confirmed) {
      try {
        await this.authService.deleteAccount();
        this.router.navigate(['/']);
      } catch (e: any) {
        if (e.code === 'auth/requires-recent-login') {
          alert('For security reasons, please log out and log back in before deleting your account.');
        } else {
          alert('Failed to delete account. Please try again later.');
          console.error(e);
        }
      }
    }
  }

  ngOnDestroy() {
    this.stopMatchingTimers();
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    if (this.state !== 'idle') {
      this.signalingService.hangUp();
    }
  }
}
