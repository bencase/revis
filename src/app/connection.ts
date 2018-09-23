import { HttpResultContainer } from './dtos/responses';

export function getDisplayName(name: string, host: string, port: string, db: number): string {
	if (name) {
		return name;
	}
	let displayName = host + ":" + port;
	if (db) {
		displayName = displayName + "[" + db + "]"
	}
	return displayName;
}
export class ConnectionsContainer extends HttpResultContainer {
	public connections: Connection[];
}
export class Connection {
	public name: string;
	public host: string;
	public port: string;
	public password: string;
	public db: number;

	public getDisplayName(): string {
		return getDisplayName(this.name, this.host, this.port, this.db);
	}
}