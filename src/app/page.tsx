import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/issues?view=grouped-page&status=in-progress");
}
