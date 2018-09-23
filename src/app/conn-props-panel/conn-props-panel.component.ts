import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

import { getDisplayName, Connection } from '../connection';
import { HttpResultContainer, ErrorResponse } from '../dtos/responses';
import { RedisCmdService } from '../services/redis-cmd.service';
import { handleResponse } from '../util';

@Component({
  selector: 'conn-props-panel',
  templateUrl: './conn-props-panel.component.html',
  styleUrls: ['./conn-props-panel.component.scss']
})
export class ConnPropsPanelComponent implements OnInit {

	@Input() name: string;
	@Input() host: string;
	@Input() port: string;
	@Input() usesPassword: boolean;
	@Input() password: string;
	@Input() db: number = 0;
	@Input() close: () => void = function(){console.log("default close function called")};

	@Output() connEmitter = new EventEmitter<Connection>();

	@ViewChild('firstInput') firstInput: ElementRef;

	errorMessage: string;
	otherMessage: string;
	hasPassedTest: boolean;
	isAwaitingResults: boolean;
	isAwaitingResultsTest: boolean;
	isAwaitingResultsSave: boolean;

	private originalName: string;

	constructor(private redisCmdService : RedisCmdService) { }

	ngOnInit() {
		if (this.host && this.port) {
			this.originalName = getDisplayName(this.name, this.host, this.port, this.db);
		}
		if (!this.host) {
			this.host = "localhost";
		}
		if (!this.port) {
			this.port = "6379";
		}
	}

	ngAfterViewInit() {
		this.firstInput.nativeElement.focus();
	}

	connFieldChanged(): void {
		this.hasPassedTest = false;
		this.otherMessage = null;
	}

	testConnection(): void {
		if (this.isAwaitingResults || this.hasPassedTest) {
			return;
		}

		this.clearMessages();

		let conn = new Connection();
		conn.name = this.name;
		conn.host = this.host;
		conn.port = this.port;
		if (this.usesPassword) {
			conn.password = this.password;
		}
		conn.db = this.db;

		this.hasPassedTest = false;
		this.isAwaitingResults = true;
		this.isAwaitingResultsTest = true;
		handleResponse<HttpResultContainer>(this.redisCmdService.testConnection(conn), () => {
			this.onSuccessfulTest();
		}, (errResp: ErrorResponse) => {
			this.onFailedTest(errResp.message);
		});

	}
	private onSuccessfulTest(): void {
		this.isAwaitingResults = false;
		this.isAwaitingResultsTest = false;
		this.isAwaitingResultsSave = false;
		this.hasPassedTest = true;
		this.otherMessage = "Connection Successful";
	}
	private onFailedTest(message: string): void {
		this.isAwaitingResults = false;
		this.isAwaitingResultsTest = false;
		this.isAwaitingResultsSave = false;
		this.errorMessage = "Connection Invalid";
	}

	saveConnection(): void {
		if (this.isAwaitingResults) {
			return;
		}

		this.clearMessages();

		let conn = new Connection();
		conn.name = this.name;
		conn.host = this.host;
		conn.port = this.port;
		if (this.usesPassword) {
			conn.password = this.password;
		}
		conn.db = this.db;

		this.isAwaitingResults = true;
		this.isAwaitingResultsSave = true;
		handleResponse<HttpResultContainer>(this.redisCmdService.testConnection(conn), () => {
			handleResponse<HttpResultContainer>(this.redisCmdService.upsertConnection(conn, this.originalName), () => {
				this.onSuccessfulSaveAttempt(conn);
			}, (errResp: ErrorResponse) => {
				this.onFailedSaveAttempt(errResp.message);
			});
		}, (errResp: ErrorResponse) => {
			this.onFailedTest(errResp.message);
		});
	}
	private onSuccessfulSaveAttempt(conn: Connection): void {
		this.isAwaitingResults = false;
		this.isAwaitingResultsTest = false;
		this.isAwaitingResultsSave = false;
		this.connEmitter.emit(conn);
		this.close();
	}
	private onFailedSaveAttempt(message: string): void {
		this.isAwaitingResults = false;
		this.isAwaitingResultsTest = false;
		this.isAwaitingResultsSave = false;
		this.errorMessage = message;
	}

	toggleUsesPassword(): void {
		this.usesPassword = !this.usesPassword;
	}

	private clearMessages(): void {
		this.errorMessage = null;
		this.otherMessage = null;
	}
}
