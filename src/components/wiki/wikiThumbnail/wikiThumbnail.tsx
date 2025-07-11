import IconQuestionMark from '~icons/material-symbols/question-mark-rounded';
import './wikiThumbnail.css';
import type { WikiThumbnail } from '@/composables/useWiki';
import type { ComponentProps } from 'react';

type WikiThumbnailProp = ComponentProps<"div"> & {
    thumbnail:WikiThumbnail|null
}

export function WikiThumbnail({ thumbnail, ...props }: WikiThumbnailProp) {
  if (thumbnail) {
    return (
      <div className="wiki-thumbnail" {...props}>
        <img src={thumbnail.source} width={thumbnail.width} height={thumbnail.height} alt="Wikipedia article thumbnail" />
      </div>
    );
  }

  return (
    <div className="wiki-thumbnail no-img" {...props}>
      <IconQuestionMark />
    </div>
  );
}

