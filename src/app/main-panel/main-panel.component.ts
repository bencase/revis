import { Component, OnInit, ViewChild } from '@angular/core';

import { TabProps } from '../objects';
import { TabbedViewComponent } from '../tabbed-view/tabbed-view.component';

@Component({
  selector: 'main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ["main-panel.component.scss"]
})
export class MainPanelComponent implements OnInit {

	@ViewChild(TabbedViewComponent) tabbedView: TabbedViewComponent;

	selectedConn: string;

	constructor() { }

	ngOnInit() {
	}

	selectedConnChanged(newSelectedConn: string): void {
		// TODO create a tab properties type
		let tabProps = new TabProps();
		this.tabbedView.addTab(newSelectedConn, tabProps);
	}

}
