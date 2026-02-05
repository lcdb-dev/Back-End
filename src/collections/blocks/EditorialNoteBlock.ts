import type { Block } from 'payload';

import { createArticleRichTextEditor } from '@/lib/articleRichTextEditor';

export const EditorialNoteBlock: Block = {
  slug: 'editorialNote',
  labels: {
    singular: 'Note / Personal Comment',
    plural: 'Notes / Personal Comments',
  },
  interfaceName: 'EditorialNoteBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Notes',
      admin: {
        description: 'Short label for this note block.',
        placeholder: 'Notes',
      },
    },
    {
      name: 'tone',
      type: 'select',
      required: true,
      defaultValue: 'note',
      options: [
        { label: 'Note', value: 'note' },
        { label: 'Tip', value: 'tip' },
        { label: 'Variation', value: 'variation' },
      ],
      admin: {
        description: 'Classifies this note for editors.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: createArticleRichTextEditor({
        placeholder: 'Add a quote, note, or personal comment.',
      }),
      admin: {
        description: 'Use this for highlighted notes and personal comments.',
      },
    },
  ],
};
