import { promises as fs } from 'fs';
import path from 'path';
import type { ExtendedClient } from '../index';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Required for ES2020 to get the correct __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function eventHandler(client: ExtendedClient) {
	const eventsPath = path.join(__dirname, '../events');

	try {
		const eventFiles = (await fs.readdir(eventsPath)).filter((file) =>
			file.endsWith('.ts')
		);

		for (const file of eventFiles) {
			const filePath = path.join(eventsPath, file);
			const eventModule = await import(`file://${filePath}`);
			const event = eventModule.default;

			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args));
			} else {
				client.on(event.name, (...args) => event.execute(...args));
			}
		}
	} catch (error) {
		console.error('Error loading events:', error);
	}
}

export { eventHandler };
