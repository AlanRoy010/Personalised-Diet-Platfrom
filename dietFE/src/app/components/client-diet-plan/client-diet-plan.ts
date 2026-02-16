import { Component } from '@angular/core';
import { NgIf, NgForOf, NgClass } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WebServices } from '../../services/web-services';

@Component({
  standalone: true,
  selector: 'app-client-diet-plan',
  imports: [RouterModule, NgIf, NgForOf, NgClass],
  templateUrl: './client-diet-plan.html',
  styleUrl: './client-diet-plan.css'
})
export class ClientDietPlan {
  clientId: string | null = null;
  plan: any = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: WebServices
  ) {}

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');

    if (routeId) {
      
      this.clientId = routeId;
      this.loadPlan(routeId);
      return;
    }

    const userId = sessionStorage.getItem('user_id');

    if (!userId) {
      this.error = 'You must be logged in to view your diet plan.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.api.getClientByUser(userId).subscribe({
      next: (client: any) => {
        const cid =
          client?._id?.$oid ??
          client?._id ??
          null;

        if (!cid) {
          this.error = 'Please create your client profile first.';
          this.loading = false;
          return;
        }

        this.clientId = cid;
        this.loadPlan(cid);
      },
      error: () => {
        this.error = 'Could not load your client profile.';
        this.loading = false;
      }
    });
  }

  loadPlan(id: string) {
    this.loading = true;
    this.error = null;

    this.api.getDietPlan(id).subscribe({
      next: (res) => {
        this.plan = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not generate diet plan.';
        this.loading = false;
      }
    });
  }
}
