import { DiscordClient } from '../../main.js';
import { CommandInterface } from '../../types/index';
import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getGuilds, getUsers } from '../../helpers/discord.js';
import { t } from '../../helpers/i18n.js';

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setNSFW(false)
        .setDescription('Get information about our bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const Embed = new EmbedBuilder()
            .setAuthor({
                name: t('help.author', { bot_username: client.user?.username }),
                iconURL: client.user?.displayAvatarURL(),
            })
            .setColor(client.config.colors.theme)
            .addFields(
                {
                    name: t('help.field1.name'),
                    value: t('help.field1.value', { bot_username: client.user?.username }),
                },
                {
                    name: t('help.field2.name'),
                    value: t('help.field2.value', {
                        guildCount: await getGuilds(client),
                        userCount: await getUsers(client),
                    }),
                },
                {
                    name: t('help.field3.name'),
                    value: t('help.field3.value', {
                        inviteLink: client.config.bot.invite,
                        discordLink: client.config.bot.discord,
                        kofiLink: client.config.links.kofi,
                    }),
                },
            );

        interaction.reply({ embeds: [Embed] });
    },
};
export default command;
