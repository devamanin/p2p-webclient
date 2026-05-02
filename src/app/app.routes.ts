import { Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash';
import { HomeComponent } from './components/home/home';
import { DeleteAccountComponent } from './components/delete-account/delete-account';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy';
import { SafetyStandardsComponent } from './components/safety-standards/safety-standards';

export const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'home', component: HomeComponent },
  { path: 'delete-account', component: DeleteAccountComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'safety-standards', component: SafetyStandardsComponent },
  { path: 'matching', redirectTo: 'home' },
  { path: 'video-chat', redirectTo: 'home' },
  { path: '**', redirectTo: '' }
];
