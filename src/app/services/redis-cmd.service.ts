import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, throwError, timer } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { ElectronService } from 'ngx-electron';

import { ConnUpsert, RemoveConnectionRequest, UpsertConnectionsRequest } from '../dtos/requests';
import { DeleteResponse, HttpResultContainer, KeysResponse } from '../dtos/responses';
import { Connection, ConnectionsContainer } from '../connection';
import { Header } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class RedisCmdService {

	private readonly HOSTNAME = "http://localhost:";
	private readonly REDIS_SERVICE = "/api/redis";

	private hasInitialized = false;

	private port = "63799";

	constructor(private httpClient: HttpClient, private elecService: ElectronService) {
		if (this.elecService.ipcRenderer) {
			this.elecService.ipcRenderer.on("port", (event, arg) => {
				this.port = arg;
				console.log("Set port to " + this.port);
				this.hasInitialized = true;
			});
		}
	}

	private getPathPrefix(): string {
		return this.HOSTNAME + this.port + this.REDIS_SERVICE;
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

	public upsertConnection(connection: Connection, replace: string): Observable<HttpResponse<HttpResultContainer>> {
		let upsertReq = new UpsertConnectionsRequest();
		let connUpsert = new ConnUpsert();
		connUpsert.newConn = connection;
		if (replace) {
			connUpsert.oldConnName = replace;
		}
		upsertReq.connections = [connUpsert];
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

	public testConnection(conn: Connection): Observable<HttpResponse<HttpResultContainer>> {
		return this.httpClient.post<HttpResultContainer>(this.getPathPrefix() + "/connections/test", conn, {observe: "response"})
			.pipe(catchError(this.handleError));
	}

	public getInitialKeysWithValues(connName: string, pattern: string): Observable<HttpResponse<KeysResponse>> {
		let headers = {};
		headers[Header.ConnName] = connName;
		headers[Header.Pattern] = pattern;
		headers[Header.ScanId] = "0";
		return this.httpClient.get<KeysResponse>(this.getPathPrefix() + "/kvs",
				{observe: "response", headers: headers})
			.pipe(catchError(this.handleError));
	}
	public getMoreKeysWithValues(scanId: string): Observable<HttpResponse<KeysResponse>> {
		let headers = {};
		headers[Header.ConnName] = "";
		headers[Header.Pattern] = "";
		headers[Header.ScanId] = scanId;
		return this.httpClient.get<KeysResponse>(this.getPathPrefix() + "/kvs",
				{observe: "response", headers: headers})
			.pipe(catchError(this.handleError));
	}
	private handleError(err: HttpErrorResponse): Observable<never> {
		return throwError(err.error);
	}

	public deleteKeysWithPattern(connName: string, pattern: string): Observable<HttpResponse<DeleteResponse>> {
		let headers = {};
		headers[Header.ConnName] = connName;
		headers[Header.Pattern] = pattern;
		return this.httpClient.delete<DeleteResponse>(this.getPathPrefix() + "/keys",
				{observe: "response", headers: headers})
			.pipe(catchError(this.handleError));
	}
}
