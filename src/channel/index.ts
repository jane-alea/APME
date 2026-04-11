export interface ClientTransferEventMap {
  "merge-conflict": [lastApproved: number, changeset: Change[]];
  accepted: [key: number];
  "received-change": [changeNumber: number, change: Change];
  disconnected: [];
}

export interface ClientSideTransferChannel {
  on<K extends keyof ClientTransferEventMap>(
    event: K,
    callback: (...args: ClientTransferEventMap[K]) => void,
  ): void;

  sendChange(number: number, change: Change): void;
}

export interface ServerTransferEventMap {
  "change-request": [client: Client, changeNumber: number, change: Change];
  connection: [client: Client];
  disconnection: [client: Client];
}

export interface ServerSideTransferChannel {
  on<K extends keyof ServerTransferEventMap>(
    event: K,
    callback: (...args: ServerTransferEventMap[K]) => void,
  ): void;

  acceptChange(client: Client, number: number): void;
  sendMergeConflict(
    client: Client,
    lastApproved: number,
    changeset: Change[],
  ): void;
  sendThirdPartyChange(client: Client, number: number, change: Change): void;
  kick(client: Client): void;
}

export interface Change {}

export interface Client {
  username: string;
}
