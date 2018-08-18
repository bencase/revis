import { Component, OnInit } from '@angular/core';

import { TabProps } from '../objects';
import { CountHolder } from '../util';

@Component({
  selector: 'tabbed-view',
  templateUrl: './tabbed-view.component.html'
})
export class TabbedViewComponent implements OnInit {

	selectedTab: Tab;
	tabs: Tab[] = [];
	
	private counts: CountHolder = new CountHolder();

	constructor() { }

	ngOnInit() {
	}

	public addTab(tabName: string, tabProps: TabProps): void {
		let tab: Tab = null;
		tabProps.connName = tabName;
		if (!this.counts.hasValue(tabName)) {
			tab = new Tab(tabName, tabProps);
			this.tabs.push(tab);
			this.counts.increment(tabName);
		} else {
			this.counts.increment(tabName);
			let count = this.counts.getCount(tabName);
			let newTabName = tabName + " (" + count + ")";
			tab = new Tab(newTabName, tabProps)
			this.tabs.push(tab);
		}
		this.selectedTab = tab;
	}

	hasTabs(): boolean {
		if (!this.tabs) {
			return false;
		} else if (this.tabs.length === 0) {
			return false;
		}
		return true;
	}

	selectTab(tab: Tab): void {
		this.selectedTab = tab;
	}
}

class Tab {
	constructor(name: string, tabProps: TabProps) {
		this.name = name;
		this.tabProps = tabProps;
	}
	name: string;
	tabProps: TabProps;
}