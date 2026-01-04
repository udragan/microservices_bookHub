import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet, RouterLink } from '@angular/router';

import { SharedModule } from 'primeng/api';
import { Avatar } from 'primeng/avatar'
import { Button } from 'primeng/button'
import { Toolbar } from 'primeng/toolbar'

import { MediaService } from '../../core/services/media.service';

@Component({
	selector: 'app-admin-main-layout',
	imports: [
		FormsModule,
		Avatar,
		Button,
		CommonModule,
		Toolbar,
		RouterLink,
		RouterOutlet,
		SharedModule,
	],
	templateUrl:'./admin-main-layout.html',
	styleUrl: './admin-main-layout.scss',
})
export class AdminMainLayout implements OnInit, OnDestroy {	
	private mediaService = inject(MediaService);
	private sanitizer = inject(DomSanitizer);

	private avatarUrlRaw: string | null = null;
	protected avatarUrlSignal = signal<any>(null);

	constructor() {	}

	// ------------------------------------------------------------------------

	ngOnInit() : void {
		this.loadAvatar();
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
}
