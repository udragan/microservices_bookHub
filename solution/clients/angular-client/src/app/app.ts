import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './features/auth/auth.service';
import { MediaService } from './core/services/media.service';

@Component({
	selector: 'app-root',
	imports: [
		RouterOutlet
	],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	protected auth = inject(AuthService);
	protected mediaService =inject(MediaService);

	protected readonly title = signal('Bookhub-AngularClient');

	constructor() {	}

	// ------------------------------------------------------------------------

	editUser() {

	}

	logout() {
		this.auth.logout();
	}
}
