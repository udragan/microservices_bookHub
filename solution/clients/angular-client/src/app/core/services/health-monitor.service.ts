import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ServiceResponse } from '../models/service-response.model';

@Injectable({
  	providedIn: 'root'
})
export class HealthMonitorService {
	private apiUrl = '';
	
	private http = inject(HttpClient);
	
	avatarUrlSignal = signal<any>(null);
	
	constructor() {
		this.apiUrl = environment.apiBaseUrl + "/hms";
	}

	// ------------------------------------------------------------------------

	getAllHeartbeats() : Observable<ServiceResponse<any>> {
		return this.http.get<ServiceResponse<any>>(`${this.apiUrl}/health`);
	}
}
