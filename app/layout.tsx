import './globals.css'
import { Inter } from 'next/font/google'
import TopBar from "../components/topbar";
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import ReactPlugin from '@stagewise-plugins/react';

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
    images: [],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card meta tags
  twitter: {
    card: 'summary',
    title: 'WAY2B1 - Task Management & Kanban Board',
    description: 'Professional task management system with Kanban board, team collaboration, and project tracking. Manage tasks efficiently with our intuitive interface.',
    images: [],
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
    <html lang="en">
      <head>
        <meta property="og:image" content="" />
        <meta name="twitter:image" content="" />
        <meta property="og:image:url" content="" />
        <meta property="og:image:secure_url" content="" />
        <meta name="twitter:image:src" content="" />
        <meta property="article:author" content="" />
      </head>
      <body className={inter.className}>
        {children}
        <StagewiseToolbar 
          config={{
            plugins: [ReactPlugin]
          }}
        />
      </body>
    </html>
  );
}
