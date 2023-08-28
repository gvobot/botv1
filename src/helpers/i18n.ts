import i18next from 'i18next';
import backend from 'i18next-node-fs-backend';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define the languages supported
export const supportedLanguages = [
    'af_ZA', // Afrikaans
    'ar_SA', // Arabic
    'ca_ES', // Catalan
    'zh_CN', // Chinese Simplified
    'zh_TW', // Chinese Traditional
    'cs_CZ', // Czech
    'da_DK', // Danish
    'nl_NL', // Dutch
    'en_US', // English, United States
    'fi_FI', // Finnish
    'fr_FR', // French
    'de_DE', // German
    'el_GR', // Greek
    'he_IL', // Hebrew
    'hu_HU', // Hungarian
    'it_IT', // Italian
    'ja_JP', // Japanese
    'no_NO', // Norwegian
    'pl_PL', // Polish
    'pt_PT', // Portuguese
    'pt_BR', // Portuguese, Brazilian
    'ro_RO', // Romanian
    'ru_RU', // Russian
    'sr_SP', // Serbian (Cyrillic)
    'es_ES', // Spanish
    'sv_SE', // Swedish
    'tr_TR', // Turkish
    'uk_UA', // Ukrainian
    'vi_VN', // Vietnamese
];

// Initialize i18next
i18next.use(backend).init({
    lng: 'en_US', // Default language
    fallbackLng: 'en_US', // Fallback language
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
