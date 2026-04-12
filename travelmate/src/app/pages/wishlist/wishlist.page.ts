import { Component, OnInit } from '@angular/core';
import { LocationsService } from 'src/app/services/locations.service';
import { CommonModule } from '@angular/common';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { LocationData } from 'src/app/interfaces/locationdata';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  standalone: true,
  imports: [ CommonModule]
})
export class WishlistPage implements OnInit {
  wishlistItems: LocationData[] = [];
  userEmail: string = ''; 

  constructor(private locationsService: LocationsService) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      this.userEmail = JSON.parse(storedUser).email;
      this.locationsService.getUserWishlist(this.userEmail).subscribe({
        next: (data) => this.wishlistItems = data,
        error: (err) => console.error('Failed to load wishlist:', err)
      });
    }
  }
}
