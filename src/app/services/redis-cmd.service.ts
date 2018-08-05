import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';

import { Observable, Observer, throwError } from 'rxjs';
import { catchError, filter, flatMap } from 'rxjs/operators';

import { KeysRequest } from '../dtos/requests';
import { ErrorResponse, HttpResultContainer, KeysResponse } from '../dtos/responses';
import { Connection, ConnectionsContainer } from '../connection';
import { handleResponse } from '../util';

@Injectable({
  providedIn: 'root'
})
export class RedisCmdService {

	private readonly HOSTNAME = "http://localhost:8080";
	private readonly REDIS_SERVICE = "/api/redis";

	private readonly CONN_NAME_HEADER = "connName";
	private readonly PATTERN_HEADER = "pattern";
	private readonly SCAN_ID_HEADER = "scanId";

	constructor(private httpClient: HttpClient) { }

	public getKeys(pattern: string): Observable<KeysResponse> {
		let keysReq = new KeysRequest();
		keysReq.matchStr = pattern;
		//return this.httpClient.post<KeysResponse>(this.HOSTNAME + this.REDIS_SERVICE + "/keys", keysReq, {headers: this.HEADERS});
		return this.httpClient.post<KeysResponse>(this.HOSTNAME + this.REDIS_SERVICE + "/keys", keysReq);
	}

	public getConnections(): Observable<HttpResponse<ConnectionsContainer>> {
		return this.httpClient.get<ConnectionsContainer>(this.HOSTNAME + this.REDIS_SERVICE + "/connections", {observe: "response"})
			.pipe(catchError(this.handleError));
	}

	public upsertConnections(connections: Connection[]): Observable<HttpResponse<HttpResultContainer>> {
		let upsertReq = new ConnectionsContainer();
		upsertReq.connections = connections;
		return this.httpClient.post<HttpResultContainer>(this.HOSTNAME + this.REDIS_SERVICE + "/connections", upsertReq, {observe: "response"})
			.pipe(catchError(this.handleError));
	}

	public getInitialKeysWithValues(connName: string, pattern: string): Observable<HttpResponse<KeysResponse>> {
		/*
		let headers = new HttpHeaders();
		headers.set(this.CONN_NAME_HEADER, connName);
		headers.set(this.PATTERN_HEADER, pattern);
		*/
		let headers = {};
		headers[this.CONN_NAME_HEADER] = connName;
		headers[this.PATTERN_HEADER] = pattern;
		headers[this.SCAN_ID_HEADER] = "0";
		return this.httpClient.get<KeysResponse>(this.HOSTNAME + this.REDIS_SERVICE + "/kvs",
				{observe: "response", headers: headers})
			.pipe(catchError(this.handleError));
	}
	public getMoreKeysWithValues(scanId: string): Observable<HttpResponse<KeysResponse>> {
		/*
		let headers = new HttpHeaders();
		headers.set(this.CONN_NAME_HEADER, connName);
		headers.set(this.PATTERN_HEADER, pattern);
		*/
		let headers = {};
		headers[this.CONN_NAME_HEADER] = "";
		headers[this.PATTERN_HEADER] = "";
		console.log("scanId: " + scanId);
		//headers[this.SCAN_ID_HEADER] = "0";
		headers[this.SCAN_ID_HEADER] = scanId;
		return this.httpClient.get<KeysResponse>(this.HOSTNAME + this.REDIS_SERVICE + "/kvs",
				{observe: "response", headers: headers})
			.pipe(catchError(this.handleError));
	}
/*
	public getMoreKeysWithValues(scanId: string): Observable<HttpResponse<KeysResponse>> {
		//let headers = new HttpHeaders();
		//headers.set(this.SCAN_ID_HEADER, scanId);
		let headers = {};
		headers[this.SCAN_ID_HEADER] = scanId;
		return this.httpClient.get<KeysResponse>(this.HOSTNAME + this.REDIS_SERVICE + "/kvs",
				{observe: "response", headers: headers})
			.pipe(catchError(this.handleError));
	}
*/
	private handleError(err: HttpErrorResponse): Observable<never> {
		return throwError(err.error);
	}
}
