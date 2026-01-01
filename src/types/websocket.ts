export interface WsMessage<T = unknown> {
  event: string;
  data: T;
}

export type MessageSchema = {
  toUserId: number;
  message: string;
};
