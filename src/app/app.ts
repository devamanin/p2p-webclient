import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('web-client');
  
  constructor(private seoService: SeoService) {
    this.seoService.init();
    console.log('App Component Initialized with SEO Service');
  }
}
