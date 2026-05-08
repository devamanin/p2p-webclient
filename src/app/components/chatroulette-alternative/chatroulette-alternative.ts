import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chatroulette-alternative',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chatroulette-alternative.html',
  styleUrls: ['../landing/landing.css']
})
export class ChatrouletteAlternativeComponent {
}
