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
	
	private http = inject(HttpClient);
	private sanitizer = inject(DomSanitizer);
	
	avatarUrlSignal = signal<any>(null);
	
	constructor() {
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

	getUserById(userId: number): Observable<User> {
		return this.http.get<User>(`${this.apiUrl}/${userId}`);
	}

	updateUser(user: User) : Observable<User> {
		return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
	}

	passwordReset(userId: number) : Observable<string> {
		return this.http.post<string>(`${this.apiUrl}/passwordReset`, { "id": userId });
	}
}
