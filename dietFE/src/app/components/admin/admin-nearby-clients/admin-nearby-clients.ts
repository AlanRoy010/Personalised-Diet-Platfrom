import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WebServices } from '../../../services/web-services';

interface RandomClient {  //a random client willbe selected and printed
  id: string;             //this is the structure of the random client selected
  name: string;
  town: string;
}

interface NearbyClient { // this is the structure of the nearby clients.
  _id: string;
  name: string;
  town: string;
  distance_m: number;
}

interface NearbyClientsResponse {
  random_client: RandomClient;
  nearby_clients: NearbyClient[];
}


@Component({
  standalone: true,
  selector: 'app-admin-nearby-clients',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-nearby-clients.html',
  styleUrl: './admin-nearby-clients.css',
})
export class AdminNearbyClients implements OnInit {
  randomClient: RandomClient | null = null;
  nearbyClients: NearbyClient[] = [];

  private static cachedData: NearbyClientsResponse | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private webservices: WebServices) {}

  ngOnInit(): void {                                       
    if (AdminNearbyClients.cachedData) { // If we already have cached data we reuse it here !!, this is to make sure
      const res = AdminNearbyClients.cachedData;   // when the page is refreshed we don't change the selected 
      this.randomClient = res.random_client;       // random client unless we press the refresh button in the random client section.
      this.nearbyClients = res.nearby_clients || [];
      return; 
    }

    // we are fetching from backend and cache it
    this.fetchAndCacheNearbyClients();
  }


  private fetchAndCacheNearbyClients(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.webservices.getNearbyClients().subscribe({
      next: (res: NearbyClientsResponse) => {
        this.randomClient = res.random_client;
        this.nearbyClients = res.nearby_clients || [];

        // Save full response in static cache
        AdminNearbyClients.cachedData = res;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading nearby clients', err);
        this.errorMessage =
          err?.error?.message || 'Failed to load nearby clients.';
        this.isLoading = false;
      }
    });
  }

  refreshNearbyClients(): void {
    AdminNearbyClients.cachedData = null; // clearing previous data !!
    this.fetchAndCacheNearbyClients();
  }

  distanceToKm(distance_m: number): number {
    if (!distance_m && distance_m !== 0) return 0;
    return distance_m / 1000;
  }
}
