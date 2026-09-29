'use client';
import dynamic from 'next/dynamic';

const MissingPandalModal = dynamic(() => import('./MissingPandalModal'), { ssr: false });
export default MissingPandalModal;
