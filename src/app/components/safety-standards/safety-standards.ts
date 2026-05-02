import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-safety-standards',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './safety-standards.html',
  styleUrl: './safety-standards.css'
})
export class SafetyStandardsComponent {}
