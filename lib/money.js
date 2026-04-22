const NUMBER_CAPTURE = /([0-9]+(?:\.[0-9]+)?)/g;

function normalizeMoneyText(text) {
  return text.replace(/,/g, '').replace(/\$/g, '');
}

/** Last currency-like number in the string (e.g. row ending with balance). */
export function parseLastDollarAmount(text) {
  if (text == null) throw new Error('text is null');
  const normalized = normalizeMoneyText(text);
  let last = null;
  const re = new RegExp(NUMBER_CAPTURE.source, 'g');
  let match;
  while ((match = re.exec(normalized)) !== null) {
    last = parseFloat(match[1]);
  }
  if (last === null) throw new Error(`No number found in: ${text}`);
  return last;
}
