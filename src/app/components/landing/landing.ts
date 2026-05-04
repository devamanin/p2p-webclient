import { Component, ElementRef, QueryList, ViewChildren, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('revealItem') revealItems!: QueryList<ElementRef>;
  @ViewChild('horizontalSection') horizontalSection!: ElementRef;
  @ViewChild('horizontalTrack') horizontalTrack!: ElementRef;
  @ViewChild('scrollProgress') scrollProgress!: ElementRef;

  private observer: IntersectionObserver | null = null;
  private scrollListener: any;

  ngAfterViewInit() {
    this.setupRevealObserver();
    this.setupHorizontalScroll();
  }

  private setupRevealObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          this.observer?.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '-10% 0px',
      threshold: 0.1
    });

    this.revealItems.forEach(item => {
      this.observer?.observe(item.nativeElement);
    });
  }

  private setupHorizontalScroll() {
    this.scrollListener = () => {
      if (!this.horizontalSection || !this.horizontalTrack) return;

      const section = this.horizontalSection.nativeElement;
      const track = this.horizontalTrack.nativeElement;
      const progress = this.scrollProgress.nativeElement;

      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Calculate how far we've scrolled into the section (0 to 1)
      let scrollPercent = (scrollY - sectionTop) / (sectionHeight - viewportHeight);
      scrollPercent = Math.max(0, Math.min(1, scrollPercent));

      // Map progress to transform (0% to -maxScroll)
      const maxScroll = track.scrollWidth - window.innerWidth;
      const translateX = scrollPercent * maxScroll;

      track.style.transform = `translateX(-${translateX}px)`;
      progress.style.width = `${scrollPercent * 100}%`;
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
    // Initial call
    setTimeout(() => this.scrollListener(), 100);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }
}

