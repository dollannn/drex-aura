import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Collection } from 'discord.js';
import type { Command } from '../index';
import { ExtendedClient } from '../index';

async function commandHandler(client: ExtendedClient): Promise<void> {
	client.commands = new Collection<string, Command>();

	// Get the current file's directory name
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	const commandsPath = path.join(__dirname, '..', 'commands');

	const loadCommands = async (dir: string) => {
		const commandFiles = fs
			.readdirSync(dir)
			.filter(
				(file) =>
					file.endsWith('.ts') ||
					fs.statSync(path.join(dir, file)).isDirectory()
			);

		for (const file of commandFiles) {
			const filePath = path.join(dir, file);
			if (fs.statSync(filePath).isDirectory()) {
				// Check if a file with the same name as the directory exists
				const sameNameFile = path.join(filePath, `${file}.ts`);
				if (fs.existsSync(sameNameFile)) {
					const { default: command } = await import(`file://${sameNameFile}`);

					if ('data' in command && 'execute' in command) {
						client.commands.set(command.data.name, command);
					} else {
						console.log(
							`[WARNING] The command at ${sameNameFile} is missing a required "data" or "execute" property.`
						);
					}
				} else {
					await loadCommands(filePath);
				}
			} else {
				const { default: command } = await import(`file://${filePath}`);

				if ('data' in command && 'execute' in command) {
					client.commands.set(command.data.name, command);
				} else {
					console.log(
						`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
					);
				}
			}
		}
	};

	await loadCommands(commandsPath);
	console.log(`Loaded ${client.commands.size} commands.`);
}

export { commandHandler };
