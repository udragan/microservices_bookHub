import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive} from '@angular/router';

import { AppRoutes } from '../../app.routes';
import { User } from '../../core/models/user.model';
import { UsersService } from '../../core/services/users.service';


@Component({
	selector: 'app-admin-users',
	imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
],
	templateUrl:'./admin-users.html',
	styleUrl: './admin-users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsers implements OnInit {
	routes = AppRoutes;
 	protected expanded = signal(false);
	protected readonly breadcrumbs = ['Home', 'Admin', 'Users'];

	columns = ["Id", "Name", "Email", "Role", "Actions"];
	users = signal<User[]>([]);
	loading = true;

	constructor(private usersService: UsersService) { }

	ngOnInit(): void {
		this.usersService.getAllUsers().subscribe({
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

	protected handleToggle(): void {
		this.expanded.update((e) => !e);
	}
}
