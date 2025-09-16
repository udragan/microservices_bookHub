import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";
import { switchMap } from "rxjs";

@Component({
	selector: 'app-register',
	imports: [
		FormsModule
	],
	templateUrl:'./register.html',
})
export class Register {
	name = '';
	email = '';
	password = '';

	constructor(private auth: AuthService, private router: Router) {}

	register() {
		this.auth.register({ name: this.name, email: this.email, password: this.password }).pipe(
			switchMap(() => this.auth.login({
				email: this.email,
				password: this.password
			}))
		).subscribe({
			next: res => {
				this.auth.setToken(res.access_token);
				this.router.navigate(['/']);
			},
			error: err => alert('Login failed'),
		});
	}
}
