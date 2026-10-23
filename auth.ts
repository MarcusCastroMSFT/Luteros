import NextAuth, { CredentialsSignin } from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, accounts, sessions, verificationTokens } from '@/lib/db/schema'
import { applyStoredSessionImage } from '@/lib/auth-session'

// Account exists but has no password (created with Google, or its unverified password was
// dropped when Google was linked). The login form explains how to get in instead of
// reporting a wrong password. The code ends up in the URL, so it carries no details.
class PasswordNotSetError extends CredentialsSignin {
  code = 'password_not_set'
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: 'jwt',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Google only returns verified addresses, so a Google sign-in may attach to an existing
      // account with the same e-mail. The linkAccount event below closes the pre-registration hole.
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const normalizedEmail = String(credentials.email).trim().toLowerCase()

        const user = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            image: users.image,
            role: users.role,
            displayName: users.displayName,
            password: users.password,
          })
          .from(users)
          .where(sql`lower(${users.email}) = ${normalizedEmail}`)
          .limit(1)
          .then((r) => r[0] ?? null)

        if (!user) return null
        if (!user.password) throw new PasswordNotSetError()

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!isValid) return null

        // Never pass the password hash into the NextAuth user object / JWT
        const { password: _pw, ...safeUser } = user
        return safeUser
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        if (!user.id) throw new Error('Authenticated user is missing an id')
        token.id = user.id
        token.role = (user as typeof users.$inferSelect).role
        token.displayName = (user as typeof users.$inferSelect).displayName
        token.image = user.image
      }
      if (trigger === 'update' && token.id) {
        const storedUser = await db
          .select({ image: users.image })
          .from(users)
          .where(sql`${users.id} = ${token.id as string}`)
          .limit(1)
          .then((rows) => rows[0])

        return applyStoredSessionImage(token, storedUser?.image)
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.displayName = token.displayName as string | null
        session.user.image = token.image as string | null
      }
      return session
    },
  },
  events: {
    // Password sign-up does not verify the e-mail. If the account was never verified, whoever
    // created it may not own the address, so Google proves ownership and the old password is dropped
    // (the real owner can set a new one with "Esqueci minha senha").
    async linkAccount({ user }) {
      if (!user.id) return
      await db
        .update(users)
        .set({ emailVerified: new Date(), password: null, updatedAt: new Date() })
        .where(and(eq(users.id, user.id), isNull(users.emailVerified)))
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
})
