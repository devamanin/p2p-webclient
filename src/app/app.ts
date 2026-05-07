import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('web-client');
  
  constructor(private seoService: SeoService) {
    console.log('App Component Constructor');
  }

  ngOnInit() {
    try {
      this.seoService.init();
      console.log('SEO Service initialized in ngOnInit');
    } catch (error) {
      console.error('Failed to initialize SEO Service:', error);
    }
  }
}
