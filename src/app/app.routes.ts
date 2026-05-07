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
  
  // Lazy Loaded SEO Landing Pages
  { 
    path: 'omegle-alternative', 
    loadComponent: () => import('./components/omegle-alternative/omegle-alternative').then(m => m.OmegleAlternativeComponent),
    title: 'Omegle Alternative #1 Free and Safe | blynq.app' 
  },
  { 
    path: 'random-video-chat', 
    loadComponent: () => import('./components/random-chat/random-chat').then(m => m.RandomChatComponent),
    title: 'Random Video Chat - Free Live & Safe | blynq.app' 
  },
  { 
    path: 'ogtv-alternative', 
    loadComponent: () => import('./components/ogtv-alternative/ogtv-alternative').then(m => m.OgtvAlternativeComponent),
    title: 'OGTV Alternative - Fast & Secure Video Chat | blynq.app' 
  },
  { 
    path: 'monkey-app-alternative', 
    loadComponent: () => import('./components/monkey-app-alternative/monkey-app-alternative').then(m => m.MonkeyAppAlternativeComponent),
    title: 'Monkey App Alternative - Meet New People | blynq.app' 
  },
  { 
    path: 'ometv-alternative', 
    loadComponent: () => import('./components/ometv-alternative/ometv-alternative').then(m => m.OmetvAlternativeComponent),
    title: 'Ome.tv Alternative - Anonymous Video Chat | blynq.app' 
  },
  { 
    path: 'chatroulette-alternative', 
    loadComponent: () => import('./components/chatroulette-alternative/chatroulette-alternative').then(m => m.ChatrouletteAlternativeComponent),
    title: 'Chatroulette Alternative - Global Video Chat | blynq.app' 
  },
  { 
    path: 'video-chat-with-girls', 
    loadComponent: () => import('./components/video-chat-with-girls/video-chat-with-girls').then(m => m.VideoChatWithGirlsComponent),
    title: 'Video Chat with Girls - Safe & Instant | blynq.app' 
  },
  { 
    path: 'video-chat-with-strangers', 
    loadComponent: () => import('./components/video-chat-with-strangers/video-chat-with-strangers').then(m => m.VideoChatWithStrangersComponent),
    title: 'Video Chat with Strangers - Global & Free | blynq.app' 
  },
  { 
    path: 'omegle-india', 
    loadComponent: () => import('./components/omegle-india/omegle-india').then(m => m.OmegleIndiaComponent),
    title: 'India\'s #1 Omegle Alternative - Safe & Fast | blynq.app' 
  },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], title: 'Home | blynq.app' },
  { path: 'delete-account', component: DeleteAccountComponent, title: 'Delete Account | blynq.app' },
  { path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'Privacy Policy | blynq.app' },
  { path: 'safety-standards', component: SafetyStandardsComponent, title: 'Safety Standards | blynq.app' },
  { path: 'matching', redirectTo: 'home' },
  { path: 'video-chat', redirectTo: 'home' },
  { path: '**', redirectTo: '' }
];
