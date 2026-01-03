import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = '';

  constructor(private http: HttpClient) {
		this.apiUrl = environment.apiBaseUrl + "/users";
	}
	
	getAllUsers(): Observable<User[]> {
		return this.http.get<User[]>(`${this.apiUrl}`);
  }
}
