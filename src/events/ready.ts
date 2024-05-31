import { Events } from 'discord.js';
import chalk from 'chalk';
import { ExtendedClient } from '../index';
import { consola } from 'consola';

const event = {
	name: Events.ClientReady,
	once: true,
	async execute(client: ExtendedClient) {
		const shardId = client.shard?.ids[0] as number;
		consola.log(chalk.green(`Ready! Logged in as ${client?.user?.tag}`));

		client?.user?.setPresence({
			status: 'invisible',
		});
	},
};

export default event;
