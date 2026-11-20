export const linkClass =
  "font-medium text-thread-deep underline underline-offset-4 hover:text-ink";

type FieldProps = Omit<React.ComponentProps<"input">, "name"> & {
  label: string;
  name: string;
  hint?: string;
};

export function Field({ label, name, hint, type = "text", ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        aria-describedby={hint ? `${name}-hint` : undefined}
        className="h-11 rounded-[5px] border border-ink/25 bg-white px-3 text-base transition-colors hover:border-ink/50 focus:border-ink"
        {...props}
      />
      {hint && (
        <p id={`${name}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
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