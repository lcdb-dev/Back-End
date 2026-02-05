import { createElement } from 'react'
import { headers as getHeaders } from 'next/headers'
import Script from 'next/script'
import { getPayload } from 'payload'
import config from '@/payload.config'

type FeatureCard = {
  icon: string
  title: string
  text: string
}

const featureCards: FeatureCard[] = [
  {
    icon: 'solar:monitor-bold-duotone',
    title: 'Visual Admin Panel',
    text: 'Easy-to-use admin dashboard for non-technical editors with drag-and-drop blocks, rich text editing, and media management.',
  },
  {
    icon: 'solar:code-bold-duotone',
    title: 'Full TypeScript Support',
    text: 'End-to-end type safety across frontend and backend with generated types.',
  },
  {
    icon: 'solar:server-square-bold-duotone',
    title: 'Headless & API-First',
    text: 'REST and GraphQL APIs out of the box for modern frontend stacks.',
  },
  {
    icon: 'solar:widget-5-bold-duotone',
    title: 'Custom Fields & Collections',
    text: 'Flexible content modeling with relationships and nested structures.',
  },
  {
    icon: 'solar:shield-user-bold-duotone',
    title: 'Auth & Roles',
    text: 'Role-based permissions and access control for secure workflows.',
  },
  {
    icon: 'solar:gallery-bold-duotone',
    title: 'Media Management',
    text: 'Built-in uploads, optimization, previews, and responsive media handling.',
  },
]

const postsSnippet = `// collections/Posts.ts
export const Posts: CollectionConfig = {
  slug: 'posts',
  endpoints: [
    {
      path: '/featured',
      method: 'get',
      handler: async () => {
        // custom logic
      },
    },
  ],
}`

const hooksSnippet = `// collections/Pages.ts
export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [async ({ data }) => ({ ...data, updatedAt: new Date() })],
  },
}`

const interactionsScript = `
(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  const mobileMenu = document.getElementById('mobile-menu');
  const openBtn = document.getElementById('open-menu');
  const closeBtn = document.getElementById('close-menu');

  const toggleMenu = () => {
    if (!mobileMenu) return;
    const closed = mobileMenu.classList.contains('closed');
    mobileMenu.classList.toggle('closed', !closed);
    mobileMenu.classList.toggle('open', closed);
    document.body.style.overflow = closed ? 'hidden' : '';
  };

  openBtn?.addEventListener('click', toggleMenu);
  closeBtn?.addEventListener('click', toggleMenu);

  const parallaxBg = document.getElementById('parallax-bg');
  window.addEventListener('scroll', () => {
    if (parallaxBg) {
      parallaxBg.style.transform = 'translateY(' + window.scrollY * 0.3 + 'px)';
    }
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (mobileMenu && !mobileMenu.classList.contains('closed')) toggleMenu();
    });
  });
})();
`

function IconifyIcon({ icon, className }: { icon: string; className?: string }) {
  return createElement('iconify-icon', {
    icon,
    class: className,
    'aria-hidden': 'true',
  })
}

export default async function HomePage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })
  const adminURL = payload.getAdminURL()
  const adminPath = adminURL.startsWith('http') ? new URL(adminURL).pathname : adminURL || '/admin'
  const year = new Date().getFullYear()

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js"
        strategy="afterInteractive"
      />
      <Script id="landing-page-interactions" strategy="afterInteractive">
        {interactionsScript}
      </Script>

      <div className="scroll-smooth antialiased min-h-screen selection:bg-blue-500/20 bg-[#020202]">
        <div id="parallax-bg" />

        <div
          id="mobile-menu"
          className="fixed inset-0 bg-[#020202] z-[60] flex flex-col justify-center items-center closed md:hidden"
        >
          <button id="close-menu" type="button" className="absolute top-6 right-6 text-white text-3xl">
            <IconifyIcon icon="solar:close-circle-bold-duotone" />
          </button>
          <nav className="flex flex-col gap-8 text-center">
            <a href="#features" className="text-3xl font-serif text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#developers" className="text-3xl font-serif text-zinc-400 hover:text-white transition-colors">
              Developers
            </a>
            <a href="https://payloadcms.com/docs" target="_blank" rel="noopener noreferrer" className="text-3xl font-serif text-zinc-400 hover:text-white transition-colors">
              Docs
            </a>
          </nav>
        </div>

        <div className="max-w-[1440px] mx-auto relative z-10">
          <header className="relative z-50 border-b border-white/5 sticky top-0 bg-[#020202]/80 backdrop-blur-xl">
            <div className="flex justify-between items-center px-6 md:px-12 py-6">
              <button id="open-menu" type="button" className="md:hidden text-white text-2xl">
                <IconifyIcon icon="solar:hamburger-menu-bold-duotone" />
              </button>

              <nav className="hidden md:flex gap-8">
                <a href="#features" className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-500 hover:text-white transition-colors">Features</a>
                <a href="#developers" className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-500 hover:text-white transition-colors">Developers</a>
              </nav>

              <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-2xl text-white tracking-tight font-newsreader font-light">Payload</span>
              </div>

              <nav className="hidden md:flex gap-8 items-center">
                <a href="https://payloadcms.com/docs" target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-500 hover:text-white transition-colors">Docs</a>
                <a href={adminPath} className="text-[11px] font-medium tracking-[0.2em] uppercase text-white border border-white/20 px-5 py-2 rounded-full hover:bg-white hover:text-black transition-all">Admin Panel</a>
              </nav>

              <div className="w-6 md:hidden" />
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-12 min-h-[900px] bg-[#020202]/50 border-white/5 border-b relative">
            <div className="col-span-1 md:col-span-9 border-r border-white/5 relative overflow-hidden min-h-[500px]">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20" />
                <img src="https://img.rocket.new/generatedImages/rocket_gen_img_1fd986d62-1766500351311.png" alt="Payload admin dashboard preview" className="w-full h-full object-cover grayscale opacity-40" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-[#020202]/10 z-10 pointer-events-none" />

              <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full z-20">
                <span className="inline-block px-3 py-1 mb-6 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] uppercase tracking-[0.2em] text-zinc-300 reveal">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block mr-2" />
                  Production Ready
                </span>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-light text-white leading-[0.9] tracking-tight">
                  <span className="block font-newsreader font-light">The Modern</span>
                  <span className="block font-newsreader font-light">Headless CMS</span>
                </h1>
                <p className="text-xl text-zinc-400 mt-6 max-w-xl font-dm-sans reveal delay-100">
                  Build fast, scalable websites with Payload CMS and Next.js - full control, no limits.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <a href={adminPath} className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-blue-600 transition-all">
                    Go to Admin Panel
                    <IconifyIcon icon="solar:arrow-right-bold-duotone" />
                  </a>
                  <a href="https://payloadcms.com/docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-white/5 transition-all">
                    View Documentation
                  </a>
                </div>

                {user && <p className="text-zinc-500 text-sm mt-6">Logged in as <span className="text-zinc-300">{user.email}</span></p>}
              </div>
            </div>

            <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-1 md:grid-rows-3 spotlight-group md:p-0 gap-4 md:gap-0 bg-[#020202] h-full pt-4 pr-4 pb-4 pl-4">
              <div className="spotlight-card md:border-0 md:border-b md:rounded-none md:bg-transparent p-6 md:p-8 flex flex-col justify-center reveal delay-100">
                <IconifyIcon icon="solar:code-bold-duotone" className="text-3xl text-zinc-600 mb-4 transition-colors z-10" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1 z-10">TypeScript</span>
                <span className="text-3xl text-white tracking-tight font-newsreader font-light z-10">100%</span>
              </div>
              <div className="spotlight-card md:border-0 md:border-b md:rounded-none md:bg-transparent p-6 md:p-8 flex flex-col justify-center reveal delay-200">
                <IconifyIcon icon="solar:rocket-2-bold-duotone" className="text-3xl text-zinc-600 mb-4 transition-colors z-10" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1 z-10">API Speed</span>
                <span className="text-3xl text-white tracking-tight font-newsreader font-light z-10">&lt;50ms</span>
              </div>
              <div className="spotlight-card md:border-0 md:rounded-none md:bg-transparent p-6 md:p-8 flex flex-col justify-center reveal delay-300 col-span-2 md:col-span-1">
                <IconifyIcon icon="solar:database-bold-duotone" className="text-3xl text-zinc-600 mb-4 transition-colors z-10" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1 z-10">Collections</span>
                <span className="text-3xl text-white tracking-tight font-newsreader font-light z-10">Unlimited</span>
              </div>
            </div>
          </section>

          <section id="features" className="relative z-10 py-24 bg-[#020202]">
            <div className="px-6 md:px-12 mb-16">
              <h2 className="text-4xl md:text-6xl text-white tracking-tight font-newsreader font-light mb-4">Everything you need to build</h2>
              <p className="text-zinc-500 text-lg max-w-2xl">Powerful features for developers and editors, no compromises.</p>
            </div>
            <div className="spotlight-group grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-12">
              {featureCards.map((feature, index) => (
                <div key={feature.title} className={`spotlight-card p-8 bg-zinc-900/10 flex flex-col justify-between h-full min-h-[300px] reveal ${index % 3 === 1 ? 'delay-100' : index % 3 === 2 ? 'delay-200' : ''}`}>
                  <div className="relative z-10">
                    <IconifyIcon icon={feature.icon} className="text-5xl text-blue-500 mb-6" />
                    <h3 className="text-2xl text-white mb-4 tracking-tight font-newsreader font-light">{feature.title}</h3>
                    <p className="text-zinc-400 leading-relaxed">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="developers" className="relative z-10 py-24 bg-[#050505] border-t border-white/5">
            <div className="px-6 md:px-12 mb-16">
              <h2 className="text-4xl md:text-6xl text-white tracking-tight font-newsreader font-light mb-4">Built for developers who want control</h2>
              <p className="text-zinc-500 text-lg max-w-2xl">No locked-in architecture. Full customization with hooks, access control, and custom endpoints.</p>
            </div>

            <div className="spotlight-group grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-12">
              <div className="spotlight-card p-8 md:p-12 bg-zinc-900/30 border border-white/5 rounded-xl reveal">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Custom Endpoints</span>
                  <IconifyIcon icon="solar:code-scan-bold-duotone" className="text-xl text-blue-500" />
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-white/5 mb-6">
                  <pre className="text-xs text-zinc-300 font-jetbrains overflow-x-auto"><code>{postsSnippet}</code></pre>
                </div>
              </div>

              <div className="spotlight-card p-8 md:p-12 bg-zinc-900/30 border border-white/5 rounded-xl reveal delay-100">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Hooks & Access Control</span>
                  <IconifyIcon icon="solar:shield-check-bold-duotone" className="text-xl text-blue-500" />
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-white/5 mb-6">
                  <pre className="text-xs text-zinc-300 font-jetbrains overflow-x-auto"><code>{hooksSnippet}</code></pre>
                </div>
              </div>
            </div>
          </section>

          <section className="relative z-10 py-32 bg-[#020202] border-t border-white/5">
            <div className="px-6 md:px-12 text-center reveal">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-5xl md:text-7xl text-white tracking-tight font-newsreader font-light mb-8">Ready to build your next project with Payload?</h2>
                <p className="text-zinc-400 text-lg mb-12 max-w-2xl mx-auto">Get started in minutes with docs and open-source examples.</p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <a href={adminPath} className="inline-flex items-center justify-center gap-3 bg-blue-500 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-blue-600 transition-all group">
                    Open Admin Panel
                    <IconifyIcon icon="solar:arrow-right-bold-duotone" className="text-xl group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="https://payloadcms.com/docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 border-2 border-white/20 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/5 transition-all">
                    Read the Docs
                  </a>
                </div>
              </div>
            </div>
          </section>

          <footer className="relative z-10 bg-[#020202] border-t border-white/5 py-16 px-6 md:px-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl text-white tracking-tight font-newsreader font-light">Payload</span>
            </div>
            <p className="text-zinc-500 text-sm mb-6">The modern headless CMS for developers and editors.</p>
            <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-zinc-600 text-xs">(c) {year} Payload CMS. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-zinc-600 hover:text-white transition-colors text-xs">Privacy Policy</a>
                <a href="#" className="text-zinc-600 hover:text-white transition-colors text-xs">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
