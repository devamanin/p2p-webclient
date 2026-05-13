import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Faq {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent {
  faqs: Faq[] = [
    {
      question: 'Is blynq.app free to use?',
      answer: 'Yes, blynq.app is completely free to use. You can sign up, match with people, and have unlimited video chats at no cost. We also offer a coin-based reward system where you can earn coins through daily logins and watching ads to unlock premium matching filters like gender and location preferences.',
      open: false
    },
    {
      question: 'How does blynq.app keep users safe?',
      answer: 'Safety is our top priority. We use real-time AI-powered content moderation to detect and prevent inappropriate behavior. Every user has access to one-tap reporting and blocking tools. All video calls are transmitted using peer-to-peer WebRTC encryption, meaning your conversations are never stored on our servers. We also have strict community guidelines and a dedicated safety team that reviews all reports promptly.',
      open: false
    },
    {
      question: 'What devices can I use blynq.app on?',
      answer: 'blynq.app is available on multiple platforms. You can use it directly in your web browser on any desktop or laptop computer without downloading anything. We also have native apps available for Android on the Google Play Store and for iOS on the Apple App Store, so you can connect on the go from your smartphone or tablet.',
      open: false
    },
    {
      question: 'How is blynq different from Omegle or Chatroulette?',
      answer: 'Unlike legacy platforms like Omegle (which has shut down) or Chatroulette, blynq.app uses a smart interest-based matching algorithm that pairs you with people who share your hobbies, language preferences, and demographics. This means less random skipping and more meaningful conversations. We also offer features those platforms never had, like friend requests, offline messaging, Real Mode for local matching, and robust safety tools.',
      open: false
    },
    {
      question: 'Do I need to create an account to use blynq?',
      answer: 'Yes, creating an account is required to use blynq.app. You can sign up quickly using your Google account or email address. We require accounts to maintain accountability in our community and to power our smart matching algorithm with your interest preferences. The sign-up process takes less than 30 seconds.',
      open: false
    },
    {
      question: 'What is Real Mode?',
      answer: 'Real Mode is a unique blynq feature that uses proximity-based matching to connect you with people near your physical location. It is perfect for meeting locals, finding nearby study partners, or connecting with people in your city. You can toggle Real Mode on and off at any time, and your exact location is never shared with other users — we only use it for matching purposes.',
      open: false
    },
    {
      question: 'Can I add someone as a friend after a video chat?',
      answer: 'Absolutely! If you have a great conversation and want to stay in touch, you can send a friend request directly during the video call. Once accepted, you can chat with them offline through our built-in messaging system and even start a direct video call with them anytime. This is one of the features that sets blynq apart from other random video chat platforms.',
      open: false
    },
    {
      question: 'How does the coin and reward system work?',
      answer: 'blynq uses a virtual coin economy to unlock premium features. You earn coins through daily login bonuses and by watching short rewarded video ads. These coins can be spent on premium matching filters such as gender-based matching and location-specific filters. This system keeps the platform free for everyone while giving engaged users access to enhanced matching options.',
      open: false
    },
    {
      question: 'Is my video chat data stored or recorded?',
      answer: 'No. All video and audio data on blynq.app is transmitted directly between you and the person you are chatting with using peer-to-peer WebRTC technology. This means your conversations are never routed through or stored on our servers. We take your privacy extremely seriously and do not record, store, or monitor the content of your video calls.',
      open: false
    },
    {
      question: 'What should I do if I encounter inappropriate behavior?',
      answer: 'If you encounter any inappropriate behavior during a video chat, you can immediately tap the Report button on the call screen. This will flag the user for review by our safety team. You can also block the user instantly to prevent any further contact. For urgent safety concerns, you can email our dedicated safety team directly at support@blynq.app. We take all reports seriously and investigate them promptly.',
      open: false
    }
  ];

  toggleFaq(faq: Faq) {
    faq.open = !faq.open;
  }
}
