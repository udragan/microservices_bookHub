import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink } from '@angular/router';

import { Avatar } from 'primeng/avatar'
import { SharedModule } from 'primeng/api';
import { Button } from 'primeng/button'
import { Toolbar } from 'primeng/toolbar'

import { AppRoutes } from '../../app.routes';
import { User } from '../../core/models/user.model';
import { UsersService } from '../../core/services/users.service';


@Component({
	selector: 'app-admin-main-layout',
	imports: [
    FormsModule,
	Avatar,
	Button,
	CommonModule,
	Toolbar,
    RouterLink,
	RouterOutlet,
	SharedModule,
],
	templateUrl:'./admin-main-layout.html',
	styleUrl: './admin-main-layout.scss',
})
export class AdminMainLayout implements OnInit {
	routes = AppRoutes;

	constructor(private usersService: UsersService) { }

	// ------------------------------------------------------------------------
	ngOnInit(): void {

	}
}
