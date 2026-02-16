import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { WebServices } from '../../services/web-services';

@Component({
  standalone:true,
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  user: any = null;
  initial: string = '';
                        // we are using the same profile when normal user goes to thier respective profile page 
                        //and when the admin checks a user profile from admin panel
  isAdminView = false;   // true when /admin/users/:id
  editMode = false;
  editableUser: any = {};
  constructor(
    public authService: AuthService,
    public router: Router,
    private route: ActivatedRoute,
    private webServices: WebServices
  ) {}

  ngOnInit() {
    const routeUserId = this.route.snapshot.paramMap.get('id');

    if (routeUserId) {
      // for Admin viewing a specific user
      this.isAdminView = true;
      this.loadAdminUser(routeUserId);
    } else {
      // for Normal user viewing their own profile
      this.isAdminView = false;
      this.loadSelfProfile();
    }
  }

  // -------- Normal self-profile mode --------
  private loadSelfProfile() {
    if (this.authService.isloggedIn$.value === false) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to view your profile.',
        confirmButtonColor: '#0d6efd'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    const userId = sessionStorage.getItem('user_id');

    if (!userId) {
      this.authService.clearLoginState();
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getUser(userId).subscribe({
      next: (user: any) => {
        this.user = user;
        this.setInitialFromUser();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not load profile details.',
          confirmButtonColor: '#d33'
        }).then(() => {
          this.router.navigate(['/']);
        });
      }
    });
  }

  // -------- Admin mode: load user by id from backend --------
  private loadAdminUser(id: string) {
    this.webServices.getUserById(id).subscribe({
      next: (user: any) => {
        this.user = user;
        this.setInitialFromUser();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not load user details.',
          confirmButtonColor: '#d33'
        }).then(() => {
          this.router.navigate(['/admin'], { queryParams: { tab: 'users' } });
        });
      }
    });
  }

  private setInitialFromUser() {
    const base = (this.user?.name || this.user?.username || '').toString();
    this.initial = base ? base.charAt(0).toUpperCase() : '';
  }

  // -------- Logout --------
  onLogout() {
    const token =
      this.authService.getToken?.() || sessionStorage.getItem('token');

    if (!token) {
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
        this.authService.clearLoginState();
        this.router.navigate(['/login']);
      }
    });
  }

  // -------- Admin: Edit user --------
  startEdit() {
    if (!this.user) return;
    this.editMode = true;
    this.editableUser = {
      name: this.user.name,
      username: this.user.username,
      email: this.user.email,
      admin: this.user.admin
    };
  }

  cancelEdit() {
    this.editMode = false;
  }

  saveEdit() {
    if (!this.user || !this.user._id) return;

    this.webServices.updateUser(this.user._id, this.editableUser).subscribe({
      next: (updated: any) => {
        this.user = updated;
        this.setInitialFromUser();
        this.editMode = false;
        Swal.fire({
          icon: 'success',
          title: 'User updated',
          timer: 1200,
          showConfirmButton: false
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Update failed',
          text: 'Could not save user changes.'
        });
      }
    });
  }

  // -------- Admin: Delete user --------
  onDeleteUser() {
    if (!this.user || !this.user._id) return;

    const confirmText = this.isAdminView
    ? 'This will delete this user and related client data.'
    : 'This will delete your account and any related client data. You will be logged out.';


    Swal.fire({
      icon: 'warning',
      title: 'Delete user?',
      text: confirmText,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (result.isConfirmed) {
        this.webServices.deleteUser(this.user._id).subscribe({
          next: () => {
            if (this.isAdminView) {
              Swal.fire({
                icon: 'success',
                title: 'User deleted',
                timer: 1200,
                showConfirmButton: false
              });
              this.router.navigate(['/admin'], { queryParams: { tab: 'users' } });
            } else {
              // self delete: clear auth + redirect
              this.authService.clearLoginState();
              Swal.fire({
                icon: 'success',
                title: 'Account deleted',
                text: 'Your account and related data have been removed.',
                confirmButtonColor: '#0d6efd'
              }).then(() => {
                this.router.navigate(['/register']);
              });
            }
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Delete failed',
              text: 'Could not delete user.'
            });
          }
        });
      }
    });
  }

  goBackToAdmin() {
    this.router.navigate(['/admin'], { queryParams: { tab: 'users' } });
  }
}  