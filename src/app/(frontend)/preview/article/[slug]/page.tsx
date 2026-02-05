import { RichText } from '@payloadcms/richtext-lexical/react';
import { headers as getHeaders } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getPayload } from 'payload';
import React from 'react';

import config from '@/payload.config';
import type {
  Article,
  EditorialNoteBlock,
  ImageGalleryBlock,
  IntroductionBlock,
  Media,
  RecipeCardBlock,
} from '@/payload-types';

import './preview.css';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type PreviewBlock = IntroductionBlock | EditorialNoteBlock | RecipeCardBlock | ImageGalleryBlock;

const readText = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
};

const hasRichTextContent = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const root = (value as { root?: { children?: unknown[] } }).root;
  if (!root || !Array.isArray(root.children)) {
    return false;
  }

  const queue = [...root.children];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') {
      continue;
    }

    const node = current as Record<string, unknown>;
    const text = node.text;
    if (typeof text === 'string' && text.trim().length > 0) {
      return true;
    }

    if (node.type === 'upload' || node.type === 'relationship' || node.type === 'block') {
      return true;
    }

    if (Array.isArray(node.children)) {
      queue.push(...node.children);
    }
  }

  return false;
};

const isMediaObject = (value: unknown): value is Media => {
  return Boolean(value && typeof value === 'object' && typeof (value as Media).url === 'string');
};

const renderRichText = (value: unknown) => {
  if (!value || !hasRichTextContent(value)) {
    return null;
  }

  return <RichText data={value as never} />;
};

const renderBlock = (block: PreviewBlock, index: number) => {
  switch (block.blockType) {
    case 'introduction': {
      return (
        <section className="preview-block" key={`intro-${index}`}>
          <h2>{readText(block.title) || 'Introduction'}</h2>
          {renderRichText(block.body)}
        </section>
      );
    }

    case 'editorialNote': {
      return (
        <section className="preview-block preview-note" key={`note-${index}`}>
          <h3>{readText(block.title) || 'Notes'}</h3>
          {block.tone && <p className="preview-kicker">{block.tone}</p>}
          {renderRichText(block.body)}
        </section>
      );
    }

    case 'recipeCard': {
      return (
        <section className="preview-block preview-recipe" key={`recipe-${index}`}>
          <h2>{readText(block.title) || 'Recipe card'}</h2>
          <div className="preview-recipe-meta">
            <span>Prep: {readText(block.preparationTimeMinutes) || '0'} min</span>
            <span>Cook: {readText(block.cookingTimeMinutes) || '0'} min</span>
            <span>Difficulty: {readText(block.difficulty) || 'medium'}</span>
            <span>{readText(block.servings) || 'Servings not set'}</span>
          </div>
          {block.ingredients.length > 0 && (
            <>
              <h3>Ingredients</h3>
              <ul>
                {block.ingredients.map((ingredient, ingredientIndex) => (
                  <li key={`ingredient-${ingredientIndex}`}>
                    <strong>{ingredient.quantity || ''}</strong> {ingredient.item || ''}
                    {ingredient.notes ? ` (${ingredient.notes})` : ''}
                  </li>
                ))}
              </ul>
            </>
          )}
          {block.steps.length > 0 && (
            <>
              <h3>Steps</h3>
              <ol>
                {block.steps.map((step, stepIndex) => (
                  <li key={`step-${stepIndex}`}>{step.instruction}</li>
                ))}
              </ol>
            </>
          )}
          {renderRichText(block.tips)}
          {renderRichText(block.personalNotes)}
        </section>
      );
    }

    case 'imageGallery': {
      return (
        <section className="preview-block" key={`gallery-${index}`}>
          <h2>{readText(block.title) || 'Image gallery'}</h2>
          <div className="preview-gallery">
            {block.images.map((item, imageIndex) => {
              const media = isMediaObject(item.image) ? item.image : null;
              if (!media?.url) {
                return null;
              }

              return (
                <figure key={`gallery-item-${imageIndex}`}>
                  <img alt={media.alt || ''} src={media.url} />
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </figure>
              );
            })}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
};

export default async function ArticlePreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const headers = await getHeaders();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect(`/admin/login?redirect=${encodeURIComponent(`/preview/article/${slug}`)}`);
  }

  const result = await payload.find({
    collection: 'articles',
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 3,
    draft: true,
    limit: 1,
  });

  const article = result.docs[0] as Article | undefined;
  if (!article) {
    notFound();
  }

  const featuredMedia = isMediaObject(article.featuredMedia) ? article.featuredMedia : null;
  const featuredMediaURL = featuredMedia?.url || article.featuredImage?.url || null;
  const featuredMediaAlt = featuredMedia?.alt || article.featuredImage?.alt || article.title;

  const contentBlocks = Array.isArray(article.contentBlocks) ? article.contentBlocks : [];
  const recipeBlocks = Array.isArray(article.recipeBlocks) ? article.recipeBlocks : [];
  const imageBlocks = Array.isArray(article.imageBlocks) ? article.imageBlocks : [];

  const hasModernContent =
    hasRichTextContent(article.contentV2) ||
    contentBlocks.length > 0 ||
    recipeBlocks.length > 0 ||
    imageBlocks.length > 0;

  return (
    <article className="preview-page">
      <header className="preview-header">
        <p className="preview-kicker">Authenticated preview</p>
        <h1>{article.title}</h1>
        {article.excerpt && <p className="preview-excerpt">{article.excerpt}</p>}
      </header>

      {featuredMediaURL && (
        <figure className="preview-featured">
          <img alt={featuredMediaAlt || ''} src={featuredMediaURL} />
        </figure>
      )}

      {hasModernContent ? (
        <div className="preview-body">
          {renderRichText(article.contentV2)}
          {contentBlocks.map((block, index) => renderBlock(block, index))}
          {recipeBlocks.map((block, index) => renderBlock(block, contentBlocks.length + index))}
          {imageBlocks.map((block, index) =>
            renderBlock(block, contentBlocks.length + recipeBlocks.length + index),
          )}
        </div>
      ) : (
        <div
          className="preview-body preview-legacy"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />
      )}
    </article>
  );
}
