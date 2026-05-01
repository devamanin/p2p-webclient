import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './delete-account.html',
  styleUrl: './delete-account.css'
})
export class DeleteAccountComponent {}
