import { Component, OnInit, ViewChild } from '@angular/core';

import { TabbedViewComponent } from '../tabbed-view/tabbed-view.component';

@Component({
  selector: 'main-panel',
  templateUrl: './main-panel.component.html'
})
export class MainPanelComponent implements OnInit {

	@ViewChild(TabbedViewComponent) tabbedView: TabbedViewComponent;

	selectedConn: string;

	constructor() { }

	ngOnInit() {
	}

	selectedConnChanged(newSelectedConn: string): void {
		// TODO create a tab properties type
		let tabProps: Object = {};
		this.tabbedView.addTab(newSelectedConn, tabProps);
	}

}
