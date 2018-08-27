import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import { TabProps } from '../objects';
import { CountHolder } from '../util';

@Component({
  selector: 'tabbed-view',
  templateUrl: './tabbed-view.component.html',
  styleUrls: ['./tabbed-view.component.scss'],
  host: {'(scroll)': 'handleScroll($event)'}
})
export class TabbedViewComponent implements OnInit {

	private readonly scrollAmount = 80;

	@ViewChild('hScrollElem') hScrollElem: ElementRef;

	selectedTab: Tab;
	tabs: Tab[] = [];
	
	private counts: CountHolder = new CountHolder();

	constructor() { }

	ngOnInit() {
	}

	ngAfterViewInit() {
		this.hScrollElem.nativeElement.addEventListener("mousewheel", (e) => {
			if (e.wheelDelta < 0) {
				this.hScrollElem.nativeElement.scrollLeft -= this.scrollAmount;
				console.log("right");
			} else {
				this.hScrollElem.nativeElement.scrollLeft += this.scrollAmount;
				console.log("left");
			}
			e.stopPropagation();
			e.preventDefault();
			e.returnValue = false;
		}, false);
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

	//@HostListener('scroll', ['$event'])
	handleScroll($event): void {
		console.log("blah");
		console.log(JSON.stringify($event));
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