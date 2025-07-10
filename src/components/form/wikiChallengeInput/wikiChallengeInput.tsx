import { WikiTitleInput } from "@/components/wiki/wikiTitleInput/WikiTitleInput";
import { useGameFormStore, type GameFormState } from "@/composables/gameForm";
import { useShallow } from 'zustand/react/shallow';
import "./wikiChallengeInput.css";

export function WikiStartPageInput() {
    const { wikiLang, startPage, setStartPage } = useGameFormStore(
        useShallow((state) => ({
            wikiLang: state.wikiLang,
            startPage: state.startPage,
            setStartPage: state.setStartPage,
        } satisfies Partial<GameFormState>)),   
    );
    
    return (
        <WikiTitleInput wikiPreview={startPage} setWikiPreview={setStartPage} wikiLang={wikiLang} />
    );
}

export function WikiEndPageInput() {
    const { wikiLang, endPage, setEndPage } = useGameFormStore(
        useShallow((state) => ({
            wikiLang: state.wikiLang,
            endPage: state.endPage,
            setEndPage: state.setEndPage,
        } satisfies Partial<GameFormState>)),   
    );
    
    return (
        <WikiTitleInput wikiPreview={endPage} setWikiPreview={setEndPage} wikiLang={wikiLang} />
    );
}

export function WikiChallengeInput() {
    return (
    <section className="wiki-challenge-input">
        <WikiStartPageInput />
        <div className="arrow">→</div>
        <WikiEndPageInput />
    </section>
    );
}