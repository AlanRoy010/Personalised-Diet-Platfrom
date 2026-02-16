import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class WebServices {
  pageSize: number = 9;
  constructor(private http: HttpClient,
              private authService: AuthService) { }

  getClients(page: number){
    return this.http.get<any[]>(
      'http://127.0.0.1:5000/clients?pn=' + page + '&ps=' + this.pageSize,
      this.getAuthOptions()
    );
  }

  getAllUsers(page: number, pageSize: number, search: string = '') {
  let params: any = { pn: page, ps: pageSize };
  if (search.trim()) params.q = search.trim();

  return this.http.get<any>(
    'http://127.0.0.1:5000/users',
    { ...this.getAuthOptions(), params }
  );
  }

  getClient(id: any){
    return this.http.get<any>(
      'http://127.0.0.1:5000/clients/' + id,
      this.getAuthOptions()
    );
  }

  getLoremIpsum(paragraphs : number): Observable<any>{
    let API_key = 'uBGJLoTBROnW9cZBSmQkVA==32R2HpPR6qpqezrW';
    return this.http.get<any>(
      'https://api.api-ninjas.com/v1/' + 'loremipsum?paragraphs=' + paragraphs,
      { headers: {'X-Api-Key' : API_key} }

    );

  }
  getLastPageNumber(){
    return Math.ceil(WebServices.length / this.pageSize);
  }

  private getAuthOptions() {
  const token = this.authService.getToken();
  if (!token) {
    return {};   // no headers if not logged in
  }

  return {
    headers: new HttpHeaders({
      'x-access-token': token   
      
      
    })
  };
  }

  getClientByUser(userId: string) {
    return this.http.get(`http://127.0.0.1:5000/clients/by-user/${userId}`, 
      this.getAuthOptions()
    );
  }

  getGroupedClients(groupBy: string) {
  return this.http.get<any>(
    'http://127.0.0.1:5000/clients/grouped?group_by=' + encodeURIComponent(groupBy),
    this.getAuthOptions()
  );
  }

  getNearbyClients(): Observable<any> {
    return this.http.get<any>(
      'http://127.0.0.1:5000/clients/nearby',
      this.getAuthOptions()
    );
  }

  // delClient(clientid: string){
  //   this.
  // } 

  getUserById(userId: string) {
  return this.http.get(
    `http://127.0.0.1:5000/users/${userId}`,
    this.getAuthOptions()
  );
  }

  updateUser(userId: string, payload: any) {
    return this.http.put(
      `http://127.0.0.1:5000/users/${userId}`,
      payload,
      this.getAuthOptions()
    );
  }
  deleteUser(userId: string) {
    return this.http.delete(
      `http://127.0.0.1:5000/users/${userId}`,
      this.getAuthOptions()
    );
  }

  getDietPlan(clientId: string) {
  return this.http.get<any>(
    `http://127.0.0.1:5000/clients/${clientId}/diet-plan`,
    this.getAuthOptions()
  );
  }
  
}
