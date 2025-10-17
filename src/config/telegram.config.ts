import { registerAs } from '@nestjs/config';

export default registerAs('telegram', () => ({
	token: process.env.BOT_TOKEN,
	webhookDomain: process.env.BOT_WEBHOOK_DOMAIN,
	webhookPath: process.env.BOT_WEBHOOK_PATH || '/webhook',
}));
