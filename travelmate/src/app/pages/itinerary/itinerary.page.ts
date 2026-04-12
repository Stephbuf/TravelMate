import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';

declare const google: any;

interface LocationEntry {
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
}

@Component({
  selector: 'app-itinerary',
  templateUrl: './itinerary.page.html',
  styleUrls: ['./itinerary.page.scss'],
  standalone: true,
  imports: [IonicModule, NgIf],
})
export class ItineraryPage implements AfterViewInit {
  selectedLocation: LocationEntry | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      console.log('Raw query params:', params);

      const lat = parseFloat(params['lat']);
      const lng = parseFloat(params['lng']);

      if (!isNaN(lat) && !isNaN(lng)) {
        this.selectedLocation = {
          name: params['name'] || 'Pinned Location',
          city: params['city'] || '',
          address: params['address'] || '',
          category: params['category'] || '',
          lat,
          lng,
        };

        console.log('Selected Location:', this.selectedLocation);
        setTimeout(() => this.loadMap(), 300);
      } else {
        console.warn('Latitude and/or longitude are missing or invalid.');
      }
    });
  }

  loadMap(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement || !this.selectedLocation) {
      console.error('Map element or selected location not available.');
      return;
    }

    const { lat, lng, name } = this.selectedLocation;

    const map = new google.maps.Map(mapElement as HTMLElement, {
      center: { lat, lng },
      zoom: 14,
    });

    // Marker for selected location
    new google.maps.Marker({
      position: { lat, lng },
      map,
      title: name,
    });

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

      
          new google.maps.Marker({
            position: { lat: userLat, lng: userLng },
            map,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          const bounds = new google.maps.LatLngBounds();
          bounds.extend(new google.maps.LatLng(lat, lng));
          bounds.extend(new google.maps.LatLng(userLat, userLng));
          map.fitBounds(bounds);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    } else {
      console.warn('Geolocation not supported by this browser.');
    }

    console.log('Map rendered with selected and current location markers');
  }
}
