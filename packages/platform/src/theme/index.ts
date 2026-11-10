export interface BrandingTokens {
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  logoUrl?: string | null;
}

export const DEFAULT_BRANDING: BrandingTokens = {
  primaryColor: "#0f4c81",
  accentColor: "#1a7a4c",
  surfaceColor: "#f5f7fa",
  logoUrl: null,
};

/**
 * Map org branding to CSS custom properties for the shell + future exports.
 */
export function brandingToCssVars(
  branding: BrandingTokens = DEFAULT_BRANDING,
): Record<string, string> {
  return {
    "--color-primary": branding.primaryColor,
    "--color-accent": branding.accentColor,
    "--color-surface": branding.surfaceColor,
    "--color-on-primary": "#ffffff",
    "--color-text": "#12263a",
    "--color-muted": "#5b6b7c",
    "--color-border": "#d7dee7",
  };
}

export function cssVarsToInlineStyle(
  vars: Record<string, string>,
): React.CSSProperties {
  return vars as unknown as React.CSSProperties;
}

// Minimal React types without depending on React in this package
declare namespace React {
  type CSSProperties = Record<string, string>;
}
