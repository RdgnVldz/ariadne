export function LetterView({
  name,
  contact,
  body,
}: {
  name: string;
  contact: string[];
  body: string;
}) {
  return (
    <article className="mt-10 border border-ink/15 bg-white p-8 text-[15px] leading-relaxed text-black sm:p-10 print:mt-0 print:border-0 print:p-0 print:text-[11pt]">
      <header className="mb-6">
        <h2 className="text-xl font-bold">{name}</h2>
        {contact.length > 0 && (
          <p className="text-sm">{contact.join(" | ")}</p>
        )}
      </header>
      <div className="whitespace-pre-wrap">{body}</div>
    </article>
  );
}