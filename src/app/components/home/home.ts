import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { AuthService } from '../../services/auth.service';
import { SignalingService } from '../../services/signaling.service';
import { Subscription } from 'rxjs';

// States: 'idle' | 'searching' | 'connected'
type AppState = 'idle' | 'searching' | 'connected';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('localPreview') localPreview!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  // UI state
  public state: AppState = 'idle';
  public showFilters = false;
  public localStream: MediaStream | null = null;
  public isConnected = false;
  public isMuted = false;
  public isCameraOff = false;
  public isFullScreen = false;
  public remoteMetadata: any = null;
  public dots = '';
  private dotsTimer: any = null;

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
  public currentTargetGender = 'Any Gender';
  public currentInterests: string[] = [];
  public currentLocations: string[] = ['Global'];

  private subscriptions: Subscription[] = [];
  private tipInterval: any = null;
  private matchRetryTimeout: any = null;
  private isSearching = false;
  private coinCost = 10;

  constructor(
    public prefs: UserPreferencesService,
    private authService: AuthService,
    private signalingService: SignalingService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.prefs.setName(user.displayName || 'User');
      }
    });

    this.currentMyGender = this.prefs.myGender;
    this.currentTargetGender = this.prefs.targetGender;
    this.currentInterests = [...this.prefs.interests];
    this.currentLocations = [...this.prefs.locations];
  }

  async ngAfterViewInit() {
    await this.startLocalCamera();
    this.setupSignalingSubscriptions();
    
    document.addEventListener('fullscreenchange', () => {
      this.isFullScreen = !!document.fullscreenElement;
      this.cdr.detectChanges();
    });
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
          console.log('[Home] Peer joined!');
          this.remoteMetadata = this.signalingService.remoteMetadata;
          this.state = 'connected';
          this.cdr.detectChanges();
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
            this.state = 'connected';
            this.remoteMetadata = this.signalingService.remoteMetadata;
            if (this.remoteVideo?.nativeElement) {
              this.remoteVideo.nativeElement.srcObject = stream;
              this.remoteVideo.nativeElement.play().catch(() => {});
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
          console.log('[Home] Session ended');
          if (this.state === 'connected') {
            this.signalingService.hangUp().then(() => {
              if (this.isConnected) {
                console.log('[Home] Call ended, returning to idle.');
                this.resetToIdle();
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
  }

  // ─── MATCHING LOGIC ───

  async startMatching() {
    if (this.state !== 'idle') return;

    this.coinCost = this.calculateCost();
    if (this.prefs.coins < this.coinCost) {
      console.warn(`[Home] Insufficient coins (${this.prefs.coins}). Auto-granting 200 coins for testing.`);
      this.prefs.addCoins(200);
    }

    this.state = 'searching';
    this.isConnected = false;
    this.remoteMetadata = null;
    this.signalingService.isMatched = false;

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
      await this.signalingService.openUserMedia();
      this.cdr.detectChanges(); // Ensure UI updates to searching state
    } catch (e) {
      alert('Camera and microphone access are required.');
      this.resetToIdle();
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
    this.matchRetryTimeout = setTimeout(() => {
      this.matchRetryTimeout = null;
      if (this.state === 'searching') {
        this.performMatchmaking();
      }
    }, delayMs);
  }

  private async performMatchmaking() {
    if (this.isSearching || this.state !== 'searching') return;

    // Already matched
    if (this.signalingService.roomId && this.signalingService.remoteMetadata) {
      this.onMatched();
      return;
    }

    this.isSearching = true;
    const metadata = {
      myGender: this.prefs.myGender,
      targetGender: this.prefs.targetGender,
      interests: this.prefs.interests,
      locations: this.prefs.locations,
      name: this.prefs.name,
      location: this.prefs.detectedLocation
    };

    try {
      const availableRoom = await this.signalingService.findAvailableRoom(metadata);
      if (this.state !== 'searching') return;

      if (availableRoom) {
        if (this.signalingService.roomId) {
          await this.signalingService.stopWaiting();
        }
        if (this.state !== 'searching') return;

        const success = await this.signalingService.joinRoom(availableRoom, metadata);
        if (this.state !== 'searching') return;

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
      this.isSearching = false;
      if (this.state === 'searching') {
        const nextDelay = 6000 + Math.floor(Math.random() * 4000);
        this.scheduleMatchmaking(nextDelay);
      }
    }
  }

  private onMatched() {
    console.log('[Home] *** MATCH FOUND ***');
    this.state = 'connected';
    this.signalingService.isMatched = true;
    this.remoteMetadata = this.signalingService.remoteMetadata;
    this.prefs.spendCoins(this.coinCost);
    this.stopMatchingTimers();
    this.cdr.detectChanges();
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

  toggleFilters() {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.prefs.setMyGender(this.currentMyGender);
      this.prefs.setTargetGender(this.currentTargetGender);
      this.prefs.setInterests(this.currentInterests);
      if (this.currentLocations.length === 0) this.currentLocations = ['Global'];
      this.prefs.setLocations(this.currentLocations);
    }
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
    let cost = 10;
    const defaults = ['Gaming', 'Movies', 'Fitness'];
    const custom = this.prefs.interests.length !== defaults.length || !this.prefs.interests.every(i => defaults.includes(i));
    if (this.prefs.targetGender !== 'Any Gender' || (this.prefs.locations.length > 0 && !this.prefs.locations.includes('Global')) || custom) cost = 20;
    return cost;
  }

  addFreeCoins() { alert('You earned 50 coins!'); this.prefs.addCoins(50); }

  logout() { this.authService.logout().then(() => this.router.navigate(['/'])); }

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
