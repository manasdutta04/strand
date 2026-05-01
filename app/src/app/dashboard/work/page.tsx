import { redirect } from "next/navigation";

export default function LegacyWorkRedirect() {
  redirect("/worker/work");
}
