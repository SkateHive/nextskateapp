// src/components/SidebarWrapper.tsx

"use client";

import { usePathname } from 'next/navigation';
import SidebarDesktop from "@/components/Navbar/sidebarDesktop";

const SidebarWrapper = () => {
    const pathname = usePathname();
    const hideSidebarRoutes = ["/communityMag"];

    if (hideSidebarRoutes.includes(pathname)) {
        return null;
    }

    return <SidebarDesktop />;
};

export default SidebarWrapper;
