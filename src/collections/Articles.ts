import type { CollectionConfig } from 'payload';

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: { useAsTitle: 'title' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        console.log('🔄 Article webhook hook triggered:', { operation, docId: doc?.id, slug: doc?.slug });

        // Skip webhooks in development unless explicitly enabled
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
        const forceWebhooks = process.env.FORCE_WEBHOOKS === 'true';

        if (!isProduction && !forceWebhooks) {
          console.log('🔄 Skipping webhook in development (set FORCE_WEBHOOKS=true to enable)');
          return;
        }

        try {
          // Primary: GitHub dispatch to trigger Astro rebuild/deploy
          const ghDispatchUrl =
            process.env.ASTRO_WEBHOOK_URL ||
            'https://api.github.com/repos/lcdb-dev/Front-End/dispatches';
          const ghToken = process.env.GITHUB_DISPATCH_TOKEN;

          if (!ghToken) {
            console.warn('⚠️ GITHUB_DISPATCH_TOKEN not set; skipping rebuild dispatch.');
            return;
          }

          console.log('🔄 Sending GitHub dispatch to:', ghDispatchUrl);

          // Prepare the payload
          const payload = JSON.stringify({
            event_type: 'payload-update',
            client_payload: {
              collection: 'articles',
              operation,
              id: doc?.id,
              slug: doc?.slug,
            },
          });

          console.log('🔄 Payload to send:', payload);

          // Use Node.js http module instead of fetch for localhost requests
          const url = new URL(ghDispatchUrl);
          const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
          
          const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
              ...(isLocal ? {} : {
                Accept: 'application/vnd.github+json',
                Authorization: `token ${ghToken}`,
              }),
            },
          };

          // Use fetch for local requests, http.request for GitHub
          if (isLocal) {
            try {
              // For local testing, use POST with JSON body instead of GET with query params
              const payload = JSON.stringify({
                collection: 'articles',
                operation,
                id: doc?.id,
                slug: doc?.slug,
              });

              console.log('🔄 [WEBHOOK] Local POST payload:', payload);

              const response = await fetch(ghDispatchUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: payload,
              });
              
              const responseText = await response.text();
              console.log('🔄 Response status:', response.status);
              console.log('🔄 Response body:', responseText);

              if (response.ok) {
                console.log(`✅ Webhook sent for articles ${operation}: ${doc.slug || doc.id}`);
              } else {
                console.error(`❌ Webhook failed: ${response.status}`);
                console.error('❌ Response body:', responseText);
              }
            } catch (fetchError) {
              console.error('❌ Webhook fetch error:', fetchError);
            }
          } else {
            // GitHub dispatch
            const http = await import('http');
            const https = await import('https');
            const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
              let data = '';
              res.on('data', (chunk) => {
                data += chunk;
              });
              res.on('end', () => {
                console.log('🔄 Response status:', res.statusCode);
                console.log('🔄 Response body:', data);

                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                  console.log(`✅ GitHub dispatch sent for articles ${operation}: ${doc.slug || doc.id}`);
                } else {
                  console.error(`❌ GitHub dispatch failed: ${res.statusCode}`);
                  console.error('❌ Response body:', data);
                }
              });
            });

            req.on('error', (error) => {
              console.error('❌ Webhook request error:', error);
            });

            req.write(payload);
            req.end();
          }
        } catch (error) {
          console.error('❌ Webhook error:', error);
        }
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'lang', type: 'text', defaultValue: 'en' },
    { name: 'excerpt', type: 'textarea', label: 'Short Excerpt' },
    { name: 'content', type: 'textarea', required: true, label: 'Full Content (HTML/Text)', maxLength: 1000000 },
    { name: 'date', type: 'date', required: true },
    { name: 'modified', type: 'date', label: 'Last Modified' },
    { name: 'link', type: 'text', label: 'Original Link' },
    { 
      name: 'featuredImage', 
      type: 'group', 
      label: 'Featured Image',
      fields: [
        { name: 'url', type: 'text', label: 'Image URL' },
        { name: 'width', type: 'number', label: 'Width' },
        { name: 'height', type: 'number', label: 'Height' },
        { name: 'alt', type: 'text', label: 'Alt Text' },
        { name: 'id', type: 'text', label: 'Image ID' },
      ]
    },
    { name: 'author', type: 'relationship', relationTo: 'authors', hasMany: false },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
  ],
};
