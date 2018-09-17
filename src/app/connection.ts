import { HttpResultContainer } from './dtos/responses';

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
		if (this.name) {
			return this.name;
		}
		let displayName = this.host + ":" + this.port;
		if (this.db) {
			displayName = displayName + "[" + this.db + "]"
		}
		return displayName;
	}
}