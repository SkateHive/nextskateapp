// src/components/SidebarWrapper.tsx

"use client";

import { usePathname } from 'next/navigation';
import SidebarDesktop from "@/components/Navbar/sidebarDesktop";
import { useIsClient } from '@/hooks/useIsClient';
import { useEffect, useState } from 'react';

const SidebarWrapper = () => {
    const isClient = useIsClient();
    const pathname = usePathname();
    const hideSidebarRoutes = ["/communityMag", "/leaderboard"];
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isClient) {
            setShouldRender(true);
        }
    }, [isClient]);

    if (!shouldRender) return null;

    if (hideSidebarRoutes.includes(String(pathname))) {
        return null;
    }

    return <SidebarDesktop />;
};

export default SidebarWrapper;
