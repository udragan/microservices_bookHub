import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet, RouterLink } from '@angular/router';

import { MenuItem, SharedModule } from 'primeng/api';
import { Avatar } from 'primeng/avatar'
import { Button } from 'primeng/button'
import { Menu } from 'primeng/menu'
import { Toolbar } from 'primeng/toolbar'

import { AppRoutes } from '../../app.routes';
import { AuthService } from '../auth/auth.service';
import { MediaService } from '../../core/services/media.service';

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
export class AdminMainLayout implements OnInit, OnDestroy {	
	private authService = inject(AuthService);
	private mediaService = inject(MediaService);
	private sanitizer = inject(DomSanitizer);

	private avatarUrlRaw: string | null = null;
	protected avatarUrlSignal = signal<any>(null);
	protected avatarMenuItems: MenuItem[] | undefined;
	protected routes = AppRoutes;

	constructor() {	}

	// ------------------------------------------------------------------------

	ngOnInit() : void {
		this.loadAvatar();
		this.loadAvatarMenu();
	}

	ngOnDestroy(): void {
		if (this.avatarUrlRaw) {
			URL.revokeObjectURL(this.avatarUrlRaw);
		}
	}

	loadAvatar() {
		this.mediaService.getAvatar().subscribe({
			next: response => {
				this.avatarUrlRaw = URL.createObjectURL(response);
				this.avatarUrlSignal.set(this.sanitizer.bypassSecurityTrustUrl(this.avatarUrlRaw));
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

	}

	logout() {
		this.authService.logout();
	}
}
