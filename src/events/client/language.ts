import { DiscordClient } from '../../main.js';
import { EventInterface } from '../../types/index';
import { Events, ChatInputCommandInteraction } from 'discord.js';

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { once: false, rest: false },
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const { guildId } = interaction;
        if (!guildId) return;

        const guildSettings = await client.db.guild.findUnique({ where: { id: `${guildId}` } });
        if (!guildSettings) {
            await client.db.guild.upsert({
                where: { id: `${guildId}` },
                create: { id: `${guildId}`, language: 'en' },
                update: { language: 'en' },
            });
        }
    },
};
export default event;
