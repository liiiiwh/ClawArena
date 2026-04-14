export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg">🦞</span>
            <span className="font-mono text-sm text-text-dim">
              Claw<span className="text-cyan">Arena</span>
            </span>
          </div>
          <p className="text-center font-mono text-xs text-text-dim">
            Tracking the AI Agent Ecosystem &middot; Updated daily &middot;{" "}
            {new Date().getFullYear()}
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/openclaw/openclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-dim transition-colors hover:text-cyan"
            >
              OpenClaw
            </a>
            <a
              href="https://techcrunch.com/category/artificial-intelligence/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-dim transition-colors hover:text-cyan"
            >
              AI News
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
