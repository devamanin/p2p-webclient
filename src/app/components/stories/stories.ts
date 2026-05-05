import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Story {
  id: number;
  title: string;
  author: string;
  category: 'Public Speaking' | 'Real Life' | 'Social' | 'Campus';
  content: string;
  image: string;
  date: string;
  avatar: string;
  audioUrl?: string;
  type: 'text' | 'audio';
}

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stories.html',
  styleUrl: './stories.css'
})
export class StoriesComponent {
  stories: Story[] = [
    {
      id: 5,
      title: "The Sound of the City at 3 AM",
      author: "Marcus Thorne",
      category: 'Real Life',
      content: "I recorded this while walking through the empty metro station. There's a specific rhythm to the city when it sleeps—the hum of the escalators, the distant siren, the echo of your own footsteps. It's when I feel most connected to the architecture of our lives.",
      image: 'assets/stories/metro.jpg',
      avatar: 'https://i.pravatar.cc/150?u=marcus',
      date: 'Oct 25, 2024',
      audioUrl: 'assets/audio/city-sounds.mp3',
      type: 'audio'
    },
    {
      id: 1,
      title: "The 30-Second Stage Panic",
      author: "Alex Rivers",
      category: 'Public Speaking',
      content: "I stood in front of 200 people, and for exactly thirty seconds, the world went silent. I forgot my own name, let alone my opening line. But then I saw a student in the front row nodding, and it all came back. That vulnerability actually made the audience lean in more than any perfect speech could have.",
      image: 'assets/stories/speech.jpg',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      date: 'Oct 12, 2024',
      type: 'text'
    },
    {
      id: 2,
      title: "Finding Connection in a Coffee Shop",
      author: "Sarah Chen",
      category: 'Social',
      content: "I was always the person who used my phone as a shield. One day, I decided to leave it in my pocket. I ended up talking to a retired architect for two hours about how the city has changed. It reminded me that every stranger is just a story we haven't read yet.",
      image: 'assets/stories/coffee.jpg',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      date: 'Oct 15, 2024',
      type: 'text'
    },
    {
      id: 3,
      title: "Midnight Library Debates",
      author: "Jordan Smith",
      category: 'Campus',
      content: "Our best ideas didn't come from the lectures; they came from the 2 AM debates in the 24-hour library over lukewarm pizza. Those moments where we argued about philosophy and physics were where we really learned how to think.",
      image: 'assets/stories/campus.jpg',
      avatar: 'https://i.pravatar.cc/150?u=jordan',
      date: 'Oct 18, 2024',
      type: 'text'
    },
    {
      id: 4,
      title: "The First Blynq Connection",
      author: "Maya Patel",
      category: 'Real Life',
      content: "I matched with someone 3,000 miles away. We didn't talk about the weather; we talked about our shared fear of failure. It was the most honest conversation I've had in years, and it happened through a screen.",
      image: 'assets/stories/connection.jpg',
      avatar: 'https://i.pravatar.cc/150?u=maya',
      date: 'Oct 20, 2024',
      type: 'text'
    }
  ];

  selectedCategory: string = 'All';
  selectedType: string = 'All';
  categories = ['All', 'Public Speaking', 'Real Life', 'Social', 'Campus'];
  storyTypes = [
    { id: 'All', label: 'All Stories', icon: 'auto_stories' },
    { id: 'text', label: 'Text Stories', icon: 'description' },
    { id: 'audio', label: 'Voice Stories', icon: 'mic' }
  ];

  get filteredStories() {
    return this.stories.filter(s => {
      const categoryMatch = this.selectedCategory === 'All' || s.category === this.selectedCategory;
      const typeMatch = this.selectedType === 'All' || s.type === this.selectedType;
      return categoryMatch && typeMatch;
    });
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }

  selectType(type: string) {
    this.selectedType = type;
  }
}
