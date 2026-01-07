import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ServiceResponse } from '../models/service-response.model';
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

	updateAvatar(newAvatarUrl: string) : void {
		const url = this.sanitizer.bypassSecurityTrustUrl(newAvatarUrl);
		this.avatarUrlSignal.set(url);
	}
	
	getAllUsers() : Observable<ServiceResponse<User[]>> {
		return this.http.get<ServiceResponse<User[]>>(`${this.apiUrl}`);
	}

	updateUserById(user: User) : Observable<ServiceResponse<User>> {
		return this.http.put<ServiceResponse<User>>(`${this.apiUrl}`, user);
	}

	getMine() : Observable<ServiceResponse<User>> {
		return this.http.get<ServiceResponse<User>>(`${this.apiUrl}/user`);
	}

	updateMine(user: User) : Observable<ServiceResponse<User>> {
		return this.http.put<ServiceResponse<User>>(`${this.apiUrl}/user`, user);
	}
	
	passwordChangeMine(data: { password: string, newPassword: string, newPasswordRepeat: string }) : Observable<ServiceResponse<number>> {
		return this.http.post<ServiceResponse<number>>(`${this.apiUrl}/user/passwordChange`, data);	
	}

	passwordReset(userId: number) : Observable<ServiceResponse<null>> {
		return this.http.post<ServiceResponse<null>>(`${this.apiUrl}/passwordReset`, { "id": userId });
	}
}
