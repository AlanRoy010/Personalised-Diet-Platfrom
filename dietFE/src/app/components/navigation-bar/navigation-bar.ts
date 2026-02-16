import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  standalone:true,
  selector: 'app-navigation-bar',
  imports: [CommonModule, RouterModule, NgIf],
  templateUrl: './navigation-bar.html',
  styleUrl: './navigation-bar.css',
})
export class NavigationBar {
  constructor(public authService: AuthService,
              public router: Router) {}

  onClientsClick(event: Event) {
    event.preventDefault();

    if (this.authService.isloggedIn$.value === false) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in first to view client details.',
        confirmButtonColor: '#0d6efd',
      }).then(() => {
        this.router.navigate(['/login']);
      });
    } else {
      this.router.navigate(['/clients']);
    }
  }
  onLogout() {
  const token = this.authService.getToken?.() || sessionStorage.getItem('token');

  if (!token) {
    // no token, just clear state locally
    this.authService.clearLoginState();
    this.router.navigate(['/login']);
    return;
  }

  this.authService.logout(token).subscribe({
    next: () => {
      this.authService.clearLoginState();
      Swal.fire({
        icon: 'success',
        title: 'Logged out',
        timer: 1200,
        showConfirmButton: false
      });
      this.router.navigate(['/login']);
    },
    error: () => {
      // even if backend logout fails, clear local state
      this.authService.clearLoginState();
      this.router.navigate(['/login']);
    }
  });
  }

}
