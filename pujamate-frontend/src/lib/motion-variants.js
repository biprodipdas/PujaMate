// src/lib/motion-variants.js
// Central place for animation variants so timing/easing stays consistent
// across the app instead of being redefined per-component.

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export const pageTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

// Staggered reveal for itinerary/timeline lists (PRD 5.3)
export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// Badge unlock spring (PRD 5.4 — Puja Passport)
export const badgeUnlockVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 18 },
  },
};

// Bottom sheet drawer
export const bottomSheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', stiffness: 340, damping: 34 } },
  exit: { y: '100%', transition: { duration: 0.25, ease: 'easeIn' } },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};
