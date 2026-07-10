function CenteredSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span
        aria-label="Loading"
        className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700 dark:border-neutral-700 dark:border-t-neutral-200"
      />
    </div>
  );
}

export default function Loading() {
  return <CenteredSpinner />;
}
