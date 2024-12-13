import dbConnect from "@/lib/dbConnect";
import SuperUserModel, { SuperUser } from "@/models/superUser.model";
import VolunteerModel from "@/models/volunteer.model";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const internalUserAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },

      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          
          //TODO: implement external login logic
          const superUser = await SuperUserModel.findOne({
            phone: credentials?.identifier,
          });

          if (superUser) {
            const isPasswordCorrect = await superUser.isPasswordCorrect(
              credentials?.password
            );
            if (isPasswordCorrect) return superUser;
            else throw new Error("Invalid credentials");
          }

          const volunteer = await VolunteerModel.findOne({
            phone: credentials?.identifier,
          });

          if (!volunteer) throw new Error("User not found");
          const isPasswordCorrect = await volunteer.isPasswordCorrect(
            credentials?.password
          );

          if (!isPasswordCorrect) throw new Error("Invalid credentials");

          if (!volunteer.approved) throw new Error("Account pending approval");

          return volunteer;
        } catch (error: any) {
          console.error('Authentication error:', error);
          throw new Error(error);
        }
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl) || url === "/sign-in") {
        return url;
      }
      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.name = `${user.firstName} ${user.lastName}`;
        token.role = user.role;
        token.committee = user.committee || null;
        token.canManageSuperUsers = user.canManageSuperUsers || false;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.committee = token.committee || null;
        session.user.canManageSuperUsers = token.canManageSuperUsers || false;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
