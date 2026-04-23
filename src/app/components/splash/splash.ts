import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.html',
  styleUrl: './splash.css'
})
export class SplashComponent implements OnInit, OnDestroy {
  public showLoginButton = false;
  public isSigningIn = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('SplashComponent: Initialized');
    
    // Wait 3.5 seconds for the glitch animation to complete
    timer(3500).subscribe(() => {
      console.log('SplashComponent: Animation finished. Checking auth state...');
      this.checkAuth();
    });
  }

  private checkAuth() {
    this.authSubscription = this.authService.user$.subscribe({
      next: (user) => {
        console.log('SplashComponent: Auth Check -> User:', user ? user.email : 'None');
        if (user) {
          this.router.navigate(['/home']);
        } else {
          this.showLoginButton = true;
          this.cdr.detectChanges(); // Force UI update
          console.log('SplashComponent: showLoginButton set to TRUE & detectChanges called');
        }
      },
      error: (err) => {
        console.error('SplashComponent: Auth error', err);
        this.showLoginButton = true;
        this.cdr.detectChanges();
      }
    });
  }

  async handleSignIn() {
    this.isSigningIn = true;
    try {
      const user = await this.authService.signInWithGoogle();
      if (user) {
        this.router.navigate(['/home']);
      }
    } finally {
      this.isSigningIn = false;
    }
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }
}
