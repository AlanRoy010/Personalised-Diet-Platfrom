import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebServices } from '../../../services/web-services';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface AdminUser { //this is the user structure
  _id: string;
  name: string;
  username: string;
  email?: string;
  admin: boolean;
}

@Component({
  standalone: true,
  selector: 'app-admin-users-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-users-list.html',
  styleUrl: './admin-users-list.css',
})
export class AdminUsersList implements OnInit {
 
  users: any[] = [];
  page = 1;  
  pageSize = 9;
  total = 0;
  totalPages = 1;

  searchTerm = '';

  loading = false;
  error: string | null = null;
  constructor(private api: WebServices) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.api.getAllUsers(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (res) => {
        this.users = res.users;
        this.total = res.total;
        this.page = res.page;
        this.pageSize = res.page_size;

        this.totalPages = Math.ceil(this.total / this.pageSize);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadUsers();
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }

  onSearchChange(): void { //search feature
    this.page = 1;
    this.loadUsers();
  }

  trackById(index: number, user: AdminUser): string {
    return user._id;
  

  }
  
}
