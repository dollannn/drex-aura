import { Events, VoiceChannel, VoiceState } from 'discord.js';
import {
	joinVoiceChannel,
	getVoiceConnection,
	createAudioPlayer,
	createAudioResource,
	VoiceConnectionStatus,
} from '@discordjs/voice';
import { join } from 'node:path';
import { dirname } from 'path';
import { consola } from 'consola';
import { fileURLToPath } from 'url';

const user_id_to_track = '215186659585556481';

const event = {
	name: Events.VoiceStateUpdate,
	async execute(oldState: VoiceState, newState: VoiceState) {
		const userid = newState.member?.user.id;

		if (userid !== user_id_to_track) return;
		// Join the channel if the user joins and leave if the user leaves
		if (newState.channelId) {
			const channel = newState.channel as VoiceChannel;
			const guild = newState.guild;
			// If the userid is null then return
			if (newState.member?.user.id == null) {
				return;
			}

			const connection = joinVoiceChannel({
				channelId: channel.id,
				guildId: guild.id,
				adapterCreator: guild.voiceAdapterCreator,
			});
			if (!connection) {
				consola.error('Failed to join the voice channel');
				return;
			}

			const player = createAudioPlayer();

			const __filename = fileURLToPath(import.meta.url);
			const __dirname = dirname(__filename);

			const audioFilePath = join(__dirname, '../../static/cinema_dun.mp3');
			const resource = createAudioResource(audioFilePath, {
				inlineVolume: true,
			});
			resource.volume?.setVolume(0.1);
			const subscription = connection.subscribe(player);
			if (subscription) {
				player.play(resource);
				// Unsubscribe after 5 seconds (stop playing audio on the voice connection)
				setTimeout(() => {
					if (subscription) {
						subscription.unsubscribe();
					}
					if (connection.state.status === VoiceConnectionStatus.Destroyed) {
						connection.destroy();
					}
				}, 7_000);
			}
		} else {
			const user_id = newState.member?.user.id;
			const guild_id = newState.guild.id;
			consola.log(`User ${newState.member?.user.username} left voice channel`);
			if (user_id == null) {
				consola.error('Failed to get the member id for oldState');
				return;
			}
			// Leave the channel if the user leaves
			const connection = getVoiceConnection(guild_id);
			if (connection) {
				connection.destroy();
			}
		}
	},
};

export default event;
