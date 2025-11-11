import { redirect } from "next/navigation";

export default function PteIndex() {
  // Redirect base PTE route to the main dashboard
  redirect("/pte/dashboard");
}
