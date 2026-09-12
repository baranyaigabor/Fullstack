import {
  LuBlocks,
  LuBox,
  LuCircleHelp,
  LuDatabase,
  LuGauge,
  LuHouse,
  LuLayers3,
  LuRocket,
  LuShieldCheck,
} from 'react-icons/lu';

const normalizeUrl = (value: string) => value.replace(/\/$/, '');

export const siteName =
  process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Fullstack Starter';
const publicDomain = process.env.NEXT_PUBLIC_APP_DOMAIN?.trim();
export const siteUrl = normalizeUrl(
  publicDomain
    ? `https://${publicDomain}`
    : process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost',
);
export const siteDescription =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION?.trim() ||
  'A production-ready starter for building web products without rebuilding the platform layer.';

export const navbarItems = [{ icon: LuHouse, label: 'Home', href: '/' }];

export const footerItems = [
  { icon: LuHouse, label: 'Home', href: '/' },
  { icon: LuCircleHelp, label: 'FAQ', href: '/#faq' },
];

export const homeFeatureCards = [
  {
    title: 'Modern application stack',
    description:
      'Next.js, React, NestJS, PostgreSQL, Redis, and shared TypeScript contracts in one pnpm workspace.',
    icon: LuLayers3,
    tone: 'text-blue-500',
  },
  {
    title: 'Production infrastructure',
    description:
      'Docker Compose, Nginx, health checks, database migrations, search, queues, and virus scanning are wired in.',
    icon: LuBox,
    tone: 'text-amber-500',
  },
  {
    title: 'Accounts included',
    description:
      'Email/password authentication, optional social providers, password reset, protected profiles, and uploads.',
    icon: LuShieldCheck,
    tone: 'text-emerald-500',
  },
];

export const homeExperienceCards = [
  {
    title: 'Change the identity',
    description:
      'Set the application name, URL, and description in one environment file.',
    icon: LuBlocks,
  },
  {
    title: 'Build your domain',
    description:
      'Add feature modules without rewriting authentication or infrastructure.',
    icon: LuDatabase,
  },
  {
    title: 'Ship confidently',
    description:
      'Use the same health-checked containers in local and production workflows.',
    icon: LuGauge,
  },
];

export const faqItems = [
  {
    question: 'What should I customize first?',
    answer:
      'Copy .env.example to .env, change the APP and NEXT_PUBLIC_APP values, then replace the logo and landing-page copy.',
  },
  {
    question: 'Are external integrations required?',
    answer:
      'No. Social login, Stripe, Cloudflare Turnstile, object storage, email, and the public tunnel are optional.',
  },
  {
    question: 'Where does new business logic go?',
    answer:
      'Create a feature module under backend/src and a matching route or feature folder in frontend/src.',
  },
];

export const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteName,
    url: siteUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: siteDescription,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
];

export const starterHighlights = [
  'Next.js frontend',
  'NestJS API',
  'PostgreSQL + Drizzle',
  'Docker-first workflow',
];

export const primaryAction = { label: 'Create an account', href: '/register' };
export const secondaryAction = { label: 'View profile', href: '/profile' };
export const heroIcon = LuRocket;
