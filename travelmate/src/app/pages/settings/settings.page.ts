import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonLabel, IonIcon, IonBackButton, IonButtons, IonToggle, AlertController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [ CommonModule,FormsModule,IonContent,IonItem, IonLabel, IonIcon, IonBackButton, IonButtons, IonToggle]
})
export class SettingsPage implements OnInit {
  userEmail = localStorage.getItem('userEmail') || '';

  settings = {
    darkMode: false,
    notificationsEnabled: true,
    locationAccess: true
  };

  constructor( private alertCtrl: AlertController, private router: Router, private http: HttpClient, private toastController: ToastController ) {}

  ngOnInit() {
    this.loadDarkModeSetting();
  }

  loadDarkModeSetting() {
    if (!this.userEmail) return;
    this.http.get<any>(`http://localhost:3000/users/${this.userEmail}/darkmode`).subscribe({
      next: (res) => {
        this.settings.darkMode = res.dark_mode;
        this.applyDarkMode();
      },
      error: (err) => console.error('Failed to load dark mode:', err)
    });
  }

  toggleDarkMode() {
    this.applyDarkMode();

    if (!this.userEmail) return;
    this.http.put<any>(`http://localhost:3000/users/${this.userEmail}/darkmode`, {
      dark_mode: this.settings.darkMode
    }).subscribe({
      next: () => console.log('Dark mode saved.'),
      error: (err) => console.error('Failed to save dark mode:', err)
    });
  }

  applyDarkMode() {
    document.body.classList.toggle('dark', this.settings.darkMode);
  }

  navigateToProfile() {
   this.router.navigateByUrl('/profile');
  }

  async contactSupport() {
    const alert = await this.alertCtrl.create({
      header: 'Contact Support',
      message: 'You can email us at support@travelmateapp.com or call +1-800-555-5555.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Log Out',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Log Out',
          handler: () => {
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
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

