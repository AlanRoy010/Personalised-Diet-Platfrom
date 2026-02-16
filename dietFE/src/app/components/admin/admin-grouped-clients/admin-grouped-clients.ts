import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WebServices } from '../../../services/web-services';

interface GroupedClient {
  id: string;
  name: string;
  username: string;
}

interface ClientGroup {
  key: string;
  clients: GroupedClient[];
}

@Component({
  standalone: true,
  selector: 'app-admin-grouped-clients',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-grouped-clients.html',
  styleUrl: './admin-grouped-clients.css',
})
export class AdminGroupedClients implements OnInit{

  // options for group_by the admin user will be able to see the users grouped by these categories
  groupOptions = [
    { value: 'Personal_info.Age',                              label: 'Age' },
    { value: 'Personal_info.body_metrics.height_cm',           label: 'Height (cm)' },
    { value: 'Personal_info.body_metrics.weight_kg',           label: 'Weight (kg)' },
    { value: 'Personal_info.body_metrics.BMI',                 label: 'BMI' },
    { value: 'Personal_info.location.town',                    label: 'Town' },
    { value: 'Health_Profile.Labs.Blood_Sugar_Level',          label: 'Blood Sugar Level' },
    { value: 'Health_Profile.Labs.Cholesterol_Level',          label: 'Cholesterol Level' },
    { value: 'Health_Profile.Health_risks.Allergies',          label: 'Allergies' },
    { value: 'Health_Profile.Health_risks.Chronic_Disease',    label: 'Chronic Disease' },
    { value: 'Health_Profile.Health_risks.Genetic_Risk_Factor',label: 'Genetic Risk Factor' },
    { value: 'Life_Style.Habits.Smoking',                      label: 'Smoking Status' },
    { value: 'Life_Style.Habits.Alcohol_Consumption',          label: 'Alcohol Consumption' }
  ];

  selectedGroupBy: string = this.groupOptions[0].value;

  loading: boolean = false;
  errorMsg: string = '';

  
  groups: ClientGroup[] = [];

  // we also added pagination here
  page: number = 1;
  pageSize: number = 2;   // groups per page, here the page will show only 2 grouped section

  constructor(private api: WebServices) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  onGroupChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedGroupBy = value;
    this.page = 1;        
    this.loadGroups();
  }

  loadGroups() {
    this.loading = true;
    this.errorMsg = '';
    this.groups = [];

    this.api.getGroupedClients(this.selectedGroupBy).subscribe({
      next: (res: any) => {
        
        this.groups = Object.keys(res).map(key => ({
          key,
          clients: res[key] as GroupedClient[]
        }));
        this.loading = false;
        this.page = 1;
      },
      error: (err: any) => {
        console.error('Error loading grouped clients:', err);
        this.errorMsg = err.error?.error || 'Failed to load grouped clients.';
        this.loading = false;
      }
    });
  }

  
  get totalPages(): number {
    if (this.groups.length === 0) return 1;
    return Math.ceil(this.groups.length / this.pageSize);
  }

  
  get pagedGroups(): ClientGroup[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.groups.slice(start, end);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
    }
  }

  trackGroup(index: number, group: ClientGroup) {
    return group.key;
  }

  trackClient(index: number, client: GroupedClient) {
    return client.id;
  }
}
