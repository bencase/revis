import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Connection } from '../connection';
import { HttpResultContainer, ErrorResponse } from '../dtos/responses';
import { RedisCmdService } from '../services/redis-cmd.service';
import { handleResponse } from '../util';

@Component({
  selector: 'conn-props-panel',
  templateUrl: './conn-props-panel.component.html'
})
export class ConnPropsPanelComponent implements OnInit {

	@Input() name: string;
	@Input() host: string = "localhost";
	@Input() port: string = "6379";
	@Input() usesPassword: boolean;
	@Input() password: string;
	@Input() close: () => void = function(){console.log("default close function called")};

	@Output() connEmitter = new EventEmitter<Connection>();

	errorMessage: string;

	constructor(private redisCmdService : RedisCmdService) { }

	ngOnInit() {
	}

	/*
	saveConnection(): void {
		this.clearErrorMessage();

		let conn = new Connection();
		conn.name = this.name;
		conn.host = this.host;
		conn.port = this.port;
		if (this.usesPassword) {
			conn.password = this.password;
		}

		let connsList = [conn];
		this.redisCmdService.upsertConnections(connsList).subscribe((response) => {
			this.handleResult(response, conn);
		}, (erro) => {
			this.handleResultWithBody(erro, conn);
		});
	}
	private handleResult(response: HttpResponse<ErrorContainer>, conn: Connection): void {
		let data = getNormalizedResponse<ErrorContainer>(response);
		this.handleResultWithBody(data, conn);
	}
	private handleResultWithBody(data: ErrorContainer, conn: Connection): void {
		if (data.error) {
			this.onFailedSaveAttempt(data.error.message);
		} else {
			this.onSuccessfulSaveAttempt(conn);
		}
	}
	private onFailedSaveAttempt(message: string): void {
		this.errorMessage = message;
	}
	private onSuccessfulSaveAttempt(conn: Connection): void {
		this.saveConn.emit(conn);
		this.close();
	}
	*/
	saveConnection(): void {
		this.clearErrorMessage();

		let conn = new Connection();
		conn.name = this.name;
		conn.host = this.host;
		conn.port = this.port;
		if (this.usesPassword) {
			conn.password = this.password;
		}

		let connsList = [conn];
		handleResponse<HttpResultContainer>(this.redisCmdService.upsertConnections(connsList), () => {
			this.onSuccessfulSaveAttempt(conn);
		}, (errResp: ErrorResponse) => {
			this.onFailedSaveAttempt(errResp.message);
		});
	}
	private onFailedSaveAttempt(message: string): void {
		this.errorMessage = message;
	}
	private onSuccessfulSaveAttempt(conn: Connection): void {
		this.connEmitter.emit(conn);
		this.close();
	}

	private clearErrorMessage(): void {
		this.errorMessage = null;
	}
}
