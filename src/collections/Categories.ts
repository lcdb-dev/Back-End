import type { CollectionConfig } from 'payload';

import { dispatchPayloadWebhook } from '@/lib/payloadWebhook';

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
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
          collection: 'categories',
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
