
/**
 * Simple route pattern matching utility.
 */

export function matchRoute(
  pathname: string,
  pattern: string,
): Record<string, string> | null {
  const patternParts = pattern.split("/");
  const pathParts = pathname.split("/");

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(":")) {
      const key = patternPart.slice(1);

      if (!key || !pathPart) {
        return null;
      }

      try {
        params[key] = decodeURIComponent(pathPart);
      } catch {
        return null;
      }
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}
