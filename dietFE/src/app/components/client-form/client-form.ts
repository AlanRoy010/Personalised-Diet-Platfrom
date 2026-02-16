import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-client-form',
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './client-form.html',
  styleUrls: ['./client-form.css']
})
export class ClientForm implements OnInit{

  private apiUrl = 'http://127.0.0.1:5000';

  towns: string[] = [  //list of towns 
  'Central London',
  'East London',
  'West London',
  'North London',
  'South London',
  'Croydon',
  'Wembley',
  'Richmond',
  'Greenwich',
  'Ilford'
  ];

  town = '';

  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  currentStep = 1;

  clientId: string | null = null;

  // ---- Form fields ----
  // Personal info
  Age: number | null = null;
  Gender = '';
  height_cm: number | null = null;
  weight_kg: number | null = null;
  phone = '';
  

  // Health info
  systolic: number | null = null;
  diastolic: number | null = null;
  blood_sugar: number | null = null;
  cholesterol: number | null = null;
  allergies = '';
  chronic_disease = '';
  genetic_risk_factor = '';

  // Lifestyle info
  daily_steps: number | null = null;
  sleep_hours: number | null = null;
  exercise_frequency: number | null = null;
  smoking = '';
  alcohol = '';

  // Diet
  dietary_habits = '';
  preferred_cuisine = '';
  caloric_intake: number | null = null;
  protein_intake: number | null = null;
  carb_intake: number | null = null;
  fat_intake: number | null = null;

  

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}


  goToNextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }


  ngOnInit(): void {
  // the client id from the url is retrieved if 
  // editing the client info otherwise shows a blank form
  const clientIdFromUrl = this.route.snapshot.queryParamMap.get('clientId');
  if (clientIdFromUrl) {
    this.clientId = clientIdFromUrl;
    this.isEditMode = true;
  }

  // If no clientId → treat as create (blank form)
  if (!this.isEditMode || !this.clientId) {
    return;
  }

  // Need token to call protected route
  const token = this.authService.getToken() || sessionStorage.getItem('token');
  if (!token) {
    this.router.navigate(['/login']);
    return;
  }

  const headers = new HttpHeaders({
    'x-access-token': token
  });

  // Load existing client document, autofilling the fields that already exists.
  this.http.get(`${this.apiUrl}/clients/${this.clientId}`, { headers })
    .subscribe({
      next: (client: any) => {
        // ---- Personal_info ----
        this.Age = client.Personal_info?.Age ?? null;
        this.Gender = client.Personal_info?.Gender ?? '';
        this.height_cm = client.Personal_info?.body_metrics?.height_cm ?? null;
        this.weight_kg = client.Personal_info?.body_metrics?.weight_kg ?? null;
        this.phone = client.Personal_info?.contact?.phone ?? '';
        this.town = client.Personal_info?.location?.town ?? '';

        // ---- Health_Profile ----
        const hp = client['Health Profile'] || client.Health_Profile || null;

        this.systolic =
        hp?.Vitals?.['Bloop Pressure']?.Systolic ??
        hp?.Vitals?.Blood_Pressure?.Systolic ??
        null;

        this.diastolic =
          hp?.Vitals?.['Bloop Pressure']?.Diastolic ??
          hp?.Vitals?.Blood_Pressure?.Diastolic ??
          null;

        this.blood_sugar =
          hp?.Labs?.Blood_Sugar_Level ?? null;

        this.cholesterol =
          hp?.Labs?.Cholesterol_Level ?? null;

        this.allergies =
          hp?.Health_risks?.Allergies ?? '';

        this.chronic_disease =
          hp?.Health_risks?.Chronic_Disease ?? '';

        this.genetic_risk_factor =
          hp?.Health_risks?.Genetic_Risk_Factor ?? '';

        // ---- Life_Style ----
        const ls = client['Life Style'] || client.Life_Style || null;
        this.daily_steps =
        ls?.Daily_Steps ??
        (ls?.['Daily Steps'] !== undefined ? Number(ls['Daily Steps']) : null);

        this.sleep_hours =
          ls?.Sleep_Hours ??
          (ls?.['Sleep Hours'] !== undefined ? Number(ls['Sleep Hours']) : null);

        this.exercise_frequency =
          ls?.Exercise_Frequency ??
          (ls?.['Exercise Frequency'] !== undefined ? Number(ls['Exercise Frequency']) : null);

        this.smoking = ls?.Habits?.Smoking ?? '';
        this.alcohol = ls?.Habits?.Alcohol_Consumption ?? '';
        // ---- Diet ----
        this.dietary_habits = client.Diet?.Habits?.Dietary_Habits ?? '';
        this.preferred_cuisine = client.Diet?.Habits?.Preferred_Cuisine ?? '';
        this.caloric_intake = client.Diet?.Intakes?.Caloric_Intake
          ? Number(client.Diet.Intakes.Caloric_Intake)
          : null;
        this.carb_intake = client.Diet?.Intakes?.Carbohydrate_Intake &&
                           client.Diet.Intakes.Carbohydrate_Intake !== 'Unknown'
          ? Number(client.Diet.Intakes.Carbohydrate_Intake)
          : null;
        this.protein_intake = client.Diet?.Intakes?.Protein_Intake
          ? Number(client.Diet.Intakes.Protein_Intake)
          : null;
        this.fat_intake = client.Diet?.Intakes?.Fat_Intake &&
                          client.Diet.Intakes.Fat_Intake !== 'Unknown'
          ? Number(client.Diet.Intakes.Fat_Intake)
          : null;
      },
      error: (err) => {
        console.error('Error loading client by id:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not load client details for editing.'
        });
      }
    });
  }


  onSubmit() {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID not found. Please log in again.'
      });
      return;
    }

    const token = this.authService.getToken() || sessionStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Authentication token missing. Please log in again.'
      });
      return;
    }

    //---- Build FormData --------
    const fd = new FormData();

    
    fd.append('Age', String(this.Age ?? ''));
    fd.append('Gender', this.Gender || '');
    fd.append('height_cm', String(this.height_cm ?? ''));
    fd.append('weight_kg', String(this.weight_kg ?? ''));
    fd.append('phone', this.phone || '');
    fd.append('town', this.town || '');

    fd.append('systolic', String(this.systolic ?? ''));
    fd.append('diastolic', String(this.diastolic ?? ''));
    fd.append('blood_sugar', String(this.blood_sugar ?? ''));
    fd.append('cholesterol', String(this.cholesterol ?? ''));

    fd.append('daily_steps', String(this.daily_steps ?? ''));
    fd.append('sleep_hours', String(this.sleep_hours ?? ''));
    fd.append('exercise_frequency', String(this.exercise_frequency ?? ''));

    fd.append('Smoking', this.smoking || '');
    fd.append('Alcohol_Consumption', this.alcohol || '');

    fd.append('Dietary_Habits', this.dietary_habits || '');
    fd.append('Preferred_Cuisine', this.preferred_cuisine || '');

    fd.append('Caloric_Intake', String(this.caloric_intake ?? ''));
    fd.append('Protein_Intake', String(this.protein_intake ?? ''));
    fd.append('Carbohydrate_Intake', String(this.carb_intake ?? ''));
    fd.append('Fat_Intake', String(this.fat_intake ?? ''));

    fd.append('Allergies', this.allergies || '');
    fd.append('Chronic_Disease', this.chronic_disease || '');
    fd.append('Genetic_Risk_Factor', this.genetic_risk_factor || '');

    // Also send the capitalised versions your code uses later:
    fd.append('Daily_Steps', String(this.daily_steps ?? ''));
    fd.append('Sleep_Hours', String(this.sleep_hours ?? ''));
    fd.append('Exercise_Frequency', String(this.exercise_frequency ?? ''));

    const headers = new HttpHeaders({
      'x-access-token': token
     
    });

    this.isSubmitting = true;

    const request$ = (this.isEditMode && this.clientId)
      ? this.http.put(`${this.apiUrl}/clients/${this.clientId}`, fd, { headers })
      : this.http.post(`${this.apiUrl}/clients/${userId}`, fd, { headers });


    request$.subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        const message =
          res?.missing_fields ||
          (this.isEditMode ? 'Profile updated successfully.' : 'Profile created successfully.');


        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Client profile updated' : 'Client profile created',
          text: message
        }).then(() => {
          this.location.back();
        });


        
      },
      error: (err) => {
        this.isSubmitting = false;

        Swal.fire({
          icon: 'error',
          title: 'Error creating client profile',
          text: err.error?.Error || err.error?.error || 'Please check your inputs.'
        });
      }
    });
  }
}
