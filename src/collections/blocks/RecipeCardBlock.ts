import type { Block } from 'payload';

import { createArticleRichTextEditor } from '@/lib/articleRichTextEditor';

export const RecipeCardBlock: Block = {
  slug: 'recipeCard',
  labels: {
    singular: 'Recipe Card',
    plural: 'Recipe Cards',
  },
  interfaceName: 'RecipeCardBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Recipe card',
      admin: {
        description: 'Visible heading for this recipe section.',
        placeholder: 'Recipe card',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'preparationTimeMinutes',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            width: '33%',
            description: 'Preparation time in minutes.',
            placeholder: '20',
          },
        },
        {
          name: 'cookingTimeMinutes',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            width: '33%',
            description: 'Cooking time in minutes.',
            placeholder: '35',
          },
        },
        {
          name: 'servings',
          type: 'text',
          required: true,
          admin: {
            width: '34%',
            description: 'How many people this recipe serves.',
            placeholder: 'Serves 4',
          },
        },
      ],
    },
    {
      name: 'difficulty',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
      admin: {
        description: 'Select the expected difficulty for this recipe.',
      },
    },
    {
      name: 'ingredients',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Ingredient',
        plural: 'Ingredients',
      },
      admin: {
        description: 'Ingredients: quantities required for each item.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'quantity',
              type: 'text',
              required: true,
              admin: {
                width: '30%',
                placeholder: '200 g',
              },
            },
            {
              name: 'item',
              type: 'text',
              required: true,
              admin: {
                width: '50%',
                placeholder: 'dark chocolate',
              },
            },
            {
              name: 'notes',
              type: 'text',
              admin: {
                width: '20%',
                placeholder: 'chopped',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Step',
        plural: 'Steps',
      },
      admin: {
        description: 'Add one instruction per row to keep steps clear.',
      },
      fields: [
        {
          name: 'instruction',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Steps: one step per line.',
            placeholder: 'Whisk the eggs and sugar until pale.',
          },
        },
      ],
    },
    {
      name: 'tips',
      type: 'richText',
      editor: createArticleRichTextEditor({
        placeholder: 'Tips / variations for editors and readers.',
      }),
      admin: {
        description: 'Optional tips to help readers succeed.',
      },
    },
    {
      name: 'personalNotes',
      type: 'richText',
      editor: createArticleRichTextEditor({
        placeholder: 'Personal comments or story context.',
      }),
      admin: {
        description: 'Optional notes or personal comments from the author.',
      },
    },
  ],
};
