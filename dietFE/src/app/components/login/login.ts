import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import Swal from 'sweetalert2'; //we are using sweetalert2 for feedbacks

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  message: string = '';


  token: string | null = null;

  constructor(private authService: AuthService,
              private router: Router) { }

  OnLogin(){
    if(!this.username || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please enter your username and password.',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    this.authService.getLogin(this.username, this.password).subscribe({  
      next: (res: any) => {
        this.token = res.token;
        const isAdmin = !!res.admin;
        
        this.authService.setLoginState(this.username, this.token, isAdmin);
        
        if (res.user_id) {
          sessionStorage.setItem('user_id', res.user_id);
          sessionStorage.setItem('is_admin', String(isAdmin));
        }

        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          timer: 1500,
          showConfirmButton: false
        });

        this.router.navigate(['/']);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: err.error?.message || 'Invalid username or password',
          confirmButtonColor: '#d33'
        });
      }   
    }); 
  }

  Onlogout(){
    if(!this.token) return;

    this.authService.logout(this.token).subscribe({
      next: () => {
        this.authService.clearLoginState();
        this.token = null;
        this.router.navigate(['/login']);
      }
    });
  }
}
