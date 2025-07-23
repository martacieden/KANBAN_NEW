import './globals.css'
import { Inter } from 'next/font/google'
import TopBar from "../components/topbar";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'v0 App',
  description: 'Created with v0',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
