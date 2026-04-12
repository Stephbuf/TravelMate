import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private apiLoaded = false;

 load(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if ((window as any).google && google.maps && google.maps.places) {
      this.apiLoaded = true;
      resolve();
      return;
    }

    // Already initiated but not finished loading — poll until available
    if (this.apiLoaded) {
      const checkInterval = setInterval(() => {
        if ((window as any).google && google.maps && google.maps.places) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject('Google Maps SDK failed to load in time.');
      }, 10000);
      return;
    }

    // First-time load
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC1h8HyptSYlslcFi6bYYzEqE1FI-7qe1g&libraries=places';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.apiLoaded = true;
      resolve();
    };

    script.onerror = (error) => reject(error);

    document.head.appendChild(script);
  });
}
}