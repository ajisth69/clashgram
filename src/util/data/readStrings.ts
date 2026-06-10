import { DEBUG } from '../../config';

export default function readStrings(data: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /"((?:[^"\\]|\\.)*)"\s*=\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = regex.exec(data)) !== null) {
    const key = match[1];
    let val = match[2];

    if (result[key]) {
      // eslint-disable-next-line no-console
      console.warn('Duplicate key:', key);
    }

    try {
      val = JSON.parse(`"${val}"`);
    } catch (e) {}

    result[key] = val;
  }
  return result;
}
