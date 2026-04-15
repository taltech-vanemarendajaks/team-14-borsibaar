import Link from "next/link";
import { Gamepad2, Play, Tv, Zap, HelpCircle, type LucideIcon } from "lucide-react";

type GameCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const games: GameCard[] = [
  {
    id: "tv-dashboard",
    title: "Börsibaar",
    description: "Live pricing board for screens around the bar.",
    href: "/worker/games/stock-market-bar",
    icon: Tv,
  },
  {
    id: "reaction-rush",
    title: "Reaction Rush",
    description: "Simple reaction game mock for party rounds.",
    href: "/worker/games/reaction-rush",
    icon: Zap,
  },
  {
    id: "guess-the-price",
    title: "Guess The Price",
    description: "Mock game where teams guess current drink prices.",
    href: "/worker/games/guess-the-price",
    icon: HelpCircle,
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex items-center gap-3">
        <Gamepad2 className="h-10 w-10 text-pink-500" />
        <h1 className="text-2xl font-semibold text-foreground">Games</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => {
          const Icon = game.icon;

          return (
            <div
              key={game.id}
              className="rounded-xl border bg-card p-5 shadow-sm transition hover:border-pink-400/40"
            >
              <div className="mb-4 flex items-start">
                <Icon className="h-8 w-8 text-pink-500" />
              </div>

              <h2 className="mb-2 text-lg font-semibold text-card-foreground">{game.title}</h2>
              <p className="mb-5 text-sm text-muted-foreground">{game.description}</p>

              <Link
                href={game.href}
                className="inline-flex items-center gap-2 rounded-md bg-pink-600 px-3 py-2 text-sm font-medium text-white hover:bg-pink-700"
              >
                <Play className="h-4 w-4" />
                Start game
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}


