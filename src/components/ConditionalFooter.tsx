'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

const ConditionalFooter: React.FC = () => {
    const pathname = usePathname();

    // Don't show footer on home page
    const showFooter = pathname !== '/home';

    return showFooter ? <Footer /> : null;
};

export default ConditionalFooter;
