import { Component, inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MessageService } from "primeng/api";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { Card } from "primeng/card";
import { FloatLabel } from "primeng/floatlabel";
import { FileUpload, FileUploadHandlerEvent } from "primeng/fileupload";
import { InputText } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';

import { AuthService } from "../auth/auth.service";
import { User } from "../../core/models/user.model";
import { MediaService } from "../../core/services/media.service";
import { UsersService } from "../../core/services/users.service";

@Component({
	selector: 'app-admin-account',
	imports: [
		Avatar,
		Button,
		Card,
		FileUpload,
		FloatLabel,
		FormsModule,
		InputText,
		ReactiveFormsModule,
		Toast,
	],
	providers: [
		MessageService
	],
	templateUrl: './admin-account.html',
	styleUrl: './admin-account.scss'
})
export class AdminAccount implements OnInit {

	private authService = inject(AuthService);
	private mediaService = inject(MediaService);
	private messageService = inject(MessageService);
	private userService = inject(UsersService);

	private currentUser: User | null = null;
	
	protected avatarUrlSignal = this.userService.avatarUrlSignal;

	constructor() { }

	protected readonly formUpdateAccount = new FormGroup({
		email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
		name: new FormControl('', Validators.required),
	});
	
	// ------------------------------------------------------------------------
	
	ngOnInit(): void {
		const userId = this.authService.getUserId();

		if (userId == 0) {
			this.authService.logout();
		}

		this.userService.getUserById(userId).subscribe({
			next: response => {
				this.currentUser = response;
				this.formUpdateAccount.controls.email.setValue(response.email);
				this.formUpdateAccount.controls.name.setValue(response.name);
			},
			error: e => { console.log(e); }
		})
	}

	onUploadAvatar(event: FileUploadHandlerEvent) {
		const file = event.files[0];
		const formData = new FormData();
		formData.append('file', file, file.name);

		this.mediaService.uploadAvatar(formData).subscribe({
			next: response => 
				{
					const url = URL.createObjectURL(file);
					this.userService.updateAvatar(url);
					console.log('Upload success!', response);
				},
			error: e => { console.error('Upload failed', e) }
		});
	}

	saveChanges() : void {
		this.currentUser!.name = this.formUpdateAccount.controls.name.value!;
		this.userService.updateUser(this.currentUser!).subscribe({
			next: _ => {
				this.messageService.add({ 
					severity: 'success', 
					summary: 'Confirmed', 
					detail: `${this.currentUser!.email} updated successfully.` 
				});
			},
			error: e => { console.log(e) }
		})
	}
}
