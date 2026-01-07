import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from "primeng/select";
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';

import { AppRoutes } from '../../app.routes';
import { User } from '../../core/models/user.model';
import { UsersService } from '../../core/services/users.service';


@Component({
	selector: 'app-admin-users',
	imports: [
		Button,
		ConfirmDialog,
		Dialog,
		FloatLabel,
		FormsModule,
		InputText,
		TableModule,
		Toast,
		Select
	],
	providers: [
		ConfirmationService,
		MessageService
	],
	templateUrl:'./admin-users.html',
	styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
	private confirmationService = inject(ConfirmationService)
	private messageService = inject(MessageService);
	private userService = inject(UsersService);
	
	protected routes = AppRoutes;
	protected roles = ["admin", "moderator", "user"];

	protected users = signal<User[]>([]);
	protected selectedUserSignal = signal<User | null>(null);
	protected displayDialogSignal = signal(false);
	protected loading = true;

	constructor() { }

	// ------------------------------------------------------------------------

	ngOnInit(): void {
		this.userService.getAllUsers().subscribe({
			next: response => {
				this.users.set(response.data);
				this.loading = false;
			},
			error: e => {
				this.loading = false;
				console.log(e)
			}
		});
	}

	editUser(user: User) {
		this.selectedUserSignal.set({ ...user });
		this.displayDialogSignal.set(true);
	}

	saveUser() {
		const updatedUser = this.selectedUserSignal();
		if (updatedUser) {
			this.userService.updateUser(updatedUser).subscribe({
				next: _ => {
					this.users.update(prev => 
						prev.map(u => u.id === updatedUser.id ? updatedUser : u)
					);
					this.displayDialogSignal.set(false);
				},
				error: e => {
					console.log(e)
				}
			});	
		}
	}

	confirmPasswordReset(event: Event, item: User) {
		this.confirmationService.confirm({
			target: event.target as EventTarget,
			message: `Reset password for user: ${item.email}?`,
			header: 'Confirmation',
			icon: 'pi pi-question-circle',
			acceptIcon: "none",
			rejectIcon: "none",
			rejectButtonStyleClass: "p-button-text",
			accept: () => {
				this.userService.passwordReset(item.id).subscribe({
					next: _ => {
						this.messageService.add({ 
							severity: 'success', 
							summary: 'Confirmed', 
							detail: `${item.email} reset password successfully.`
						});
					},
					error: e => {
						console.log(e);
					}
				})
			},
			reject: () => {
				console.log('Rejected!');
			}
		});
  	}
}
