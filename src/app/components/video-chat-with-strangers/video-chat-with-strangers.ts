import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-video-chat-with-strangers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './video-chat-with-strangers.html',
  styleUrls: ['../landing/landing.css']
})
export class VideoChatWithStrangersComponent {
}
