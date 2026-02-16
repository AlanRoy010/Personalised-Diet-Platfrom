import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { RouterModule, Router } from '@angular/router';

//when registering a user the details is then saved to the mongo DB 
//and then the new user can login with rightaway
@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  name: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  isSubmitting: boolean = false;

  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient,
    private router: Router
  ) {}

  onRegister() {
    if (!this.name || !this.username || !this.email || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in name, username, email and password.',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Password mismatch',
        text: 'Password and Confirm Password do not match.',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    this.isSubmitting = true;

    this.http.post(`${this.apiUrl}/register`, {
      name: this.name.trim(),
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'You can now log in with your new account.',
          confirmButtonColor: '#0d6efd'
        }).then (() => {
          this.router.navigate(['/login']);
        });
        
        this.name = '';
        this.username = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: err.error?.message || 'Could not create account.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
