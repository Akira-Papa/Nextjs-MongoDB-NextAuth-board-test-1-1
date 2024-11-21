'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function Board() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchPosts();
    }
  }, [status, router]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) throw new Error('投稿の取得に失敗しました');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError('投稿の取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingPost ? '/api/posts' : '/api/posts';
      const method = editingPost ? 'PUT' : 'POST';
      const body = editingPost 
        ? JSON.stringify({ id: editingPost._id, title, content })
        : JSON.stringify({ title, content });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) throw new Error('投稿の保存に失敗しました');

      await fetchPosts();
      setTitle('');
      setContent('');
      setEditingPost(null);
    } catch (err) {
      setError('投稿の保存中にエラーが発生しました');
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この投稿を削除してもよろしいですか？')) return;

    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('投稿の削除に失敗しました');
      await fetchPosts();
    } catch (err) {
      setError('投稿の削除中にエラーが発生しました');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">掲示板</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="内容"
            className="w-full p-2 border rounded-md h-32"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
        >
          {editingPost ? '更新' : '投稿'}
        </button>
        {editingPost && (
          <button
            type="button"
            onClick={() => {
              setEditingPost(null);
              setTitle('');
              setContent('');
            }}
            className="ml-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500"
          >
            キャンセル
          </button>
        )}
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="border rounded-md p-4">
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="mb-2 whitespace-pre-wrap">{post.content}</p>
            <div className="text-sm text-gray-600">
              投稿者: {post.author.username} | 
              投稿日時: {new Date(post.createdAt).toLocaleString('ja-JP')}
            </div>
            {session?.user?.name === post.author.username && (
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-blue-600 hover:text-blue-500"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-red-600 hover:text-red-500"
                >
                  削除
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
