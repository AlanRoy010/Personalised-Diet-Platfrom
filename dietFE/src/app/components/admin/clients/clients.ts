import { Component } from '@angular/core';
//import { ClientsData } from '../../services/clients-data'; not using the local json data anymore.
import { RouterOutlet, RouterModule, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WebServices } from '../../../services/web-services';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterLink],
  providers: [WebServices],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients {
  clients_list: any = [];
  page: number = 1;

  constructor(public webServices : WebServices) { }

  ngOnInit() {
    if (sessionStorage['page']){
      this.page = Number(sessionStorage['page']);
    }
    this.webServices.getClients(this.page).subscribe(
      (response) => {this.clients_list = response}
    );
  }

  previousPage(){
    if(this.page > 1){
      this.page = this.page - 1;

      this.webServices.getClients(this.page).subscribe(response => { 
        this.clients_list = response;
      });
      sessionStorage['page'] = this.page;
    }
  }

  nextPage() {
    this.page = this.page + 1;
    this.webServices.getClients(this.page).subscribe(response => {
      this.clients_list = response;
    });
    sessionStorage['page'] = this.page;
    
  }
  trackById(index: number, client: any) {
  return client._id.$oid;
}

}
