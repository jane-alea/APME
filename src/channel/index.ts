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
}

export interface ServerTransferEventMap {
  "change-request": [client: Client, changeNumber: number, change: Change];
  connection: [client: Client];
  disconnection: [client: Client];
}
export interface Change {}

export interface Client {
  username: string;
}
