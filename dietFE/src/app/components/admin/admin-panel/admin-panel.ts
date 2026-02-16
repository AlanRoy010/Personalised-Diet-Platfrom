import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminUsersList } from '../admin-users-list/admin-users-list';
import { Clients } from '../clients/clients';
import { AdminGroupedClients } from '../admin-grouped-clients/admin-grouped-clients';
import { AdminNearbyClients } from '../admin-nearby-clients/admin-nearby-clients';

type AdminTab = 'users' | 'clients' | 'grouped' | 'nearby'; //if set the admintab to be one of these values

@Component({
  standalone: true,
  selector: 'app-admin-panel',
  imports: [
    CommonModule,
    RouterModule,
    AdminUsersList,
    Clients,
    AdminGroupedClients,
    AdminNearbyClients
  ],
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanel implements OnInit{
  activeTab: AdminTab = 'users';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab') as AdminTab | null;

    if (tab === 'users' || tab === 'clients' || tab === 'grouped' || tab === 'nearby') {
      this.activeTab = tab;
    } else {
      
      this.setTab('users', false);
    }
  }

  setTab(tab: AdminTab, pushToUrl: boolean = true) {
    this.activeTab = tab;

    if (pushToUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab },
        queryParamsHandling: 'merge' 
      });
    }
  }
}
