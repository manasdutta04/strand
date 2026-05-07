export type UserRole = "worker" | "client" | "partner";

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
    description: "Track verified earnings, portable reputation, and credit access.",
    dashboardPath: "/worker/dashboard"
  },
  client: {
    role: "client",
    label: "Partner",
    description: "Review worker signals, verify submissions, and integrate with Strand.",
    dashboardPath: "/client/dashboard"
  },
  partner: {
    role: "partner",
    label: "Partner",
    description: "Underwrite credit lines from on-chain work signals.",
    dashboardPath: "/partner/dashboard"
  }
};

export function isUserRole(value: string): value is UserRole {
  return value === "worker" || value === "client" || value === "partner";
}
