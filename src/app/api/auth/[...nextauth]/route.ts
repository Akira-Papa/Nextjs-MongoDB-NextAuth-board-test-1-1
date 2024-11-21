import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please enter username and password');
        }
        
        await dbConnect();
        
        const user = await User.findOne({ username: credentials.username });
        if (!user) {
          throw new Error('No user found');
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.username,
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Ensure baseUrl is the Replit URL
      baseUrl = process.env.NEXTAUTH_URL || baseUrl;
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export { handler as GET, handler as POST };
