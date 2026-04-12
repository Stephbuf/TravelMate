import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonIcon } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { GoogleMapsLoaderService } from 'src/app/services/google-maps-loader.service';

type LocationData = {
  name?: string;
  location_name?: string;
  lat?: number;
  lng?: number;
  address?: string;
};

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.page.html',
  styleUrls: ['./map-view.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonList, IonItem, IonLabel, IonIcon]
})
export class MapViewPage implements OnInit {
  lat!: number;
  lng!: number;
  locationName: string = '';
  map!: google.maps.Map;
  markers = new Map<string, google.maps.Marker>();

  searchTerm: string = '';
  allLocations: LocationData[] = [];
  filteredLocations: LocationData[] = [];

  constructor(
    private route: ActivatedRoute,
    private googleMapsLoader: GoogleMapsLoaderService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.lat = parseFloat(params['lat']);
      this.lng = parseFloat(params['lng']);
      this.locationName = params['name'] || 'Pinned Location';

      const rawOthers = params['others'];
      if (rawOthers) {
        try {
          this.allLocations = JSON.parse(rawOthers);
        } catch (err) {
          console.error('Error parsing others:', err);
          this.allLocations = [];
        }
      }

      this.filteredLocations = [...this.allLocations];

   
      this.googleMapsLoader.load()
        .then(() => this.initMap(this.lat, this.lng, this.locationName))
        .catch(err => console.error('Google Maps failed to load:', err));
    });
  }

  initMap(lat: number, lng: number, name: string) {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat, lng },
      zoom: 14
    });

    this.placeMarker(lat, lng, name);
  }

  getDisplayName(location: LocationData): string {
    return location.name || location.location_name || 'Unnamed';
  }

  toggleMarker(location: LocationData) {
    const displayName = this.getDisplayName(location);

    if (this.markers.has(displayName)) {
      this.markers.get(displayName)!.setMap(null);
      this.markers.delete(displayName);
      return;
    }

    if (location.lat && location.lng) {
      this.placeMarker(location.lat, location.lng, displayName);
    } else if (location.address) {
      const query = encodeURIComponent(location.address);
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=AIzaSyC1h8HyptSYlslcFi6bYYzEqE1FI-7qe1g`)
        .then(res => res.json())
        .then(data => {
          const loc = data.results[0]?.geometry?.location;
          if (loc) {
            this.placeMarker(loc.lat, loc.lng, displayName);
          }
        })
        .catch(err => console.error('Geocoding error:', err));
    }
  }

  placeMarker(lat: number, lng: number, name: string) {
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      title: name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="font-size: 14px; font-weight: 500;">${name}</div>`
    });

    marker.addListener('mouseover', () => infoWindow.open(this.map, marker));
    marker.addListener('mouseout', () => infoWindow.close());

    this.markers.set(name, marker);
  }

  filterLocations() {
    const term = this.searchTerm.toLowerCase();
    this.filteredLocations = this.allLocations.filter(loc =>
      (loc.name || loc.location_name || '').toLowerCase().includes(term)
    );
  }

  addAllMarkers() {
    this.allLocations.forEach(loc => this.toggleMarker(loc));
  }
}
