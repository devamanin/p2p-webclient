import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ogtv-alternative',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ogtv-alternative.html',
  styleUrls: ['../landing/landing.css']
})
export class OgtvAlternativeComponent {
}
