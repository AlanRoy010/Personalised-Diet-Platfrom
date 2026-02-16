import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { WebServices } from '../../services/web-services';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth-service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [GoogleMapsModule, RouterModule, NgIf],
  providers: [WebServices],
  templateUrl: './client.html',
  styleUrls: ['./client.css'],
})
export class ClientDetail {

  clients_list: any = [];
  loremIpssum: any;
  map_options: google.maps.MapOptions = { };
  lat: number = 0;
  lng: number = 0;

  loading: boolean = false;
  hasClient: boolean = false;

  constructor(private route: ActivatedRoute,
    private WebServices: WebServices,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {

    if (!this.authService.isloggedIn$.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Login Required',
      text: 'Please log in to continue.',
      confirmButtonColor: '#0d6efd'
    }).then(() => {
      this.router.navigate(['/login']);
    });
    return;
    }
    //only the new clients created by the webapp have userID linked to the client information 
    //in the old data client only have clientID
    //when admin clicks a client card from admin panel the client is retrieved by client id, 
    //when user goes to the client info, the client details retrieved using userID
    const routeId = this.route.snapshot.paramMap.get('id');       // e.g. /client/:id 
    const userId  = sessionStorage.getItem('user_id');            // current logged in user

    if (routeId) {
      // 🔹 case 1: admin or link with a specific client id
      this.loadClientById(routeId);
    } else if (userId) {
      // 🔹 case 2: normal “Client Info” from navbar – load by user
      this.loadClientByUser(userId);
    } else {
      // no user id → something is wrong, go to login
      this.router.navigate(['/login']);
      return;
    }
      
  
    this.WebServices.getLoremIpsum(1).subscribe(
      (response: any) => {
        this.loremIpssum = response.text.slice(0,400);
      }
    );
  }

  // ---- existing behaviour for /client/:id ----
  private loadClientById(id: string) {

    this.loading = true;
    this.WebServices.getClient(id).subscribe({
      next: (response: any) => {
        this.clients_list = [response];
        this.hasClient = true;
        this.loading = false;

        this.lat = response.Personal_info.location.coordinates[1];
        this.lng = response.Personal_info.location.coordinates[0];

        this.map_options = {
          mapId: 'Demo',
          center: { lat: this.lat, lng: this.lng },
          zoom: 13
        };
      },

      error: (err: any) => {
        console.error('Error loading client by id:', err);
        
        this.clients_list = [];
        this.hasClient = false;
        this.loading = false;

        Swal.fire({
        icon: 'error',
        title: 'Unable to load client',
        text: 'The selected client could not be loaded. Please try again.',
        confirmButtonColor: '#0d6efd'
        }).then(() => {
          this.router.navigate(['/clients']);
        });
      }
    });
  }


  // ----  load client info for the logged-in user ----
  private loadClientByUser(userId: string) {
    this.loading = true;
    this.WebServices.getClientByUser(userId).subscribe({
      next: (response: any) => {
        this.clients_list = [response];
        this.hasClient = true;
        this.loading = false;


        this.lat = response.Personal_info.location.coordinates[1];
        this.lng = response.Personal_info.location.coordinates[0];

        this.map_options = {
          mapId: 'Demo',
          center: { lat: this.lat, lng: this.lng },
          zoom: 13
        };
      },
      error: (err: any) => {
        this.loading = false;

        if (err.status === 404) {
          // if no client info for this user
          this.hasClient = false;
          this.clients_list = [];
          // here the template will show
          // "No client information" + a button to "create client information"
        } else {
          
          console.error('Error loading client by user:', err);
        }
      }
    });
  }

  onEdit(client: any) {
    if (!client || !client._id) {
      console.error('No client id found for edit');
      return;
    }

    // Navigate to the form with clientId in the URL query
    this.router.navigate(['/client/create'], {
      queryParams: { clientId: client._id }
    });
  }

}



