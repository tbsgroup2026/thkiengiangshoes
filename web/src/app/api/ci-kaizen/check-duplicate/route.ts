import { NextResponse } from 'next/server';
import { ensureKaizenSchema } from '@/lib/kaizenDbMigration';

export const dynamic = 'force-static';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

// Compute text similarity percentage (Token Jaccard / Overlap)
function calculateTextSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s\u00C0-\u1EF9]/gi, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokens1 = new Set(clean(str1));
  const tokens2 = new Set(clean(str2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  for (const token of tokens1) {
    if (tokens2.has(token)) intersection++;
  }

  const union = new Set([...tokens1, ...tokens2]).size;
  return union > 0 ? Math.round((intersection / union) * 100) : 0;
}

export async function POST(request: Request) {
  try {
    const db = getDbBinding();
    if (!db) {
      return NextResponse.json({ success: true, isDuplicate: false, matches: [] });
    }

    await ensureKaizenSchema(db);

    const body = await request.json();
    const {
      factory = '',
      region = '',
      line = '',
      category = '',
      beforeDescription = '',
      afterSolution = '',
      title = '',
    } = body;

    const query = `
      SELECT * FROM ci_kaizen_proposals 
      WHERE (trang_thai IS NULL OR trang_thai != 'DA_GOP')
      ORDER BY created_at DESC LIMIT 300
    `;
    const { results } = await db.prepare(query).all();

    if (!results || results.length === 0) {
      return NextResponse.json({ success: true, isDuplicate: false, matches: [] });
    }

    const matches: any[] = [];
    const targetArea = (factory || region || '').toUpperCase().trim();
    const targetLine = (line || '').toUpperCase().trim();
    const targetCategory = (category || '').toUpperCase().trim();
    const targetText = `${title} ${beforeDescription} ${afterSolution}`;

    for (const prop of results) {
      const propArea = (prop.factory || prop.region || '').toUpperCase().trim();
      const propLine = (prop.line || '').toUpperCase().trim();
      const propCategory = (prop.category || '').toUpperCase().trim();
      const propText = `${prop.title || ''} ${prop.before_description || ''} ${prop.after_solution || ''}`;

      let score = 0;

      // 1. Hard Area Match (25%)
      if (targetArea && propArea && (targetArea.includes(propArea) || propArea.includes(targetArea))) {
        score += 25;
      }

      // 2. Line Match (25%)
      if (targetLine && propLine && (targetLine.includes(propLine) || propLine.includes(targetLine))) {
        score += 25;
      } else if (!targetLine && !propLine) {
        score += 15;
      }

      // 3. Category Match (20%)
      if (targetCategory && propCategory && targetCategory === propCategory) {
        score += 20;
      }

      // 4. Description Text Similarity (0-30%)
      const textSim = calculateTextSimilarity(targetText, propText);
      score += Math.round((textSim * 30) / 100);

      if (score >= 45) {
        matches.push({
          proposal: prop,
          similarityPercentage: Math.min(score, 99),
          matchReason: `Trùng khớp ${score}% (Khu vực: ${targetArea || 'Tất cả'}, Line: ${targetLine || 'Tất cả'}, Category: ${targetCategory})`,
        });
      }
    }

    // Sort matches by similarity percentage descending
    matches.sort((a, b) => b.similarityPercentage - a.similarityPercentage);

    return NextResponse.json({
      success: true,
      isDuplicate: matches.length > 0,
      matches: matches.slice(0, 5), // Return top 5 matches
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi kiểm tra trùng lặp';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
