import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalingService } from '../../services/signaling.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { Subscription } from 'rxjs';

import { AdCoinPill } from '../ad-coin-pill/ad-coin-pill';

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [CommonModule, AdCoinPill],
  templateUrl: './matching.html',
  styleUrl: './matching.css'
})
export class MatchingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('localPreview') localPreview!: ElementRef<HTMLVideoElement>;
  public tipIndex = 0;
  public dots = '';
  public tips = [
    "Be respectful to your matches! A good vibe goes a long way.",
    "Good lighting makes a huge difference in video calls.",
    "Use interests to find people with similar hobbies.",
  ];
  private tipInterval: any = null;
  private dotsTimer: any = null;
  private matchRetryTimeout: any = null;
  private coinCost = 10;
  private isSearching = false;
  private hasNavigated = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private signalingService: SignalingService,
    private prefs: UserPreferencesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    console.log('[Matching] Matching Screen Initialized');
    this.route.queryParams.subscribe(params => {
      this.coinCost = params['cost'] ? parseInt(params['cost']) : 10;
    });

    this.startDotsAnimation();
    this.startTipRotation();
    
    // Always attempt matchmaking initialization
    await this.initMatchmaking();
  }

  ngAfterViewInit() {
    this.attachCamera();
  }

  private attachCamera() {
    const stream = this.signalingService.localStream;
    if (stream && this.localPreview?.nativeElement) {
      this.localPreview.nativeElement.srcObject = stream;
      this.localPreview.nativeElement.muted = true;
      this.localPreview.nativeElement.play().catch(() => {});
    }
  }

  private startDotsAnimation() {
    let count = 0;
    this.dotsTimer = setInterval(() => {
      count = (count + 1) % 4;
      this.dots = '.'.repeat(count);
    }, 500);
  }

  private startTipRotation() {
    this.tipInterval = setInterval(() => {
      this.tipIndex = (this.tipIndex + 1) % this.tips.length;
    }, 5000);
  }

  private async initMatchmaking() {
    this.subscriptions.push(
      this.signalingService.peerJoined$.subscribe(() => this.navigateToVideoChat())
    );

    this.subscriptions.push(
      this.signalingService.remoteStream$.subscribe(stream => {
        if (stream) this.navigateToVideoChat();
      })
    );

    this.subscriptions.push(
      this.signalingService.sessionEnded$.subscribe(() => {
        if (!this.hasNavigated) {
          this.signalingService.hangUp().then(() => this.performMatchmaking());
        }
      })
    );

    try {
      await this.signalingService.openUserMedia();
      this.attachCamera();
      
      if (this.hasNavigated) return;

      // Match mobile randomization delay
      const initialDelay = 1000 + Math.floor(Math.random() * 1500);
      this.scheduleMatchmaking(initialDelay);
    } catch (e) {
      console.error('[Matching] Critical Media Error:', e);
      // Removed redirect to home to prevent "split screen" behavior
    }
  }

  private scheduleMatchmaking(delayMs: number) {
    if (this.hasNavigated) return;
    if (this.matchRetryTimeout) clearTimeout(this.matchRetryTimeout);
    this.matchRetryTimeout = setTimeout(() => {
      this.matchRetryTimeout = null;
      if (!this.hasNavigated) this.performMatchmaking();
    }, delayMs);
  }

  private async performMatchmaking() {
    if (this.isSearching || this.hasNavigated || this.signalingService.isNegotiating) return;
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
      if (this.hasNavigated) return;

      if (availableRoom) {
        if (this.signalingService.roomId) await this.signalingService.stopWaiting();
        const success = await this.signalingService.joinRoom(availableRoom, metadata);
        if (success) this.navigateToVideoChat();
      } else if (!this.signalingService.roomId) {
        await this.signalingService.createRoom(metadata);
      }
    } catch (e) {
      console.error('[Matching] performMatchmaking error:', e);
    } finally {
      this.isSearching = false;
      if (!this.hasNavigated) {
        this.scheduleMatchmaking(7000 + Math.floor(Math.random() * 3000));
      }
    }
  }

  private navigateToVideoChat() {
    if (this.hasNavigated) return;
    this.hasNavigated = true;

    this.stopAllTimers();
    this.signalingService.isMatched = true;
    this.isSearching = false;
    this.prefs.spendCoins(this.coinCost);
    
    this.router.navigate(['/video-chat'], { replaceUrl: true });
  }

  cancelSearch() {
    this.hasNavigated = true;
    this.stopAllTimers();
    this.signalingService.hangUp();
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  private stopAllTimers() {
    if (this.tipInterval) clearInterval(this.tipInterval);
    if (this.dotsTimer) clearInterval(this.dotsTimer);
    if (this.matchRetryTimeout) clearTimeout(this.matchRetryTimeout);
    this.tipInterval = this.dotsTimer = this.matchRetryTimeout = null;
  }

  ngOnDestroy() {
    this.stopAllTimers();
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }
}
