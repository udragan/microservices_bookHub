import { ChangeDetectorRef, Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiAppearance, TuiDataList, TuiDropdown, TuiRoot, TuiTextfield } from '@taiga-ui/core'
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
		this.isOpen = false;
	}
	
	protected onClick(): void {
		this.isOpen = !this.isOpen;
	}
}
