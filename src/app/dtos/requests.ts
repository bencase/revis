export class KeysRequest {
	public connName: string;
	public matchStr: string;
	public limit: number;
}

export class RemoveConnectionRequest {
	public connectionNames: string[];
}