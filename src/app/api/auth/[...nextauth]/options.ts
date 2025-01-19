import dbConnect from "@/lib/dbConnect";
import ClModel from "@/models/cl.model";
import CollegeModel from "@/models/college.model";
import SuperUserModel from "@/models/superuser.model";
import VolunteerModel from "@/models/volunteer.model";
import { UserType } from "@/types";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
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
          if (credentials?.userType === (UserType.EXTERNAL as string)) {
            const college = await CollegeModel.findOne({
              ccode: credentials?.identifier,
            });
            if (!college) throw new Error("College not found");
            if (!college.isApproved) throw new Error("College not approved");

            const isPasswordCorrect = await college.isPasswordCorrect(
              credentials?.password as string
            );
            if (!isPasswordCorrect) throw new Error("Invalid credentials");

            const cl = await ClModel.findOne({ college: college._id }).lean();
            if (!cl) throw new Error("CL not found");

            return cl;
          } else {
            const superUser = await SuperUserModel.findOne({
              phone: credentials?.identifier,
            });

            if (superUser) {
              const isPasswordCorrect = await superUser.isPasswordCorrect(
                credentials?.password as string
              );
              if (isPasswordCorrect) return superUser;
              else throw new Error("Invalid credentials");
            }

            const volunteer = await VolunteerModel.findOne({
              phone: credentials?.identifier,
            });

            if (!volunteer) throw new Error("User not found");
            const isPasswordCorrect = await volunteer.isPasswordCorrect(
              credentials?.password as string
            );

            if (!isPasswordCorrect) throw new Error("Invalid credentials");

            if (!volunteer.approved)
              throw new Error("Account pending approval");

            return volunteer;
          }
        } catch (error: any) {
          console.error("Authentication error:", error);
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
        token.userType = user.userType;

        if (user.userType === UserType.EXTERNAL) {
          token.college = user.college;
        } else {
          token.committee = user.committee || null;
          token.canManageSuperUsers = user.canManageSuperUsers || false;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.userType = token.userType;

        if (token.userType === UserType.EXTERNAL) {
          session.user.college = token.college;
        } else {
          session.user.committee = token.committee || null;
          session.user.canManageSuperUsers = token.canManageSuperUsers || false;
        }
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
