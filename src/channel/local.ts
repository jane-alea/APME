import { APMEEventEmitter } from "../utils";
import type {
  Change,
  Client,
  ClientSideTransferChannel,
  ClientTransferEventMap,
  ServerSideTransferChannel,
  ServerTransferEventMap,
} from "./index";

export function localChannel(): [LocalServerEnd, LocalClientEnd] {
  const server = new LocalServerEnd();
  const client = new LocalClientEnd();

  server.client = client;
  client.server = server;

  return [server, client];
}

export class LocalServerEnd implements ServerSideTransferChannel {
  // @ts-ignore
  ee: APMEEventEmitter<ServerTransferEventMap>;
  client!: LocalClientEnd;

  constructor() {
    this.ee = new APMEEventEmitter();
  }

  on<K extends keyof ServerTransferEventMap>(
    event: K,
    callback: (...args: ServerTransferEventMap[K]) => void,
  ): void {
    this.ee.on(event, callback);
  }

  acceptChange(_client: Client, number: number): void {
    this.client.ee.trigger("accepted", [number]);
  }

  sendMergeConflict(
    _client: Client,
    lastApproved: number,
    changeset: Change[],
  ): void {
    this.client.ee.trigger("merge-conflict", [lastApproved, changeset]);
  }

  sendThirdPartyChange(_client: Client, number: number, change: Change): void {
    this.client.ee.trigger("received-change", [number, change]);
  }

  kick(_client: Client): void {
    this.client.ee.trigger("disconnected", []);
  }
}

export class LocalClientEnd implements ClientSideTransferChannel {
  // @ts-ignore
  ee: APMEEventEmitter<ClientTransferEventMap>;
  server!: LocalServerEnd;

  constructor() {
    this.ee = new APMEEventEmitter();
  }

  on<K extends keyof ClientTransferEventMap>(
    event: K,
    callback: (...args: ClientTransferEventMap[K]) => void,
  ): void {
    this.ee.on(event, callback);
  }

  sendChange(number: number, change: Change): void {
    this.server.ee.trigger("change-request", [
      { username: "You" },
      number,
      change,
    ]);
  }
}
