import type { CollectionConfig } from 'payload';

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: { singular: 'Comment', plural: 'Comments' },
  admin: { useAsTitle: 'author' },
  access: {
    read: () => true,
    create: () => true, // Allow public comments
    update: ({ req }) => !!req.user, // Only admins can edit
    delete: ({ req }) => !!req.user, // Only admins can delete
  },
  fields: [
    { name: 'author', type: 'text', required: true, label: 'Author Name' },
    { name: 'email', type: 'email', label: 'Author Email' },
    { name: 'content', type: 'textarea', required: true, label: 'Comment Text' },
    { name: 'article', type: 'relationship', relationTo: 'articles', required: true },
    { name: 'approved', type: 'checkbox', defaultValue: false, label: 'Approved' },
    { name: 'createdAt', type: 'date', admin: { position: 'sidebar' } },
  ],
};
