# 🌍 Building a Google Places Autocomplete Component with `PlaceAutocompleteElement` in Angular 19

## ✨ Overview

In this blog, we’ll explore how to integrate the Google Places API in an Angular 19 application using the new `PlaceAutocompleteElement`. This modern approach offers a native element for place predictions, reducing the need for verbose directive wrappers or third-party libraries.

By the end, you’ll learn:

- How to configure your Google Places API key
- Why the `PlaceAutocompleteElement` is a game-changer
- How to load the Maps JavaScript SDK dynamically
- How to create a reusable autocomplete address component in Angular

---

## 🧠 Why Google Places API?

The [Google Places API](https://developers.google.com/maps/documentation/places/web) lets developers access comprehensive information about millions of places globally. It supports:

- **Autocomplete Suggestions**: Improve form UX by suggesting addresses.
- **Rich Place Data**: Get names, locations, formatted addresses, and more.
- **Geolocation Support**: Enable nearby search, place lookup, and map-based queries.

**Ideal for:**

- Address entry in forms
- Location-based services
- Store locators and check-ins

---

## 🔧 Step 1: Setup and Configuration

### 🔌 Enable Required Services

#### 1. Firebase Console (optional for broader use):

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Register your web app and grab your config object
- Store it in Angular’s `environment.ts`

#### 2. Google Cloud Console:

- Visit [Google Cloud Console](https://console.cloud.google.com/)
- Enable the **Places API**
- Navigate to **APIs & Services > Credentials**
- Create a **restricted API Key** (HTTP referrers recommended)

```ts
// environment.ts
export const environment = {
  production: false,
  googleMapsApiKey: 'YOUR_API_KEY_HERE'
};
```

---

## ⚙️ Step 2: Google Maps Loader Service

To load the Google Maps JavaScript API only once and avoid race conditions, we’ll create a dedicated service.

**`googlemap.service.ts`:**

```ts
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleMapService {
  private static googleMapPromise: Promise<typeof google.maps> | null = null;
  private static readonly CALLBACK_NAME = 'GooglePlaces_cb';
  private static readonly API_KEY = environment.googleMapsApiKey;

  public getGoogleMapPlaces() {
    return this.loadGoogleMapPlace();
  }

  private loadGoogleMapPlace(): Promise<typeof google.maps> {
    if (GoogleMapService.googleMapPromise) return GoogleMapService.googleMapPromise;
    const existingScript = document.getElementById('google-places-js-script');
    if (existingScript) return this.getLoadedGoogleMap();
    return this.setGoogleMapScript();
  }

  private getLoadedGoogleMap(): Promise<typeof google.maps> {
    return new Promise((resolve, reject) => {
      if ((window as any).google?.maps) return resolve((window as any).google.maps);
      (window as any)[GoogleMapService.CALLBACK_NAME] = () => resolve((window as any).google.maps);
      const script = document.getElementById('google-places-js-script');
      if (script) script.onerror = reject;
    });
  }

  private setGoogleMapScript(): Promise<typeof google.maps> {
    GoogleMapService.googleMapPromise = new Promise((resolve, reject) => {
      (window as any)[GoogleMapService.CALLBACK_NAME] = () => resolve((window as any).google.maps);
      const script = document.createElement('script');
      script.id = 'google-places-js-script';
      script.src = this.getScriptSrc(GoogleMapService.CALLBACK_NAME);
      script.async = true;
      script.defer = true;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    return GoogleMapService.googleMapPromise;
  }

  private getScriptSrc(callback: string): string {
    const query = new URLSearchParams({
      v: 'weekly',
      callback,
      key: GoogleMapService.API_KEY,
      libraries: 'places',
      language: 'en'
    }).toString();
    return `https://maps.googleapis.com/maps/api/js?${query}`;
  }
}
```

**Why These Methods?**

- `getGoogleMapPlaces()`: Public method for components to trigger the script load.
- `loadGoogleMapPlace()`: Checks if script is already loaded or in progress.
- `getLoadedGoogleMap()`: Waits for an existing script to finish loading.
- `setGoogleMapScript()`: Dynamically adds the Google Maps JS SDK.
- `getScriptSrc()`: Constructs the script URL with required parameters.

---

## 🧩 Step 3: Autocomplete UI Component

Using Angular’s standalone component support (available in v15+), we’ll make a modular and reusable place autocomplete component.

**`placesautocompleteelement.component.ts`:**

```ts
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { GoogleMapService } from '../googlemap.service';

@Component({
  selector: 'auto-complete-ele-1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auto-complete-ele-1.html',
})
export class AutoCompleteElement1 {
  private readonly googleMapService = inject(GoogleMapService);
  public readonly addressGroupContainer = viewChild<ElementRef<HTMLDivElement>>('addressGroupContainer');
  public readonly placeJson = signal(null);

  async ngOnInit() {
    const maps = await this.googleMapService.getGoogleMapPlaces();
    const placeAutocomplete = new maps.places.PlaceAutocompleteElement({
      types: ['geocode'],
    });

    this.addressGroupContainer()?.nativeElement.appendChild(placeAutocomplete);

    placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }: any) => {
      const place = placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'addressComponents'],
      });
      this.placeJson.set(place.toJSON());
    });
  }
}
```

**`placesautocompleteelement.component.html`:**

```html
<div>
  <label for="">Search Google Places</label>
  <div class="address-group position-relative" #addressGroupContainer></div>

  @if (placeJson()) {
    <div>
      <pre>{{ placeJson() | json }}</pre>
    </div>
  }
</div>
```

---

## 📚 Why Use PlaceAutocompleteElement?

Google’s `PlaceAutocompleteElement` is a Web Component introduced to simplify place predictions without needing to manually handle text input, debouncing, or prediction list management.

**Benefits:**

- Native browser event handling (`gmp-select`)
- Automatically styled and localized
- Fetches complete place data including geometry, address, and display name
- Integrates easily with Angular, React, Vue, etc.

---

## 🧼 Best Practices

- **Restrict API Keys:** Always restrict by HTTP referrer to prevent misuse.
- **Load Scripts Lazily:** Don’t include the Maps SDK in `index.html`; instead, load it only when needed.
- **Use Signals or Observables:** Handle place data reactively with Angular signals, subjects, or observables.
- **Error Handling:** Handle script load failure or empty predictions gracefully.

---

## ✅ Conclusion

The new `PlaceAutocompleteElement` paired with Angular 19’s modern features (like standalone components and signals) makes it incredibly straightforward to build responsive, reactive, and user-friendly autocomplete UIs.

By breaking the integration into services and components, you maintain modularity and separation of concerns.

## 🚀 Live Demos

Check out the working demos to see the Google Places Autocomplete in action:

- **StackBlitz Live Demo:**  
  [Open in StackBlitz](https://stackblitz.com/edit/stackblitz-starters-4cwhnwvc?file=src%2Fmain.ts)

- **Source Code on GitHub:**  
  [View on GitHub](https://github.com/bhushanzade/angular-19-google-places-api-placeautocompleteelement)

Explore, fork, and experiment with the code to accelerate your integration!

## 🔗 Resources

- [Google Maps JS API Docs](https://developers.google.com/maps/documentation/javascript/overview)
- [PlaceAutocompleteElement Docs](https://developers.google.com/maps/documentation/javascript/place-autocomplete-element/overview)
- [Angular Signals](https://angular.dev/reference/signals)
- [Secure Google API Keys](https://developers.google.com/maps/api-key-best-practices)

---

## 🧪 Bonus Demo Ideas

You could extend this example with:

- Map marker integration after selection
- Reverse geocoding from coordinates
- Saving selected place to Firebase or Firestore

Happy coding! 🧑‍💻🌐


[![image](https://media.daily.dev/image/upload/s--KIxxV-xl--/f_auto/v1748164689/ugc/content_1b4c6ea8-b236-4485-9323-be9924d53865?_a=BAMClqUq0)](https://procodeprogramming.com/blogs/integrating-google-places-api-with-placeautocompleteelement-in-angular-19)