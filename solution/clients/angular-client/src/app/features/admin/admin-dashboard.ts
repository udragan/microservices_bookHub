import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MessageService, SharedModule } from 'primeng/api';
import { Button } from "primeng/button";
import { Card } from "primeng/card";
import { DataView } from "primeng/dataview";
import { Divider } from 'primeng/divider';
import { Tag } from "primeng/tag";
import { Toast } from 'primeng/toast';

import { AppRoutes } from '../../app.routes';
import { HealthMonitorService } from '../../core/services/health-monitor.service';
import { ServiceHealthDetails } from '../../core/models/service-health.model';


@Component({
	selector: 'app-admin-dashboard',
	imports: [
		Button,
		Card,
		CommonModule,
		DataView,
		Divider,
		FormsModule,
		SharedModule,
		Tag,
		Toast,
	],
	providers: [
		MessageService
	],
	templateUrl:'./admin-dashboard.html',
})
export class AdminDashboard implements OnInit {
	routes = AppRoutes;
	protected readonly breadcrumbs = ['Home', 'Admin', 'Dashboard'];

	private healthMonitorService = inject(HealthMonitorService);
	private messageService = inject(MessageService)

    healthSignal = signal<any>([]);
	
	constructor() { 
		
	}
	ngOnInit(): void {
		//let dummyResponse : ServiceHealthDetails[] = [
		//	{
		//		"serviceId": "Bookhub.test-service",
		//		"timestamp": "432",
		//		"status": "healthy",
		//		"stats": [],
		//		"data": []
		//	},
		//	{
		//		"serviceId": "Bookhub.user-service",
		//		"timestamp": "2113",
		//		"status": "stale",
		//		"stats": {
		//			"cpu": "17%",
		//			"memory": "58.32MB",
		//			"uptime": "2:32:11"
		//		},
		//		"data": []
		//	}
		//];
		//this.healthSignal.set(dummyResponse);
		this.healthMonitorService.getAllHeartbeats().subscribe({
			next: response => {
				let mappedResponse = Object.entries(response).map(([serviceId, details]) : ServiceHealthDetails => ({
					serviceId,
					...details
				}))
				this.healthSignal.set(mappedResponse);
			},
			error: e => {
				this.messageService.add({ 
					severity: 'error', 
					summary: 'Error', 
					detail: `Failed to load health statuses: ${e.error.message}`
				});
			}
		});
  }

	// ------------------------------------------------------------------------
  	
}
