import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
	selector: 'app-home',
	imports: [],
	templateUrl: './home.html',
	styleUrl: './home.scss'
})
export class Home {
	constructor(private auth: AuthService) { }

	logout() {
		this.auth.logout();
	}
}
