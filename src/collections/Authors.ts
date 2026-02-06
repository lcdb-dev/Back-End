import type { CollectionConfig } from 'payload';

import { dispatchPayloadWebhook } from '@/lib/payloadWebhook';

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Author', plural: 'Authors' },
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
          collection: 'authors',
          operation,
          id: doc?.id,
          slug: doc?.name,
        });
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'bio', type: 'textarea' },
    { name: 'link', type: 'text', label: 'Author URL' },
  ],
};
