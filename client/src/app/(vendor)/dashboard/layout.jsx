'use client';

import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSidebar } from "../../../context/SidebarContext";
import AppHeader from "../../../layout/AppHeader";
import AppSidebar from "../../../layout/AppSidebar";
import Backdrop from "../../../layout/Backdrop";
import { useAuth } from "@/context/AuthProvider";
import Loader from "@/components/loader/loader";

export default function DashboardLayout({ children }) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();
    const { user, loading } = useAuth(); 
    const router = useRouter();

    const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

    useEffect(() => {

        if (loading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if(user.roles?.includes('ROLE_USER')) {
            router.push('/');
        } 
        
    }, [user, loading, router]);

    if (loading || !user || !user.roles?.includes('ROLE_VENDOR')) {
        return <Loader/>
    }else{
        return (
            <div className="min-h-screen xl:flex">
                <AppSidebar />
                <Backdrop />
                <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                    <AppHeader />
                    <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
                </div>
            </div>
        );
    }

}