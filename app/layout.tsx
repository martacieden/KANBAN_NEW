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
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        width: 1200,
        height: 630,
        alt: 'Beautiful mountain landscape',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card meta tags
  twitter: {
    card: 'summary_large_image',
    title: 'WAY2B1 - Task Management & Kanban Board',
    description: 'Professional task management system with Kanban board, team collaboration, and project tracking. Manage tasks efficiently with our intuitive interface.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        width: 1200,
        height: 630,
        alt: 'Beautiful mountain landscape',
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
        <meta property="og:image" content="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" />
        <meta property="og:image:url" content="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" />
        <meta property="og:image:secure_url" content="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" />
        <meta name="twitter:image:src" content="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" />
        <meta property="article:author" content="WAY2B1" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image:alt" content="Beautiful mountain landscape" />
        <meta property="og:image:alt" content="Beautiful mountain landscape" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
