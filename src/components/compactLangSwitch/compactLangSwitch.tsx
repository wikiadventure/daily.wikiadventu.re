import "./compactLangSwitch.css";
import React, { useRef } from "react";
import IconTranslate from "~icons/material-symbols/translate-rounded";
import { langs, type LangCode } from "../../i18n/lang";

interface CompactLangSwitchProps {
  url: URL;
}

const CompactLangSwitch: React.FC<CompactLangSwitchProps> = ({ url }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const locale = url.pathname.split("/").at(1) as LangCode;

  function getUrlForLangCode(l:LangCode) {
    return url.pathname.split("/").with(1,l).join("/");
  }

  const langEntries = Object.entries(langs) as [LangCode, string][];

  const aRefs = useRef<HTMLAnchorElement[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    const currentIndex = aRefs.current.findIndex(
      (el) => el === document.activeElement
    );

    if (event.key === 'ArrowDown') {
      const nextIndex = (currentIndex + 1) % aRefs.current.length;
      aRefs.current[nextIndex]?.focus();
    } else if (event.key === 'ArrowUp') {
      const prevIndex =
        (currentIndex - 1 + aRefs.current.length) %
        aRefs.current.length;
      aRefs.current[prevIndex]?.focus();
    }
  };

  return (
    <button tabIndex={0} className="compact-lang-switch"
          onClick={() => dialogRef.current?.showModal()}
          onKeyDown={(event) => {if (event.key === "Enter") dialogRef.current?.showModal();}}
    >
      <IconTranslate /> {locale}
      <dialog ref={dialogRef} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div>
          <label>
            <IconTranslate /> {langs[locale]}
          </label>
          {langEntries.map(([k, v], index) => (
            <a key={k} rel="alternate" tabIndex={0}
              ref={(el) => {if (el) {
                  aRefs.current[index] = el;
              }}}
              {...(locale == k ? { "data-current-lang": true } : {})}
              hrefLang={k}
              href={getUrlForLangCode(k)}
            >
              {v}
            </a>
          ))}
        </div>
      </dialog>
    </button>
  );
};

export default CompactLangSwitch;