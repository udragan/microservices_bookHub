import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ServiceResponse } from '../models/service-response.model';

@Injectable({
	providedIn: 'root'
})
export class MediaService {
	private apiUrl = '';

	constructor(private http: HttpClient) {
		this.apiUrl = environment.apiBaseUrl + "/media";
	}

	// ------------------------------------------------------------------------
	
	// do not use ServiceResponse since it is not a text protocol
	getAvatar(): Observable<Blob> {
		return this.http.get<Blob>(`${this.apiUrl}/avatar`);
	}

	uploadAvatar(data: FormData) : Observable<ServiceResponse<null>> {
		return this.http.post<ServiceResponse<null>>(`${this.apiUrl}/avatar`, data);
	}
}
