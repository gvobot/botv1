import i18next from 'i18next';
import backend from 'i18next-node-fs-backend';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define the languages supported
export const supportedLanguages = [
    'bg', // Bulgarian
    'cs', // Czech
    'da', // Danish
    'de', // German
    'el', // Greek
    'en-GB', // English, UK
    'en-US', // English, US
    'es-ES', // Spanish
    'fi', // Finnish
    'fr', // French
    'hi', // Hindi
    'hr', // Croatian
    'hu', // Hungarian
    'id', // Indonesian
    'it', // Italian
    'ja', // Japanese
    'ko', // Korean
    'lt', // Lithuanian
    'nl', // Dutch
    'no', // Norwegian
    'pl', // Polish
    'pt-BR', // Portuguese, Brazilian
    'ro', // Romanian, Romania
    'ru', // Russian
    'sv-SE', // Swedish
    'th', // Thai
    'tr', // Turkish
    'uk', // Ukrainian
    'vi', // Vietnamese
    'zh-CN', // Chinese, China
    'zh-TW', // Chinese, Taiwan
];

// Initialize i18next
i18next.use(backend).init({
    lng: 'en-US', // Default language
    fallbackLng: 'en-US', // Fallback language
    preload: supportedLanguages, // Preload available languages
    ns: ['common'], // Namespace for translation files (create 'common.json' for each language)
    backend: {
        loadPath: 'locales/{{lng}}/{{ns}}.json', // Path to translation files
    },
});

// Helper function to check if a language is supported
export function isLanguageSupported(lng: string): boolean {
    return supportedLanguages.includes(lng);
}

// Helper function to load resources for a specific language
export async function loadLanguage(guildId: string): Promise<void> {
    let guildSettings: any;

    try {
        guildSettings = await prisma.guild.findUnique({
            where: { id: guildId },
        });
    } catch (err) {
        throw new Error('Failed to fetch guild settings.');
    }

    const lng = guildSettings?.language || 'en';

    if (!isLanguageSupported(lng)) {
        throw new Error(`Language '${lng}' is not supported.`);
    }

    await i18next.changeLanguage(lng);
}

// Function to handle translations
export function t(key: string, options: Record<string, unknown> = {}): string {
    const translation = i18next.t(key, options);
    const missingKeys = translation.match(/\{\w+\}/g);

    if (missingKeys && missingKeys.length > 0) {
        throw new Error(`Missing parameters in translation '${key}': ${missingKeys.join(', ')}`);
    }

    return translation;
}
