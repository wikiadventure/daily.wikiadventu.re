import type { LangCode } from "@/i18n/lang";


interface DeepStringRecord {
    [key: string]: string | DeepStringRecord;
}

export type TranslationForLang = DeepStringRecord;

export type Translations<Of extends TranslationForLang> = Record<LangCode, Of>;


export function useTranslations<Trans extends Translations<TranslationForLang>>(lang: LangCode, translations: Trans, fallbackLang: LangCode = "en") {
    // Helper function to resolve nested keys using dot notation
    function resolveKey(obj: any, key: string): string | undefined {
        return key.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    // TypeScript utility to infer all possible keys that lead to a string
    type NestedKeys<T> = {
        [K in keyof T & string]: T[K] extends string
            ? `${K}`
            : T[K] extends Record<string, any>
            ? `${K}.${NestedKeys<T[K]>}`
            : never;
    }[keyof T & string];

    function t<K extends NestedKeys<Trans[LangCode]>>(key: K): string {
        const value = resolveKey(translations[lang], key);
        if (value && typeof value === "string" && value.trim() !== "") {
            return value;
        }
        const fallbackValue = resolveKey(translations[fallbackLang], key);
        return fallbackValue && typeof fallbackValue === "string" ? fallbackValue : "";
    }

    return {
        t,
    };
}

