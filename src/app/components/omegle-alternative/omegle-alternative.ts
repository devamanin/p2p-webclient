import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-omegle-alternative',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './omegle-alternative.html',
  styleUrls: ['../landing/landing.css']
})
export class OmegleAlternativeComponent {
}
