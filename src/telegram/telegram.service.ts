import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';

@Injectable()
export class TelegramService {
	private readonly logger = new Logger(TelegramService.name);

	constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

	async sendMessage(chatId: string | number, text: string) {
		try {
			return await this.bot.telegram.sendMessage(chatId, text);
		} catch (error) {
			this.logger.error(`Failed to send message: ${error}`);
			throw error;
		}
	}

	async sendPhoto(chatId: string | number, photoUrl: string, caption?: string) {
		try {
			return await this.bot.telegram.sendPhoto(chatId, photoUrl, {
				caption,
			});
		} catch (error) {
			this.logger.error(`Failed to send photo: ${error}`);
			throw error;
		}
	}

	async getUserProfilePhotos(userId: number) {
		try {
			return await this.bot.telegram.getUserProfilePhotos(userId);
		} catch (error) {
			this.logger.error(`Failed to get user photos: ${error}`);
			throw error;
		}
	}
}
