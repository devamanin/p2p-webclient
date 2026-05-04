import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './careers.html',
  styleUrl: './careers.css'
})
export class CareersComponent {
  jobs = [
    {
      title: 'Senior WebRTC Engineer',
      location: 'Remote',
      type: 'Full-time',
      description: 'Lead the development of our core real-time communication infrastructure, optimizing latency and reliability.'
    },
    {
      title: 'Full Stack Developer (Angular/Node)',
      location: 'Remote / Hybrid',
      type: 'Full-time',
      description: 'Build and maintain features across our Angular web client and Node.js backend.'
    },
    {
      title: 'Community Safety Specialist',
      location: 'Remote',
      type: 'Part-time',
      description: 'Help us maintain a safe, welcoming environment by reviewing reports and refining our automated safety filters.'
    }
  ];
}
