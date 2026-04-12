import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton,IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBackButton, IonButtons } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.page.html',
  styleUrls: ['./add-location.page.scss'],
  standalone: true,
  imports: [IonButtons, IonBackButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard, CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonLabel, IonItem, IonInput, IonContent, IonSelect, IonSelectOption, IonBackButton]
})
export class AddLocationPage implements OnInit {
  locationForm!: FormGroup;
categories: { [key: string]: string } = {
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
  isSubmitting = false;
  categoryKeys(): string[] {
  return Object.keys(this.categories);
}


  constructor( private fb: FormBuilder, private http: HttpClient,  private router: Router,private toastController: ToastController) {}

 ngOnInit(): void {
  const stored = localStorage.getItem('selectedPlace');
  const parsed = stored ? JSON.parse(stored) : {};

  const address = parsed.address || '';
  const city = parsed.city || '';
  const country = parsed.country || '';

  this.locationForm = this.fb.group({
    country: [country, Validators.required],
    city: [city, Validators.required],
    address: [address, Validators.required],
    category: ['', Validators.required],
    tag: ['wishlist', Validators.required],
    location_name: ['', Validators.required]
  });
}

onSubmit(): void {
  if (this.locationForm.invalid) return;

  this.isSubmitting = true;

  const { country, city, address, category, tag, location_name } = this.locationForm.value;

  const payload = {
    country: country.trim(),
    city: city.trim(),
    address: address.trim(),
    category: category.trim(),
    tag,
    wishlist: tag === 'wishlist',
    location_name: location_name.trim(),
    userEmail: localStorage.getItem('email'),
  };

  console.log('🚀 Payload being sent:', payload);

  this.http.post('http://localhost:3000/locations', payload).subscribe({
    next: () => {
      this.showToast('Location added!', 'custom-toast');
      this.router.navigate(['/tabs/tab2']);
      this.isSubmitting = false;
    },
    error: (err) => {
      if (err.status === 400 && err.error?.message) {
        this.showToast(err.error.message, 'custom-toast-danger');
      } else {
        this.showToast('Failed to save location.', 'custom-toast-danger');
      }
      this.isSubmitting = false;
    }
  });
}

async showToast(message: string, cssClass: string = 'custom-toast') {
  const toast = await this.toastController.create({
    message,
    duration: 2000,
    position: 'bottom',
    cssClass
  });
  toast.present();
}
}