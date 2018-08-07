import { Component, Input, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';

import { RedisCmdService } from '../services/redis-cmd.service';
import { ErrorResponse, HashVal, Key, KeysResponse, ZsetVal, getScanId } from '../dtos/responses';
import { handleResponse } from '../util';
import { KeyType } from '../config/config';

@Component({
  selector: 'redis-content',
  templateUrl: './redis-content.component.html'
})
export class RedisContentComponent implements OnInit {

	private readonly KEYS_PER_PAGE = 50;

	@Input() connName: string;
	@Input() props: Object;

	currentPage = 1;
	pattern: string;

	keys: Key[] = [];

	constructor(private redisCmdService : RedisCmdService) { }

	ngOnInit(): void {
		this.getKeysMatchingPattern("*");
	}

	getKeysMatchingPattern(inputPattern: string): void {
		let patternToUse = inputPattern;
		if (!patternToUse || patternToUse === "") {
			patternToUse = "*";
		}
		let httpResp$ = this.redisCmdService.getInitialKeysWithValues(this.connName, patternToUse);
		this.getKeysFromObs(httpResp$);
	}
	getMoreKeysFromScanId(scanId: string): void {
		let httpResp$ = this.redisCmdService.getMoreKeysWithValues(scanId);
		this.getKeysFromObs(httpResp$);
	}
	private getKeysFromObs(httpResp$: Observable<HttpResponse<KeysResponse>>): void {
		handleResponse<KeysResponse>(httpResp$,
			(keysResp: KeysResponse) => {
				for (let key of keysResp.keys) {
					this.keys.push(this.getPreparedKey(key));
				}
				if (keysResp.status === 202) {
					this.getMoreKeysFromScanId(getScanId(keysResp));
				}
			}, (errResp: ErrorResponse) => {
				console.log("Error getting keys: " + errResp.message);
			});
	}
	private getPreparedKey(key: Key): Key {
		if (key.type === KeyType.Zset) {
			let zsetVals: ZsetVal[] = [];
			for (let sourceVal of key.val) {
				zsetVals.push(Object.assign(new ZsetVal(), sourceVal));
			}
			key.val = zsetVals;
		} else if (key.type === KeyType.Hash) {
			let hashKvs: HashVal[] = [];
			for (let sourceVal of key.val) {
				hashKvs.push(Object.assign(new HashVal(), sourceVal));
			}
			key.val = hashKvs;
		}
		return Object.assign(new Key(), key);
	}

	getKeysOnCurrentPage(): Key[] {
		let startIndex = (this.currentPage - 1) * 50;
		if (startIndex >= this.keys.length) {
			return [];
		}
		let endIndex = startIndex + this.KEYS_PER_PAGE;
		if (endIndex >= this.keys.length) {
			endIndex = this.keys.length;
		}
		return this.keys.slice(startIndex, endIndex);
	}

	getTypeTextColor(key: Key): string {
		if (!key.type) {
			return "blue";
		}
		switch (key.type) {
		case "" : return "blue";
		case KeyType.List : return "purple";
		case KeyType.Set : return "#ff8000"; // redish-orange
		case KeyType.Zset : return "green";
		case KeyType.Hash : return "red";
		default : return "maroon";
		}
	}
}
