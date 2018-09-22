import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { Connection } from '../connection';
import { ConnectionsResponse, ErrorResponse, HttpResultContainer } from '../dtos/responses';
import { RedisCmdService } from '../services/redis-cmd.service';
import { CountHolder, handleResponse } from '../util';

@Component({
  selector: 'connections-panel',
  templateUrl: './connections-panel.component.html',
  styleUrls: ['./connections-panel.component.scss']
})
export class ConnectionsPanelComponent implements OnInit {

	@Output() selectConnEmitter = new EventEmitter<string>();
	@Output() numOfConnectionsEmitter = new EventEmitter<number>();

	connections: Connection[] = [];

	propsModalIsOpen: boolean;

	connOpenedForEditing: Connection;
	connForWhichRemovalPending: Connection;

	private clickCounter: CountHolder = new CountHolder();
	private timeoutHolder = {};

	constructor(private redisCmdService : RedisCmdService) {}

	ngOnInit() {
		handleResponse<ConnectionsResponse>(this.redisCmdService.getConnections(),
			(connsResp: ConnectionsResponse) => {
				for (let respConn of connsResp.connections) {
					this.connections.push(Object.assign(new Connection(), respConn));
				}
				this.numOfConnectionsEmitter.emit(this.connections.length);
			}, (errResp: ErrorResponse) => {
				console.log("Error getting connections list: " + errResp.message);
				this.numOfConnectionsEmitter.emit(this.connections.length);
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
		this.propsModalIsOpen = false;
		this.connOpenedForEditing = null;
	}
	setConnAsOpenForEditing(conn: Connection): void {
		this.connOpenedForEditing = conn;
	}

	saveConn(conn: Connection): void {
		this.connections.push(conn);
		this.numOfConnectionsEmitter.emit(this.connections.length);
		this.selectConn(conn);
	}
	
	updateConn(conn: Connection): void {
		let indexToReplace: number;
		let foundConnection = false;
		for (let i = 0; i < this.connections.length; i++) {
			let oldConn = this.connections[i];
			if (oldConn === this.connOpenedForEditing) {
				foundConnection = true;
				indexToReplace = i;
				break;
			}
		}
		if (foundConnection) {
			this.connections[indexToReplace] = conn;
		} else {
			console.log("Could not find connection to replace");
		}
	}
	connUsesPassword(conn: Connection): boolean {
		if (conn.password) {
			return true;
		}
		return false;
	}

	openRemoveConnModal(conn: Connection): void {
		this.connForWhichRemovalPending = conn;
	}
	closeRemoveConnModal = () => {
		this.connForWhichRemovalPending = null;
	}
	removeConn(i: number): void {
		let conn = this.connections[i];
		handleResponse<HttpResultContainer>(this.redisCmdService.removeConnection(conn.getDisplayName()),
			(resp: HttpResultContainer) => {
				this.connections.splice(i, 1);
				this.closeRemoveConnModal();
				this.numOfConnectionsEmitter.emit(this.connections.length);
			}, (errResp: ErrorResponse) => {
				console.log("Error removing connection " + conn.getDisplayName() + ": " + errResp.message);
				this.closeRemoveConnModal();
			});
	}

	selectConn(conn: Connection): void {
		this.selectConnEmitter.emit(conn.getDisplayName());
	}

}
