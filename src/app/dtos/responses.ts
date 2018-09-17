import { HttpHeaders } from '@angular/common/http';

import { Connection } from '../connection';

import { Header, KeyType } from '../config/config';

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
	public compactDisplayStr: string;

	public isOpen: boolean;

	public getCompactValueDisplay(): string {
		if (this.compactDisplayStr) {
			return this.compactDisplayStr;
		}
		this.resetCompactValueDisplay();
		return this.compactDisplayStr;
	}
	public resetCompactValueDisplay(): void {
		switch (this.type) {
		case "" : this.compactDisplayStr = this.val as string;
			break;
		case KeyType.List : this.compactDisplayStr = getListOrSetAsString(this.val as string[]);
			break;
		case KeyType.Set : this.compactDisplayStr = getListOrSetAsString(this.val as string[]);
			break;
		case KeyType.Zset : this.compactDisplayStr = getZsetAsString(this.val as ZsetVal[]);
			break;
		case KeyType.Hash : this.compactDisplayStr = getHashAsString(this.val as HashVal[]);
			break;
		default : this.compactDisplayStr = this.val.toString();
			break;
		}
	}

	public getTypeForDisplay(): string {
		if (!this.type) {
			return "STRING";
		}
		return this.type.toUpperCase();
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
	return result.headers.get(Header.ScanId);
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