import { notFound } from "next/navigation";
import LoginClient from "./LoginClient";
import { isUserRole } from "../../../lib/roles";

export default function RoleLoginPage({ params }: { params: { role: string } }) {
  if (!isUserRole(params.role)) {
    notFound();
  }

  return <LoginClient role={params.role} />;
}
