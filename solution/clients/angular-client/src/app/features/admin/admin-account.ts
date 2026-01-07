import { Component, inject, OnInit, signal } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MessageService } from "primeng/api";
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { Card } from "primeng/card";
import { Dialog } from 'primeng/dialog';
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
		Dialog,
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
	protected showChangePasswordDialogSignal = signal(false);	

	constructor() { }

	protected readonly formUpdateAccount = new FormGroup({
		email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
		name: new FormControl('', Validators.required),
	});

	protected readonly formPasswordChange = new FormGroup({
		password: new FormControl('', [Validators.required]),
		newPassword: new FormControl('', [Validators.required]),
		newPasswordRepeat: new FormControl('', [Validators.required]),
	});
	
	// ------------------------------------------------------------------------
	
	ngOnInit(): void {
		const userId = this.authService.getUserId();

		if (userId == 0) {
			this.authService.logout();
		}

		this.userService.getMine().subscribe({
			next: response => {
				this.currentUser = response.data;
				this.formUpdateAccount.controls.email.setValue(response.data.email);
				this.formUpdateAccount.controls.name.setValue(response.data.name);
			},
			error: e => { console.log(e); }
		})
	}

	onUploadAvatar(event: FileUploadHandlerEvent) : void {
		const file = event.files[0];
		const formData = new FormData();
		formData.append('file', file, file.name);

		this.mediaService.uploadAvatar(formData).subscribe({
			next: response => {				
				const url = URL.createObjectURL(file);
				this.userService.updateAvatar(url);
				this.messageService.add({ 
					severity: 'success', 
					summary: 'Confirmed', 
					detail: 'Upload succeeded'
				});
				console.log('Upload success!', response);
			},
			error: e => { 
				this.messageService.add({ 
					severity: 'error', 
					summary: 'Error', 
					detail: `Upload failed: ${e.error.message}`
				});
			}
		});
	}

	saveChanges() : void {
		this.currentUser!.name = this.formUpdateAccount.controls.name.value!;
		this.userService.updateMine(this.currentUser!).subscribe({
			next: _ => {
				this.formUpdateAccount.markAsPristine();
				this.messageService.add({ 
					severity: 'success', 
					summary: 'Confirmed', 
					detail: `${this.currentUser!.email} updated successfully.` 
				});
			},
			error: e => {
				this.messageService.add({ 
					severity: 'error', 
					summary: 'Error', 
					detail: `Update failed: ${e.error.message}`
				});
			}
		})
	}

	passwordChange() : void {
		const password = this.formPasswordChange.controls.password.value;
		const newPassword = this.formPasswordChange.controls.newPassword.value;
		const newPasswordRepeat = this.formPasswordChange.controls.newPasswordRepeat.value;

		if (password && newPassword && newPasswordRepeat) {
			this.userService.passwordChangeMine({ password, newPassword, newPasswordRepeat }).subscribe({
				next: response => {
					this.showChangePasswordDialogSignal.set(false);
					this.messageService.add({ 
						severity: 'success', 
						summary: 'Confirmed', 
						detail: `${this.currentUser!.email} ${response.message}` 
					})
				},
				error: e => {
					this.messageService.add({ 
						severity: 'error', 
						summary: 'Error', 
						detail: `Password change failed: ${e.error.message}`
					});
				}
			});
		}
	}
}
