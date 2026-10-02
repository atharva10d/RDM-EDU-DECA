/** Standard NTA assertion–reason choices when the bank stored only A/B/C/D. */
const AR_BY_LETTER: Record<"A" | "B" | "C" | "D", string> = {
  A: "Both Assertion and Reason are true, and Reason is the correct explanation of Assertion.",
  B: "Both Assertion and Reason are true, but Reason is not the correct explanation of Assertion.",
  C: "Assertion is true, but Reason is false.",
  D: "Assertion is false, but Reason is true.",
};

export function isAssertionReasonStem(stem: string): boolean {
  return /\bassertion\b/i.test(stem) && /\breason\b/i.test(stem);
}

export function optionChoiceLetter(raw: string): "A" | "B" | "C" | "D" | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/^[\(\[]?([A-Da-d])[\)\]\.\:\-]?\s*$/);
  if (!match) return null;
  return match[1]!.toUpperCase() as "A" | "B" | "C" | "D";
}

function isShuffledLetterKey(options: string[]): boolean {
  if (options.length !== 4) return false;
  const letters = options.map(optionChoiceLetter);
  if (letters.some((letter) => letter == null)) return false;
  return new Set(letters).size === 4;
}

/** Keep correctIndex; replace letter-only AR options with the full statements. */
export function displayChallengeOptions(stem: string, options: string[]): string[] {
  if (!isAssertionReasonStem(stem) || !isShuffledLetterKey(options)) return options;
  return options.map((option) => AR_BY_LETTER[optionChoiceLetter(option)!]);
}
