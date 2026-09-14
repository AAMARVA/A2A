export function cleanMkDocsMarkdown(raw: string): string {
  if (!raw) return '';

  // Strip YAML frontmatter
  let text = raw.replace(/^---[\s\S]*?---\n*/m, '');

  // Strip html comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Convert MkDocs admonitions:
  // !!! note "Title"
  //     body text
  text = text.replace(/!!!\s+([a-zA-Z0-9_-]+)(?:\s+"([^"]*)")?\n((?:(?:    |\t).*\n?)+)/g, (match, type, title, body) => {
    const unindented = body.replace(/^(?:    |\t)/gm, '');
    const displayTitle = title || (type.charAt(0).toUpperCase() + type.slice(1));
    return `> **${displayTitle}** (${type})\n>\n` + unindented.split('\n').map((l: string) => `> ${l}`).join('\n') + '\n\n';
  });

  // Convert MkDocs button and class attributes like {: .md-button } or {class="twemoji lg middle"} or { width="70%" style="..." }
  text = text.replace(/\{:[^}]+\}/g, '');
  text = text.replace(/\{[ \t]*(?:width|style|class|id|align)=[^}\n]*\}/gi, '');
  text = text.replace(/\{class="[^"]*"[^}]*\}/g, '');
  text = text.replace(/\{[^}\n]*\.md-button[^}\n]*\}/g, '');
  text = text.replace(/\{[^}\n]*\.(?:lg|middle)[^}\n]*\}/g, '');

  // Remove material icon codes like :material-account-group-outline:{ .lg .middle }
  text = text.replace(/:material-[a-z0-9-]+:(?:\{[^}]*\})?/g, '•');

  // Fix image paths: ../assets/ or ./assets/ or assets/ to /assets/
  text = text.replace(/\]\((?:\.\.\/|\.\/)?assets\//g, '](/assets/');
  text = text.replace(/src="(?:\.\.\/|\.\/)?assets\//g, 'src="/assets/');

  // Replace <div class="hero-tagline-carousel"...> or complex hero blocks with clean markdown if present
  text = text.replace(/<div class="hero-tagline-carousel"[\s\S]*?<\/div>\s*<\/div>/g, '');

  return text.trim();
}
