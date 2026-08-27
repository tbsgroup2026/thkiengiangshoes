/**
 * Detect placeholders formatted as {{placeholder_name}} in raw text or XML string
 */
export function extractPlaceholdersFromText(text: string): { key: string; label: string; type: string }[] {
  const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  const matches = new Set<string>();
  let match;

  while ((match = regex.exec(text)) !== null) {
    matches.add(match[1]);
  }

  return Array.from(matches).map((key) => {
    let label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    let type = 'text';

    if (key.includes('ngay') || key.includes('date') || key.includes('thang')) {
      type = 'date';
    } else if (key.includes('so') || key.includes('amount') || key.includes('qty')) {
      type = 'number';
    } else if (key.includes('ly_do') || key.includes('mo_ta') || key.includes('content')) {
      type = 'textarea';
    }

    return { key, label, type };
  });
}

/**
 * Basic document renderer substituting placeholders with form data
 */
export function fillDocumentPlaceholders(templateText: string, data: Record<string, string>): string {
  let result = templateText;
  for (const [key, value] of Object.entries(data)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value || '');
  }
  return result;
}
