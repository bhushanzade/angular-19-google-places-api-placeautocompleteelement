import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { GoogleMapService } from '../googlemap.service';

@Component({
  selector: 'auto-complete-ele-2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auto-complete-ele-2.html',
})
export class AutoCompleteElement2 {
  private readonly googleMapService = inject(GoogleMapService);
  public readonly addressGroupContainer = viewChild<ElementRef<HTMLDivElement>>(
    'addressGroupContainer'
  );
  public readonly addressFieldContainer = viewChild<ElementRef<HTMLElement>>(
    'addressFieldContainer'
  );
  public readonly placeAutocompleteDropdown = viewChild<
    ElementRef<HTMLElement>
  >('placeAutocompleteDropdown');

  private readonly addressField: WritableSignal<HTMLInputElement | undefined> =
    signal(undefined);
  private readonly addressLabelField: WritableSignal<
    HTMLLabelElement | undefined
  > = signal(undefined);

  public readonly placeJson = signal(null);

  async ngOnInit() {
    console.log('AutoCompleteElement2 maps called');
    const maps = await this.googleMapService.getGoogleMapPlaces();
    console.log('AutoCompleteElement2 maps', maps);
    console.log('maps.places', maps.places);

    const placeAutocomplete = new maps.places.PlaceAutocompleteElement({
      types: ['geocode'],
    });

    const inputAutocompleteElement = this.createInputEle(placeAutocomplete);
    const dropdownElement = this.createDropdownEle(placeAutocomplete);
    const labelElement = this.createLabelEle();

    this.addressField.set(inputAutocompleteElement);
    this.addressLabelField.set(labelElement);

    this.addressFieldContainer()?.nativeElement.appendChild(
      this.addressField()!
    );
    this.addressFieldContainer()?.nativeElement.appendChild(
      this.addressLabelField()!
    );
    this.placeAutocompleteDropdown()?.nativeElement.appendChild(
      dropdownElement
    );

    if (this.addressField && this.addressField()) {
      // this.addressField()?.addEventListener('blur', (e) => {
      // 	// this.selectedPlace.set((e.target as HTMLInputElement).value);
      // 	this.hasFocus.set(false);
      // 	this.onBlur();
      // });
    }

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

  private createInputEle(placeAutocomplete: any) {
    const input = placeAutocomplete.Eg;
    input.setAttribute('value', ''); // You can pass default value
    input.classList.add('form-control');
    input.id = 'google-place-address';
    input.setAttribute('placeholder', 'Search google place address');
    input.setAttribute('autocomplete', 'new-google-address');
    return input;
  }

  private createLabelEle() {
    const label = document.createElement('label');
    label.className = 'color-gray d-flex';
    label.htmlFor = 'google-place-address';
    label.textContent = 'Google Place Address';
    return label;
  }

  private createDropdownEle(placeAutocomplete: any) {
    const divEle = document.createElement('div');
    divEle.className = 'predictions-anchor';
    const dropdown = (placeAutocomplete as any).Jg;
    dropdown.classList.add('dropdown');
    dropdown.classList.add('dropdown-results');
    dropdown.classList.add('gpai-dropdown');
    dropdown.classList.add('gpai-dropdown-results');
    dropdown.setAttribute('part', 'prediction-list');
    divEle.appendChild(dropdown);
    return divEle;
  }

  @HostListener('document:mousedown', ['$event'])
  onHandleOutsideClick(event: MouseEvent) {
    const groupContainer = this.addressGroupContainer()?.nativeElement;
    const dropdown = this.placeAutocompleteDropdown()?.nativeElement;
    if (!groupContainer || !dropdown) return;
    if (!groupContainer.contains(event.target as Node)) {
      dropdown.style.display = 'none';
    } else {
      dropdown.style.display = '';
    }
  }
}
