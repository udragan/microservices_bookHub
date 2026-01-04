import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  	providedIn: 'root'
})
export class UsersService {
	private apiUrl = '';
	
	private sanitizer = inject(DomSanitizer);
	
	avatarUrlSignal = signal<any>(null);
	
	constructor(private http: HttpClient) {
		this.apiUrl = environment.apiBaseUrl + "/users";
	}

	// ------------------------------------------------------------------------

	updateAvatar(newAvatarUrl: string) {
		const url = this.sanitizer.bypassSecurityTrustUrl(newAvatarUrl);
		this.avatarUrlSignal.set(url);
	}
	
	getAllUsers(): Observable<User[]> {
		return this.http.get<User[]>(`${this.apiUrl}`);
	}
}
