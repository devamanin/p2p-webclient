import { Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash';
import { HomeComponent } from './components/home/home';
import { DeleteAccountComponent } from './components/delete-account/delete-account';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy';
import { SafetyStandardsComponent } from './components/safety-standards/safety-standards';
import { LandingComponent } from './components/landing/landing';
import { CareersComponent } from './components/careers/careers';
import { StoriesComponent } from './components/stories/stories';
import { OmegleAlternativeComponent } from './components/omegle-alternative/omegle-alternative';
import { RandomChatComponent } from './components/random-chat/random-chat';
import { OgtvAlternativeComponent } from './components/ogtv-alternative/ogtv-alternative';
import { MonkeyAppAlternativeComponent } from './components/monkey-app-alternative/monkey-app-alternative';
import { OmetvAlternativeComponent } from './components/ometv-alternative/ometv-alternative';
import { ChatrouletteAlternativeComponent } from './components/chatroulette-alternative/chatroulette-alternative';
import { VideoChatWithGirlsComponent } from './components/video-chat-with-girls/video-chat-with-girls';
import { VideoChatWithStrangersComponent } from './components/video-chat-with-strangers/video-chat-with-strangers';

import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent, title: 'blynq.app - Connect with the World' },
  { path: 'login', component: SplashComponent, title: 'Login | blynq.app' },
  { path: 'landing', redirectTo: '' },
  { path: 'careers', component: CareersComponent, title: 'Careers | blynq.app' },
  { path: 'stories', component: StoriesComponent, title: 'User Stories | blynq.app' },
  { path: 'omegle-alternative', component: OmegleAlternativeComponent, title: 'Omegle Alternative #1 Free and Safe | blynq.app' },
  { path: 'random-video-chat', component: RandomChatComponent, title: 'Random Video Chat - Free Live & Safe | blynq.app' },
  { path: 'ogtv-alternative', component: OgtvAlternativeComponent, title: 'OGTV Alternative - Fast & Secure Video Chat | blynq.app' },
  { path: 'monkey-app-alternative', component: MonkeyAppAlternativeComponent, title: 'Monkey App Alternative - Meet New People | blynq.app' },
  { path: 'ometv-alternative', component: OmetvAlternativeComponent, title: 'Ome.tv Alternative - Anonymous Video Chat | blynq.app' },
  { path: 'chatroulette-alternative', component: ChatrouletteAlternativeComponent, title: 'Chatroulette Alternative - Global Video Chat | blynq.app' },
  { path: 'video-chat-with-girls', component: VideoChatWithGirlsComponent, title: 'Video Chat with Girls - Safe & Instant | blynq.app' },
  { path: 'video-chat-with-strangers', component: VideoChatWithStrangersComponent, title: 'Video Chat with Strangers - Global & Free | blynq.app' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], title: 'Home | blynq.app' },
  { path: 'delete-account', component: DeleteAccountComponent, title: 'Delete Account | blynq.app' },
  { path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'Privacy Policy | blynq.app' },
  { path: 'safety-standards', component: SafetyStandardsComponent, title: 'Safety Standards | blynq.app' },
  { path: 'matching', redirectTo: 'home' },
  { path: 'video-chat', redirectTo: 'home' },
  { path: '**', redirectTo: '' }
];
