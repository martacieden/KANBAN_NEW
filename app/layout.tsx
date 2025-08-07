import './globals.css'
import { Inter } from 'next/font/google'
import TopBar from "../components/topbar";


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://task-management-chi-jade.vercel.app'),
  title: 'WAY2B1 - Task Management & Kanban Board',
  description: 'Professional task management system with Kanban board, team collaboration, and project tracking. Manage tasks efficiently with our intuitive interface.',
  keywords: 'task management, kanban board, project management, team collaboration, productivity, WAY2B1',
  authors: [{ name: 'WAY2B1 Team' }],
  creator: 'WAY2B1 Task Management',
  
  // Open Graph meta tags
  openGraph: {
    title: 'WAY2B1 - Task Management & Kanban Board',
    description: 'Professional task management system with Kanban board, team collaboration, and project tracking. Manage tasks efficiently with our intuitive interface.',
    url: 'https://task-management-chi-jade.vercel.app',
    siteName: 'WAY2B1 Task Management',
    images: [
      {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=',
        width: 1,
        height: 1,
        alt: 'Gray background',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card meta tags
  twitter: {
    card: 'summary',
    title: 'WAY2B1 - Task Management & Kanban Board',
    description: 'Professional task management system with Kanban board, team collaboration, and project tracking. Manage tasks efficiently with our intuitive interface.',
    images: [
      {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=',
        width: 1,
        height: 1,
        alt: 'Gray background',
      }
    ],
    creator: '@WAY2B1',
  },
  
  // Additional meta tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  
  // Favicon
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta property="og:image" content="" />
        <meta name="twitter:image" content="" />
        <meta property="og:image:url" content="" />
        <meta property="og:image:secure_url" content="" />
        <meta name="twitter:image:src" content="" />
        <meta property="article:author" content="" />
        
        {/* Блокуємо превью зображення */}
        <meta property="og:image:width" content="0" />
        <meta property="og:image:height" content="0" />
        <meta name="twitter:image:alt" content="" />
        <meta property="og:image:alt" content="" />
        <meta property="og:image:type" content="" />
        <meta name="twitter:image:width" content="0" />
        <meta name="twitter:image:height" content="0" />
        <meta property="og:image:secure_url" content="" />
        <meta name="twitter:image:src" content="" />
        
        {/* Додаткові теги для повного блокування */}
        <meta property="og:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=" />
        <meta name="twitter:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=" />
        <meta property="og:image:url" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=" />
        
        {/* Додаємо сірий фон для превью */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 1200px) {
              body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #f5f5f5;
                z-index: -1;
              }
            }
          `
        }} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
