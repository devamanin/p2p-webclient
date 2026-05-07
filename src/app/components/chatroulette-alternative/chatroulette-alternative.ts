import { Component, ElementRef, QueryList, ViewChildren, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chatroulette-alternative',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chatroulette-alternative.html',
  styleUrls: ['../landing/landing.css']
})
export class ChatrouletteAlternativeComponent implements AfterViewInit, OnDestroy {
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

      let progress = (scrollY - sectionTop) / (sectionHeight - viewportHeight);
      progress = Math.max(0, Math.min(1, progress));

      const numCards = cards.length;
      
      cards.forEach((cardRef, index) => {
        const card = cardRef.nativeElement;
        const dot = dotElements[index]?.nativeElement;
        if (!dot) return;
        
        const start = index / numCards;
        const end = (index + 1) / numCards;
        
        const isActive = index === numCards - 1 
          ? progress >= start && progress <= 1.0
          : progress >= start && progress < end;

        if (isActive) {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0) scale(1)';
          card.style.zIndex = '50';
          card.style.pointerEvents = 'auto';
          
          dot.style.backgroundColor = cardColors[index];
          dot.style.width = '1rem';
          dot.classList.remove('bg-white/20');
          
          if (headerTag) {
            headerTag.style.borderColor = `${cardColors[index]}33`;
            headerTag.style.backgroundColor = `${cardColors[index]}1a`;
            headerTag.style.color = cardColors[index];
          }
        } else if (progress >= end) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(-60px) scale(0.95)';
          card.style.zIndex = '10';
          card.style.pointerEvents = 'none';
          
          dot.style.backgroundColor = '';
          dot.style.width = '0.5rem';
          dot.classList.add('bg-white/20');
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(60px) scale(1.05)';
          card.style.zIndex = '10';
          card.style.pointerEvents = 'none';
          
          dot.style.backgroundColor = '';
          dot.style.width = '0.5rem';
          dot.classList.add('bg-white/20');
        }
      });

      const headerScale = 1 - (progress * 0.05);
      const headerOpacity = 1 - (progress * 0.3);
      header.style.transform = `scale(${headerScale})`;
      header.style.opacity = `${headerOpacity}`;
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
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
