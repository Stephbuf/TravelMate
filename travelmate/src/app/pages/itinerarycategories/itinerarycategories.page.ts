import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent,IonItem,IonLabel,IonIcon,IonButtons,IonBackButton,AlertController,ToastController,IonItemSliding,IonItemOptions,IonItemOption} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-itinerarycategories',
  templateUrl: './itinerarycategories.page.html',
  styleUrls: ['./itinerarycategories.page.scss'],
  standalone: true,
  imports: [ CommonModule,FormsModule,IonContent,IonItem,IonLabel,IonIcon,IonButtons,IonBackButton,IonItemSliding,IonItemOptions,IonItemOption]
})
export class ItinerarycategoriesPage implements OnInit {
  city: string = '';
  categories: { name: string; places: any[] }[] = [];
  expandedCategory: string | null = null;
  animationTiming = 27;
  animationDelayFraction = this.animationTiming / this.categories.length;

  constructor(private route: ActivatedRoute,private http: HttpClient,private router: Router,private alertController: AlertController,private toastController: ToastController) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.route.queryParams.subscribe((params) => {
      this.city = params['city'];
      const userEmail = localStorage.getItem('email');

      this.http
        .get<any[]>(`http://localhost:3000/locations/user/${userEmail}?tag=itinerary`)
        .subscribe((data) => {
          const filtered = data.filter((entry) => entry.city === this.city);
          const categoryMap = new Map<string, any[]>();

          filtered.forEach((entry) => {
            const displayName = entry.location_name?.trim()
              ? entry.location_name
              : this.getLabelFromAddress(entry.address);

            const entryWithName = { ...entry, name: displayName };

            if (!categoryMap.has(entry.category)) {
              categoryMap.set(entry.category, []);
            }

            categoryMap.get(entry.category)!.push(entryWithName);
          });

          this.categories = Array.from(categoryMap.entries()).map(([name, places]) => ({
            name,
            places
          }));
        });
    });
  }

  toggleCategory(categoryName: string): void {
    this.expandedCategory = this.expandedCategory === categoryName ? null : categoryName;
  }

  getCategoryEmoji(name: string): string {
    const emojiMap: { [key: string]: string } = {
      'Restaurant': '🍽️',
      'Bar': '🍻',
      'Shopping': '🛍️',
      'Museum': '🏛️',
      'Sightseeing': '📸',
      'Beach': '🏖️',
      'Club': '💃',
      'Airport': '✈️',
      'Hotel': '🏨',
      'Gallery': '🖼️',
      'Coffee Shop': '☕',
      'Bakery': '🥐',
      'Landmark': '📍',
      'Downtown': '🏙️',
      'Hiking Trail': '🏔️',
      'Theatre': '🎭',
      'National Park': '🏞️'
    };
    return emojiMap[name] || '📍';
  }

  getLabelFromAddress(address: string): string {
    if (!address) return '';
    return address.split(',')[0];
  }

  goToMap(place: any) {
    const name = place.name;
    const address = place.address;

    const allOtherPlaces = this.categories.reduce((acc: any[], cat) => {
      const filtered = cat.places.filter(p => p.name !== name);
      return acc.concat(filtered);
    }, []);

    const others = JSON.stringify(allOtherPlaces);

    if (place.lat && place.lng && !isNaN(place.lat) && !isNaN(place.lng)) {
      this.router.navigate(['/map-view'], {
        queryParams: { lat: place.lat, lng: place.lng, name, others }
      });
    } else if (address) {
      const query = encodeURIComponent(address);
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=AIzaSyC1h8HyptSYlslcFi6bYYzEqE1FI-7qe1g`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            this.router.navigate(['/map-view'], {
              queryParams: {
                lat: location.lat,
                lng: location.lng,
                name,
                others
              }
            });
          } else {
            console.error('Geocoding failed:', data.status, data.error_message || '');
          }
        })
        .catch(err => {
          console.error('Geocoding request error:', err);
        });
    } else {
      console.error('No address or coordinates available for this place.');
    }
  }

  async editPlace(place: any) {
    const alert = await this.alertController.create({
      header: 'Edit Place Name',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Place Name',
          value: place.location_name
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            const userEmail = localStorage.getItem('email');
            if (!userEmail || !data.name.trim()) return;

            this.http.put(`http://localhost:3000/locations/${place.id}`, {
              ...place,
              location_name: data.name.trim(),
              userEmail
            }).subscribe({
              next: () => {
                this.toast('Place name updated.');
                this.fetchData();
              },
              error: () => {
                this.toast('Error updating place.');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  deletePlace(place: any) {
    this.http.delete(`http://localhost:3000/locations/${place.id}`)
      .subscribe({
        next: () => {
          this.toast('Place deleted.');
          this.fetchData();
        },
        error: () => {
          this.toast('Error deleting place.');
        }
      });
  }

   toast(message: string, cssClass: string = 'custom-toast') {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      cssClass
    }).then(toast => toast.present());
  }
}