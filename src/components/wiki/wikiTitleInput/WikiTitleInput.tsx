import { useState, useRef } from 'react';
import { useDebouncedCallback } from '@react-hookz/web';
// import { WikiPreview } from '../wikiPreview/WikiPreview';
import './wikiTitleInput.css';
import { loadSuggestions, type WikiContentPreview } from '@/composables/useWiki';
import { WikiPreview } from '../wikiPreview/WikiPreview';
import type { LangCode } from '@/i18n/lang';
 
interface WikiTitleInputProps {
    wikiPreview: WikiContentPreview | null;
    setWikiPreview: (w:WikiContentPreview) => void,

    wikiLang: LangCode;
}

export function WikiTitleInput({ wikiPreview, setWikiPreview, wikiLang }: WikiTitleInputProps) {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<WikiContentPreview[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const debouncedLoadSuggestions = useDebouncedCallback(async () => {
        console.log("useDebouncedCallback change " + input);
        if (input) {
            const s = await loadSuggestions(input, wikiLang);
            if (s) {
                setSuggestions(s);
            }
        } else {
            setSuggestions([]);
        }
    }, [input], 250, 1000);

    function handleSelect(w: WikiContentPreview) {
        setWikiPreview(w);
        setInput(w.title ?? "");

        if (containerRef.current) {
            // Find all focusable elements in the document
            const focusableElements = Array.from(
                document.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])'
                )
            );

            // Find the last focusable element within this component
            const componentFocusableElements = Array.from(containerRef.current.querySelectorAll<HTMLElement>('[tabindex="0"], input'));
            const lastComponentElement = componentFocusableElements[componentFocusableElements.length - 1];

            if (lastComponentElement) {
                const lastIndex = focusableElements.indexOf(lastComponentElement);
                // Focus the next element in the document
                if (lastIndex > -1 && lastIndex + 1 < focusableElements.length) {
                    focusableElements[lastIndex + 1]?.focus();
                }
            }
        }
    }

    function handleSuggestionClick(w: WikiContentPreview) {
        handleSelect(w);
    }

    function handleSuggestionKeyPress(e: React.KeyboardEvent, w: WikiContentPreview) {
        if (e.key === 'Enter') {
            handleSelect(w);
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        console.log("handleInputChange " + e.target.value);
        setInput(e.target.value);
        debouncedLoadSuggestions();
    }

    function handleArrowNav(e: React.KeyboardEvent) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

        const container = containerRef.current;
        if (!container) return;

        // The input and all the suggestion items are focusable.
        const focusableItems = Array.from(
            container.querySelectorAll<HTMLElement>('input, .wiki-title-suggest [tabindex="0"]')
        );

        if (focusableItems.length <= 1) return; // No suggestions to navigate to

        const activeElement = document.activeElement as HTMLElement;
        const currentIndex = focusableItems.indexOf(activeElement);

        e.preventDefault(); // Prevent default scrolling or cursor movement

        let nextIndex = -1;

        if (e.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % focusableItems.length;
        } else if (e.key === 'ArrowUp') {
            nextIndex = (currentIndex - 1 + focusableItems.length) % focusableItems.length;
        }

        if (nextIndex !== -1) {
            focusableItems[nextIndex]?.focus();
        }
    }

    return (
        <div className="wiki-title-input" ref={containerRef} onKeyUp={handleArrowNav}>
            <input
                value={input}
                onChange={handleInputChange}
            />
            <div className="wiki-title-suggest">
                {suggestions.map((w) => (
                    <WikiPreview
                        key={w.id}
                        wikiContentPreview={w}
                        onClick={() => handleSuggestionClick(w)}
                        onKeyUp={(e:React.KeyboardEvent) => handleSuggestionKeyPress(e, w)}
                        // disableGotoWiki
                        accessKey="enter"
                        tabIndex={0} // Make it focusable
                    /> 
                ))}
            </div>
            <WikiPreview
                key={wikiPreview?.id}
                wikiContentPreview={wikiPreview}
                tabIndex={-1}
            />
        </div>
    );
}
