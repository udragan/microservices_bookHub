import { Component, inject, OnInit } from "@angular/core";

import { Avatar } from "primeng/avatar";
import { Card } from "primeng/card";
import { FloatLabel } from "primeng/floatlabel";
import { FileUpload, FileUploadHandlerEvent } from "primeng/fileupload";
import { InputText } from 'primeng/inputtext';

import { MediaService } from "../../core/services/media.service";
import { UsersService } from "../../core/services/users.service";

@Component({
	selector: 'app-admin-account',
	imports: [
		Avatar,
		Card,
		FileUpload,
		FloatLabel,
		InputText,
	],
	templateUrl: './admin-account.html',
	styleUrl: './admin-account.scss'
})
export class AdminAccount implements OnInit {

	private mediaService = inject(MediaService);
	private userService = inject(UsersService);
	
	protected avatarUrlSignal = this.userService.avatarUrlSignal;

	constructor() { }
	
	// ------------------------------------------------------------------------
	
	ngOnInit(): void {
		
	}

	onUploadAvatar(event: FileUploadHandlerEvent) {
		const file = event.files[0];
		const formData = new FormData();
		formData.append('file', file, file.name);

		this.mediaService.uploadAvatar(formData).subscribe({
			next: (response) => 
				{
					const url = URL.createObjectURL(file);
					this.userService.updateAvatar(url);
					console.log('Upload success!', response);
				},
			error: (err) => console.error('Upload failed', err)
		});
	}
}
