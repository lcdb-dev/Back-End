import {
  ValidationError,
  type CollectionBeforeChangeHook,
  type PayloadRequest,
} from 'payload';

type ArticleChecklistData = {
  title?: unknown;
  slug?: unknown;
  excerpt?: unknown;
  date?: unknown;
  contentV2?: unknown;
  contentBlocks?: unknown;
  recipeBlocks?: unknown;
  imageBlocks?: unknown;
  content?: unknown;
  featuredMedia?: unknown;
  featuredImage?: { url?: unknown } | null;
  seoImage?: unknown;
  readyForPublication?: unknown;
};

type ValidationIssue = {
  message: string;
  path: string;
};

type GenericBlock = Record<string, unknown>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const toArray = <T = unknown>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

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
    if (isNonEmptyString(node.text)) {
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

const getMediaID = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const relationID = (value as { id?: unknown }).id;
  if (typeof relationID === 'string' || typeof relationID === 'number') {
    return String(relationID);
  }

  return null;
};

const getInlineMediaAlt = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const alt = (value as { alt?: unknown }).alt;
  return isNonEmptyString(alt) ? alt.trim() : null;
};

const loadMediaAlt = async (req: PayloadRequest, mediaID: string, cache: Map<string, string | null>) => {
  if (cache.has(mediaID)) {
    return cache.get(mediaID) ?? null;
  }

  try {
    const media = (await req.payload.findByID({
      collection: 'media',
      id: mediaID,
      depth: 0,
      req,
      overrideAccess: true,
    })) as { alt?: unknown } | null;

    const alt = isNonEmptyString(media?.alt) ? media.alt.trim() : null;
    cache.set(mediaID, alt);
    return alt;
  } catch {
    cache.set(mediaID, null);
    return null;
  }
};

const ensureMediaAlt = async ({
  cache,
  errors,
  label,
  path,
  req,
  value,
}: {
  cache: Map<string, string | null>;
  errors: ValidationIssue[];
  label: string;
  path: string;
  req: PayloadRequest;
  value: unknown;
}) => {
  if (value === null || value === undefined || value === '') {
    return;
  }

  const inlineAlt = getInlineMediaAlt(value);
  if (inlineAlt) {
    return;
  }

  const mediaID = getMediaID(value);
  if (!mediaID) {
    errors.push({
      path,
      message: `${label} must reference a Media item.`,
    });
    return;
  }

  const alt = await loadMediaAlt(req, mediaID, cache);
  if (!alt) {
    errors.push({
      path,
      message: `${label} is missing alt text in Media.`,
    });
  }
};

const validateRecipeBlocks = (recipeBlocks: GenericBlock[], errors: ValidationIssue[]) => {
  recipeBlocks.forEach((rawBlock, blockIndex) => {
    const block = rawBlock as {
      title?: unknown;
      servings?: unknown;
      ingredients?: unknown;
      steps?: unknown;
    };

    if (!isNonEmptyString(block.title)) {
      errors.push({
        path: `recipeBlocks.${blockIndex}.title`,
        message: 'Recipe card title is required.',
      });
    }

    if (!isNonEmptyString(block.servings)) {
      errors.push({
        path: `recipeBlocks.${blockIndex}.servings`,
        message: 'Recipe servings are required.',
      });
    }

    const ingredients = toArray<Record<string, unknown>>(block.ingredients);
    if (ingredients.length === 0) {
      errors.push({
        path: `recipeBlocks.${blockIndex}.ingredients`,
        message: 'Add at least one ingredient.',
      });
    }

    ingredients.forEach((ingredient, ingredientIndex) => {
      if (!isNonEmptyString(ingredient.quantity)) {
        errors.push({
          path: `recipeBlocks.${blockIndex}.ingredients.${ingredientIndex}.quantity`,
          message: 'Ingredient quantity is required.',
        });
      }

      if (!isNonEmptyString(ingredient.item)) {
        errors.push({
          path: `recipeBlocks.${blockIndex}.ingredients.${ingredientIndex}.item`,
          message: 'Ingredient name is required.',
        });
      }
    });

    const steps = toArray<Record<string, unknown>>(block.steps);
    if (steps.length === 0) {
      errors.push({
        path: `recipeBlocks.${blockIndex}.steps`,
        message: 'Add at least one preparation step.',
      });
    }

    steps.forEach((step, stepIndex) => {
      if (!isNonEmptyString(step.instruction)) {
        errors.push({
          path: `recipeBlocks.${blockIndex}.steps.${stepIndex}.instruction`,
          message: 'Step instruction is required.',
        });
      }
    });
  });
};

const validateArticleForPublication = async (article: ArticleChecklistData, req: PayloadRequest) => {
  const errors: ValidationIssue[] = [];
  const mediaAltCache = new Map<string, string | null>();

  if (!isNonEmptyString(article.title)) {
    errors.push({
      path: 'title',
      message: 'Title is required before publication.',
    });
  }

  if (!isNonEmptyString(article.slug)) {
    errors.push({
      path: 'slug',
      message: 'Slug is required before publication.',
    });
  } else if (!SLUG_PATTERN.test(article.slug.trim())) {
    errors.push({
      path: 'slug',
      message: 'Use a URL-safe slug (lowercase letters, numbers, and hyphens only).',
    });
  }

  if (!article.date) {
    errors.push({
      path: 'date',
      message: 'Publication date is required before publication.',
    });
  }

  const contentBlocks = toArray<GenericBlock>(article.contentBlocks);
  const recipeBlocks = toArray<GenericBlock>(article.recipeBlocks);
  const imageBlocks = toArray<GenericBlock>(article.imageBlocks);

  const hasModernRichText = hasRichTextContent(article.contentV2);
  const hasModernContent =
    hasModernRichText || contentBlocks.length > 0 || recipeBlocks.length > 0 || imageBlocks.length > 0;
  const hasLegacyContent = isNonEmptyString(article.content);

  if (!hasModernContent && !hasLegacyContent) {
    errors.push({
      path: 'contentV2',
      message:
        'Add content before publication (Rich Text, blocks, or legacy content fallback).',
    });
    return errors;
  }

  if (!hasModernContent) {
    return errors;
  }

  if (!isNonEmptyString(article.excerpt)) {
    errors.push({
      path: 'excerpt',
      message: 'Short excerpt is required for modern content articles.',
    });
  }

  const hasPrimaryBody = hasModernRichText || contentBlocks.length > 0 || recipeBlocks.length > 0;
  if (!hasPrimaryBody) {
    errors.push({
      path: 'contentV2',
      message: 'Add at least one paragraph/section/recipe block before publication.',
    });
  }

  if (article.featuredMedia === null || article.featuredMedia === undefined || article.featuredMedia === '') {
    errors.push({
      path: 'featuredMedia',
      message: 'Featured media is required for modern content publication.',
    });
  } else {
    await ensureMediaAlt({
      cache: mediaAltCache,
      errors,
      label: 'Featured media',
      path: 'featuredMedia',
      req,
      value: article.featuredMedia,
    });
  }

  if (article.seoImage !== null && article.seoImage !== undefined && article.seoImage !== '') {
    await ensureMediaAlt({
      cache: mediaAltCache,
      errors,
      label: 'SEO image',
      path: 'seoImage',
      req,
      value: article.seoImage,
    });
  }

  validateRecipeBlocks(recipeBlocks, errors);

  for (const [blockIndex, rawBlock] of imageBlocks.entries()) {
    const block = rawBlock as { images?: unknown };
    const images = toArray<Record<string, unknown>>(block.images);

    if (images.length === 0) {
      errors.push({
        path: `imageBlocks.${blockIndex}.images`,
        message: 'Add at least one image in each gallery block.',
      });
      continue;
    }

    for (const [imageIndex, imageRow] of images.entries()) {
      await ensureMediaAlt({
        cache: mediaAltCache,
        errors,
        label: 'Gallery image',
        path: `imageBlocks.${blockIndex}.images.${imageIndex}.image`,
        req,
        value: imageRow.image,
      });
    }
  }

  return errors;
};

export const validateArticlePublicationChecklist: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const merged = {
    ...(originalDoc && typeof originalDoc === 'object' ? (originalDoc as Record<string, unknown>) : {}),
    ...(data && typeof data === 'object' ? (data as Record<string, unknown>) : {}),
  } as ArticleChecklistData;

  if (merged.readyForPublication !== true) {
    return data;
  }

  const errors = await validateArticleForPublication(merged, req);
  if (errors.length > 0) {
    throw new ValidationError({
      collection: 'articles',
      errors,
      req,
    });
  }

  return data;
};
