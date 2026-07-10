"use client";

type ToastLike = {
  id: string;
  kind: "success" | "error";
  message: string;
};

type ToastStackProps = {
  toasts: ToastLike[];
  onDismiss: (id: string) => void;
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => onDismiss(toast.id)}
          className={[
            "pointer-events-auto w-full rounded-2xl border px-4 py-3 text-left shadow-lg backdrop-blur transition duration-200 ease-out animate-[toast-enter_160ms_ease-out] hover:-translate-y-0.5",
            toast.kind === "success"
              ? "border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/90 dark:text-emerald-100"
              : "border-red-200 bg-red-50/95 text-red-900 dark:border-red-900/60 dark:bg-red-950/90 dark:text-red-100",
          ].join(" ")}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </button>
      ))}
    </div>
  );
}
