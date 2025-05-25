import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoogleMapService {
  private static googleMapPromise: Promise<typeof google.maps> | null = null;
  private static readonly CALLBACK_NAME = 'GooglePlaces_cb';

  public getGoogleMapPlaces() {
    return this.loadGoogleMapPlace();
  }

  private loadGoogleMapPlace(): Promise<typeof google.maps> {
    if (GoogleMapService.googleMapPromise) {
      return GoogleMapService.googleMapPromise;
    }
    const existingScript = document.getElementById('google-places-js-script');
    if (existingScript) {
      return this.getLoadedGoogleMap();
    }
    return this.setGoogleMapScript();
  }

  private getLoadedGoogleMap(): Promise<typeof google.maps> {
    return new Promise((resolve, reject) => {
      if ((window as any).google && (window as any).google.maps) {
        resolve((window as any).google.maps);
      } else {
        (window as any)[GoogleMapService.CALLBACK_NAME] = () => {
          resolve((window as any).google.maps);
        };
        const script = document.getElementById('google-places-js-script');
        if (script) script.onerror = reject;
      }
    });
  }

  private setGoogleMapScript(): Promise<typeof google.maps> {
    if (GoogleMapService.googleMapPromise) {
      return GoogleMapService.googleMapPromise;
    }
    GoogleMapService.googleMapPromise = new Promise((resolve, reject) => {
      (window as any)[GoogleMapService.CALLBACK_NAME] = () => {
        resolve((window as any).google.maps);
      };
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.id = 'google-places-js-script';
      script.src = this.getScriptSrc(GoogleMapService.CALLBACK_NAME);
      script.onerror = reject;
      document.body.appendChild(script);
    });
    return GoogleMapService.googleMapPromise;
  }

  private getScriptSrc(callback: string): string {
    const query = {
      v: 'weekly',
      callback,
      key: 'Replace your firebase key',
      libraries: 'places',
      loading: 'async',
      language: 'en',
    };
    const params = (Object.keys(query) as Array<keyof typeof query>)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return `//maps.googleapis.com/maps/api/js?${params}`;
  }
}
