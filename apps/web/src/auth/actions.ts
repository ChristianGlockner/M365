"use server";

import { signIn, signOut, isDemoAuthEnabled } from "@/auth/config";

export async function demoSignIn(formData: FormData) {
  if (!isDemoAuthEnabled) {
    throw new Error("Demo auth disabled");
  }
  const locale = (formData.get("locale") as string) || "de";
  const name = (formData.get("name") as string) || "Demo Analyst";
  await signIn("demo", {
    name,
    redirectTo: `/${locale}/tenants`,
  });
}

export async function entraSignIn(formData: FormData) {
  const locale = (formData.get("locale") as string) || "de";
  await signIn("microsoft-entra-id", {
    redirectTo: `/${locale}/tenants`,
  });
}

export async function appSignOut(formData: FormData) {
  const locale = (formData.get("locale") as string) || "de";
  await signOut({ redirectTo: `/${locale}` });
}
