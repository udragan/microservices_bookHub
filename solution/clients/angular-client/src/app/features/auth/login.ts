import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { concatMap } from 'rxjs';

import { Button } from 'primeng/button'
import { Card } from 'primeng/card'
import { FloatLabel } from 'primeng/floatlabel'; 
import { InputText } from 'primeng/inputtext';
import { Tabs, Tab, TabList, TabPanel, TabPanels } from 'primeng/tabs';

import { AppRoutes } from '../../app.routes';
import { AuthService } from './auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		Button,
		CommonModule,
		Card,
		FormsModule,
		ReactiveFormsModule,
		FloatLabel,
		InputText,
		Tab,
		TabList,
		TabPanel,
		TabPanels,
		Tabs,
	],
	templateUrl:'./login.html',
	styleUrl:'./login.scss'
})
export class Login {
	constructor(private auth: AuthService, private router: Router) {}
	
	protected readonly formLogin = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', Validators.required)
	});

	protected readonly formRegister = new FormGroup({
		name: new FormControl('', Validators.required),
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', Validators.required)
	});

	// ------------------------------------------------------------------------
	
	login() {
		if (this.formLogin.valid) {
			const formData = this.formLogin.value;
			const email = formData.email?? '';
			const password = formData.password?? '';
			this.auth.login({ email: email, password: password }).subscribe({
				next: res => {
					this.auth.setToken(res.access_token);
					if (this.auth.isAdmin()) {
						this.router.navigate([AppRoutes.AdminDashboard]);
					} else {
						this.router.navigate([AppRoutes.Home]);
					}
				},
				error: _ => alert('Login failed!'), 
			});
		} else {
			alert('Input form is not valid!');
		}
	}

	register() {
		if (this.formRegister.valid) {
			const formData = this.formRegister.value;
			const name = formData.name?? '';
			const email = formData.email?? '';
			const password = formData.password?? '';

			this.auth.register({name: name, email: email, password: password }).pipe(
				concatMap(_ => this.auth.login({ email: email, password: password }))).subscribe({
					next: res => {
						this.auth.setToken(res.access_token);
						this.router.navigate([AppRoutes.Home]);
					},
					error: _ => alert('Registration failed!')
			});
		} else {
			alert('Input form is not valid!');
		}
	}
}
