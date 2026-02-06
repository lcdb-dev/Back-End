import type { CollectionConfig } from 'payload';

import { dispatchPayloadWebhook } from '@/lib/payloadWebhook';

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        await dispatchPayloadWebhook({
          collection: 'tags',
          operation,
          id: doc?.id,
          slug: doc?.slug || doc?.name,
        });
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
  ],
};
