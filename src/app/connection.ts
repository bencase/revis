import { HttpResultContainer } from './dtos/responses';

export class ConnectionsContainer extends HttpResultContainer {
	public connections: Connection[];
}
export class Connection {
	public name: string;
	public host: string;
	public port: string;
	public password: string;

	public getDisplayName(): string {
		if (this.name) {
			return this.name;
		}
		return this.host + ":" + this.port;
	}
}