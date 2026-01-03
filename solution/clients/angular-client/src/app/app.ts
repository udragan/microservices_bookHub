import { Component, effect, inject, signal } from '@angular/core';
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
	isOpen = false;
	avatar = "@tui.user"
	userSignal = this.auth.userSignal;

	constructor() {
		effect(() => { 
			const currentUser = this.userSignal();
      if (currentUser) {
        this.mediaService.getAvatar().subscribe({
					next: response => {
						const imageUrl = URL.createObjectURL(response);
						this.avatar = imageUrl;
					},
					error: e => {
						console.error(e)
					}
				});
      } else {
        this.avatar = "@tui.user";
      }
		});
	}

	ngOnInit() : void {
		this.auth.setUserSignal(this.auth.isAuthenticated());
	}

	editUser() {

	}

	logout() {
		this.auth.logout();
	}
	
	protected onClick(): void {
		this.isOpen = !this.isOpen;
	}
}
