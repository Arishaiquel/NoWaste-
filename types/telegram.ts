export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    data?: string;
    from: TelegramUser;
    message?: TelegramMessage;
  };
}

export interface TelegramUser { id: number; username?: string; first_name?: string }
export interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  from?: TelegramUser;
  text?: string;
  photo?: Array<{ file_id: string; file_size?: number; width: number; height: number }>;
}
