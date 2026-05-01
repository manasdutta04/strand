export type UserRole = "worker" | "client" | "lender";

export interface RoleMeta {
  role: UserRole;
  label: string;
  description: string;
  dashboardPath: string;
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  worker: {
    role: "worker",
    label: "Worker",
    description: "Track completed jobs, skill attestations, and score growth.",
    dashboardPath: "/worker/dashboard"
  },
  client: {
    role: "client",
    label: "Client",
    description: "Post jobs, fund escrow, and manage freelancer payouts.",
    dashboardPath: "/client/dashboard"
  },
  lender: {
    role: "lender",
    label: "Lender",
    description: "Underwrite credit lines using on-chain Strand score signals.",
    dashboardPath: "/lender/dashboard"
  }
};

export function isUserRole(value: string): value is UserRole {
  return value === "worker" || value === "client" || value === "lender";
}
