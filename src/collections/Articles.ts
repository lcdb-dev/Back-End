import type { CollectionConfig } from 'payload';

import { EditorialNoteBlock } from './blocks/EditorialNoteBlock';
import { ImageGalleryBlock } from './blocks/ImageGalleryBlock';
import { IntroductionBlock } from './blocks/IntroductionBlock';
import { RecipeCardBlock } from './blocks/RecipeCardBlock';
import { validateArticlePublicationChecklist } from './hooks/articlePublicationChecklist';

import { createArticleRichTextEditor } from '@/lib/articleRichTextEditor';
import { dispatchPayloadWebhook } from '@/lib/payloadWebhook';

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    preview: (doc, { token }) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : null;
      if (!slug) {
        return null;
      }

      const basePreviewPath = `/preview/article/${encodeURIComponent(slug)}`;
      if (!token) {
        return basePreviewPath;
      }

      const params = new URLSearchParams({ previewToken: token });
      return `${basePreviewPath}?${params.toString()}`;
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [validateArticlePublicationChecklist],
    afterChange: [
      async ({ doc, operation }) => {
        console.log('[articles] webhook triggered', {
          operation,
          docId: doc?.id,
          slug: doc?.slug,
        });

        await dispatchPayloadWebhook({
          collection: 'articles',
          operation,
          id: doc?.id,
          slug: doc?.slug,
        });
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Main editor-facing article title.',
        placeholder: 'Creamy coffee cream',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used in the article URL.',
        placeholder: 'creamy-coffee-cream',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Short Excerpt',
              admin: {
                description: 'Introduction for cards/list pages. Keep this to 2-3 sentences.',
                placeholder: 'A silky, coffee-forward cream for desserts and cakes.',
              },
            },
            {
              name: 'contentV2',
              type: 'richText',
              label: 'Content (Rich Text)',
              editor: createArticleRichTextEditor({
                placeholder: 'Write article content visually (no HTML).',
              }),
              admin: {
                description:
                  'Use this editor for all new content: headings, paragraphs, lists, media, and quotes.',
              },
            },
            {
              name: 'contentBlocks',
              type: 'blocks',
              labels: {
                singular: 'Content Block',
                plural: 'Content Blocks',
              },
              blocks: [IntroductionBlock, EditorialNoteBlock],
              admin: {
                description: 'Structured sections that can be reordered via drag and drop.',
              },
            },
            {
              name: 'content',
              type: 'textarea',
              label: 'Legacy Content (Read-only HTML)',
              maxLength: 1000000,
              admin: {
                readOnly: true,
                condition: (data) => Boolean(data?.content),
                description:
                  'Imported legacy HTML. It is preserved as-is and used only as fallback when contentV2 is empty.',
              },
            },
          ],
        },
        {
          label: 'Recipe',
          fields: [
            {
              name: 'recipeBlocks',
              type: 'blocks',
              labels: {
                singular: 'Recipe Block',
                plural: 'Recipe Blocks',
              },
              blocks: [RecipeCardBlock],
              admin: {
                description:
                  'Use recipe blocks for preparation/cooking times, ingredients, steps, and variations.',
              },
            },
          ],
        },
        {
          label: 'Images',
          fields: [
            {
              name: 'featuredMedia',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Featured image from Media library. Alt text is required on media entries.',
              },
            },
            {
              name: 'imageBlocks',
              type: 'blocks',
              labels: {
                singular: 'Image Block',
                plural: 'Image Blocks',
              },
              blocks: [ImageGalleryBlock],
              admin: {
                description: 'Add drag-and-drop image galleries (no manual URLs).',
              },
            },
            {
              name: 'featuredImage',
              type: 'group',
              label: 'Legacy Featured Image (Read-only)',
              admin: {
                readOnly: true,
                condition: (data) => Boolean(data?.featuredImage?.url),
                description: 'Imported legacy image metadata kept for backward compatibility.',
              },
              fields: [
                { name: 'url', type: 'text', label: 'Image URL', admin: { readOnly: true } },
                { name: 'width', type: 'number', label: 'Width', admin: { readOnly: true } },
                { name: 'height', type: 'number', label: 'Height', admin: { readOnly: true } },
                { name: 'alt', type: 'text', label: 'Alt Text', admin: { readOnly: true } },
                { name: 'id', type: 'text', label: 'Image ID', admin: { readOnly: true } },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seoTitle',
              type: 'text',
              admin: {
                description: 'Optional SEO title override (recommended max 60 characters).',
                placeholder: 'Creamy Coffee Cream Recipe',
              },
            },
            {
              name: 'seoDescription',
              type: 'textarea',
              maxLength: 160,
              admin: {
                description: 'Optional meta description (recommended max 160 characters).',
                placeholder: 'Learn how to make a creamy coffee dessert filling in minutes.',
              },
            },
            {
              name: 'seoImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional social share image from Media library.',
              },
            },
            {
              name: 'canonicalURL',
              type: 'text',
              admin: {
                description: 'Optional canonical URL.',
                placeholder: 'https://example.com/articles/creamy-coffee-cream',
              },
            },
            {
              name: 'noIndex',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Enable to prevent this page from being indexed.',
              },
            },
          ],
        },
        {
          label: 'Metadata',
          fields: [
            {
              name: 'readyForPublication',
              type: 'checkbox',
              label: 'Ready for publication',
              defaultValue: false,
              admin: {
                description:
                  'Enable this to run strict publication checklist validation on every save. Keep off while drafting.',
              },
            },
            {
              name: 'lang',
              type: 'text',
              defaultValue: 'en',
              admin: {
                description: 'Language code for this article.',
                placeholder: 'en',
              },
            },
            {
              name: 'date',
              type: 'date',
              required: true,
              admin: {
                description: 'Original publication date.',
              },
            },
            {
              name: 'modified',
              type: 'date',
              label: 'Last Modified',
              admin: {
                description: 'Optional last modified date.',
              },
            },
            {
              name: 'link',
              type: 'text',
              label: 'Original Link',
              admin: {
                description: 'Optional source URL for imported articles.',
                placeholder: 'https://example.com/original-article',
              },
            },
            {
              name: 'author',
              type: 'relationship',
              relationTo: 'authors',
              hasMany: false,
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
            },
          ],
        },
      ],
    },
  ],
};
