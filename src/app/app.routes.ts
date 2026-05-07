import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';

import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent, title: 'blynq.app - Connect with the World' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/splash/splash').then(m => m.SplashComponent),
    title: 'Login | blynq.app' 
  },
  { path: 'landing', redirectTo: '' },
  { 
    path: 'careers', 
    loadComponent: () => import('./components/careers/careers').then(m => m.CareersComponent),
    title: 'Careers | blynq.app' 
  },
  { 
    path: 'stories', 
    loadComponent: () => import('./components/stories/stories').then(m => m.StoriesComponent),
    title: 'User Stories | blynq.app' 
  },
  
  // Lazy Loaded SEO Landing Pages
  { 
    path: 'omegle-alternative', 
    loadComponent: () => import('./components/omegle-alternative/omegle-alternative').then(m => m.OmegleAlternativeComponent),
    title: 'Omegle Alternative #1 Free and Safe | blynq.app',
    data: {
      description: 'Looking for the best Omegle alternative? blynq.app offers a free, safe, and instant random video chat experience to connect with people globally.',
      keywords: 'omegle alternative, random video chat, free chat, meet strangers'
    }
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
    title: 'Video Chat with Girls - Safe & Instant | blynq.app',
    data: {
      description: 'Join blynq.app for high-quality video chat with girls. Our platform ensures a safe and respectful community for meaningful connections.',
      keywords: 'video chat with girls, girl chat, random video chat, safe chat'
    }
  },
  { 
    path: 'video-chat-with-strangers', 
    loadComponent: () => import('./components/video-chat-with-strangers/video-chat-with-strangers').then(m => m.VideoChatWithStrangersComponent),
    title: 'Video Chat with Strangers - Global & Free | blynq.app' 
  },
  { 
    path: 'omegle-india', 
    loadComponent: () => import('./components/omegle-india/omegle-india').then(m => m.OmegleIndiaComponent),
    title: 'India\'s #1 Omegle Alternative - Safe & Fast | blynq.app',
    data: {
      description: 'The best Omegle alternative for India. Connect with people across India and globally through blynq.app\'s fast and secure video chat.',
      keywords: 'omegle india, omegle alternative india, indian video chat, random chat india'
    }
  },

  { 
    path: 'home', 
    loadComponent: () => import('./components/home/home').then(m => m.HomeComponent),
    canActivate: [AuthGuard], 
    title: 'Home | blynq.app' 
  },
  { 
    path: 'delete-account', 
    loadComponent: () => import('./components/delete-account/delete-account').then(m => m.DeleteAccountComponent),
    title: 'Delete Account | blynq.app' 
  },
  { 
    path: 'privacy-policy', 
    loadComponent: () => import('./components/privacy-policy/privacy-policy').then(m => m.PrivacyPolicyComponent),
    title: 'Privacy Policy | blynq.app' 
  },
  { 
    path: 'safety-standards', 
    loadComponent: () => import('./components/safety-standards/safety-standards').then(m => m.SafetyStandardsComponent),
    title: 'Safety Standards | blynq.app' 
  },
  { path: 'matching', redirectTo: 'home' },
  { path: 'video-chat', redirectTo: 'home' },
  { path: '**', redirectTo: '' }
];
