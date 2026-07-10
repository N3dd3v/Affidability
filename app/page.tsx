import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Clock3,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

const featureCards = [
  {
    title: "Find your people",
    copy: "Search by @username, send requests, and keep relationship states clean and obvious.",
    icon: Search,
  },
  {
    title: "Shape your week",
    copy: "Mark the windows that usually work so planning feels light instead of exhausting.",
    icon: CalendarClock,
  },
  {
    title: "Move faster together",
    copy: "Spot overlap quickly and turn vague scheduling talk into momentum.",
    icon: Users,
  },
];

const stats = [
  { label: "Friend requests", value: "Fast" },
  { label: "Availability view", value: "Weekly" },
  { label: "Planning tone", value: "Calm" },
];

// Renders the marketing landing page by mapping static content arrays into cards,
// which keeps the visual sections consistent without repeating markup.
export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-136 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_58%)]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 py-10 sm:px-6 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Social Availability
            </div>
            <h1 className="mt-6 font-serif text-[3.6rem] leading-[0.92] tracking-[-0.04em] text-neutral-950 dark:text-neutral-50 sm:text-[4.8rem]">
              A softer way to ask, &quot;When are we free?&quot;
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">
              Build your social graph, share your weekly rhythm, and replace messy
              scheduling threads with one calm, visual place to plan.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/friends"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
              >
                Open friends
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/availability"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-6 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-white/70 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/5"
              >
                View availability
              </Link>
            </div>
          </div>

          <div className="rounded-4xl border border-black/10 bg-white/80 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.75)] backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {/* Stats are rendered from data so the summary card stays easy to edit
                  without touching the presentation structure. */}
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-3xl border border-black/10 bg-neutral-50/90 p-4 dark:border-white/10 dark:bg-white/4"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                    {stat.label}
                  </p>
                  <p className="mt-3 font-serif text-3xl text-neutral-950 dark:text-neutral-50">
                    {stat.value}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-5 rounded-3xl bg-emerald-500/10 p-5 dark:bg-emerald-400/10">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-900 dark:text-emerald-200">
                <Clock3 className="h-4 w-4" />
                Designed for quick coordination
              </div>
              <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                The interface stays quiet, readable, and social-first so the product
                feels like momentum, not admin.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {featureCards.map((card) => {
            // Each feature selects its icon component dynamically from the config
            // object, then renders a matching title/copy block with the same layout.
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-4xl border border-black/10 bg-white/80 p-6 shadow-[0_26px_70px_-50px_rgba(15,23,42,0.8)] backdrop-blur dark:border-white/10 dark:bg-neutral-950/75"
              >
                <span className="inline-flex rounded-full bg-neutral-100 p-3 dark:bg-white/5">
                  <Icon className="h-5 w-5 text-neutral-800 dark:text-neutral-100" />
                </span>
                <h2 className="mt-5 font-serif text-3xl text-neutral-950 dark:text-neutral-50">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                  {card.copy}
                </p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 rounded-5xl border border-black/10 bg-neutral-950 px-6 py-8 text-white shadow-[0_32px_90px_-55px_rgba(15,23,42,1)] dark:border-white/10 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              How it flows
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-white">
              Add people, mark your week, meet without the back-and-forth.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Search and add the people you actually plan with.",
              "Publish the windows that feel realistic for your week.",
              "Use overlap cues to move from chat to actual plans.",
            ].map((step, index) => (
              <article
                key={step}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
                  Step {index + 1}
                </p>
                <p className="mt-3 text-sm leading-7 text-neutral-200">{step}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
