'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900">
              挨拶アプリ
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/board"
                  className="text-gray-700 hover:text-gray-900"
                >
                  掲示板
                </Link>
                <span className="text-gray-700">
                  {session.user?.name}さん
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: process.env.NEXTAUTH_URL || '/', redirect: true })}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-500"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
