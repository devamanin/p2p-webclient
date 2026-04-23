import { Component, ElementRef, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SignalingService } from '../../services/signaling.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-chat.html',
  styleUrl: './video-chat.css'
})
export class VideoChatComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  public isMuted = false;
  public isCameraOff = false;
  public isConnected = false; // NEW: Track connection state
  public remoteMetadata: any = null;
  private subscriptions: Subscription[] = [];
  private isTransitioning = false;

  constructor(
    public signalingService: SignalingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.remoteMetadata = this.signalingService.remoteMetadata;

    try {
      const stream = await this.signalingService.openUserMedia();
      if (this.localVideo) this.localVideo.nativeElement.srcObject = stream;
    } catch (e) { console.error(e); }

    this.subscriptions.push(
      this.signalingService.remoteStream$.subscribe(stream => {
        if (stream && this.remoteVideo) {
          this.remoteVideo.nativeElement.srcObject = stream;
          this.isConnected = true;
          this.cdr.detectChanges();
        }
      })
    );

    this.subscriptions.push(
      this.signalingService.sessionEnded$.subscribe(() => {
        if (!this.isTransitioning) this.handleNext();
      })
    );
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
    this.subscriptions.forEach(s => s.unsubscribe());
    if (!this.isTransitioning) {
      this.signalingService.hangUp();
    }
  }
}
