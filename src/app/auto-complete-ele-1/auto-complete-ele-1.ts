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
  public readonly addressGroupContainer = viewChild<ElementRef<HTMLDivElement>>(
    'addressGroupContainer'
  );
  public readonly placeJson = signal(null);

  async ngOnInit() {
    console.log('AutoCompleteElement1 maps called');
    const maps = await this.googleMapService.getGoogleMapPlaces();
    console.log('AutoCompleteElement1 maps', maps);
    const placeAutocomplete = new maps.places.PlaceAutocompleteElement({
      types: ['geocode'],
    });
    this.addressGroupContainer()?.nativeElement.appendChild(placeAutocomplete);

    placeAutocomplete.addEventListener(
      'gmp-select',
      async ({ placePrediction }: any) => {
        const place = placePrediction.toPlace();
        await place.fetchFields({
          fields: [
            'displayName',
            'formattedAddress',
            'location',
            'addressComponents',
          ],
        });

        if (place.toJSON()) {
          this.placeJson.set(place.toJSON());
        }
      }
    );
  }
}
