import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/user-auth";
import { getDb } from "../../lib/db";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const db = await getDb();
  const [diagnoses] = await db.execute(
    "SELECT id, score, label, title, created_at FROM user_diagnoses WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
    [user.id]
  );

  return <AccountClient user={user} diagnoses={diagnoses} />;
}
