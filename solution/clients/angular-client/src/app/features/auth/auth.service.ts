import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly TOKEN_KEY = 'jwt_token';
	private apiUrl = 'https://localhost:8000/auth'; // via API Gateway

	constructor(private http: HttpClient, private router: Router) {}

	login(credentials: { email: string; password: string }) {
		return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, credentials);
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
