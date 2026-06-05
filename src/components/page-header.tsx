export function PageHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="container py-8 md:py-12">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
        {description}
      </p>
    </section>
  );
}
