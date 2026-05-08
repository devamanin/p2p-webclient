import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-random-chat',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './random-chat.html',
  styleUrls: ['../landing/landing.css']
})
export class RandomChatComponent {
}
