import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {href && action ? (
        <Link className="text-link" href={href}>
          {action} <span aria-hidden="true">↗</span>
        </Link>
      ) : null}
    </div>
  );
}
