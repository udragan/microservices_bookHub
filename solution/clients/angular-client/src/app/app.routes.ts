import { Routes } from '@angular/router';

import { AuthGuard } from './features/auth/auth.guard';
import { Login } from './features/auth/login';
import { AdminAccount } from './features/admin/admin-account';
import { AdminDashboard } from './features/admin/admin-dashboard';
import { AdminGuard } from './features/admin/admin.guard';
import { AdminMainLayout } from './features/admin/admin-main-layout';
import { AdminUsers } from './features/admin/admin-users';
import { Home } from './features/home/home';

export const routes: Routes = [    
	{ path: '', component: Home, canActivate: [AuthGuard] },
	{ path: 'login', component: Login },
	{
		path: 'admin',
		component: AdminMainLayout,
		children: [
			{ path: 'dashboard', component: AdminDashboard, canActivate: [AdminGuard], data: { caption: 'Admin - Dashboard' }},
			{ path: 'users', component: AdminUsers, canActivate: [AdminGuard], data: { caption: 'Admin - Users' }},
			{ path: 'account', component: AdminAccount, canActivate: [AdminGuard], data: { caption: 'Admin - Account' }},
		]
	}
];

export const AppRoutes = {
	Home: '/',
	Login: '/login',
	AdminDashboard: '/admin/dashboard',
	AdminUsers: '/admin/users',
	AdminAccount: '/admin/account',
	AdminNotifications: '/admin/notifications'
}
