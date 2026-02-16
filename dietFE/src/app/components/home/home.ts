import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{
  images = [
    '/images/andres-gimenez-FLzs8iCDeaE-unsplash.jpg', //list of images used in the home page
    '/images/brooke-lark-jUPOXXRNdcA-unsplash.jpg',
    '/images/david-foodphototasty-FGrO63vUbaA-unsplash.jpg',
    '/images/jan-sedivy-3HE3B4r-A08-unsplash.jpg',
    '/images/vitalii-pavlyshynets-kcRFW-Hje8Y-unsplash.jpg'

  ];

  currentIndex = 0;
  autoSlideId: any;

  constructor(private router: Router,
              public authService: AuthService
  ) { }

  ngOnInit(): void {
    // auto-slide every 5 seconds
    this.autoSlideId = setInterval(() => {
      this.next();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.autoSlideId) {
      clearInterval(this.autoSlideId);
    }
  }

  prev(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  getPrevIndex(): number {
    return (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  getNextIndex(): number {
    return (this.currentIndex + 1) % this.images.length;
  }

  onStartDietPlan() {
    const isLoggedIn = this.authService.isloggedIn$.value;

    if (!isLoggedIn) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to view your diet plan.',
        confirmButtonColor: '#0d6efd'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    this.router.navigate(['/diet-plan']);
  }

  onUpdateHealthProfile() {
    const isLoggedIn = this.authService.isloggedIn$.value;

    if (!isLoggedIn) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to update your health profile.',
        confirmButtonColor: '#0d6efd'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    this.router.navigate(['/client-info']);
  }
}