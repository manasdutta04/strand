export interface WorkNFTCardData {
  client: string;
  amountUsdc: number;
  skills: string[];
  clientRating: number;
  completedAt: string;
  explorerUrl: string;
}

function truncateWallet(value: string): string {
  if (value.length < 10) {
    return value;
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function WorkNFTCard({ data }: { data: WorkNFTCardData }) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(data.completedAt));

  return (
    <article className="panel group p-4 transition-all duration-150 hover:bg-card-hover">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full border border-accent/40 px-2 py-1 text-xs text-accent">
          ${data.amountUsdc.toLocaleString()} USDC
        </span>
        <span className="text-xs text-muted">Client {truncateWallet(data.client)}</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {data.skills.map((skill) => (
          <span
            key={`${data.client}-${skill}`}
            className="rounded-full border border-accent/50 px-2 py-1 text-xs text-accent"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mb-2 flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <svg
            key={`${data.client}-star-${index}`}
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className={index < data.clientRating ? "fill-accent" : "fill-[#343434]"}
          >
            <path d="M12 2.4l2.8 5.68 6.27.91-4.54 4.43 1.07 6.23L12 16.72l-5.61 2.95 1.07-6.23L2.92 8.99l6.27-.91L12 2.4z" />
          </svg>
        ))}
      </div>

      <div className="mb-4 text-sm text-muted">{formattedDate}</div>

      <a
        href={data.explorerUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-accent transition-colors duration-150 hover:text-accent-dim"
      >
        View on Explorer ↗
      </a>
    </article>
  );
}

