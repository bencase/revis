import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, throwError, timer } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { ElectronService } from 'ngx-electron';

import { KeysRequest, RemoveConnectionRequest } from '../dtos/requests';
import { HttpResultContainer, KeysResponse } from '../dtos/responses';
import { Connection, ConnectionsContainer } from '../connection';

@Injectable({
  providedIn: 'root'
})
export class RedisCmdService {

	private readonly HOSTNAME = "http://localhost:";
	private readonly REDIS_SERVICE = "/api/redis";

	private readonly CONN_NAME_HEADER = "connName";
	private readonly PATTERN_HEADER = "pattern";
	private readonly SCAN_ID_HEADER = "scanId";

	private hasInitialized = false;

	private port = "63799";

	constructor(private httpClient: HttpClient, private elecService: ElectronService) {
		this.elecService.ipcRenderer.on("port", (event, arg) => {
			this.port = arg;
			console.log("Set port to " + this.port);
			this.hasInitialized = true;
		});
	}

	private getPathPrefix(): string {
		return this.HOSTNAME + this.port + this.REDIS_SERVICE;
	}

	public getKeys(pattern: string): Observable<KeysResponse> {
		let keysReq = new KeysRequest();
		keysReq.matchStr = pattern;
		return this.httpClient.post<KeysResponse>(this.getPathPrefix() + "/keys", keysReq);
	}

	public getConnections(): Observable<HttpResponse<ConnectionsContainer>> {
		// Note: if not yet initialized, a delay is added in so that there is time for
		// the port to be set via the window event.
		if (this.hasInitialized) {
			return this.getConnectionsReady();
		} else {
			return timer(500).pipe<HttpResponse<ConnectionsContainer>>(mergeMap(() => {
				this.hasInitialized = true;
				return this.getConnectionsReady();
			}));
		}
	}
	private getConnectionsReady(): Observable<HttpResponse<ConnectionsContainer>> {
		return this.httpClient.get<ConnectionsContainer>(this.getPathPrefix() + "/connections", {observe: "response"})
			.pipe(catchError(this.handleError));
	}

	public upsertConnections(connections: Connection[]): Observable<HttpResponse<HttpResultContainer>> {
		let upsertReq = new ConnectionsContainer();
		upsertReq.connections = connections;
		return this.httpClient.post<HttpResultContainer>(this.getPathPrefix() + "/connections", upsertReq, {observe: "response"})
			.pipe(catchError(this.handleError));
	}

	public removeConnection(connName: string): Observable<HttpResponse<HttpResultContainer>> {
		let removeConnReq = new RemoveConnectionRequest();
		removeConnReq.connectionNames = [connName];
		// Note: the below method is used instead of HttpClient.delete since this allows for both a body and observe: "response"
		return this.httpClient.request<HttpResultContainer>("DELETE", this.getPathPrefix() + "/connections",
				{observe: "response", body: removeConnReq})
			.pipe(catchError(this.handleError));
	}

	public getInitialKeysWithValues(connName: string, pattern: string): Observable<HttpResponse<KeysResponse>> {
		let headers = {};
		headers[this.CONN_NAME_HEADER] = connName;
		headers[this.PATTERN_HEADER] = pattern;
		headers[this.SCAN_ID_HEADER] = "0";
		return this.httpClient.get<KeysResponse>(this.getPathPrefix() + "/kvs",
				{observe: "response", headers: headers})
			.pipe(catchError(this.handleError));
	}
	public getMoreKeysWithValues(scanId: string): Observable<HttpResponse<KeysResponse>> {
		let headers = {};
		headers[this.CONN_NAME_HEADER] = "";
		headers[this.PATTERN_HEADER] = "";
		headers[this.SCAN_ID_HEADER] = scanId;
		return this.httpClient.get<KeysResponse>(this.getPathPrefix() + "/kvs",
				{observe: "response", headers: headers})
			.pipe(catchError(this.handleError));
	}
	private handleError(err: HttpErrorResponse): Observable<never> {
		return throwError(err.error);
	}
}
