import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Faq {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-omegle-alternative',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './omegle-alternative.html',
  styleUrls: ['../landing/landing.css']
})
export class OmegleAlternativeComponent {
  faqs: Faq[] = [
    {
      question: 'Is Omegle still available?',
      answer: 'No. Omegle permanently shut down on November 8, 2023. The founder cited an inability to combat platform misuse and ongoing legal challenges as the primary reasons for closure. blynq.app was built as a modern, safer replacement that addresses all of the safety and moderation shortcomings that led to Omegle\'s shutdown.',
      open: false
    },
    {
      question: 'Is blynq.app really a safe Omegle alternative?',
      answer: 'Yes. Unlike Omegle, blynq.app requires account registration for accountability, uses AI-powered real-time content moderation, provides instant one-tap reporting and blocking tools, and has a dedicated safety team that reviews all reports. All video calls are encrypted with WebRTC peer-to-peer technology.',
      open: false
    },
    {
      question: 'Is blynq.app free like Omegle was?',
      answer: 'Yes, blynq.app is completely free to use. You can create an account, match with other users, and have unlimited video chats at no cost. Premium matching filters can be unlocked using coins earned through daily logins and watching rewarded ads.',
      open: false
    },
    {
      question: 'Do I need to download anything to use blynq?',
      answer: 'No downloads are needed for the web version. Simply visit blynq.app in your browser and start chatting. We also offer native mobile apps on the Google Play Store for Android and the Apple App Store for iOS if you prefer a dedicated mobile experience.',
      open: false
    },
    {
      question: 'Can I choose who I want to chat with?',
      answer: 'Yes. Unlike Omegle\'s completely random matching, blynq lets you set preferences for gender, location, and interests. Our smart matching algorithm uses these preferences to connect you with people you are more likely to have a meaningful conversation with.',
      open: false
    },
    {
      question: 'What happens if I encounter inappropriate behavior?',
      answer: 'You can instantly block and report any user with a single tap during a video call. Our safety team reviews all reports promptly. Users who violate our community guidelines face immediate and permanent account bans. We also use AI content moderation that works in real-time during video calls.',
      open: false
    }
  ];

  toggleFaq(faq: Faq) {
    faq.open = !faq.open;
  }
}
