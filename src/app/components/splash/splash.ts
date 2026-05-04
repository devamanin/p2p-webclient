import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './splash.html',
  styleUrl: './splash.css'
})
export class SplashComponent implements OnInit, OnDestroy {
  public showLoginButton = false;
  public isSigningIn = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService, 
    private prefs: UserPreferencesService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('SplashComponent: Initialized');
    
    // Wait 3.5 seconds for the glitch animation to complete
    timer(3500).subscribe(() => {
      console.log('SplashComponent: Animation finished. Checking auth state...');
      this.fetchLocation();
      this.checkAuth();
    });
  }

  private async fetchLocation() {
    try {
      const res = await fetch('http://ip-api.com/json/');
      const data = await res.json();
      if (data && data.city && data.country) {
        this.prefs.setDetectedLocation(`${data.city}, ${data.country}`);
      }
    } catch (e) {
      console.error('SplashComponent: Failed to fetch location', e);
    }
  }

  private checkAuth() {
    this.authSubscription = this.authService.user$.subscribe({
      next: (user) => {
        console.log('SplashComponent: Auth Check -> User:', user ? user.email : 'None');
        if (user) {
          this.prefs.setName(user.displayName || 'User');
          if (user.photoURL) {
            this.prefs.setProfilePicture(user.photoURL);
          }
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
      const result = await this.authService.signInWithGoogle();
      if (result?.user) {
        this.prefs.setName(result.user.displayName || 'User');
        if (result.user.photoURL) {
          this.prefs.setProfilePicture(result.user.photoURL);
        }
        
        if (result.token) {
          try {
            const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=genders,birthdays', {
              headers: { Authorization: `Bearer ${result.token}` }
            });
            const data = await response.json();
            
            const gender = data.genders?.[0]?.value;
            if (gender === 'male' || gender === 'female') {
              this.prefs.setMyGender(gender === 'male' ? 'Male' : 'Female');
            }
            
            const birthYear = data.birthdays?.[0]?.date?.year;
            if (birthYear) {
              const age = new Date().getFullYear() - birthYear;
              this.prefs.setAge(age);
            }
          } catch (e) {
            console.error('Error fetching People API:', e);
          }
        }
        
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
