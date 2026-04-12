import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonTextarea, IonIcon, IonItem, IonLabel, IonButtons, IonBackButton, ToastController } from '@ionic/angular/standalone';
import { IonContent,IonInput,IonButton} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButtons, IonLabel, IonItem, IonIcon, CommonModule, FormsModule, IonContent, IonInput, IonButton, IonTextarea]
})
export class ProfilePage implements OnInit {
  defaultPhoto = 'assets/images/avatar-default.jpg';

  user = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    profilePhoto: ''
  };

  constructor(private http: HttpClient,private router: Router,private toastController: ToastController) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      this.user.id = parsedUser.id;

      this.http.get<any>(`http://localhost:3000/users/${this.user.id}`).subscribe({
        next: (res) => {
          this.user = {
            ...this.user,
            firstName: res.firstName,
            lastName: res.lastName,
            email: res.email,
            phone: res.phone || '',
            location: res.location || '',
            bio: res.bio || '',
         profilePhoto: res.profilePhoto ? res.profilePhoto : this.defaultPhoto

          };
        },
        error: (err) => console.error('Error loading user data:', err)
      });
    }
  }

  saveProfile() {
    const updatedData = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      phone: this.user.phone,
      location: this.user.location,
      bio: this.user.bio,
       profilePhoto: this.user.profilePhoto
    };

    this.http.put(`http://localhost:3000/users/update/${this.user.id}`, updatedData)
      .subscribe({
        next: () => this.toast('Profile updated successfully!'),
        error: () => this.toast('Error updating profile.')
      });
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.user.profilePhoto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
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