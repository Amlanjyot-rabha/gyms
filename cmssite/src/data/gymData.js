/**
 * Central CMS-style content. Replace with API mapping in one place (e.g. useGymData).
 * Shape matches a typical public gym site payload.
 */
export const gymData = {
  meta: {
    documentTitle: 'Apex Athletic Club | Premium Fitness',
    htmlLang: 'en',
  },
  branding: {
    gymName: 'Apex Athletic Club',
    logo: {
      mode: 'text',
      wordmark: 'APEX',
      tagline: 'ATHLETIC CLUB',
      imageSrc: '',
      imageAlt: '',
    },
  },
  navigation: {
    ariaLabel: 'Primary',
    brandHref: '#',
    links: [
      { id: 'about', href: '#about', label: 'About' },
      { id: 'trainers', href: '#trainers', label: 'Trainers' },
      { id: 'gallery', href: '#gallery', label: 'Gallery' },
      { id: 'testimonials', href: '#testimonials', label: 'Stories' },
      { id: 'membership', href: '#membership', label: 'Membership' },
      { id: 'contact', href: '#contact', label: 'Contact' },
    ],
    menuOpenLabel: 'Open menu',
    menuCloseLabel: 'Close menu',
    cta: {
      href: '#membership',
      label: 'Join Now',
    },
  },
  hero: {
    title: 'Train with intention. Move with purpose.',
    subtitle:
      'Private coaching, precision equipment, and a calm studio environment designed for steady progress.',
    backgroundImage:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80',
    backgroundImageAlt: '',
    ctaPrimary: { href: '#membership', label: 'View membership' },
    ctaSecondary: { href: '#about', label: 'Our philosophy' },
  },
  about: {
    sectionEyebrow: 'About',
    heading: 'Quiet intensity. Thoughtful programming.',
    body: [
      'Apex is a members-only studio focused on strength, mobility, and sustainable habits. We keep class sizes small so every session feels personal.',
      'Programs blend evidence-based training with recovery-minded pacing—so you leave energized, not depleted.',
    ],
    imageSrc:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Athlete training with dumbbells in a minimal gym space',
    stats: [
      { value: '12+', label: 'Years coaching' },
      { value: '4.9', label: 'Member rating' },
      { value: '24/7', label: 'Member access' },
    ],
  },
  trainers: {
    sectionEyebrow: 'Coaches',
    heading: 'Specialists who meet you where you are.',
    fieldLabels: {
      experience: 'Experience',
    },
    items: [
      {
        id: 't1',
        name: 'Jordan Lee',
        specialization: 'Strength & Powerlifting',
        experience: '10 years',
        imageSrc:
          'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=800&q=80',
        imageAlt: 'Portrait of coach Jordan',
      },
      {
        id: 't2',
        name: 'Sofia Reyes',
        specialization: 'Athletic Performance',
        experience: '8 years',
        imageSrc:
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
        imageAlt: 'Portrait of coach Sofia',
      },
      {
        id: 't3',
        name: 'Marcus Chen',
        specialization: 'Mobility & Recovery',
        experience: '12 years',
        imageSrc:
          'https://images.unsplash.com/photo-1597452485669-2e7b2b696c5d?auto=format&fit=crop&w=800&q=80',
        imageAlt: 'Portrait of coach Marcus',
      },
    ],
  },
  gallery: {
    sectionEyebrow: 'Gallery',
    heading: 'Inside the club.',
    filterAllLabel: 'All',
    categories: [
      { id: 'all', label: 'All' },
      { id: 'floor', label: 'Training floor' },
      { id: 'studio', label: 'Studio' },
      { id: 'recovery', label: 'Recovery' },
    ],
    items: [
      {
        id: 'g1',
        src: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80',
        alt: 'Open gym training area',
        category: 'floor',
      },
      {
        id: 'g2',
        src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
        alt: 'Row of barbells',
        category: 'floor',
      },
      {
        id: 'g3',
        src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
        alt: 'Stretch and mobility corner',
        category: 'studio',
      },
      {
        id: 'g4',
        src: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&w=900&q=80',
        alt: 'Yoga mats in studio light',
        category: 'studio',
      },
      {
        id: 'g5',
        src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
        alt: 'Recovery lounge seating',
        category: 'recovery',
      },
      {
        id: 'g6',
        src: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=900&q=80',
        alt: 'Locker room detail',
        category: 'recovery',
      },
    ],
  },
  testimonials: {
    sectionEyebrow: 'Member stories',
    heading: 'Outcomes that feel sustainable.',
    items: [
      {
        id: 'x1',
        quote:
          'The coaching is meticulous without being loud. I finally have a plan I trust—and time that respects my schedule.',
        name: 'Alyssa K.',
        role: 'Product lead',
        ratingLabel: '5 out of 5 stars',
        ratingDisplay: '★★★★★',
      },
      {
        id: 'x2',
        quote:
          'It feels premium in the details: lighting, spacing, equipment maintenance. Training here is oddly calming.',
        name: 'Devon M.',
        role: 'Architect',
        ratingLabel: '5 out of 5 stars',
        ratingDisplay: '★★★★★',
      },
      {
        id: 'x3',
        quote:
          'I came for aesthetics and stayed for longevity. Mobility work changed how I move through the day.',
        name: 'Priya N.',
        role: 'Consultant',
        ratingLabel: '5 out of 5 stars',
        ratingDisplay: '★★★★★',
      },
    ],
  },
  membershipPlans: {
    sectionEyebrow: 'Membership',
    heading: 'Choose your cadence.',
    periodNote: 'Prices shown monthly. Annual options available at the desk.',
    featuredBadge: 'Most popular',
    plans: [
      {
        id: 'p1',
        name: 'Base',
        price: '$79',
        period: '/ month',
        description: 'Essential access for self-directed training.',
        features: ['Floor access', 'Locker amenities', 'App booking'],
        highlighted: false,
        cta: { label: 'Start Base', href: '#contact' },
      },
      {
        id: 'p2',
        name: 'Plus',
        price: '$129',
        period: '/ month',
        description: 'Coached touchpoints each month + peak-hour priority.',
        features: ['Everything in Base', '2 coach sessions / mo', 'Program reviews'],
        highlighted: true,
        cta: { label: 'Choose Plus', href: '#contact' },
      },
      {
        id: 'p3',
        name: 'Private',
        price: '$249',
        period: '/ month',
        description: 'High-touch training for accelerated goals.',
        features: ['Dedicated coach', 'Nutrition checkpoints', 'Priority scheduling'],
        highlighted: false,
        cta: { label: 'Talk to us', href: '#contact' },
      },
    ],
  },
  contact: {
    sectionEyebrow: 'Visit',
    heading: 'Say hello.',
    intro: 'Book a tour or ask a question—we respond within one business day.',
    contactInfo: {
      phoneLabel: 'Phone',
      phone: '+1 (555) 014-2277',
      phoneHref: 'tel:+15550142277',
      emailLabel: 'Email',
      email: 'hello@apexathletic.example',
      emailHref: 'mailto:hello@apexathletic.example',
    },
    openingHours: {
      heading: 'Opening hours',
      lines: [
        { days: 'Monday — Friday', hours: '5:00a — 10:00p' },
        { days: 'Saturday', hours: '7:00a — 8:00p' },
        { days: 'Sunday', hours: '8:00a — 6:00p' },
      ],
    },
    address: {
      label: 'Location',
      lines: ['218 Harbor Row', 'Chicago, IL'],
    },
    mapEmbedAriaLabel: 'Map showing gym location',
  },
  footer: {
    tagline: 'Strength with restraint.',
    copyright: '© {year} {gymName}. All rights reserved.',
    socialHeading: 'Connect',
    quickLinksHeading: 'Explore',
    socialLinks: [
      { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
      { id: 'youtube', label: 'YouTube', href: 'https://youtube.com' },
      { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
    ],
  },
  theme: {
    toggleLabels: {
      switchToDark: 'Switch to dark theme',
      switchToLight: 'Switch to light theme',
    },
  },
  loading: {
    ariaBusyLabel: 'Loading site content',
  },
  error: {
    title: 'Something went wrong',
    description: 'We could not load the site content. Please try again.',
    retryLabel: 'Retry',
  },
  skipLink: {
    href: '#main-content',
    label: 'Skip to main content',
  },
  // ── New fields (backward-compatible defaults) ──────────────
  siteStatus: 'open',   // 'open' | 'closed'
  banners: [],          // promotional banner slider items
}

/**
 * Mock async fetch — swap for `fetch`/`axios` and map response to the same shape.
 * @param {{ delayMs?: number }} opts
 * @returns {Promise<typeof gymData>}
 */
export function fetchGymData(opts = {}) {
  const delayMs = opts.delayMs ?? 650
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(gymData)), delayMs)
  })
}
