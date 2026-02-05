import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical';

type CreateArticleRichTextEditorArgs = {
  placeholder: string;
};

export const createArticleRichTextEditor = ({ placeholder }: CreateArticleRichTextEditorArgs) =>
  lexicalEditor({
    admin: {
      placeholder,
    },
    features: () => [
      ParagraphFeature(),
      HeadingFeature({
        enabledHeadingSizes: ['h2', 'h3'],
      }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      BlockquoteFeature(),
      LinkFeature(),
      UploadFeature({
        enabledCollections: ['media'],
      }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ],
  });
