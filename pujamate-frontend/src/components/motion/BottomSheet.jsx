'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import {
  bottomSheetVariants,
  backdropVariants,
} from '@/lib/motion-variants';

const DISMISS_THRESHOLD = 120;
const DISMISS_VELOCITY = 500;

export default function BottomSheet({
  open,
  onClose,
  children,
  title,
}) {
  const dragControls = useDragControls();

  // Prevent the page behind the sheet from scrolling on mobile.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-crimson-900/40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Details'}
            className="
              fixed inset-x-0 bottom-0 z-50
              flex max-h-[92dvh] flex-col
              overflow-hidden
              rounded-t-[1.75rem]
              bg-app-surface
              shadow-sheet
            "
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Drag Handle */}
            <div
              className="flex shrink-0 cursor-grab justify-center py-3 active:cursor-grabbing"
              onPointerDown={(event) => {
                dragControls.start(event);
              }}
            >
              <motion.div
                className="h-1.5 w-12 rounded-full bg-crimson-100"
                drag="y"
                dragControls={dragControls}
                dragConstraints={{ top: 0, bottom: 180 }}
                dragElastic={0.15}
                onDragEnd={(event, info) => {
                  if (
                    info.offset.y > DISMISS_THRESHOLD ||
                    info.velocity.y > DISMISS_VELOCITY
                  ) {
                    onClose?.();
                  }
                }}
              />
            </div>

            {/* Sheet Header */}
            {title && (
              <div className="shrink-0 border-b border-app-border/10 px-6 pb-3">
                <h2 className="font-subheading text-xl text-crimson">
                  {title}
                </h2>
              </div>
            )}

            {/* Scrollable Content */}
            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                overscroll-contain
                px-6
                pb-[calc(2rem+env(safe-area-inset-bottom))]
                pt-4
                [webkit-overflow-scrolling:touch]
              "
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}