import type { Block } from 'payload';

export const ImageGalleryBlock: Block = {
  slug: 'imageGallery',
  labels: {
    singular: 'Image Gallery',
    plural: 'Image Galleries',
  },
  interfaceName: 'ImageGalleryBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Image gallery',
      admin: {
        description: 'Optional heading shown above the gallery.',
        placeholder: 'Image gallery',
      },
    },
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      admin: {
        description: 'Upload images from the Media library. No manual URLs.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            placeholder: 'Optional caption',
          },
        },
      ],
    },
  ],
};
