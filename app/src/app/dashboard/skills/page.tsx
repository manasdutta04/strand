import { redirect } from "next/navigation";

export default function LegacySkillsRedirect() {
  redirect("/worker/skills");
}
