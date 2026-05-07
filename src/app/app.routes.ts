import { Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash';
import { HomeComponent } from './components/home/home';
import { DeleteAccountComponent } from './components/delete-account/delete-account';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy';
import { SafetyStandardsComponent } from './components/safety-standards/safety-standards';
import { LandingComponent } from './components/landing/landing';
import { CareersComponent } from './components/careers/careers';
import { StoriesComponent } from './components/stories/stories';

import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent, title: 'blynq.app - Connect with the World' },
  { path: 'login', component: SplashComponent, title: 'Login | blynq.app' },
  { path: 'landing', redirectTo: '' },
  { path: 'careers', component: CareersComponent, title: 'Careers | blynq.app' },
  { path: 'stories', component: StoriesComponent, title: 'User Stories | blynq.app' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], title: 'Home | blynq.app' },
  { path: 'delete-account', component: DeleteAccountComponent, title: 'Delete Account | blynq.app' },
  { path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'Privacy Policy | blynq.app' },
  { path: 'safety-standards', component: SafetyStandardsComponent, title: 'Safety Standards | blynq.app' },
  { path: 'matching', redirectTo: 'home' },
  { path: 'video-chat', redirectTo: 'home' },
  { path: '**', redirectTo: '' }
];
