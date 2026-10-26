const URL_RE = /(https?:\/\/[^\s]+)/g;

/** Texto de Facebook con sus saltos de línea y los enlaces convertidos en enlaces. */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className}>
      {text.split(URL_RE).map((part, i) =>
        i % 2 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="font-semibold break-all text-puno underline hover:text-puno-800"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </p>
  );
}
