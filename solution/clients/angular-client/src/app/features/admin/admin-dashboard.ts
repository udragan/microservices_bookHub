import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutes } from '../../app.routes';

@Component({
	selector: 'app-admin-dashboard',
	imports: [
		FormsModule,
		
	],
	templateUrl:'./admin-dashboard.html',
})
export class AdminDashboard {
	routes = AppRoutes;
	protected readonly breadcrumbs = ['Home', 'Admin', 'Dashboard'];
	
	constructor() { 
		
	}
	// ------------------------------------------------------------------------

	
}
