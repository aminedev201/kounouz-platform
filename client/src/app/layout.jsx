import { Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { AuthProvider } from '@/context/AuthProvider';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({children}) {

  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
          <ThemeProvider>
              <SidebarProvider>
                  <AuthProvider>
                    {children}  
                  </AuthProvider>
              </SidebarProvider>
          </ThemeProvider>
      </body>
    </html>
    );

 
}


