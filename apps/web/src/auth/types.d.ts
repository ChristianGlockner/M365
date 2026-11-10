import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    organizationId: string | null;
    entraOid: string | null;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    organizationId?: string | null;
    entraOid?: string;
  }
}
