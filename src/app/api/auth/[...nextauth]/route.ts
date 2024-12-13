import NextAuth from "next-auth";
import { internalUserAuthOptions } from "./options";

const handler = NextAuth(internalUserAuthOptions)

export{handler as GET, handler as POST}