import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { Connection } from '../connection';
import { ConnectionsResponse, ErrorResponse } from '../dtos/responses';
import { RedisCmdService } from '../services/redis-cmd.service';
import { handleResponse } from '../util';

@Component({
  selector: 'connections-panel',
  templateUrl: './connections-panel.component.html',
  styleUrls: ['./connections-panel.component.scss']
})
export class ConnectionsPanelComponent implements OnInit {

	@Output() selectConnEmitter = new EventEmitter<string>();

	connections: Connection[] = [];

	propsModalIsOpen: boolean;

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
