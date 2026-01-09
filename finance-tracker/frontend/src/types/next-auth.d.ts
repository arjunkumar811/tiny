import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    } & DefaultSession["user"];
    accessToken: string;
    organizationId: string;
    organizationName: string;
  }

  interface User extends DefaultUser {
    token: string;
    organizationId: string;
    organizationName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    organizationId: string;
    organizationName: string;
  }
}
