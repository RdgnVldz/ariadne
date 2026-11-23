import { HEADINGS, type ResumeDoc } from "@/lib/resume";
import { PrintFrame } from "./print-frame";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h3 className="border-b border-black/30 pb-1 text-base font-semibold">
        {title}
      </h3>
      <div className="mt-2 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-1 list-disc pl-5">
      {items.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}

export function ResumeView({ doc }: { doc: ResumeDoc }) {
  return (
    <PrintFrame>
      <article className="mt-10 border border-ink/15 bg-white p-8 text-[15px] leading-snug text-black sm:p-10 print:mt-0 print:border-0 print:p-0 print:text-[10.5pt]">
        <header>
          <h2 className="text-2xl font-bold">{doc.name}</h2>
          {doc.headline && <p className="mt-0.5">{doc.headline}</p>}
          {doc.contact.length > 0 && (
            <p className="mt-1 text-sm">{doc.contact.join(" | ")}</p>
          )}
        </header>

        {doc.summary && (
          <Section title={HEADINGS.summary}>
            <p>{doc.summary}</p>
          </Section>
        )}

        {doc.experiences.length > 0 && (
          <Section title={HEADINGS.experience}>
            {doc.experiences.map((e, i) => (
              <div key={i}>
                <h4 className="font-semibold">
                  {e.title}, {e.company}
                </h4>
                <p className="text-sm">
                  {e.dates}
                  {e.location ? `, ${e.location}` : ""}
                </p>
                <Bullets items={e.bullets} />
              </div>
            ))}
          </Section>
        )}

        {doc.projects.length > 0 && (
          <Section title={HEADINGS.projects}>
            {doc.projects.map((p, i) => (
              <div key={i}>
                <h4 className="font-semibold">{p.name}</h4>
                {p.description && <p>{p.description}</p>}
                {p.tech.length > 0 && (
                  <p className="text-sm">Tech: {p.tech.join(", ")}</p>
                )}
                {p.links.length > 0 && (
                  <p className="text-sm">{p.links.join(" | ")}</p>
                )}
                <Bullets items={p.bullets} />
              </div>
            ))}
          </Section>
        )}

        {doc.education.length > 0 && (
          <Section title={HEADINGS.education}>
            {doc.education.map((e, i) => (
              <div key={i}>
                <h4 className="font-semibold">{e.degree}</h4>
                <p className="text-sm">
                  {e.school}
                  {e.dates ? `, ${e.dates}` : ""}
                </p>
                <Bullets items={e.bullets} />
              </div>
            ))}
          </Section>
        )}

        {doc.skills.length > 0 && (
          <Section title={HEADINGS.skills}>
            <ul className="flex flex-col gap-1">
              {doc.skills.map((g, i) => (
                <li key={i}>
                  <span className="font-semibold">{g.category}:</span>{" "}
                  {g.items.join(", ")}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </article>
    </PrintFrame>
  );
}