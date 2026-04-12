import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleMapsLoaderService } from '../services/google-maps-loader.service';


@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Tab1Page implements AfterViewInit {
  searchQuery: string = '';
  inputElement!: HTMLInputElement;
  autocomplete!: google.maps.places.Autocomplete;

  constructor( private router: Router,private gmapsLoader: GoogleMapsLoaderService) {}

  async ngAfterViewInit(): Promise<void> {
    await this.gmapsLoader.load();

    setTimeout(() => {
      this.inputElement = document.getElementById('search-input-tab1') as HTMLInputElement;

      if (this.inputElement) {
        this.autocomplete = new google.maps.places.Autocomplete(this.inputElement, {
          types: ['geocode'],
          fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components']
        });

        this.autocomplete.addListener('place_changed', () => {
          const place = this.autocomplete.getPlace();
          if (place && place.place_id) {
            const components = place.address_components || [];
            const getComponent = (type: string) =>
              components.find(c => c.types.includes(type))?.long_name || '';

            const city = getComponent('locality') || getComponent('postal_town') || getComponent('administrative_area_level_1');
            const country = getComponent('country');

            localStorage.setItem('selectedPlace', JSON.stringify({
              name: place.name,
              address: place.formatted_address,
              placeId: place.place_id,
              city,
              country
            }));

            this.searchQuery = place.formatted_address || place.name || '';
          }
        });
      } else {
        console.error('Could not find input element with id="search-input-tab1"');
      }
    }, 0);
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.searchQuery.trim()) {
      this.router.navigate(['/search-location'], {
        queryParams: { query: this.searchQuery.trim() }
      });
    }
  }
}
