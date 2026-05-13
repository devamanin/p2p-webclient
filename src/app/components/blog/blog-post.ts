import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BLOG_POSTS, BlogPost } from './blog-data';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-post.html',
  styleUrls: ['../landing/landing.css']
})
export class BlogPostComponent implements OnInit {
  post: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      this.post = BLOG_POSTS.find(p => p.slug === slug) || null;
      if (this.post) {
        this.relatedPosts = BLOG_POSTS
          .filter(p => p.slug !== slug && p.category === this.post!.category)
          .slice(0, 2);
        if (this.relatedPosts.length < 2) {
          const more = BLOG_POSTS.filter(p => p.slug !== slug && !this.relatedPosts.includes(p)).slice(0, 2 - this.relatedPosts.length);
          this.relatedPosts.push(...more);
        }
      }
    });
  }
}
