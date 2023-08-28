import { DiscordClient } from '../../main.js';
import { EventInterface } from '../../types/index.js';
import { Events } from 'discord.js';
import { loadLanguage } from '../../helpers/i18n.js';

const event: EventInterface = {
    name: Events.ClientReady,
    options: { once: true, rest: false },
    execute: async (client: DiscordClient) => {
        console.log(`Logged in as ${client.user?.username}`);

        for (const [guildId, guild] of client.guilds.cache) {
            try {
                await loadLanguage(guildId);
                console.log(`Loaded language for guild ${guild.name}`);
            } catch (error) {
                console.error(`Failed to load language for guild ${guild.name}: ${error}`);
            }
        }
    },
};
export default event;
