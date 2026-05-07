import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly baseUrl = 'https://blynq.app';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private meta: Meta
  ) {}

  /**
   * Initializes the SEO service to track route changes and update the canonical URL and social meta tags.
   */
  init() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateSeoTags();
    });
    
    // Delay initial update to ensure router state is fully initialized
    setTimeout(() => {
      this.updateSeoTags();
    }, 0);
  }

  /**
   * Updates or creates the canonical link tag and social meta tags.
   */
  private updateSeoTags() {
    try {
      if (!this.router || !this.router.url) return;

      // Get current path without query params or fragments
      const path = this.router.url.split('?')[0].split('#')[0];
      
      // Normalize URL: avoid trailing slashes unless it's the root
      const normalizedPath = path === '/' ? '' : path.replace(/\/$/, '');
      const fullUrl = `${this.baseUrl}${normalizedPath}/`;

      // 1. Update Canonical Link
      if (this.document && this.document.head) {
        let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
        if (!link) {
          link = this.document.createElement('link');
          link.setAttribute('rel', 'canonical');
          this.document.head.appendChild(link);
        }
        link.setAttribute('href', fullUrl);
      }

      // 2. Update Social URLs
      this.meta.updateTag({ property: 'og:url', content: fullUrl });
      this.meta.updateTag({ name: 'twitter:url', content: fullUrl });

      // 3. Update Description and Keywords from Route Data
      if (this.router.routerState && this.router.routerState.snapshot) {
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) {
          route = route.firstChild;
        }
        
        const data = route.data;
        if (data) {
          if (data['description']) {
            this.meta.updateTag({ name: 'description', content: data['description'] });
            this.meta.updateTag({ property: 'og:description', content: data['description'] });
            this.meta.updateTag({ name: 'twitter:description', content: data['description'] });
          }

          if (data['keywords']) {
            this.meta.updateTag({ name: 'keywords', content: data['keywords'] });
          }
        }
      }
    } catch (error) {
      console.error('SeoService: Error updating SEO tags', error);
    }
  }
}
