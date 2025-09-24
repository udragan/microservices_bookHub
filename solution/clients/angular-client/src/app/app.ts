import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TuiRoot } from '@taiga-ui/core'

import { AuthInterceptor } from './features/auth/auth.interceptor';

@Component({
	selector: 'app-root',
	imports: [
		RouterOutlet,
		TuiRoot
	],
	templateUrl: './app.html',
	styleUrl: './app.scss',
	providers: [
		{
				provide: HTTP_INTERCEPTORS,
				useClass: AuthInterceptor,
				multi: true
		}
	]
})
export class App {
	protected readonly title = signal('Bookhub-AngularClient');
}
