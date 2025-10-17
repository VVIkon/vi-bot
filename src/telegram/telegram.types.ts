import { Context } from 'telegraf';

export interface SessionData {
	messageCount: number;
	lastActivity: Date;
}

export interface BotContext extends Context {
	session?: SessionData;
}

export type TelegramMessage = {
	message_id: number;
	from?: {
		id: number;
		is_bot: boolean;
		first_name: string;
		last_name?: string;
		username?: string;
		language_code?: string;
	};
	date: number;
	chat: {
		id: number;
		first_name?: string;
		last_name?: string;
		username?: string;
		type: string;
	};
	text?: string;
};
