import { Update, Ctx, Start, Help, On, Hears, Command, InjectBot, Action } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { Injectable, Logger } from '@nestjs/common';

// Интерфейс для сессии
interface SessionData {
	messageCount: number;
	lastActivity: Date;
}

// Расширяем стандартный Context
interface BotContext extends Context {
	session?: SessionData;
}

@Update()
@Injectable()
export class TelegramUpdate {
	private readonly logger = new Logger(TelegramUpdate.name);

	constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

	@Start()
	async startCommand(@Ctx() ctx: BotContext) {
		// Инициализация сессии
		ctx.session = {
			messageCount: 0,
			lastActivity: new Date(),
		};

		const welcomeText = `🤖 Добро пожаловать, ${ctx.from?.first_name || 'пользователь'}!

Я VVIkonBot, Привет

Доступные команды:
/start - начать работу
/help - помощь
/profile - информация о вас
/keyboard - показать клавиатуру
/stats - статистика сессии
/echo [текст] - повторить текст
/inline - инлайн кнопки`;

		await ctx.reply(welcomeText);
		this.logger.log(`User ${ctx.from?.id} started the bot`);
	}

	@Help()
	async helpCommand(@Ctx() ctx: BotContext) {
		const helpText = `📋 Помощь по командам:

/profile - получить информацию о вашем профиле
/stats - статистика вашей сессии
/echo [текст] - повторяет ваш текст
/keyboard - показывает интерактивную клавиатуру
/inline - показывает инлайн кнопки

Для связи с разработчиком используйте команду /feedback`;

		await ctx.reply(helpText);
	}

	@Command('profile')
	async profileCommand(@Ctx() ctx: BotContext) {
		const user = ctx.from;

		if (!user) {
			await ctx.reply('Не удалось получить информацию о пользователе');
			return;
		}

		const profileText = `👤 Информация о профиле:

ID: ${user.id}
Имя: ${user.first_name}
Фамилия: ${user.last_name || 'Не указана'}
Username: ${user.username ? `@${user.username}` : 'Не указан'}
Язык: ${user.language_code || 'Не указан'}`;

		await ctx.reply(profileText);
	}

	@Command('stats')
	async statsCommand(@Ctx() ctx: BotContext) {
		if (!ctx.session) {
			ctx.session = { messageCount: 0, lastActivity: new Date() };
		}

		const statsText = `📊 Статистика сессии:

Сообщений в этой сессии: ${ctx.session.messageCount}
Последняя активность: ${ctx.session.lastActivity.toLocaleString('ru-RU')}
Длительность сессии: ${Math.floor((new Date().getTime() - ctx.session.lastActivity.getTime()) / 1000)} сек.`;

		await ctx.reply(statsText);
	}

	@Command('echo')
	async echoCommand(@Ctx() ctx: BotContext) {
		const text = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ').slice(1).join(' ') : '';

		if (!text) {
			await ctx.reply('Пожалуйста, укажите текст после команды: /echo ваш текст');
			return;
		}

		await ctx.reply(`🔁 Вы сказали: "${text}"`);
	}

	@Command('keyboard')
	async keyboardCommand(@Ctx() ctx: BotContext) {
		const keyboard = {
			reply_markup: {
				keyboard: [
					[{ text: '📊 Статистика' }, { text: '👤 Профиль' }],
					[{ text: '🔄 Обновить' }, { text: '❓ Помощь' }],
					[{ text: '📅 Дата и время' }],
				],
				resize_keyboard: true,
				one_time_keyboard: false,
			},
		};

		await ctx.reply('Выберите действие:', keyboard);
	}

	@Command('inline')
	async inlineCommand(@Ctx() ctx: BotContext) {
		const keyboard = {
			reply_markup: {
				inline_keyboard: [
					[
						{ text: 'GitHub', url: 'https://github.com' },
						{ text: 'NestJS Docs', url: 'https://docs.nestjs.com' },
					],
					[
						{ text: '✅ Подтвердить', callback_data: 'confirm' },
						{ text: '❌ Отменить', callback_data: 'cancel' },
					],
					[{ text: '📊 Получить статистику', callback_data: 'get_stats' }],
				],
			},
		};

		await ctx.reply('Выберите действие:', keyboard);
	}

	@Hears('📊 Статистика')
	async hearsStats(@Ctx() ctx: BotContext) {
		await this.statsCommand(ctx);
	}

	@Hears('👤 Профиль')
	async hearsProfile(@Ctx() ctx: BotContext) {
		await this.profileCommand(ctx);
	}

	@Hears('📅 Дата и время')
	async hearsDateTime(@Ctx() ctx: BotContext) {
		const now = new Date();
		await ctx.reply(`🕒 Текущее время: ${now.toLocaleString('ru-RU')}`);
	}

	@Hears('🔄 Обновить')
	async hearsRefresh(@Ctx() ctx: BotContext) {
		await ctx.reply('♻️ Сессия обновлена!');
	}

	@Action('confirm')
	async confirmAction(@Ctx() ctx: BotContext) {
		await ctx.answerCbQuery();
		await ctx.editMessageText('✅ Действие подтверждено!');
	}

	@Action('cancel')
	async cancelAction(@Ctx() ctx: BotContext) {
		await ctx.answerCbQuery();
		await ctx.editMessageText('❌ Действие отменено!');
	}

	@Action('get_stats')
	async getStatsAction(@Ctx() ctx: BotContext) {
		await ctx.answerCbQuery();

		if (ctx.session) {
			const stats = `📈 Ваша статистика:
Сообщений: ${ctx.session.messageCount}
Активен с: ${ctx.session.lastActivity.toLocaleTimeString('ru-RU')}`;

			await ctx.editMessageText(stats);
		} else {
			await ctx.editMessageText('Статистика недоступна. Начните новую сессию.');
		}
	}

	@On('text')
	async onText(@Ctx() ctx: BotContext) {
		// Обновляем статистику сессии
		if (ctx.session) {
			ctx.session.messageCount = (ctx.session.messageCount || 0) + 1;
			ctx.session.lastActivity = new Date();
		} else {
			ctx.session = {
				messageCount: 1,
				lastActivity: new Date(),
			};
		}

		this.logger.log(
			`Received text message from ${ctx.from?.id}: ${ctx.message && 'text' in ctx.message ? ctx.message.text : 'unknown'}`,
		);
	}

	@On('message')
	async onMessage(@Ctx() ctx: BotContext) {
		if (ctx.message && 'text' in ctx.message) {
			return; // Текстовые сообщения обрабатываются в onText
		}

		await ctx.reply('✅ Сообщение получено! Пока я лучше понимаю текстовые сообщения 😊');
	}
}
