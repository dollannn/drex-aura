// Require the necessary discord.js classes
import {
	Client,
	GatewayIntentBits,
	Collection,
	Partials,
	SlashCommandBuilder,
	CommandInteraction,
} from 'discord.js';

import { eventHandler } from './handlers/event';
import { commandHandler } from './handlers/command';

// get env
import { config } from 'dotenv';
config();

export interface Command {
	data: SlashCommandBuilder;
	execute: (interaction: CommandInteraction) => Promise<void>;
}

export class ExtendedClient extends Client {
	commands: Collection<string, Command>;

	constructor(options: any) {
		super(options);
		this.commands = new Collection();
	}
}
const client = new ExtendedClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
	],
	partials: [Partials.Message, Partials.Channel, Partials.User],
});

export { client };

await eventHandler(client);
await commandHandler(client);

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
