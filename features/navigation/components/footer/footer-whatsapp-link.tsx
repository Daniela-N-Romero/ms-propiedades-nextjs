'use client';

import { trackWhatsAppClickGeneral } from '@/lib/analytics';

interface FooterWhatsAppLinkProps {
    href: string;
    className?: string;
    children: React.ReactNode;
}

export default function FooterWhatsAppLink({ href, className, children }: FooterWhatsAppLinkProps) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className={className}
            onClick={() => trackWhatsAppClickGeneral('Footer')} 
        >
            {children}
        </a>
    );
}