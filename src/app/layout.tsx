import { Noto_Sans_JP } from 'next/font/google';
import { NextAuthProvider } from './providers';
import Header from './components/Header';
import './globals.css';

const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['400', '700']
});

export const metadata = {
  title: 'Japanese Greetings App',
  description: 'A simple app showing different Japanese greetings based on login status',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={notoSansJP.className}>
        <NextAuthProvider>
          <Header />
          <main>{children}</main>
        </NextAuthProvider>
      </body>
    </html>
  );
}
