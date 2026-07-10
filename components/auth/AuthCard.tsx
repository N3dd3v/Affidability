import Link from "next/link";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  alternateLabel: string;
  alternateHref: string;
  alternateText: string;
  children: React.ReactNode;
};

export function AuthCard({
  eyebrow,
  title,
  description,
  alternateLabel,
  alternateHref,
  alternateText,
  children,
}: AuthCardProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-6xl items-center px-4 py-10 sm:px-6">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.88fr)] lg:items-center">
        <section className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-none tracking-tight text-neutral-950 dark:text-neutral-50">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
            {description}
          </p>
        </section>

        <section className="rounded-4xl border border-black/10 bg-white/88 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] backdrop-blur dark:border-white/10 dark:bg-neutral-950/82 sm:p-8">
          {children}
          <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
            {alternateLabel}{" "}
            <Link
              href={alternateHref}
              className="font-medium text-neutral-900 underline decoration-black/20 underline-offset-4 transition hover:decoration-black/50 dark:text-neutral-100 dark:decoration-white/20 dark:hover:decoration-white/50"
            >
              {alternateText}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
