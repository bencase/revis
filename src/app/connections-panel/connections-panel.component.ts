import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { Connection } from '../connection';
import { ConnectionsResponse, ErrorResponse } from '../dtos/responses';
import { RedisCmdService } from '../services/redis-cmd.service';
import { CountHolder, handleResponse } from '../util';

@Component({
  selector: 'connections-panel',
  templateUrl: './connections-panel.component.html',
  styleUrls: ['./connections-panel.component.scss']
})
export class ConnectionsPanelComponent implements OnInit {

	@Output() selectConnEmitter = new EventEmitter<string>();

	connections: Connection[] = [];

	propsModalIsOpen: boolean;

	private clickCounter: CountHolder = new CountHolder();
	private timeoutHolder = {};

	constructor(private redisCmdService : RedisCmdService) { }

	ngOnInit() {
		handleResponse<ConnectionsResponse>(this.redisCmdService.getConnections(),
			(connsResp: ConnectionsResponse) => {
				for (let respConn of connsResp.connections) {
					this.connections.push(Object.assign(new Connection(), respConn));
				}
			}, (errResp: ErrorResponse) => {
				console.log("Error getting connections list: " + errResp.message);
			});
	}

	/*
	Note: this method is used instead of Angular's dblclick feature because that
	feature is not responsive if you click fast enough.
	*/
	onConnDblClick(conn: Connection): void {
		let connName = conn.getDisplayName();
		this.clickCounter.increment(connName);
		if (this.clickCounter.getCount(connName) < 2) {
			let timeout = setTimeout(() => {
				this.clickCounter.reset(connName);
				delete this.timeoutHolder[connName];
			}, 400);
			this.timeoutHolder[connName] = timeout;
		} else {
			let timeout = this.timeoutHolder[connName];
			if (timeout) {
				clearTimeout(timeout);
				delete this.timeoutHolder[connName];
			}
			this.clickCounter.reset(connName);
			this.selectConn(conn);
		}
	}

	openConnPropertiesPanelForAdding(): void {
		console.log("conns: " + JSON.stringify(this.connections));
		this.propsModalIsOpen = true;
	}
	closeConnPropsModal = () => {
		if (this.propsModalIsOpen) {
			this.propsModalIsOpen = false;
		}
	}
	
	saveConn(conn: Connection): void {
		this.connections.push(conn);
	}

	selectConn(conn: Connection): void {
		this.selectConnEmitter.emit(conn.getDisplayName());
	}

}
