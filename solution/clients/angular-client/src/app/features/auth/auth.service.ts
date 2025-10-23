import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { environment } from '../../../environments/environment';
import { JwtUser } from './jwtUser';
import { AppRoutes } from '../../app.routes';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly TOKEN_KEY = 'jwt_token';
	private apiUrl = '';
	private user = signal<string | null>(null);
	userSignal = this.user.asReadonly();


	constructor(private http: HttpClient, private router: Router) {
		this.apiUrl = environment.apiBaseUrl;
	}

	register(credentials: { name: string, email: string; password: string }): Observable<{ userId: string, email: string }> {
		return this.http.post<{ userId: string, email: string }>(`${this.apiUrl}/users/register`, credentials);
	}
	
	login(credentials: { email: string; password: string }): Observable<{access_token: string}> {
		return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/login`, credentials);
	}

	logout() {
		localStorage.removeItem(this.TOKEN_KEY);
		this.setUserSignal(false);
		this.router.navigate([AppRoutes.Login]);
	}

	setToken(token: string) {
		localStorage.setItem(this.TOKEN_KEY, token);
		this.setUserSignal(true);
	}
	
	getToken(): string | null {
		return localStorage.getItem(this.TOKEN_KEY);
	}

	setUserSignal(userPresent: boolean) : void {
		if (userPresent) {
			this.user.set("loggedin");
		} else {
			this.user.set(null);
		}
	}

	isAuthenticated(): boolean {
		var token = this.getToken();
		if (token === null) {
			return false;
		}
		try {
			const decoded = jwtDecode(token);
			const exp = decoded.exp;
			const now = Math.floor(Date.now() / 1000);
			return exp !== undefined && exp > now;
		} catch {
			return false;
		}
	}

	isAdmin(): boolean {
		var token = this.getToken();
		if (token === null) {
			return false;
		}
		try {
			const decoded = jwtDecode<JwtUser>(token);
			const role = decoded.role;
			return role !== undefined && role === 'admin';
		} catch {
			return false;
		}
	}
}
