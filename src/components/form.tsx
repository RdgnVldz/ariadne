export const linkClass =
  "font-medium text-thread-deep underline underline-offset-4 hover:text-ink";

export const secondaryButtonClass =
  "inline-flex h-9 items-center rounded-[5px] border border-ink/30 px-3 text-sm font-medium transition-colors hover:border-ink hover:bg-marble-deep";

const controlClass =
  "w-full rounded-[5px] border border-ink/25 bg-white px-3 text-base transition-colors hover:border-ink/50 focus:border-ink aria-[invalid=true]:border-fault";

type Common = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
};

function Note({
  name,
  hint,
  error,
}: {
  name: string;
  hint?: string;
  error?: string;
}) {
  if (!error && !hint) return null;
  return (
    <p
      id={`${name}-note`}
      className={`text-sm ${error ? "text-fault" : "text-ink-soft"}`}
    >
      {error ?? hint}
    </p>
  );
}

export function Field({
  label,
  name,
  hint,
  error,
  wrapperClassName = "",
  type = "text",
  ...props
}: Common & Omit<React.ComponentProps<"input">, "name">) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${name}-note` : undefined}
        className={`${controlClass} h-11`}
        {...props}
      />
      <Note name={name} hint={hint} error={error} />
    </div>
  );
}

export function TextArea({
  label,
  name,
  hint,
  error,
  wrapperClassName = "",
  rows = 5,
  ...props
}: Common & Omit<React.ComponentProps<"textarea">, "name">) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${name}-note` : undefined}
        className={`${controlClass} py-2 leading-relaxed`}
        {...props}
      />
      <Note name={name} hint={hint} error={error} />
    </div>
  );
}

export function Button({
  className = "",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={`h-11 rounded-[5px] bg-ink px-5 font-medium text-marble transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}