import { Routes } from '@angular/router';

import { AuthGuard } from './features/auth/auth.guard';
import { Login } from './features/auth/login';
import { AdminGuard } from './features/admin/admin.guard';
import { AdminMainLayout } from './features/admin/admin-main-layout';
import { AdminDashboard } from './features/admin/admin-dashboard';
import { Home } from './features/home/home';
import { AdminUsers } from './features/admin/admin-users';

export const routes: Routes = [    
		{ path: '', component: Home, canActivate: [AuthGuard] },
		{ path: 'login', component: Login },
		{
			path: 'admin',
			component: AdminMainLayout,
			children: [
				{ path: 'dashboard', component: AdminDashboard, canActivate: [AdminGuard] },
				{ path: 'users', component: AdminUsers, canActivate: [AdminGuard] },
			]
		}
];

export const AppRoutes = {
	Home: '/',
	Login: '/login',
	AdminDashboard: '/admin/dashboard',
	AdminUsers: '/admin/users'
}
