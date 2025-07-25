import './globals.css'
import { Inter } from 'next/font/google'
import TopBar from "../components/topbar";
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import ReactPlugin from '@stagewise-plugins/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'v0 App',
  description: 'Created with v0',
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
