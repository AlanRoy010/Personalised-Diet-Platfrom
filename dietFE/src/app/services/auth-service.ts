import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5000';
  
  isloggedIn$ = new BehaviorSubject<boolean>(false);
  currentUser$ = new BehaviorSubject<string | null>(null);
  private token: string | null = null;
  isAdmin$ = new BehaviorSubject<boolean>(false);

  constructor(private http:HttpClient) { }

  getLogin(username: string, password: string): Observable<any>{
    const basicToken = btoa(`${username}:${password}`);

    const headers = new HttpHeaders({
      Authorization: `Basic ${basicToken}`
    });

    return this.http.get(`${this.apiUrl}/login`, {headers});
      
  }

  logout(token: string){
    const headers = new HttpHeaders({
      'x-access-token':token
    });
    return this.http.get(`${this.apiUrl}/logout`, {headers});
  }

  setLoginState(username: string, token: string | null, admin: boolean = false){
    this.isloggedIn$.next(true);
    this.currentUser$.next(username);
    this.isAdmin$.next(admin); 

    this.token = token;
    if (token) {
      sessionStorage.setItem('token', token);
    }
    sessionStorage.setItem('is_admin', String(admin));
  }

  clearLoginState(){
    this.isloggedIn$.next(false);
    this.currentUser$.next(null);
    this.isAdmin$.next(false);
  }
  getToken(): string | null {
  return this.token || sessionStorage.getItem('token');
  }

  

  getUser(userId: string) {
  const token = this.getToken?.() || sessionStorage.getItem('token');

  const headers = token
    ? new HttpHeaders({ 'x-access-token': token })
    : undefined;

  return this.http.get(
    `${this.apiUrl}/users/${userId}`,
    { headers }
  );
  }

}
