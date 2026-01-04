import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

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
	private router = inject(Router);
	private userService = inject(UsersService);
	protected avatarMenuItems: MenuItem[] | undefined;
	protected avatarUrlSignal = this.userService.avatarUrlSignal;
	protected routes = AppRoutes;

	constructor() {	}

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
				{ label: 'Settings', icon: 'pi pi-refresh', command: () => this.accountSettings() },
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
