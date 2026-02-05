import type { Block } from 'payload'

import { createArticleRichTextEditor } from '@/lib/articleRichTextEditor'

export const IntroductionBlock: Block = {
  slug: 'introduction',
  labels: {
    singular: 'Introduction',
    plural: 'Introductions',
  },
  interfaceName: 'IntroductionBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Introduction',
      admin: {
        description: 'Short heading for this section.',
        placeholder: 'Introduction',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: createArticleRichTextEditor({
        placeholder: 'Introduction (2-3 short sentences).',
      }),
      admin: {
        description:
          'Keep this concise. Editors should summarize the recipe or story in plain language.',
      },
    },
  ],
}
