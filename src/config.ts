import { ConfigInterface } from './types/index';
import { ColorResolvable } from 'discord.js';
import 'dotenv/config';

export const config: ConfigInterface = {
    bot: {
        token: `${process.env.DISCORD_TOKEN}`,
        invite: 'https://gvobot.app/invite',
        discord: 'https://gvobot.app/discord',
    },
    links: {
        website: 'https://gvobot.app/',
        kofi: 'https://gvobot.app/kofi',
        github: 'https://gvobot.app/github',
        blog: 'https://gvobot.app/blog',
    },
    guilds: [
        { name: "Good Vibes Only - Test Server", id: '1113542893840367687' },
        { name: 'Good Vibes Only', id: '1126979648249659422' },
    ],
    colors: {
        theme: '#fee300' as ColorResolvable,
        green: '#00E09E' as ColorResolvable,
        red: '#FF434E' as ColorResolvable,
    },
    emojis: {
        success: '😊',
        error: '😥',
    },
};
