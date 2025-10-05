import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { backendUrl } from "@/utils/constants";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { user: me } = await getCurrentUser();
  if (!me) return <p className="p-6">Not authenticated.</p>;

  let orgName = "Unknown Organization";
  if (me.organizationId) {
    try {
      const res = await fetch(
        `${backendUrl}/api/organizations/${me.organizationId}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const org = await res.json();
        orgName = org.name;
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg bg-card p-6 shadow">
          <h1 className="text-3xl font-bold text-card-foreground mb-4">
            Welcome, {me.name || me.email}!
          </h1>
          <div className="space-y-2 text-muted-foreground mb-6">
            <p>
              <span className="font-medium text-card-foreground">Email:</span>{" "}
              {me.email}
            </p>
            <p>
              <span className="font-medium text-card-foreground">
                Organization:
              </span>{" "}
              {orgName}
            </p>
            <p>
              <span className="font-medium text-card-foreground">Role:</span>{" "}
              {me.role || "No role assigned"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/inventory"
              className="block p-4 bg-blue-100 dark:bg-blue-900 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Inventory Management
              </h3>
              <p className="text-blue-600 dark:text-blue-300 text-sm">
                Manage stock levels, add products, and track inventory changes
              </p>
            </a>

            <a
              href="/pos"
              className="block p-4 bg-green-100 dark:bg-green-900 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            >
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Point of Sales
              </h3>
              <p className="text-green-600 dark:text-green-300 text-sm">
                Process sales, manage cart, and handle customer transactions
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
