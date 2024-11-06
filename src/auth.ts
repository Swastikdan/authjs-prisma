import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { ZodError } from 'zod';
import { signInSchema } from '@/lib/zod';
import { Account, Profile, User as NextAuthUser, Session } from 'next-auth';

// Extend the NextAuth Session and User interfaces to include additional fields
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
      role: string;
    } & NextAuthUser;
  }

  interface User {
    id?: string;
    role: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    GitHub,
    Google,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }

        // Validate the credentials using Zod schema
        const { email, password } = await signInSchema.parseAsync(credentials);

        try {
          // Find the user in the database
          const user = await prisma.user.findFirst({
            where: { email },
          });

          if (!user) {
            throw new Error('No user found.');
          }

          // Compare the provided password with the stored hashed password
          const isValid = await compare(
            password as string,
            user.password as string
          );

          if (!isValid) {
            throw new Error('Invalid password');
          }

          // Return the user object if the password is valid
          return user;
        } catch (error) {
          if (error instanceof ZodError) {
            // Return `null` to indicate that the credentials are invalid
            return null;
          }
          console.error(error);
          throw new Error('An error occurred during authentication.');
        }
      },
    }),
  ],
  callbacks: {
    // async signIn({
    //   account,
    //   profile,
    // }: {
    //   account: Account | null;
    //   profile?: Profile;
    // }) {
    //   if (account?.provider === 'google') {
    //     return (
    //       (profile?.email_verified &&
    //         profile.email?.endsWith('@example.com')) ||
    //       false
    //     );
    //   }
    //   return true; // Do different verification for other providers that don't have `email_verified`
    // },
    async session({ session, token }: { session: Session; token: any }) {
      // Attach user ID and role to the session object
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.image = token.image as string;
      session.user.role = token.role as string;
      return session;
    },
    async jwt({ token, user }: { token: any; user?: NextAuthUser }) {
      // Find the user in the database and attach user ID and role to the token
      const dbUser = await prisma.user.findFirst({
        where: { email: token.email as string },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });

      if (!dbUser) {
        token.id = user!.id;
        return token;
      }
      token.id = dbUser.id;
      token.name = dbUser.name;
      token.email = dbUser.email;
      token.image = dbUser.image;
      token.role = dbUser.role;
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  // pages: {
  //   signIn: '/login',
  //   signOut: '/',
  //   error: '/login',
  // },
});
