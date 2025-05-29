export const forbiddenNamePattern = /[^a-z0-9._-]|^\.|\.$|\.\.|^[._-]+$/;

export function hasControlCharacters(str: string): boolean {
  for (let i = 0; i < str.length; i += 1) {
    const codePoint = str.codePointAt(i);

    if (typeof codePoint !== "number") {
      continue;
    } else if (codePoint < 0x20 || codePoint === 0x7f) {
      return true;
    } else if (codePoint >= 0x10000) {
      i += 1;
    }
  }

  return false;
}
