import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { MenuItem, SharedModule } from 'primeng/api';
import { Avatar } from 'primeng/avatar'
import { Button } from 'primeng/button'
import { Menu } from 'primeng/menu'
import { Toolbar } from 'primeng/toolbar'

import { AppRoutes } from '../../app.routes';
import { AuthService } from '../auth/auth.service';
import { MediaService } from '../../core/services/media.service';
import { UsersService } from '../../core/services/users.service';

@Component({
	selector: 'app-admin-main-layout',
	imports: [
		FormsModule,
		Avatar,
		Button,
		CommonModule,
		Menu,
		Toolbar,
		RouterLink,
		RouterOutlet,
		SharedModule,
	],
	templateUrl:'./admin-main-layout.html',
	styleUrl: './admin-main-layout.scss',
})
export class AdminMainLayout implements OnInit {	
	private authService = inject(AuthService);
	private mediaService = inject(MediaService);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private userService = inject(UsersService);
	protected avatarMenuItems: MenuItem[] | undefined;
	protected avatarUrlSignal = this.userService.avatarUrlSignal;
	protected captionSignal = signal<string>('');
	protected routes = AppRoutes;

	constructor() {
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)).subscribe({
				next: _ => {
					let child = this.route.firstChild;
					while (child?.firstChild) {
						child = child.firstChild;
					}					
					const newCaption = child?.snapshot.data['caption'] || '';
					this.captionSignal.set(newCaption);
				},
				error: e => {
					console.error(e);
				}
			});
	}

	// ------------------------------------------------------------------------

	ngOnInit() : void {
		this.loadAvatar();
		this.loadAvatarMenu();
	}

	loadAvatar() {
		this.mediaService.getAvatar().subscribe({
			next: response => {
				const url = URL.createObjectURL(response);
				this.userService.updateAvatar(url);
			},
			error: e => {
				console.error(e)
			}
		});
	}

	loadAvatarMenu() {
		this.avatarMenuItems = [{
			label: 'Options',
			items: [
				{ label: 'Account', icon: 'pi pi-user-edit', command: () => this.accountSettings() },
				{ label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
			]
		}]
	}

	accountSettings() {
		this.router.navigate([AppRoutes.AdminAccount])
	}

	logout() {
		this.authService.logout();
	}
}
