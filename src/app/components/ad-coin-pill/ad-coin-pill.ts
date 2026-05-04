import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdService } from '../../services/ad.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-ad-coin-pill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-coin-pill.html',
  styleUrl: './ad-coin-pill.css'
})
export class AdCoinPill {
  private adService = inject(AdService);
  private userPrefs = inject(UserPreferencesService);

  coins = toSignal(this.userPrefs.coins$);
  isAdPlaying = this.adService.isAdPlaying;

  async watchAd() {
    if (this.isAdPlaying()) return;

    const status = await this.adService.showRewardedVideo();
    console.log('[AdCoinPill] Ad finished with status:', status);
    
    if (status === 'completed' || status === 'ad-watched') {
      this.userPrefs.addCoins(50);
      alert('Congratulations! You earned 50 coins.');
    } else if (status === 'no_ads' || status === 'ad-empty') {
      alert('No ads available at the moment. Please try again later.');
    }
  }
}
