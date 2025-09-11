import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly TOKEN_KEY = 'jwt_token';
	private apiUrl = '';

	constructor(private http: HttpClient, private router: Router) {
		this.apiUrl = environment.apiBaseUrl;
	}
	
	login(credentials: { email: string; password: string }) {
		return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/login`, credentials);
	}

	logout() {
		localStorage.removeItem(this.TOKEN_KEY);
		this.router.navigate(['/login']);
	}

	setToken(token: string) {
		localStorage.setItem(this.TOKEN_KEY, token);
	}

	getToken(): string | null {
		return localStorage.getItem(this.TOKEN_KEY);
	}

	isAuthenticated(): boolean {
		var token = this.getToken();
		return !!token && token != 'undefined';
	}
}
