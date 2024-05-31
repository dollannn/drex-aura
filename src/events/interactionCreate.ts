import { Events, Interaction } from 'discord.js';
import type { ExtendedClient } from '../index';
import { consola } from 'consola';

export default {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}

		const NODE_ENV = process.env.NODE_ENV;

		const client = interaction.client as ExtendedClient;
		if (interaction.inGuild() === false) {
			await interaction.reply({
				content: 'Detta kommand kan endast användas i en server.',
				ephemeral: true,
			});
			return;
		}
		if (NODE_ENV !== 'production') {
			consola.log(
				`[${interaction.guild?.name}]-[${interaction.member?.user.username}]: ${interaction}`
			);
		}

		const commandName = interaction.commandName;
		const command = client.commands.get(commandName);

		if (!command) {
			interaction.reply({
				content: 'Detta kommandot finns inte.',
				ephemeral: true,
			});
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			consola.error(error);
			await interaction.reply({
				content: 'Det gick inte att utföra detta kommando.',
				ephemeral: true,
			});
		}
	},
};
