import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';

import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: LandingComponent, 
    title: 'blynq.app - Connect with the World',
    data: {
      description: 'Join blynq.app to connect with people from around the world through peer-to-peer video calls and group chats. The safest random video chat experience.',
      keywords: 'video chat, p2p call, connect, meet new people, global chat, blynq, anonymous chat, random chat, chat with girls, omegle'
    }
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/splash/splash').then(m => m.SplashComponent),
    title: 'Login | blynq.app',
    data: {
      description: 'Login to blynq.app to connect with people from around the world through peer-to-peer video calls and group chats.',
      keywords: 'login, blynq, video chat, sign in'
    }
  },
  { path: 'landing', redirectTo: '' },
  { 
    path: 'careers', 
    loadComponent: () => import('./components/careers/careers').then(m => m.CareersComponent),
    title: 'Careers | blynq.app',
    data: {
      description: 'Join the blynq team and help us build the future of global connection. Explore career opportunities in engineering, design, and community.',
      keywords: 'careers, jobs, blynq, work at blynq'
    }
  },
  { 
    path: 'stories', 
    loadComponent: () => import('./components/stories/stories').then(m => m.StoriesComponent),
    title: 'User Stories | blynq.app',
    data: {
      description: 'Discover amazing stories and meaningful connections made by users on blynq.app. See how people are connecting worldwide.',
      keywords: 'user stories, blynq stories, community, global connections'
    }
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
    title: 'Random Video Chat - Free Live & Safe | blynq.app',
    data: {
      description: 'Connect with people worldwide through our high-speed random video chat. Safe, free, and instant connections on blynq.app.',
      keywords: 'random video chat, free video chat, live chat, connect with people'
    }
  },
  { 
    path: 'ogtv-alternative', 
    loadComponent: () => import('./components/ogtv-alternative/ogtv-alternative').then(m => m.OgtvAlternativeComponent),
    title: 'OGTV Alternative - Fast & Secure Video Chat | blynq.app',
    data: {
      description: 'Looking for a fast and secure OGTV alternative? blynq.app provides the best video chat experience with global reach and advanced moderation.',
      keywords: 'ogtv alternative, video chat, secure chat, anonymous video chat'
    }
  },
  { 
    path: 'monkey-app-alternative', 
    loadComponent: () => import('./components/monkey-app-alternative/monkey-app-alternative').then(m => m.MonkeyAppAlternativeComponent),
    title: 'Monkey App Alternative - Meet New People | blynq.app',
    data: {
      description: 'The ultimate Monkey App alternative. Meet new people, make friends, and enjoy safe video chats on blynq.app.',
      keywords: 'monkey app alternative, meet new people, social video chat, make friends'
    }
  },
  { 
    path: 'ometv-alternative', 
    loadComponent: () => import('./components/ometv-alternative/ometv-alternative').then(m => m.OmetvAlternativeComponent),
    title: 'Ome.tv Alternative - Anonymous Video Chat | blynq.app',
    data: {
      description: 'Experience the best Ome.tv alternative. blynq.app offers a superior anonymous video chat experience with smart interest matching.',
      keywords: 'ometv alternative, ome.tv alternative, anonymous chat, random chat'
    }
  },
  { 
    path: 'chatroulette-alternative', 
    loadComponent: () => import('./components/chatroulette-alternative/chatroulette-alternative').then(m => m.ChatrouletteAlternativeComponent),
    title: 'Chatroulette Alternative - Global Video Chat | blynq.app',
    data: {
      description: 'Join the top Chatroulette alternative for safe and fun global video chat. Connect instantly with strangers on blynq.app.',
      keywords: 'chatroulette alternative, global video chat, random video chat, connect with strangers'
    }
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
    title: 'Video Chat with Strangers - Global & Free | blynq.app',
    data: {
      description: 'Connect with strangers globally through our free and secure video chat platform. blynq.app makes meeting new people easy and safe.',
      keywords: 'video chat with strangers, talk to strangers, free video chat, global chat'
    }
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
    title: 'Delete Account | blynq.app',
    data: {
      description: 'Delete your blynq.app account. We value your privacy and make it simple to manage your data.',
      keywords: 'delete account, privacy, manage data'
    }
  },
  { 
    path: 'privacy-policy', 
    loadComponent: () => import('./components/privacy-policy/privacy-policy').then(m => m.PrivacyPolicyComponent),
    title: 'Privacy Policy | blynq.app',
    data: {
      description: 'Read our Privacy Policy to understand how blynq.app collects, uses, and protects your personal information.',
      keywords: 'privacy policy, data protection, privacy'
    }
  },
  { 
    path: 'safety-standards', 
    loadComponent: () => import('./components/safety-standards/safety-standards').then(m => m.SafetyStandardsComponent),
    title: 'Safety Standards | blynq.app',
    data: {
      description: 'Learn about blynq.app\'s safety standards and community guidelines. We are committed to providing a safe and respectful environment for all.',
      keywords: 'safety, community guidelines, safe chat'
    }
  },
  { path: 'matching', redirectTo: 'home' },
  { path: 'video-chat', redirectTo: 'home' },
  { path: '**', redirectTo: '' }
];
