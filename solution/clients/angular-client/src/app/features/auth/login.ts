import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from './auth.service';

@Component({
	selector: 'app-login',
	imports: [
		FormsModule
	],
	template: `
	<form (ngSubmit)="login()">
		<input [(ngModel)]="email" name="email" placeholder="Email" required />
		<input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />
		<button type="submit">Login</button>
	</form>
	`,
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
}
