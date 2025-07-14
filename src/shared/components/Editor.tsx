import '@blocknote/core/fonts/inter.css';
import '@blocknote/shadcn/style.css';

import { BlockNoteEditor, filterSuggestionItems } from '@blocknote/core';
import { ko } from '@blocknote/core/locales';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  FormattingToolbar,
  FormattingToolbarController,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from '@blocknote/react';
import { DefaultReactSuggestionItem } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import { useCallback, useEffect } from 'react';

import {
  // markdownContent,
  parseMarkdownToBlocks,
} from '@/shared/lib/parseMarkdownToBlocks';

type SuggestionItem = DefaultReactSuggestionItem & {
  key: (typeof SELECTED_SLASH_MENU_ITEMS)[number];
};

const SELECTED_SLASH_MENU_ITEMS = [
  'heading',
  'heading_2',
  'heading_3',
  'quote',
  'numbered_list',
  'bullet_list',
  'check_list',
  'paragraph',
  'emoji',
  'code_block',
] as const;

const getCustomSlashMenuItems = (
  editor: BlockNoteEditor
): DefaultReactSuggestionItem[] => {
  const defaultItems = getDefaultReactSlashMenuItems(editor);
  return defaultItems.filter((item) =>
    SELECTED_SLASH_MENU_ITEMS.includes((item as SuggestionItem).key)
  );
};

export function Editor({
  content,
  setMarkdown,
}: {
  content: string | undefined;
  setMarkdown: (markdown: string) => void;
}) {
  const locale = ko;

  // const [_markdown, setMarkdown] = useState<string>('');

  const editor = useCreateBlockNote({
    dictionary: {
      ...locale, // i18n 한국어 설정
      placeholders: {
        ...locale.placeholders,
        emptyDocument: '내용을 입력하거나 /로 명령을 입력해주세요',
      },
    },
    initialContent: parseMarkdownToBlocks(content ?? ``),
  });

  const onChange = useCallback(async () => {
    // Block object를 마크다운으로 변환 후 state로 저장
    const markdownOutput = await editor.blocksToMarkdownLossy(editor.document);
    setMarkdown(markdownOutput);
    // console.log(markdownOutput); // markdown 결과물 확인용
  }, [editor, setMarkdown]);

  useEffect(() => {
    if (editor.document) {
      onChange();
    }
  }, [editor.document, onChange]);

  return (
    <BlockNoteView
      aria-labelledby="content-label"
      editor={editor}
      formattingToolbar={false}
      slashMenu={false}
      sideMenu={false}
      onChange={onChange}
      className="h-full min-h-0 flex-1 overflow-auto text-sm leading-tight font-medium [&_.bn-editor]:!bg-neutral-100 [&_.bn-editor]:!px-0 [&_.bn-editor]:!text-neutral-400 [&.bn-container]:rounded-lg [&.bn-container]:bg-neutral-100 [&.bn-container]:p-3"
    >
      <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar>
            <BlockTypeSelect key={'blockTypeSelect'} />
            <BasicTextStyleButton
              basicTextStyle={'bold'}
              key={'boldStyleButton'}
            />
            <BasicTextStyleButton
              basicTextStyle={'italic'}
              key={'italicStyleButton'}
            />
            <BasicTextStyleButton
              basicTextStyle={'strike'}
              key={'strikeStyleButton'}
            />
            <BasicTextStyleButton
              key={'codeStyleButton'}
              basicTextStyle={'code'}
            />
            <CreateLinkButton key={'createLinkButton'} />
          </FormattingToolbar>
        )}
      />
      <SuggestionMenuController
        triggerCharacter={'/'}
        // Slash Menu item 편집
        getItems={async (query) =>
          filterSuggestionItems(getCustomSlashMenuItems(editor), query)
        }
      />
    </BlockNoteView>
  );
}
