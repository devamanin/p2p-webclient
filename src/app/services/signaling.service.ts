import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private socket!: Socket;
  private serverUrl = 'https://web-production-17aa6.up.railway.app/';
  // private serverUrl = 'https://p2pcall-signalling-service.onrender.com/';

  public peerConnection: RTCPeerConnection | null = null;
  public localStream: MediaStream | null = null;
  public remoteStream: MediaStream | null = null;

  public roomId: string | null = null;
  public remoteMetadata: any | null = null;
  public isMatched = false;

  private remoteStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  public remoteStream$ = this.remoteStreamSubject.asObservable();

  private peerJoinedSubject = new Subject<void>();
  public peerJoined$ = this.peerJoinedSubject.asObservable();

  private connectionStateSubject = new BehaviorSubject<string>('new');
  public connectionState$ = this.connectionStateSubject.asObservable();

  private sessionEndedSubject = new Subject<void>();
  public sessionEnded$ = this.sessionEndedSubject.asObservable();

  private messageSubject = new BehaviorSubject<string | null>(null);
  public message$ = this.messageSubject.asObservable();

  private typingStatusSubject = new BehaviorSubject<boolean>(false);
  public typingStatus$ = this.typingStatusSubject.asObservable();

  private isRemoteDescriptionSet = false;
  private isPeerJoined = false;
  private isBusy = false;
  private candidateQueue: RTCIceCandidateInit[] = [];
  private earlyLocalCandidates: RTCIceCandidateInit[] = [];

  public get isNegotiating(): boolean {
    return this.isPeerJoined || this.isRemoteDescriptionSet;
  }
  private iceConfiguration: RTCConfiguration = {};

  constructor() {
    console.log('[Signaling] Initializing Socket...');
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => console.log('[Signaling] Connected. ID:', this.socket.id));

    this.socket.on('answer', async (data: any) => {
      if (this.peerConnection && !this.isRemoteDescriptionSet) {
        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          this.isRemoteDescriptionSet = true;
          this.flushIceCandidates();
        } catch (e) { console.error('[Signaling] Answer Error:', e); }
      }
    });

    this.socket.on('candidate', async (data: any) => {
      if (this.peerConnection && this.isRemoteDescriptionSet) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) { /* Ignore candidate errors during transitions */ }
      } else {
        // Queue candidates if PeerConnection isn't ready or RemoteDescription isn't set
        // This handles candidates arriving before the join handshake completes
        this.candidateQueue.push(data.candidate);
      }
    });

    this.socket.on('message', (data: any) => {
      console.log('[Signaling] Message received:', data);
      this.messageSubject.next(data.text || '');
    });

    this.socket.on('typing', (data: any) => {
      this.typingStatusSubject.next(data.isTyping || false);
    });

    this.socket.on('peer_joined', (data: any) => {
      this.remoteMetadata = data.metadata;
      this.isPeerJoined = true;
      this.peerJoinedSubject.next();
      
      // Send any early local candidates now that the peer has joined and we have a roomId
      if (this.roomId && this.earlyLocalCandidates.length > 0) {
        console.log(`[Signaling] Sending ${this.earlyLocalCandidates.length} early local candidates...`);
        this.earlyLocalCandidates.forEach(candidate => {
          this.socket.emit('send_candidate', { room_id: this.roomId, candidate });
        });
        this.earlyLocalCandidates = [];
      }
    });

    this.socket.on('session_ended', (data: any) => {
      console.log('[Signaling] session_ended received:', data);
      // Ignore session_ended if it belongs to an old room, or if we've already cleared our roomId
      if (data && data.room_id && this.roomId && data.room_id !== this.roomId) {
        console.log(`[Signaling] Ignoring session_ended for old room ${data.room_id} (current: ${this.roomId})`);
        return;
      }
      console.log('[Signaling] session_ended triggering subject');
      this.sessionEndedSubject.next();
    });
  }

  public async findAvailableRoom(metadata: any): Promise<string | null> {
    return new Promise((resolve) => {
      this.socket.emit('find_room', { metadata }, (data: any) => {
        resolve(data.room_id?.toString() || null);
      });
    });
  }

  public async createRoom(metadata: any): Promise<string | null> {
    if (this.isBusy) return null;
    this.isBusy = true;
    this.isRemoteDescriptionSet = false;
    this.candidateQueue = [];
    this.earlyLocalCandidates = [];

    await this.fetchIceServers();

    try {
      this.peerConnection = new RTCPeerConnection(this.iceConfiguration);
      this.setupPeerConnectionListeners();

      this.localStream?.getTracks().forEach(t => this.peerConnection?.addTrack(t, this.localStream!));

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      return new Promise((resolve) => {
        this.socket.emit('create_room', { offer, metadata }, (data: any) => {
          try {
            this.roomId = data.room_id;
            this.isBusy = false;
            resolve(this.roomId);
          } catch (e) {
            console.error('[Signaling] Error in create_room callback:', e);
            this.isBusy = false;
            resolve(null);
          }
        });
      });
    } catch (e) {
      console.error('[Signaling] Error creating room:', e);
      this.isBusy = false;
      return null;
    }
  }

  public async joinRoom(roomId: string, metadata: any): Promise<boolean> {
    if (this.isBusy) return false;
    this.isBusy = true;
    this.isRemoteDescriptionSet = false;
    this.candidateQueue = [];

    return new Promise((resolve) => {
      this.socket.emit('join_room', { room_id: roomId, metadata }, async (data: any) => {
        if (data.success) {
          try {
            this.roomId = roomId; // CRITICAL: Save the room ID
            this.remoteMetadata = data.metadata;
            await this.fetchIceServers();
            this.peerConnection = new RTCPeerConnection(this.iceConfiguration);
            this.setupPeerConnectionListeners();

            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            this.isRemoteDescriptionSet = true;
            await this.flushIceCandidates();

            this.localStream?.getTracks().forEach(t => this.peerConnection?.addTrack(t, this.localStream!));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.socket.emit('send_answer', { room_id: roomId, answer });

            this.isBusy = false;
            resolve(true);
          } catch (e) {
            console.error('[Signaling] Error in join_room callback:', e);
            this.isBusy = false;
            resolve(false);
          }
        } else {
          this.isBusy = false;
          resolve(false);
        }
      });
    });
  }

  private setupPeerConnectionListeners() {
    if (!this.peerConnection) return;
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateJson = event.candidate.toJSON();
        if (this.roomId && this.isPeerJoined) {
          this.socket.emit('send_candidate', { room_id: this.roomId, candidate: candidateJson });
        } else {
          // If the room isn't ready or peer hasn't joined yet, queue them
          this.earlyLocalCandidates.push(candidateJson);
        }
      }
    };
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState || 'new';
      console.log('[Signaling] Connection state:', state);
      this.connectionStateSubject.next(state);
      if (state === 'failed') {
        console.warn('[Signaling] PeerConnection FAILED - possible ICE/STUN issue');
      }
    };
    this.peerConnection.ontrack = (event) => {
      console.log('[Signaling] ontrack received:', event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.remoteStreamSubject.next(this.remoteStream);
      } else {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
          this.remoteStreamSubject.next(this.remoteStream);
        }
        this.remoteStream.addTrack(event.track);
      }
    };
  }

  private async fetchIceServers() {
    if (this.iceConfiguration.iceServers) return;
    return new Promise((resolve) => {
      this.socket.emit('get_ice_servers', {}, (data: any) => {
        this.iceConfiguration = data;
        resolve(true);
      });
    });
  }

  private async flushIceCandidates() {
    console.log(`[Signaling] Flushing ${this.candidateQueue.length} queued candidates`);
    while (this.candidateQueue.length > 0) {
      const candidate = this.candidateQueue.shift();
      try {
        await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) { console.error('[Signaling] Flush Candidate Error:', e); }
    }
  }

  public async openUserMedia() {
    // REUSE logic to prevent "Device Busy" errors
    if (this.localStream && this.localStream.active) {
      console.log('[Signaling] Reusing existing camera stream');
      return this.localStream;
    }
    console.log('[Signaling] Opening new camera stream');
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user' } });
    return this.localStream;
  }

  public async hangUp() {
    console.log('[Signaling] Hanging up and cleaning up PeerConnection...');
    if (this.roomId) this.socket.emit('leave_room', { room_id: this.roomId });

    this.isRemoteDescriptionSet = false;
    this.isPeerJoined = false;
    this.roomId = null;
    this.remoteMetadata = null;
    this.isMatched = false;
    this.isBusy = false;
    this.candidateQueue = [];
    this.earlyLocalCandidates = [];
    this.connectionStateSubject.next('closed');

    // Stop remote video
    this.remoteStream?.getTracks().forEach(t => t.stop());
    this.remoteStream = null;
    this.remoteStreamSubject.next(null);

    // Remove the listener before closing to prevent false 'session_ended' triggers
    if (this.peerConnection) {
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  public async stopWaiting() {
    await this.hangUp();
  }

  public sendMessage(text: string) {
    if (this.roomId) {
      this.socket.emit('send_message', { room_id: this.roomId, text });
    }
  }
}
