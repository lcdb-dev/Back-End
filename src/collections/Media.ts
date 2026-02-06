import type { CollectionConfig } from 'payload'

import { dispatchPayloadWebhook } from '@/lib/payloadWebhook'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        await dispatchPayloadWebhook({
          collection: 'media',
          operation,
          id: doc?.id,
        });
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
