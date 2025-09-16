import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from './auth.service';

@Component({
	selector: 'app-login',
	imports: [
		FormsModule
	],
	templateUrl:'./login.html',
})
export class Login {
	email = '';
	password = '';

	constructor(private auth: AuthService, private router: Router) {}

	login() {
		this.auth.login({ email: this.email, password: this.password }).subscribe({
			next: res => {
				this.auth.setToken(res.access_token);
				this.router.navigate(['/']);
			},
			error: err => alert('Login failed'),
		});
	}

	register() {
		this.router.navigate(['register']);
	}
}
