/**
 * Detects severity of harassment from report text.
 * Used to trigger academic accommodation notifications for higher severity.
 */
const SEVERITY_KEYWORDS = {
  critical: [
    'rape', 'assault', 'physical', 'violence', 'forced', 'threatened', 'weapon',
    'attack', 'serious injury', 'hospital', 'trauma', 'suicidal', 'fear for life'
  ],
  high: [
    'touched', 'groping', 'unwanted contact', 'stalking', 'repeated', 'retaliation',
    'blackmail', 'coercion', 'power', 'authority', 'grades', 'expulsion', 'failed'
  ],
  medium: [
    'comments', 'jokes', 'lewd', 'suggestive', 'proposition', 'advances',
    'unwanted', 'uncomfortable', 'repeated', 'persistent'
  ],
  low: [
    'stare', 'look', 'comment', 'once', 'single incident'
  ]
};

function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function detectSeverity(text) {
  const normalized = normalizeText(text);
  if (!normalized) return 'low';

  let score = { critical: 0, high: 0, medium: 0, low: 0 };

  for (const [level, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) score[level]++;
    }
  }

  if (score.critical >= 1) return 'critical';
  if (score.high >= 2 || score.high >= 1 && score.medium >= 1) return 'high';
  if (score.high >= 1 || score.medium >= 2) return 'high';
  if (score.medium >= 1 || score.low >= 2) return 'medium';
  return 'low';
}

function needsAcademicAccommodation(severity) {
  return ['high', 'critical'].includes(severity);
}

module.exports = { detectSeverity, needsAcademicAccommodation };
