import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonFab, IonFabButton, IonIcon, IonBackButton, IonButtons,} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { add, search, searchOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { GoogleMapsLoaderService } from 'src/app/services/google-maps-loader.service';

@Component({
  selector: 'app-search-location',
  templateUrl: './search-location.page.html',
  styleUrls: ['./search-location.page.scss'],
  standalone: true,
  imports: [IonButtons, IonBackButton, IonContent, CommonModule, FormsModule, IonFab, IonFabButton, IonIcon]
})
export class SearchLocationPage implements AfterViewInit {
  map!: google.maps.Map;
  autocomplete!: google.maps.places.Autocomplete;
  inputElement!: HTMLInputElement;
  searchQuery: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private googleMapsLoader: GoogleMapsLoaderService) {
    addIcons({search,add,searchOutline});
  }

async ngAfterViewInit(): Promise<void> {
  try {
    await this.googleMapsLoader.load();

    setTimeout(() => {
      this.inputElement = document.getElementById('search-input-location') as HTMLInputElement;
      this.initializeAutocomplete();
    }, 0);

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['query'] || '';
      if (this.searchQuery) {
        this.loadMap();
      }
    });

  } catch (error) {
    console.error('Google Maps failed to load', error);
  }
}

  initializeAutocomplete(): void {
    if (!this.inputElement) return;

    this.autocomplete = new google.maps.places.Autocomplete(this.inputElement, {
      types: ['establishment'],
      fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components']
    });

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (place && place.geometry && place.place_id) {
        const addressComponents = place.address_components || [];

        const getComponent = (type: string) => {
          const match = addressComponents.find(c => c.types.includes(type));
          return match ? match.long_name : '';
        };

        this.searchQuery = place.formatted_address || place.name || '';

        localStorage.setItem('selectedPlace', JSON.stringify({
          name: place.name,
          address: place.formatted_address,
          placeId: place.place_id,
          city: getComponent('locality'),
          country: getComponent('country')
        }));

        this.loadMap();
      }
    });
  }

  async loadMap(): Promise<void> {
    const mapElement = document.getElementById('map') as HTMLElement;
    if (!mapElement) {
      console.error('Map element not found');
      return;
    }

    this.map = new google.maps.Map(mapElement, {
      center: { lat: 0, lng: 0 },
      zoom: 14,
      mapId: 'DEMO_MAP_ID'
    });

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: this.searchQuery }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        if (location) {
          this.map.setCenter(location);

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map: this.map,
            position: location,
            title: this.searchQuery
          });
        }
      } else {
        alert('Location not found.');
        console.error('Geocode error:', status);
      }
    });
  }

  goToAddLocation(): void {
    this.router.navigate(['/add-location']);
  }

  onSubmit(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate([], {
        queryParams: { query: this.searchQuery.trim() },
        queryParamsHandling: 'merge'
      });
    }
  }
}
