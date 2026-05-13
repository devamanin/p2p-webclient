import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BLOG_POSTS, BlogPost } from './blog-data';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog.html',
  styleUrls: ['../landing/landing.css']
})
export class BlogComponent {
  posts: BlogPost[] = BLOG_POSTS;
  selectedCategory = 'All';
  categories = ['All', ...new Set(BLOG_POSTS.map(p => p.category))];

  get filteredPosts() {
    if (this.selectedCategory === 'All') return this.posts;
    return this.posts.filter(p => p.category === this.selectedCategory);
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }
}
