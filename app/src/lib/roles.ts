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
    description: "Track verified work, reputation, and credit access.",
    dashboardPath: "/worker/dashboard"
  },
  client: {
    role: "client",
    label: "Client",
    description: "Post work, manage escrow, and supervise delivery.",
    dashboardPath: "/client/dashboard"
  },
  lender: {
    role: "lender",
    label: "Lender",
    description: "Underwrite credit lines from on-chain work signals.",
    dashboardPath: "/lender/dashboard"
  }
};

export function isUserRole(value: string): value is UserRole {
  return value === "worker" || value === "client" || value === "lender";
}
