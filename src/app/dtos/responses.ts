import { HttpHeaders } from '@angular/common/http';

import { Connection } from '../connection';

import { KeyType } from '../config/config';

const SCAN_ID_HEADER = "scanId";

export class HttpResultContainer {
	public error: ErrorResponse;
	public status: number;
	public headers: HttpHeaders;
}
export class KeysResponse extends HttpResultContainer {
	public keys: Key[];
}
export class Key {
	public key: string;
	public val: string|string[]|ZsetVal[]|HashVal[];
	public type: string;

	public getCompactValueDisplay(): string {
		switch (this.type) {
		case "" : return this.val as string;
		case KeyType.List : return getListOrSetAsString(this.val as string[]);
		case KeyType.Set : return getListOrSetAsString(this.val as string[]);
		case KeyType.Zset : return getZsetAsString(this.val as ZsetVal[]);
		case KeyType.Hash : return getHashAsString(this.val as HashVal[]);
		default : return this.val.toString();
		}
	}
}
export class ZsetVal {
	public zval: string;
	public score: number;
}
export class HashVal {
	public hkey: string;
	public hval: string;
}
export class ConnectionsResponse extends HttpResultContainer {
	public connections: Connection[];
}
export class ErrorResponse {
	public message: string;
}

export function getScanId(result: HttpResultContainer) {
	return result.headers.get(SCAN_ID_HEADER);
}

function getListOrSetAsString(list: string[]): string {
	let builderArray: string[] = [];
	let isFirstItem = true;
	list.forEach((str: string) => {
		if (!isFirstItem) {
			builderArray.push(", ");
		}
		builderArray.push(str);
		isFirstItem = false;
	});
	return builderArray.join("");
}

function getZsetAsString(zset: ZsetVal[]): string {
	let builderArray: string[] = [];
	let isFirstItem = true;
	zset.forEach((zsetVal: ZsetVal) => {
		if (!isFirstItem) {
			builderArray.push(", ");
		}
		console.log(JSON.stringify(zsetVal));
		builderArray.push(zsetVal.zval);
		builderArray.push(": ");
		builderArray.push(zsetVal.score.toString());
		isFirstItem = false;
	});
	return builderArray.join("");
}

function getHashAsString(hash: HashVal[]): string {
	let builderArray: string[] = [];
	let isFirstItem = true;
	hash.forEach((hashVal: HashVal) => {
		if (!isFirstItem) {
			builderArray.push(", ");
		}
		builderArray.push(hashVal.hkey);
		builderArray.push(": ");
		builderArray.push(hashVal.hval);
		isFirstItem = false;
	});
	return builderArray.join("");
}