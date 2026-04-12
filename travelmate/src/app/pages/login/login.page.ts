import { Component, OnInit,  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonItem, IonInput, IonButton, IonIcon} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { eyeOffOutline, eyeOutline, logoFacebook, logoGoogle, closeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonItem, IonInput, IonButton, IonIcon, CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule, FormsModule]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
    showPlane = false;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    addIcons({closeOutline,eyeOutline,logoGoogle,logoFacebook,eyeOffOutline});
  }

  ngOnInit() {
     setTimeout(() => {
    this.showPlane = true;
  });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/)
      ]]
    });
  }

  login() {
  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;

    this.http.post<any>('http://localhost:3000/users/login', { email, password }).subscribe({
      next: (user) => {
        // Save email to localStorage for use in Tab 1
        localStorage.setItem('email', user.email);
        localStorage.setItem('user_id', user.id); 

        this.router.navigate(['/tabs/tab1']);
      },
      error: (err) => {
        console.error('Login error:', err);
        alert('Invalid email or password');
      }
    });
  } else {
    this.loginForm.markAllAsTouched();
  }
}

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToSignup() {
    this.router.navigate(['/sign-up']);
  }
}