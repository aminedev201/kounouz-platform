'use client';

import React, { useEffect , useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthProvider";
import Loader from "@/components/loader/loader";
import Header from "@/layout/user/header";
import Footer from "@/layout/user/footer";



export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth(); 
    const router = useRouter();

    useEffect(() => {

        if (loading) return;

        if (user && user.roles?.includes('ROLE_VENDOR')) {
            router.push('/dashboard/home');
        } 

    }, [user, loading, router]);

    if (loading || ( user && !user.roles?.includes('ROLE_USER'))) {
        return <Loader/>
    }else{
        return (
        <div className="min-h-screen bg-gray-50">
       <Header/>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer/>
    </div>
        );
    }

}