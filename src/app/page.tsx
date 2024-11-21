'use client';

import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {session ? (
        <div className="text-center">
          <h1 className="text-4xl mb-4">こんばんは, {session.user?.name}!</h1>
          <p className="mb-4">ようこそ!</p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl mb-4">こんにちは!</h1>
          <p className="mb-4">ログインしてください</p>
        </div>
      )}
    </main>
  );
}
