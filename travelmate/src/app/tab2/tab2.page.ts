import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, IonicModule]
})
export class Tab2Page implements OnInit {
  allData: any[] = [];
  wishlistData: any[] = [];
  expandedCountry: string | null = null;
  currentFilter: 'wishlist' | 'itinerary' = 'wishlist';
  isWishlist: boolean = true;

  constructor( private http: HttpClient, private router: Router, private toastController: ToastController, private alertController: AlertController, private menuCtrl: MenuController) {}

  ngOnInit() {
    this.fetchData();
  }

  toggleView() {
    this.isWishlist = !this.isWishlist;
    this.setFilter(this.isWishlist ? 'wishlist' : 'itinerary');
  }

  openMenu() {
    this.menuCtrl.open('mainMenu');
  }

  fetchData() {
    const userEmail = localStorage.getItem('email');
    this.http
      .get<any[]>(`http://localhost:3000/locations/user/${userEmail}?tag=${this.currentFilter}`)
      .subscribe((data) => {
        this.allData = data;
        this.applyFilter();
      });
  }

  applyFilter(): void {
    const grouped = new Map<string, any[]>();
    this.allData.forEach((item) => {
      if (!grouped.has(item.country)) {
        grouped.set(item.country, []);
      }
      grouped.get(item.country)!.push(item);
    });

    this.wishlistData = Array.from(grouped.entries()).map(([country, entries]) => ({
      country,
      entries
    }));
  }

  setFilter(filter: 'wishlist' | 'itinerary'): void {
    if (filter !== this.currentFilter) {
      this.currentFilter = filter;
      this.expandedCountry = null;
      this.fetchData();
    }
  }

  toggleCountry(country: string): void {
    this.expandedCountry = this.expandedCountry === country ? null : country;
  }

  getUniqueCities(entries: any[]): string[] {
    const citySet = new Set<string>();
    entries.forEach(entry => citySet.add(entry.city));
    return Array.from(citySet);
  }

  goToCityPage(city: string): void {
    const match = this.allData.find(entry => entry.city === city);

    if (!match || !match.address) {
      console.warn('No valid entry found for city:', city, match);
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: match.address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const route = this.currentFilter === 'wishlist' ? '/wishlistcategories' : '/itinerarycategories';

        this.router.navigate([route], {
          queryParams: {
            name: match.name,
            city: match.city,
            address: match.address,
            category: match.category,
            lat: location.lat(),
            lng: location.lng(),
          },
        });
      } else {
        console.error('Geocoding failed:', status);
      }
    });
  }

  async editLocation(name: string, type: 'city' | 'country') {
    const alert = await this.alertController.create({
      header: `Edit ${type === 'city' ? 'City' : 'Country'} Name`,
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: `${type} Name`,
          value: name
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            if (data.name && data.name.trim() !== '') {
              const newName = data.name.trim();
              const userEmail = localStorage.getItem('email');

              if (userEmail) {
                this.http.put(`http://localhost:3000/locations/editLocation/${type}/${encodeURIComponent(name)}`, { newName, userEmail })
                  .subscribe({
                    next: () => {
                      this.toast(`${type === 'city' ? 'City' : 'Country'} name updated.`);
                      this.fetchData();
                    },
                    error: (err) => {
                      console.error(`Error updating ${type}:`, err);
                      this.toast(`Error updating ${type}`);
                    }
                  });
              } else {
                this.toast('Error: User email not found');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteCity(city: string) {
    this.http.delete(`http://localhost:3000/locations/city/${city}`)
      .subscribe({
        next: () => {
          this.toast('City deleted.');
          this.fetchData();
        },
        error: (err) => {
          console.error('Error deleting city:', err);
          this.toast('Error deleting city');
        }
      });
  }

  async deleteCountry(country: string) {
    this.http.delete(`http://localhost:3000/locations/country/${country}`)
      .subscribe({
        next: () => {
          this.toast(`Deleted all entries for ${country}`);
          this.fetchData();
        },
        error: (err) => {
          console.error('Error deleting country:', err);
          this.toast(`Error deleting ${country}`);
        }
      });
  }

  moveCountry(country: string) {
    const email = localStorage.getItem('email');
    this.http.put('http://localhost:3000/locations/move-country', {
      email,
      country,
      currentTag: this.currentFilter
    }).subscribe({
      next: () => {
        const newTag = this.currentFilter === 'wishlist' ? 'itinerary' : 'wishlist';
        this.toast(`${country} moved to ${newTag}`);
        this.fetchData();
      },
      error: (err) => {
        console.error('Error moving country:', err);
        this.toast('Error moving country');
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
  

  goToProfile() {
    console.log('Navigating to Profile...');
  }

  goToSettings() {
  this.router.navigate(['/settings']);
}

  goToGeneral() {
    console.log('Navigating to General...');
  }

  logout() {
    localStorage.removeItem('email');
    this.router.navigate(['/login']);
  }

  goToAddLocation() {
   this.router.navigate(['/search-location']);

  }
}
