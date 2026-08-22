
// The framing, for a reader whose Ottawa stops at the Greenbelt (FR-003).

export function Overview({ paragraphs }: { paragraphs: string[] }) {

  return (
    <section
      className="overview"
      data-testid="overview"
      data-revealed="hidden"
      aria-labelledby="overview-heading"
    >
      <h2 className="overview__heading" id="overview-heading">
        About this journey
      </h2>
      <div className="overview__prose">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
