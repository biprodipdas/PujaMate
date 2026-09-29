'use client';

// src/components/motion/BottomSheet.jsx
// Mobile-optimized drag-to-dismiss drawer (PRD 5.1 pandal detail views).
// Usage:
//   <BottomSheet open={open} onClose={() => setOpen(false)}>
//     ...detail content...
//   </BottomSheet>

import { AnimatePresence, motion } from 'framer-motion';
import { bottomSheetVariants, backdropVariants } from '@/lib/motion-variants';

const DISMISS_THRESHOLD = 120; // px dragged down before we treat it as "close"
const DISMISS_VELOCITY = 500; // px/s flick velocity that also counts as close

export default function BottomSheet({ open, onClose, children, title }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-crimson-900/40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Details'}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-sheet bg-white shadow-sheet"
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(event, info) => {
              if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > DISMISS_VELOCITY) {
                onClose?.();
              }
            }}
          >
            <div className="flex justify-center pt-3">
              <span className="h-1.5 w-12 rounded-full bg-crimson-100" />
            </div>

            {title && (
              <h2 className="font-subheading px-6 pt-4 text-xl text-crimson">{title}</h2>
            )}

            <div className="px-6 pb-8 pt-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
