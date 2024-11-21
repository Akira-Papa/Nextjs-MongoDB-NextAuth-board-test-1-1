import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/app/lib/db';
import Post from '@/app/models/Post';
import User from '@/app/models/User';
import { handler as authOptions } from '../auth/[...nextauth]/route';

// Helper function to check authentication
async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }
  await dbConnect();
  const user = await User.findOne({ username: session.user?.name });
  return user;
}

// GET all posts
export async function GET() {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    await dbConnect();
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// CREATE new post
export async function POST(req: Request) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const { title, content } = await req.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      );
    }

    await dbConnect();
    const post = await Post.create({
      title,
      content,
      author: user._id,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: '投稿の作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT update post
export async function PUT(req: Request) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const { id, title, content } = await req.json();
    
    if (!id || !title || !content) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    await dbConnect();
    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }

    if (post.author.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: '編集権限がありません' },
        { status: 403 }
      );
    }

    post.title = title;
    post.content = content;
    post.updatedAt = new Date();
    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: '投稿の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE post
export async function DELETE(req: Request) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '投稿IDが必要です' },
        { status: 400 }
      );
    }

    await dbConnect();
    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }

    if (post.author.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: '削除権限がありません' },
        { status: 403 }
      );
    }

    await post.deleteOne();
    return NextResponse.json({ message: '投稿を削除しました' });
  } catch (error) {
    return NextResponse.json(
      { error: '投稿の削除に失敗しました' },
      { status: 500 }
    );
  }
}
