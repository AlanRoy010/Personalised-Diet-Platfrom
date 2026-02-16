import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

//made the contact component to make the website realistic, was not able 
// to send this formdata to the admin users or update in the database

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  name: string = '';
  email: string = '';
  subject: string = '';
  message: string = '';

  isSubmitting: boolean = false;

  onSubmit() {
    if (!this.name || !this.email || !this.message) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in your name, email and message.',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => {
      this.isSubmitting = false;

      Swal.fire({
        icon: 'success',
        title: 'Message Sent',
        text: 'Thank you for contacting us. We will get back to you soon.',
        confirmButtonColor: '#0d6efd'
      });

      // Clear the form
      this.name = '';
      this.email = '';
      this.subject = '';
      this.message = '';
    }, 600);
  }
}

