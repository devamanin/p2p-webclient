import { Injectable, signal } from '@angular/core';

// Declare the global functions from the AppLixir SDK
declare var adSession: any;
declare var initializeAndOpenPlayer: any;

export type AdStatus = 
  | 'completed' 
  | 'skipped' 
  | 'no_ads' 
  | 'sys_error' 
  | 'started' 
  | 'closed' 
  | 'ad-watched' 
  | 'ad-empty' 
  | 'ad-error' 
  | 'network-error';

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private readonly API_KEY = 'a925c7d7-e8cb-476d-908b-5374ff5e9d45';
  private readonly DEV_ID = 36;    // Default Test ID
  private readonly GAME_ID = 3922; // Default Test ID
  private readonly ZONE_ID = 2050; // Default Test ID

  private _isAdPlaying = signal<boolean>(false);
  public isAdPlaying = this._isAdPlaying.asReadonly();

  constructor() { }

  /**
   * Triggers a rewarded video ad.
   * @returns A promise that resolves with the final status of the ad.
   */
  showRewardedVideo(): Promise<AdStatus> {
    return new Promise((resolve) => {
      const hasAdSession = typeof adSession !== 'undefined';
      const hasInitPlayer = typeof initializeAndOpenPlayer !== 'undefined';

      console.log('AppLixir SDK Check:', { adSession: hasAdSession, initializeAndOpenPlayer: hasInitPlayer });

      if (!hasAdSession && !hasInitPlayer) {
        console.error('AppLixir SDK not loaded. Check if the script in index.html is blocked or failed to load.');
        alert('Ad SDK failed to load. Please check if you have an ad blocker enabled.');
        resolve('sys_error');
        return;
      }

      const container = document.getElementById('applixir-ad-container');
      if (!container) {
        console.error('AppLixir container div (#applixir-ad-container) not found in the DOM.');
        resolve('sys_error');
        return;
      }

      this._isAdPlaying.set(true);

      // Safety timeout: reset state after 60 seconds if no terminal callback is received
      const safetyTimeout = setTimeout(() => {
        if (this._isAdPlaying()) {
          console.warn('AppLixir Ad safety timeout reached. Resetting state.');
          this._isAdPlaying.set(false);
          resolve('sys_error');
        }
      }, 60000);

      let successSeen = false;

      const handleStatus = (status: any) => {
        // AppLixir sometimes passes an object or a string
        const statusStr = (typeof status === 'string' ? status : (status?.status || JSON.stringify(status))).toLowerCase();
        console.log('AppLixir Ad Status Callback (Normalized):', statusStr);
        
        if (statusStr.includes('watched') || statusStr.includes('completed')) {
          successSeen = true;
        }

        // AppLixir terminal statuses
        const terminalStatuses = [
          'completed', 
          'skipped', 
          'no_ads', 
          'sys_error', 
          'closed', 
          'ad-watched', 
          'ad-empty', 
          'ad-error',
          'network-error'
        ];

        // If it's a terminal status, or if we see 'closed' after seeing a success
        if (terminalStatuses.some(ts => statusStr.includes(ts)) || statusStr === 'closed') {
          clearTimeout(safetyTimeout);
          this._isAdPlaying.set(false);
          // If we saw a success at any point, resolve as 'completed'
          resolve(successSeen ? 'completed' : (statusStr as AdStatus));
        }
      };

      const options = {
        apiKey: this.API_KEY,
        zoneId: this.ZONE_ID,
        devId: this.DEV_ID,
        gameId: this.GAME_ID,
        adStatusCb: handleStatus,
        adStatusCallback: handleStatus,
        adStatusCallbackFn: handleStatus,
        verbosity: 1, // Enable SDK internal logging
        injectionElementId: 'applixir-ad-container'
      };

      console.log('Starting AppLixir Ad with options:', options);

      try {
        if (hasInitPlayer) {
          initializeAndOpenPlayer(options);
        } else {
          adSession(options);
        }
      } catch (error) {
        console.error('Exception while starting AppLixir ad:', error);
        this._isAdPlaying.set(false);
        resolve('sys_error');
      }
    });
  }
}
