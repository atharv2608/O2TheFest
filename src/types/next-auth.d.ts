import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    firstName: string;
    lastName: string;
    role: string;
    committee?: string[] | null;
    canManageSuperUsers?: boolean;
    college?: string;
    userType: string;
  }

  interface Session {
    user: {
      _id?: string;
      firstName: string;
      lastName: string;
      role: string;
      committee?: string[] | null;
      canManageSuperUsers?: boolean;
      college?: string;
      userType: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    firstName: string;
    lastName: string;
    role: string;
    committee?: string[] | null;
    canManageSuperUsers?: boolean;
    college?: string;
    userType: string;
  }
}
