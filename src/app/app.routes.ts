import { Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'home', component: HomeComponent },
  { path: 'matching', redirectTo: 'home' },
  { path: 'video-chat', redirectTo: 'home' },
  { path: '**', redirectTo: '' }
];
