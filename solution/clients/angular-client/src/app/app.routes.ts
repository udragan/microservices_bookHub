import { Routes } from '@angular/router';

import { AuthGuard } from './features/auth/auth.guard';
import { Login } from './features/auth/login';
import { Home } from './features/home/home';

export const routes: Routes = [    
		{ path: '', component: Home, canActivate: [AuthGuard] },
		{ path: 'login', component: Login },
];
