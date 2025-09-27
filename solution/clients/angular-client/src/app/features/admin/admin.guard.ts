import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
	constructor(private auth: AuthService) {}

	canActivate(): boolean {
		if (!this.auth.isAuthenticated() || !this.auth.isAdmin()) {
			this.auth.logout();
			return false;
		}
		return true;
	}
}
