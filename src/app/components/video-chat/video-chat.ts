import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SignalingService } from '../../services/signaling.service';
import { Subscription } from 'rxjs';
import * as nsfwjs from 'nsfwjs';
@Component({
  selector: 'app-video-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-chat.html',
  styleUrl: './video-chat.css'
})
export class VideoChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  public isMuted = false;
  public isCameraOff = false;
  public isConnected = false; // NEW: Track connection state
  public isNSFW = false;
  public remoteMetadata: any = null;
  private subscriptions: Subscription[] = [];
  private isTransitioning = false;
  private nsfwModel: nsfwjs.NSFWJS | null = null;
  private nsfwInterval: any;

  constructor(
    public signalingService: SignalingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.remoteMetadata = this.signalingService.remoteMetadata;

    this.subscriptions.push(
      this.signalingService.sessionEnded$.subscribe(() => {
        if (!this.isTransitioning) this.handleNext();
      })
    );

    // Load the NSFW model
    nsfwjs.load().then(model => {
      this.nsfwModel = model;
      console.log('[VideoChat] NSFW model loaded');
    }).catch(err => console.error('[VideoChat] Error loading NSFW model:', err));
  }

  async ngAfterViewInit() {
    try {
      const stream = await this.signalingService.openUserMedia();
      if (this.localVideo) {
        this.localVideo.nativeElement.srcObject = stream;
        this.localVideo.nativeElement.play().catch(e => console.error('[VideoChat] Local play error:', e));
      }
    } catch (e) { console.error(e); }

    this.subscriptions.push(
      this.signalingService.remoteStream$.subscribe(stream => {
        console.log('[VideoChat] Remote stream updated:', !!stream);
        if (stream && this.remoteVideo) {
          this.remoteVideo.nativeElement.srcObject = stream;
          this.remoteVideo.nativeElement.play().catch(e => {
            console.warn('[VideoChat] Remote video play failed (possibly autoplay policy):', e);
          });
          this.isConnected = true;
          this.startNSFWCheck();
          this.cdr.detectChanges();
        } else if (!stream) {
          this.isConnected = false;
          this.stopNSFWCheck();
          if (this.remoteVideo) this.remoteVideo.nativeElement.srcObject = null;
          this.cdr.detectChanges();
        }
      })
    );
  }

  private startNSFWCheck() {
    this.stopNSFWCheck();
    this.nsfwInterval = setInterval(async () => {
      if (!this.nsfwModel || !this.remoteVideo?.nativeElement || !this.isConnected) return;
      
      const videoElement = this.remoteVideo.nativeElement;
      if (videoElement.readyState >= 2) {
        try {
          const predictions = await this.nsfwModel.classify(videoElement);
          const pornProb = predictions.find(p => p.className === 'Porn')?.probability || 0;
          const hentaiProb = predictions.find(p => p.className === 'Hentai')?.probability || 0;
          
          const wasNSFW = this.isNSFW;
          this.isNSFW = (pornProb > 0.5 || hentaiProb > 0.5);
          
          if (wasNSFW !== this.isNSFW) {
             this.cdr.detectChanges();
          }
        } catch (e) {
          console.error('[VideoChat] NSFW classification error:', e);
        }
      }
    }, 1000);
  }

  private stopNSFWCheck() {
    if (this.nsfwInterval) {
      clearInterval(this.nsfwInterval);
      this.nsfwInterval = null;
    }
    this.isNSFW = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const stream = this.localVideo.nativeElement.srcObject as MediaStream;
    stream?.getAudioTracks().forEach(t => t.enabled = !this.isMuted);
  }

  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
    const stream = this.localVideo.nativeElement.srcObject as MediaStream;
    stream?.getVideoTracks().forEach(t => t.enabled = !this.isCameraOff);
  }

  async handleNext() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    console.log('[VideoChat] Awaiting cleanup before next match...');
    await this.signalingService.hangUp();
    
    this.router.navigate(['/matching'], { replaceUrl: true });
  }

  async handleHome() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    await this.signalingService.hangUp();
    this.router.navigate(['/home']);
  }

  ngOnDestroy() {
    this.stopNSFWCheck();
    this.subscriptions.forEach(s => s.unsubscribe());
    if (!this.isTransitioning) {
      this.signalingService.hangUp();
    }
  }
}
