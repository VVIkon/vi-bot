import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { Markup } from 'telegraf';

@Injectable()
export class InlineService {
	constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

	async sendInlineKeyboard(chatId: number, text: string) {
		const keyboard = Markup.inlineKeyboard([
			[
				Markup.button.callback('✅ Подтвердить', 'confirm_action'),
				Markup.button.callback('❌ Отменить', 'cancel_action'),
			],
			[
				Markup.button.url('📖 Документация', 'https://docs.nestjs.com'),
				Markup.button.callback('🔄 Обновить', 'refresh_data'),
			],
			[
				Markup.button.callback('📊 Статистика', 'show_stats'),
				Markup.button.callback('⚙️ Настройки', 'show_settings'),
			],
		]);

		await this.bot.telegram.sendMessage(chatId, text, keyboard);
	}

	async sendPaginatedKeyboard(chatId: number) {
		const keyboard = Markup.inlineKeyboard([
			[Markup.button.callback('Страница 1', 'page_1'), Markup.button.callback('Страница 2', 'page_2')],
			[Markup.button.callback('Далее →', 'next_page')],
		]);

		await this.bot.telegram.sendMessage(chatId, 'Выберите страницу:', keyboard);
	}
}
