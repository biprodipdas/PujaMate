'use client';

// src/components/motion/PageTransition.jsx
// Wraps route content so navigating between screens fades + slides
// instead of hard-cutting. Drop this inside layout.js around {children}.

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { pageTransitionVariants, pageTransition } from '@/lib/motion-variants';

export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
