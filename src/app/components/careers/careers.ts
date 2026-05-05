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
      title: 'Campus Ambassador Lead',
      location: 'Remote',
      type: 'Part-time / Internship',
      description: 'Lead our campus outreach program, manage a team of student ambassadors, and drive user growth across universities worldwide.'
    },
    {
      title: 'Content Creator',
      location: 'Remote',
      type: 'Full-time / Part-time',
      description: 'Create engaging video and written content that highlights Blynq’s unique features and human stories across social platforms.'
    }
  ];
}
