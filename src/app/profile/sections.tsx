import Link from "next/link";
import { linkClass, secondaryButtonClass } from "@/components/form";
import type { education, project, skillGroup } from "@/db/schema";
import { formatMonth } from "@/lib/format";
import { deleteEducationAction, deleteProjectAction } from "./actions";
import { SkillsForm } from "./skills-form";

type EducationRow = typeof education.$inferSelect;
type SkillGroupRow = typeof skillGroup.$inferSelect;
type ProjectRow = typeof project.$inferSelect;

function dateRange(start: string | null, end: string | null) {
  if (start && end) return `${formatMonth(start)} to ${formatMonth(end)}`;
  if (end) return formatMonth(end);
  if (start) return `${formatMonth(start)} to Present`;
  return null;
}

export function EducationSection({ items }: { items: EducationRow[] }) {
  return (
    <section className="mt-16">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Education</h2>
        <Link href="/profile/education/new" className={secondaryButtonClass}>
          Add education
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 border-l-2 border-thread pl-6">
          <p className="max-w-md text-ink-soft">
            No education yet.{" "}
            <Link href="/profile/education/new" className={linkClass}>
              Add your degree
            </Link>{" "}
            so it appears on your resume.
          </p>
        </div>
      ) : (
        <ul className="mt-6">
          {items.map((e) => {
            const range = dateRange(e.startDate, e.endDate);
            return (
              <li
                key={e.id}
                className="flex flex-col gap-3 border-t border-ink/15 py-5 first:border-t-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <h3 className="font-semibold">
                    {e.degree}
                    {e.field ? `, ${e.field}` : ""}
                  </h3>
                  <p className="text-sm text-ink-soft">
                    {e.school}
                    {e.location ? `, ${e.location}` : ""}
                    {range ? `, ${range}` : ""}
                  </p>
                  {e.highlights.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft">
                      {e.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/profile/education/${e.id}`}
                    className={secondaryButtonClass}
                  >
                    Edit
                  </Link>
                  <form action={deleteEducationAction.bind(null, e.id)}>
                    <button className={secondaryButtonClass}>Delete</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function SkillsSection({ groups }: { groups: SkillGroupRow[] }) {
  const defaultValue = groups
    .map((g) => `${g.category}: ${g.items.join(", ")}`)
    .join("\n");

  return (
    <section className="mt-16">
      <h2 className="text-xl font-semibold tracking-tight">Skills</h2>
      <div className="mt-6">
        <SkillsForm defaultValue={defaultValue} />
      </div>
    </section>
  );
}

export function ProjectsSection({ items }: { items: ProjectRow[] }) {
  return (
    <section className="mt-16">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
        <Link href="/profile/projects/new" className={secondaryButtonClass}>
          Add project
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 border-l-2 border-thread pl-6">
          <p className="max-w-md text-ink-soft">
            No projects yet.{" "}
            <Link href="/profile/projects/new" className={linkClass}>
              Add a project you're proud of
            </Link>
            , with what you built and the tools you used.
          </p>
        </div>
      ) : (
        <ul className="mt-6">
          {items.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 border-t border-ink/15 py-5 first:border-t-0 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                {p.description && (
                  <p className="mt-1 max-w-xl text-sm text-ink-soft">
                    {p.description}
                  </p>
                )}
                {p.techStack.length > 0 && (
                  <p className="mt-1 text-sm text-ink-soft">
                    Built with {p.techStack.join(", ")}
                  </p>
                )}
                {(p.link || p.repoUrl) && (
                  <p className="mt-1 flex gap-4 text-sm">
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        Live site
                      </a>
                    )}
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        Repository
                      </a>
                    )}
                  </p>
                )}
                {p.highlights.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft">
                    {p.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/profile/projects/${p.id}`}
                  className={secondaryButtonClass}
                >
                  Edit
                </Link>
                <form action={deleteProjectAction.bind(null, p.id)}>
                  <button className={secondaryButtonClass}>Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}