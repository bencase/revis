import { Connection } from '../connection';

export class KeysRequest {
	public connName: string;
	public matchStr: string;
	public limit: number;
}

export class UpsertConnectionsRequest {
	public connections: ConnUpsert[];
}
export class ConnUpsert {
	public oldConnName: string;
	public newConn: Connection;
}

export class RemoveConnectionRequest {
	public connectionNames: string[];
}