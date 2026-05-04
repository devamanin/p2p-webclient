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
  @ViewChildren('featureCard') featureCards!: QueryList<ElementRef>;
  @ViewChildren('dot') dots!: QueryList<ElementRef>;
  @ViewChild('pinSection') pinSection!: ElementRef;
  @ViewChild('pinHeader') pinHeader!: ElementRef;

  private observer: IntersectionObserver | null = null;
  private scrollListener: any;

  ngAfterViewInit() {
    this.setupRevealObserver();
    this.setupPinScroll();
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

  private setupPinScroll() {
    const cardColors = ['#69DAFF', '#D674FF', '#4ADE80', '#FACC15', '#F472B6'];

    this.scrollListener = () => {
      if (!this.pinSection || !this.featureCards || !this.dots || !this.pinHeader) return;

      const section = this.pinSection.nativeElement;
      const cards = this.featureCards.toArray();
      const dotElements = this.dots.toArray();
      const header = this.pinHeader.nativeElement;
      const headerTag = header.querySelector('div');

      const rect = section.getBoundingClientRect();
      const scrollY = window.scrollY;
      const sectionTop = rect.top + scrollY;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate overall progress through the section (0 to 1)
      let progress = (scrollY - sectionTop) / (sectionHeight - viewportHeight);
      progress = Math.max(0, Math.min(1, progress));

      const numCards = cards.length;
      
      // Update each card based on its index
      cards.forEach((cardRef, index) => {
        const card = cardRef.nativeElement;
        const dot = dotElements[index]?.nativeElement;
        if (!dot) return;
        
        // This card's specific active range
        const start = index / numCards;
        const end = (index + 1) / numCards;
        
        // Use a small buffer to ensure the last card stays visible at the very end
        const isActive = index === numCards - 1 
          ? progress >= start && progress <= 1.0
          : progress >= start && progress < end;

        if (isActive) {
          // Current card is active
          card.style.opacity = '1';
          card.style.transform = 'translateY(0) scale(1)';
          card.style.zIndex = '50';
          card.style.pointerEvents = 'auto';
          
          // Update dot style
          dot.style.backgroundColor = cardColors[index];
          dot.style.width = '1rem'; // w-4
          dot.classList.remove('bg-white/20');
          
          // Update header tag color if it exists
          if (headerTag) {
            headerTag.style.borderColor = `${cardColors[index]}33`; // 20% opacity
            headerTag.style.backgroundColor = `${cardColors[index]}1a`; // 10% opacity
            headerTag.style.color = cardColors[index];
          }
        } else if (progress >= end) {
          // Card has been passed
          card.style.opacity = '0';
          card.style.transform = 'translateY(-60px) scale(0.95)';
          card.style.zIndex = '10';
          card.style.pointerEvents = 'none';
          
          // Reset dot style
          dot.style.backgroundColor = '';
          dot.style.width = '0.5rem'; // w-2
          dot.classList.add('bg-white/20');
        } else {
          // Card is upcoming
          card.style.opacity = '0';
          card.style.transform = 'translateY(60px) scale(1.05)';
          card.style.zIndex = '10';
          card.style.pointerEvents = 'none';
          
          // Reset dot style
          dot.style.backgroundColor = '';
          dot.style.width = '0.5rem'; // w-2
          dot.classList.add('bg-white/20');
        }
      });

      // Subtle header animation
      const headerScale = 1 - (progress * 0.05);
      const headerOpacity = 1 - (progress * 0.3);
      header.style.transform = `scale(${headerScale})`;
      header.style.opacity = `${headerOpacity}`;
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
    // Initial call with a small delay to ensure layout is ready
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

