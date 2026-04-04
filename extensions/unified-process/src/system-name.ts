const MINOR_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'by',
  'com',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'for',
  'in',
  'na',
  'nas',
  'no',
  'nos',
  'of',
  'on',
  'para',
  'por',
  'sem',
  'the',
  'to',
  'um',
  'uma',
  'with',
]);

const REQUEST_PREFIX_PATTERNS = [
  /^\/up\b[:\s-]*/i,
  /^(?:por favor[,:\s]*)?(?:desenvolva|crie|construa|projete|implemente|gere|monte|faça|elabore|desenhe|produza)\s+/i,
  /^(?:please\s+)?(?:develop|create|build|design|implement|generate|make|draft)\s+/i,
  /^(?:eu\s+)?(?:quero|preciso|gostaria)\s+(?:de\s+)?/i,
  /^i\s+(?:need|want)\s+/i,
  /^(?:me\s+ajude\s+a|help\s+me\s+to)\s+/i,
];

const SYSTEM_TYPE_LABELS = new Map<string, string>([
  ['app', 'App'],
  ['application', 'Application'],
  ['aplicação', 'Aplicação'],
  ['aplicativo', 'Aplicativo'],
  ['dashboard', 'Dashboard'],
  ['painel', 'Painel'],
  ['platform', 'Platform'],
  ['plataforma', 'Plataforma'],
  ['portal', 'Portal'],
  ['site', 'Site'],
  ['software', 'Software'],
  ['system', 'System'],
  ['sistema', 'Sistema'],
]);

const SYSTEM_TYPE_PATTERN =
  /^(?:(?:um|uma|an?|the)\s+)?(?<type>sistema|plataforma|aplicativo|aplicação|software|portal|painel|dashboard|site|system|platform|app|application)\s+(?<link>de|do|da|dos|das|para|for)\s+(?<subject>.+)$/i;

const BOUNDARY_PATTERNS = [
  /\s+(?:que|onde|capaz de|permitindo|deve(?:rá)?|precisa(?:rá)?|incluindo|com foco em|para que)\b/i,
  /\s+(?:that|which|allow(?:s|ing)?|should|must|including|focused on)\b/i,
];

export function normalizeVisionText(raw: string): string {
  return String(raw ?? '')
    .replace(/\r\n/g, '\n')
    .trim()
    .replace(/^\/up\b[:\s-]*/i, '')
    .replace(/^["'“”‘’`]+|["'“”‘’`]+$/g, '')
    .trim();
}

export function deriveSystemNameFromVision(vision: string): string {
  const normalizedVision = normalizeVisionText(vision);
  if (!normalizedVision) return 'Unnamed System';

  let candidate = extractCandidateClause(normalizedVision);
  const explicitTypeMatch = candidate.match(SYSTEM_TYPE_PATTERN);

  if (explicitTypeMatch?.groups?.type && explicitTypeMatch.groups.subject) {
    const type = normalizeSystemType(explicitTypeMatch.groups.type);
    const subject = stripLeadingArticle(stripTrailingNoise(explicitTypeMatch.groups.subject));
    candidate = `${type} ${explicitTypeMatch.groups.link.toLowerCase()} ${subject}`;
  }

  return finalizeSystemName(candidate);
}

function extractCandidateClause(vision: string): string {
  let text = flattenWhitespace(vision);

  for (const pattern of REQUEST_PREFIX_PATTERNS) {
    text = text.replace(pattern, '');
  }

  const firstSentence = text.split(/(?:[.!?;]+|\n+)/)[0]?.trim() || text;

  for (const pattern of BOUNDARY_PATTERNS) {
    const match = pattern.exec(firstSentence);
    if (match?.index && match.index > 0) {
      return firstSentence.slice(0, match.index).trim();
    }
  }

  return firstSentence;
}

function finalizeSystemName(candidate: string): string {
  const compact = stripLeadingArticle(stripTrailingNoise(flattenWhitespace(candidate)));
  if (!compact) return 'Unnamed System';

  const words = compact.split(' ');
  const limited = words.length > 14 ? words.slice(0, 14).join(' ') : compact;
  return smartTitleCase(limited);
}

function normalizeSystemType(type: string): string {
  const normalized = normalizeWord(type);
  return SYSTEM_TYPE_LABELS.get(normalized) ?? smartTitleCase(type);
}

function stripLeadingArticle(text: string): string {
  return text.replace(/^(?:um|uma|an?|the)\s+/i, '').trim();
}

function stripTrailingNoise(text: string): string {
  return text.replace(/[\s,;:.\-–—]+$/g, '').trim();
}

function flattenWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function smartTitleCase(text: string): string {
  return text
    .split(/\s+/)
    .map((word, index) => {
      if (/^[A-Z0-9]{2,}$/.test(word)) return word;

      const normalized = normalizeWord(word);
      const lower = word.toLocaleLowerCase('pt-BR');
      if (index > 0 && MINOR_WORDS.has(normalized)) return lower;
      return capitalizeWord(lower);
    })
    .join(' ');
}

function capitalizeWord(word: string): string {
  return word
    .split('-')
    .map((segment) =>
      segment ? segment[0].toLocaleUpperCase('pt-BR') + segment.slice(1) : segment
    )
    .join('-');
}

function normalizeWord(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}
