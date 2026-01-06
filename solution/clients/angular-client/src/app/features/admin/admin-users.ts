import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from "primeng/select";
import { TableModule } from 'primeng/table';

import { AppRoutes } from '../../app.routes';
import { User } from '../../core/models/user.model';
import { UsersService } from '../../core/services/users.service';


@Component({
	selector: 'app-admin-users',
	imports: [
    Button,
    Dialog,
    FloatLabel,
    FormsModule,
    InputText,
    TableModule,
    Select
],
	templateUrl:'./admin-users.html',
	styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
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
				this.users.set(response);
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
}
