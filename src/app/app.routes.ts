import { Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash';
import { HomeComponent } from './components/home/home';
import { DeleteAccountComponent } from './components/delete-account/delete-account';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy';
import { SafetyStandardsComponent } from './components/safety-standards/safety-standards';
import { LandingComponent } from './components/landing/landing';
import { CareersComponent } from './components/careers/careers';

import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: SplashComponent },
  { path: 'landing', redirectTo: '' },
  { path: 'careers', component: CareersComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'delete-account', component: DeleteAccountComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'safety-standards', component: SafetyStandardsComponent },
  { path: 'matching', redirectTo: 'home' },
  { path: 'video-chat', redirectTo: 'home' },
  { path: '**', redirectTo: '' }
];
