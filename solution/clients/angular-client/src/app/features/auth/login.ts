import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { concatMap } from 'rxjs';

import { TuiAppearance, TuiButton, TuiError, TuiIcons, TuiTextfield } from '@taiga-ui/core';
import { TuiTabs, TuiTabsDirective, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCardMedium, TuiForm } from '@taiga-ui/layout';

import { AuthService } from './auth.service';
import { AppRoutes } from '../../app.routes';

@Component({
	selector: 'app-login',
	imports: [
    CommonModule,
    FormsModule,
    TuiAppearance,
    TuiTabs,
    TuiTabsDirective,
    TuiIcons,
    TuiButton,
    TuiCardLarge,
    TuiTextfield,
    ReactiveFormsModule,
    TuiError,
    TuiFieldErrorPipe,
    TuiCardMedium,
		AsyncPipe,
		TuiForm,
],
	templateUrl:'./login.html',
	styleUrl:'./login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
	activeTab = 0;

	constructor(private auth: AuthService, private router: Router) {}
////////////////////
	protected readonly formLogin = new FormGroup({
		email: new FormControl('', Validators.required),
		password: new FormControl('', Validators.required)
	});

	protected readonly formRegister = new FormGroup({
		name: new FormControl('', Validators.required),
		email: new FormControl('', Validators.required),
		password: new FormControl('', Validators.required)
	});
////////////////////
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
		}
	}

	register() {
		if (this.formRegister.valid) {
			const formData = this.formRegister.value;
			const name = formData.name?? '';
			const email = formData.email?? '';
			const password = formData.password?? '';

			this.auth.register({name: name, email: email, password: password }).pipe(
				concatMap(_ => this.auth.login({ email: "dd", password: password }))).subscribe({
					next: res => {
						this.auth.setToken(res.access_token);
						this.router.navigate([AppRoutes.Home]);
					},
					error: _ => alert('Registration failed!')
			});
		}
	}
}
