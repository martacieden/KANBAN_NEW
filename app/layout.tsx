import './globals.css'
import { Inter } from 'next/font/google'
import TopBar from "../components/topbar";
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import ReactPlugin from '@stagewise-plugins/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://task-management-chi-jade.vercel.app'),
  title: 'Task Management System - Kanban Board',
  description: 'Professional task management system with Kanban board view, task tracking, and team collaboration features.',
  keywords: 'task management, kanban board, project management, team collaboration, productivity',
  authors: [{ name: 'Task Management Team' }],
  creator: 'Task Management System',
  
  // Open Graph meta tags
  openGraph: {
    title: 'Task Management System - Kanban Board',
    description: 'Professional task management system with Kanban board view, task tracking, and team collaboration features.',
    url: 'https://task-management-chi-jade.vercel.app',
    siteName: 'Task Management System',
    images: [
      {
        url: '/kanban-preview.svg',
        width: 1200,
        height: 630,
        alt: 'Task Management Kanban Board Preview',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card meta tags
  twitter: {
    card: 'summary_large_image',
    title: 'Task Management System - Kanban Board',
    description: 'Professional task management system with Kanban board view, task tracking, and team collaboration features.',
    images: ['/kanban-preview.svg'],
    creator: '@taskmanagement',
  },
  
  // Additional meta tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
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
