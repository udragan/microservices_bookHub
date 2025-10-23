import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = '';

  constructor(private http: HttpClient) {
		this.apiUrl = environment.apiBaseUrl + "/media";
	}
	
	getAvatar(): Observable<Blob> {
		return this.http.get(`${this.apiUrl}/avatar`, {responseType: 'blob'});
  }
}
