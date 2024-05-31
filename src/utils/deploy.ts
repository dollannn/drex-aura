import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as fs from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import type { ChatInputApplicationCommandData } from 'discord.js';
import consola from 'consola';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const commands: ChatInputApplicationCommandData[] = [];

async function loadCommands(dir: string): Promise<void> {
	const files = fs.readdirSync(dir);

	for (const file of files) {
		const filePath = join(dir, file);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			await loadCommands(filePath);
		} else if (file.endsWith('.ts')) {
			const { default: command } = await import(`file://${filePath}`);
			commands.push(command.data.toJSON());
		}
	}
}

async function refreshCommands() {
	consola.log('Started refreshing application (/) commands.');

	const commandsPath = join(__dirname, '..', 'commands');
	await loadCommands(commandsPath);

	for (const [index, command] of commands.entries()) {
		consola.log(`CMD [#${index + 1}]: ${command.name}`);
	}

	const rest = new REST({ version: '9' }).setToken(
		process.env.DISCORD_TOKEN as string
	);

	const args = process.argv.slice(2);
	const mode = args[0] ?? 'global';

	if (mode !== 'global' && mode !== 'guild') {
		consola.error('Invalid mode! Use "global" or "guild".');
		process.exit(1);
	}

	(async () => {
		try {
			const route =
				mode === 'global'
					? Routes.applicationCommands(process.env.CLIENT_ID as string)
					: Routes.applicationGuildCommands(
							process.env.CLIENT_ID as string,
							process.env.GUILD_ID as string
					  );

			await rest.put(route, { body: commands });

			consola.success(
				`Successfully reloaded ${mode} application (/) commands.`
			);
		} catch (error) {
			consola.error(error);
		}
	})();
}

export { refreshCommands };
