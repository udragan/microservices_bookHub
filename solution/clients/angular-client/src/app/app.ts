import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TuiAppearance, TuiDataList, TuiDropdown, TuiRoot, TuiTextfield } from '@taiga-ui/core'

import { AuthInterceptor } from './features/auth/auth.interceptor';
import { TuiAvatar, TuiBadgeNotification, TuiTabs } from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { AuthService } from './features/auth/auth.service';
import { MediaService } from './core/services/media.service';

@Component({
	selector: 'app-root',
	imports: [
		RouterOutlet,
		TuiRoot,
		TuiBadgeNotification,
		TuiAvatar,		
		TuiAppearance,
		TuiAvatar,
		TuiBadgeNotification,
		TuiDataList,
		TuiDropdown,
		TuiTabs,
		TuiTextfield,
		TuiNavigation,
	],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	protected readonly title = signal('Bookhub-AngularClient');
	isOpen = false;
	avatar = "@tui.user"

	constructor(protected auth: AuthService,
		protected mediaService : MediaService
	) {}

	ngOnInit() : void {
		if (this.auth.isAuthenticated()) {
			let av = this.mediaService.getAvatar().subscribe({
				next: response => {
					const imageUrl = URL.createObjectURL(response);
    			this.avatar = imageUrl;
				},
				error: e => {
					console.error(e)
				}
			});
		}
	}

	editUser() {
		this.isOpen = false;
	}
	
	protected onClick(): void {
		this.isOpen = !this.isOpen;
	}
}
