import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-monkey-app-alternative',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './monkey-app-alternative.html',
  styleUrls: ['../landing/landing.css']
})
export class MonkeyAppAlternativeComponent {
}
