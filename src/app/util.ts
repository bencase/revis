import { HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';

import { HttpResultContainer, ErrorResponse } from './dtos/responses';

const UNKNOWN_ERROR_MESSAGE = "Encountered an unknown error"


export function handleResponse<T extends HttpResultContainer>(ob$: Observable<HttpResponse<T>>,
		successFunc: (respObj?: T) => void,
		errorFunc: (errResp: ErrorResponse) => void): void {
	ob$.subscribe((response) => {
			handleResult(response, successFunc, errorFunc);
		}, (erro) => {
			handleResultWithBody(erro, successFunc, errorFunc);
		});
}
function handleResult<T extends HttpResultContainer>(response: HttpResponse<T>,
		successFunc: (respObj?: T) => void,
		errorFunc: (errResp: ErrorResponse) => void): void {
	let data = getNormalizedResponse<T>(response);
	handleResultWithBody(data, successFunc, errorFunc);
}
function handleResultWithBody<T extends HttpResultContainer>(data: T,
		successFunc: (respObj?: T) => void,
		errorFunc: (errResp: ErrorResponse) => void): void {
	if (data.error) {
		if (data.status === 0) {
			data.status = 599;
		}
		errorFunc(data.error);
	} else {
		if (data.status === 0) {
			data.status = 200;
		}
		successFunc(data);
	}
}
/**
 * This method goes through the following process:
 * 1) Checks if there is an error in the "error" property of the response body. If so,
 * returns the response body. 2) Checks if the status code is >= 300. If so, then it
 * means there was an error but no "error" property, so attaches a generic error to the
 * body and returns it. 3) If it made it this far, there's no error, so return the body
 * unaltered.
 * @param response 
 */
function getNormalizedResponse<T extends HttpResultContainer>(response: HttpResponse<T>): T {
	let body = response.body;
	body.status = response.status;
	body.headers = response.headers;
	if (body.error) {
		return body;
	}
	if (response.status >= 300) {
		let errorResp = new ErrorResponse()
		errorResp.message = UNKNOWN_ERROR_MESSAGE;
		body.error = errorResp;
		return body;
	}
	return body;
}


export interface CountsMap {
	[key: string]: number
}
export class CountHolder {
	private countsMap: CountsMap = {};
	public hasValue(val: string): boolean {
		let count = this.countsMap[val];
		if (!count) {
			return false;
		}
		if (count === 0) {
			return false;
		}
		return true;
	}
	public increment(val: string): void {
		if (this.hasValue(val)) {
			this.countsMap[val] = this.countsMap[val] + 1;
		} else {
			this.countsMap[val] = 1;
		}
	}
	public decrement(val: string): void {
		if (this.hasValue(val)) {
			this.countsMap[val] = this.countsMap[val] - 1;
		}
		// Do nothing if it doesn't have the value
	}
	public getCount(val: string): number {
		return this.countsMap[val];
	}
	public reset(val: string): void {
		this.countsMap[val] = 0;
	}
}