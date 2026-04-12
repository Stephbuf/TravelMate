import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGoogle, logoFacebook, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [ IonContent, CommonModule, FormsModule, ReactiveFormsModule, IonItem, IonInput, IonIcon, IonButton] 
})
export class SignUpPage implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    addIcons({ logoGoogle, logoFacebook, eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/)
        ]
      ]
    });

    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      Keyboard.setScroll({ isDisabled: true }).catch((err) => {
        console.warn('Keyboard plugin error:', err);
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get firstName() {
    return this.signupForm.get('firstName');
  }
  get lastName() {
    return this.signupForm.get('lastName');
  }
  get email() {
    return this.signupForm.get('email');
  }
  get password() {
    return this.signupForm.get('password');
  }

  onSubmit() {
  this.errorMessage = '';
  this.successMessage = '';

  if (this.signupForm.invalid) {
    this.signupForm.markAllAsTouched();
    this.errorMessage = 'Please fill in all fields correctly.';
    return;
  }

  const { firstName, lastName, email, password } = this.signupForm.value;
  const payload = { firstName, lastName, email, password };

  this.http.post('http://localhost:3000/users', payload).subscribe({
    next: (res: any) => {
      localStorage.setItem('user_id', res.id.toString());
      localStorage.setItem('firstName', res.firstName);
      localStorage.setItem('lastName', res.lastName);
      localStorage.setItem('email', res.email);

      console.log('Saved user_id:', res.id);
      this.successMessage = 'Account created successfully!';
      this.signupForm.reset();
      this.router.navigate(['/tabs/tab1']);
    },
    error: (error: any) => {
      console.error('Signup failed:', error);

      if (error.error?.message === 'Email already in use') {
        this.email?.setErrors({ emailTaken: true });
      } else {
        this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
      }
    }
  });
}

}
