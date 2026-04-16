import Link from "next/link";
import {
  Tag,
  Percent,
  Gift,
  Clock,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

type PromoCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const promotions: PromoCard[] = [
  {
    id: "discount",
    title: "Discounts",
    description: "Create % based or fixed price discounts.",
    href: "/worker/promo/discounts",
    icon: Percent,
  },
  {
    id: "announcements",
    title: "Announcements",
    description: "Broadcast promotions to TV screens and users.",
    href: "/worker/promo/announcements",
    icon: Megaphone,
  },
];

export default function PromotionsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex items-center gap-3">
        <Tag className="h-10 w-10 text-pink-500" />
        <h1 className="text-2xl font-semibold text-foreground">
          Promotions
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {promotions.map((promo) => {
          const Icon = promo.icon;

          return (
            <div
              key={promo.id}
              className="rounded-xl border bg-card p-5 shadow-sm transition hover:border-pink-400/40"
            >
              <div className="mb-4 flex items-start">
                <Icon className="h-8 w-8 text-pink-500" />
              </div>

              <h2 className="mb-2 text-lg font-semibold text-card-foreground">
                {promo.title}
              </h2>

              <p className="mb-5 text-sm text-muted-foreground">
                {promo.description}
              </p>

              <Link
                href={promo.href}
                className="inline-flex items-center gap-2 rounded-md bg-pink-600 px-3 py-2 text-sm font-medium text-white hover:bg-pink-700"
              >
                <Tag className="h-4 w-4" />
                Manage
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}