import { GITHUB_URL, NOTION_URL } from "@shared/constants";
import { GitHubIcon, NotionIcon } from "@shared/ui/icons";

export function ExternalLinks() {
  return (
    <>
      <a
        href={NOTION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-muted hover:text-text-primary transition-colors hover-scale"
        aria-label="Notion"
      >
        <NotionIcon />
      </a>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-muted hover:text-text-primary transition-colors hover-scale"
        aria-label="GitHub"
      >
        <GitHubIcon />
      </a>
    </>
  );
}
