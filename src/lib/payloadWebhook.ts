type PayloadWebhookInput = {
  collection: string;
  operation?: string;
  id?: string | number | null;
  slug?: string | null;
};

const isLocalWebhookTarget = (targetURL: string) => {
  try {
    const parsed = new URL(targetURL);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

export const dispatchPayloadWebhook = async (input: PayloadWebhookInput) => {
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const forceWebhooks = process.env.FORCE_WEBHOOKS === 'true';

  if (!isProduction && !forceWebhooks) {
    console.log('[payload-webhook] skipped in development');
    return;
  }

  const webhookURL =
    process.env.ASTRO_WEBHOOK_URL || 'https://api.github.com/repos/lcdb-dev/Front-End/dispatches';
  const isLocalTarget = isLocalWebhookTarget(webhookURL);
  const token = process.env.GITHUB_DISPATCH_TOKEN;

  if (!isLocalTarget && !token) {
    console.warn('[payload-webhook] missing GITHUB_DISPATCH_TOKEN, dispatch skipped');
    return;
  }

  const body = isLocalTarget
    ? {
        collection: input.collection,
        operation: input.operation,
        id: input.id,
        slug: input.slug,
      }
    : {
        event_type: 'payload-update',
        client_payload: {
          collection: input.collection,
          operation: input.operation,
          id: input.id,
          slug: input.slug,
        },
      };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!isLocalTarget) {
    headers.Accept = 'application/vnd.github+json';
    headers.Authorization = `token ${token}`;
  }

  try {
    const response = await fetch(webhookURL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const responseBody = await response.text();
    if (!response.ok) {
      console.error('[payload-webhook] failed', {
        status: response.status,
        body: responseBody,
      });
      return;
    }

    console.log('[payload-webhook] sent', {
      status: response.status,
      collection: input.collection,
      slug: input.slug ?? input.id,
    });
  } catch (error) {
    console.error('[payload-webhook] error', error);
  }
};
