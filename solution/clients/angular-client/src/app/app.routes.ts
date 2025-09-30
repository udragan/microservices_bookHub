import { Routes } from '@angular/router';

import { AuthGuard } from './features/auth/auth.guard';
import { Login } from './features/auth/login';
import { Home } from './features/home/home';
import { AdminGuard } from './features/admin/admin.guard';
import { AdminDashboard } from './features/admin/admin-dashboard';
import { AdminUsers } from './features/admin/admin-users';

export const routes: Routes = [    
		{ path: '', component: Home, canActivate: [AuthGuard] },
		{ path: 'login', component: Login },
		{ path: 'admin-dashboard', component: AdminDashboard, canActivate: [AdminGuard] },
		{ path: 'admin-users', component: AdminUsers, canActivate: [AdminGuard] }
];

export const AppRoutes = {
	Home: '/',
	Login: '/login',
	AdminDashboard: '/admin-dashboard',
	AdminUsers: '/admin-users'
}
