import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive} from '@angular/router';

// import { tuiAsPortal } from '@taiga-ui/cdk';
// import { TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiDropdownService, TuiLink, TuiTextfield } from '@taiga-ui/core';
// import { TuiBreadcrumbs, TuiFade, TuiTabs } from '@taiga-ui/kit';
// import { TuiNavigation } from '@taiga-ui/layout';

import { AppRoutes } from '../../app.routes';

@Component({
	selector: 'app-admin-dashboard',
	imports: [
		FormsModule,
		RouterLink,
		// RouterLinkActive,
		// TuiAppearance,
		// TuiBreadcrumbs,
		// TuiButton,
		// TuiDataList,
		// TuiDropdown,
		// TuiFade,
		// TuiLink,
		// TuiNavigation,
		// TuiTabs,
		// TuiTextfield
	],
	templateUrl:'./admin-dashboard.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	// providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export class AdminDashboard {
	routes = AppRoutes;
 	protected expanded = signal(false);
	protected readonly breadcrumbs = ['Home', 'Admin', 'Dashboard'];

	constructor() { }

	protected handleToggle(): void {
		this.expanded.update((e) => !e);
	}
}
