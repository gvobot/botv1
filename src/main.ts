import { ConfigInterface, CommandInterface, EventInterface, ObjectNameIDArray } from './types/index';
import { Client, Collection, GatewayIntentBits, Partials, ApplicationCommandDataResolvable, Events } from 'discord.js';
import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import { config } from './config.js';

import { fileURLToPath, pathToFileURL } from 'node:url';
import path, { dirname } from 'node:path';
import { readdirSync } from 'node:fs';

import logger from './helpers/logger.js';

import { PrismaClient } from '@prisma/client';
import { stat } from 'node:fs/promises';
const prisma = new PrismaClient();

export class DiscordClient extends Client {
    public commands: Collection<string, CommandInterface>;
    public subcommands: Collection<string, CommandInterface>;
    public cooldowns: Collection<string, Collection<string, number>>;
    public events: Collection<string, EventInterface>;
    public config: ConfigInterface;
    public cluster: ClusterClient<DiscordClient>;
    public db: typeof prisma;
    constructor() {
        super({
            shards: getInfo().SHARD_LIST,
            shardCount: getInfo().TOTAL_SHARDS,
            intents: [
                GatewayIntentBits.AutoModerationConfiguration,
                GatewayIntentBits.AutoModerationExecution,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.MessageContent,
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.GuildScheduledEvent,
                Partials.Message,
                Partials.Reaction,
                Partials.ThreadMember,
                Partials.User,
            ],
        });
        this.commands = new Collection();
        this.subcommands = new Collection();
        this.cooldowns = new Collection();
        this.events = new Collection();
        this.config = config;
        this.cluster = new ClusterClient(this);
        this.db = prisma;
    }
    public async loadClient() {
        try {
            this.cluster.on('ready', () => {
                this.loadCommands();
                this.loadEvents();
                this.ErrorLogging();
            });

            this.login(this.config.bot.token).catch(() => {
                logger.error(`You provided a invalid token! Please change your token in 'src/config.ts'`);
            });
        } catch (error) {
            logger.error(error);
        }
    }
    private async loadCommands() {
        let commandsArray: Array<ApplicationCommandDataResolvable> = [];
        let commandsDevArray: Array<ApplicationCommandDataResolvable> = [];

        const rootFolderPath = dirname(fileURLToPath(import.meta.url));
        const commandsFolderPath = path.join(rootFolderPath, 'commands');

        const processFolder = async (folderPath) => {
            try {
                const files = readdirSync(folderPath);
                await Promise.all(
                    files.map(async (file) => {
                        const filePath = path.join(folderPath, file);
                        const fileStat = await stat(filePath);
                        const isDirectory = fileStat.isDirectory();

                        if (isDirectory) {
                            await processFolder(filePath);
                        } else if (file.endsWith('.js')) {
                            const command: CommandInterface = (await import(`${pathToFileURL(filePath)}`)).default;

                            if (command.subCommand) return this.subcommands.set(command.subCommand, command);

                            this.commands.set(command.data.name, command);
                            if (file.endsWith('.dev.js')) {
                                commandsDevArray.push(command.data.toJSON());
                            } else {
                                commandsArray.push(command.data.toJSON());
                            }
                        }
                    }),
                );
            } catch (error) {
                // Handle any errors, if necessary
                console.error(`Error processing folder: ${folderPath}`, error);
            }
        };

        await processFolder(commandsFolderPath);
        this.on(Events.ClientReady, async () => {
            this.application?.commands.set(commandsArray);

            if (this.config.guilds)
                this.config.guilds.forEach(async (guild: ObjectNameIDArray) => {
                    await this.guilds.cache.get(guild.id)?.commands.set(commandsDevArray);
                });
        });
    }
    private async loadEvents() {
        await Promise.all(
            readdirSync(`${dirname(fileURLToPath(import.meta.url))}/events`).map(async (folder) => {
                await Promise.all(
                    readdirSync(`${dirname(fileURLToPath(import.meta.url))}/events/${folder}`)
                        .filter((file) => file.endsWith('.js'))
                        .map(async (file) => {
                            const event: EventInterface = (
                                await import(
                                    `${pathToFileURL(
                                        path.resolve(
                                            `${dirname(fileURLToPath(import.meta.url))}/events/${folder}/${file}`,
                                        ),
                                    )}`
                                )
                            ).default;

                            if (event.options?.once) {
                                this.once(event.name, (...args) => event.execute(...args, this));
                            } else {
                                this.on(event.name, (...args) => event.execute(...args, this));
                            }

                            this.events.set(event.name, event);
                        }),
                );
            }),
        );
    }
    private ErrorLogging() {
        // error handling for unhandled rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error(' [Error_Handling] :: Unhandled Rejection');
            console.error('Reason:', reason);
            console.error('Promise:', promise);
        });

        // error handling for uncaught exceptions
        process.on('uncaughtException', (err, origin) => {
            console.error(' [Error_Handling] :: Uncaught Exception');
            console.error('Error:', err);
            console.error('Origin:', origin);
            // It's recommended to gracefully shut down the process after an uncaught exception
            process.exit(1);
        });

        // error handling for uncaught exceptions with monitoring
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.error(' [Error_Handling] :: Uncaught Exception (MONITOR)');
            console.error('Error:', err);
            console.error('Origin:', origin);
            // It's recommended to gracefully shut down the process after an uncaught exception
            process.exit(1);
        });

        // error handling for multiple resolves (you can implement appropriate handling here)
        process.on('multipleResolves', (type, promise, reason) => {

        });
    }
}

new DiscordClient().loadClient();
