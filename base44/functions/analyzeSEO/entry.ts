import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { url, email, fullReport = false, lang = "en" } = await req.json();

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    const normalizedUrl = url.startsWith('http') ? url : 'https://' + url;

    // Fetch website HTML
    let htmlContent = '';
    try {
      const res = await fetch(normalizedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)' },
        signal: AbortSignal.timeout(10000),
      });
      htmlContent = await res.text();
    } catch {
      htmlContent = '';
    }

    // Extract basic SEO signals from HTML
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = htmlContent.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const h1Count = (htmlContent.match(/<h1/gi) || []).length;
    const imgCount = (htmlContent.match(/<img/gi) || []).length;
    const imgAltMissing = (htmlContent.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(htmlContent);
    const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(htmlContent);
    const hasOgTags = /<meta[^>]+property=["']og:/i.test(htmlContent);
    const hasSchema = /application\/ld\+json/i.test(htmlContent);
    const hasHttps = normalizedUrl.startsWith('https');
    const wordCount = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;

    const seoSignals = {
      url: normalizedUrl,
      title: titleMatch?.[1]?.trim() || null,
      titleLength: titleMatch?.[1]?.trim().length || 0,
      description: descMatch?.[1]?.trim() || null,
      descriptionLength: descMatch?.[1]?.trim().length || 0,
      h1Text: h1Match?.[1]?.trim() || null,
      h1Count,
      imgCount,
      imgAltMissing,
      hasViewport,
      hasCanonical,
      hasOgTags,
      hasSchema,
      hasHttps,
      wordCount,
    };

    // AI analysis
    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an expert SEO analyst. Analyze the following website SEO signals and provide a concise, actionable audit report.

Website: ${normalizedUrl}
Title: ${seoSignals.title || 'MISSING'} (${seoSignals.titleLength} chars)
Meta Description: ${seoSignals.description || 'MISSING'} (${seoSignals.descriptionLength} chars)
H1 Tag: ${seoSignals.h1Text || 'MISSING'} (count: ${seoSignals.h1Count})
Images: ${seoSignals.imgCount} total, ${seoSignals.imgAltMissing} missing alt text
Mobile viewport: ${seoSignals.hasViewport ? 'YES' : 'NO'}
Canonical tag: ${seoSignals.hasCanonical ? 'YES' : 'NO'}
Open Graph tags: ${seoSignals.hasOgTags ? 'YES' : 'NO'}
Schema markup: ${seoSignals.hasSchema ? 'YES' : 'NO'}
HTTPS: ${seoSignals.hasHttps ? 'YES' : 'NO'}
Content words: ~${seoSignals.wordCount}

Also search the web to check:
1. How many backlinks/referring domains this site appears to have
2. Whether Google has indexed this site
3. Page speed/Core Web Vitals signals if available
4. Social media presence strength
5. Domain authority estimate

Return JSON with:
- score: integer 0-100 (overall SEO health score)
- grade: "A", "B", "C", "D", or "F"
- summary: 2-3 sentence plain-language summary of the site's SEO health
- quick_wins: array of 3-5 objects with { issue, impact: "high"/"medium"/"low", fix }
- strengths: array of 2-4 strings (what they're doing well)
- full_report_sections: array of objects with { section_title, score: 0-100, status: "good"/"warning"/"critical", findings: string, recommendations: string } — include sections: Technical SEO, On-Page SEO, Content Quality, Mobile & UX, Backlinks & Authority, Social & Branding
- keyword_opportunities: array of 3-5 suggested keywords this site should target
- competitor_gap: 1-2 sentence estimate of where competitors likely outperform them`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: "object",
        properties: {
          score: { type: "number" },
          grade: { type: "string" },
          summary: { type: "string" },
          quick_wins: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: { type: "string" },
                impact: { type: "string" },
                fix: { type: "string" },
              }
            }
          },
          strengths: { type: "array", items: { type: "string" } },
          full_report_sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                section_title: { type: "string" },
                score: { type: "number" },
                status: { type: "string" },
                findings: { type: "string" },
                recommendations: { type: "string" },
              }
            }
          },
          keyword_opportunities: { type: "array", items: { type: "string" } },
          competitor_gap: { type: "string" },
        },
        required: ["score", "grade", "summary", "quick_wins", "strengths", "full_report_sections"]
      }
    });

    const report = {
      ...seoSignals,
      ...aiResult,
    };

    // Save SEO lead when email provided
    if (email) {
      try {
        await base44.asServiceRole.entities.SEOLead.create({
          email,
          url: normalizedUrl,
          score: aiResult.score,
          grade: aiResult.grade,
        });
      } catch {}
    }

    // If email requested, send full report
    if (email && fullReport) {
      const sectionsHtml = (aiResult.full_report_sections || []).map(s => {
        const color = s.status === 'good' ? '#16a34a' : s.status === 'warning' ? '#d97706' : '#dc2626';
        return `
          <div style="margin-bottom:20px;padding:16px;background:#f9f9f9;border-radius:10px;border-left:4px solid ${color};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <strong style="font-size:15px;color:#111;">${s.section_title}</strong>
              <span style="background:${color};color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">${s.score}/100</span>
            </div>
            <p style="font-size:13px;color:#555;margin:0 0 6px;"><strong>Findings:</strong> ${s.findings}</p>
            <p style="font-size:13px;color:#555;margin:0;"><strong>Fix:</strong> ${s.recommendations}</p>
          </div>`;
      }).join('');

      const quickWinsHtml = (aiResult.quick_wins || []).map(w => {
        const impactColor = w.impact === 'high' ? '#dc2626' : w.impact === 'medium' ? '#d97706' : '#16a34a';
        return `
          <div style="padding:12px 16px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:10px;">
            <div style="display:flex;gap:8px;align-items:flex-start;">
              <span style="background:${impactColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;white-space:nowrap;margin-top:2px;">${w.impact.toUpperCase()}</span>
              <div>
                <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:3px;">${w.issue}</div>
                <div style="font-size:12px;color:#666;">✅ ${w.fix}</div>
              </div>
            </div>
          </div>`;
      }).join('');

      const emailBody = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 28px;border-radius:12px 12px 0 0;text-align:center;">
            <img src="https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/09f0d2769_b-arrow-1.png" alt="Bildo" style="width:64px;height:64px;margin-bottom:12px;" />
            <h1 style="color:#fff;font-size:24px;font-weight:900;margin:0 0 6px;">Your Full SEO Report</h1>
            <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;">${normalizedUrl}</p>
          </div>

          <!-- Score -->
          <div style="background:#f5f3ff;padding:28px;text-align:center;border-bottom:1px solid #ede9fe;">
            <div style="font-size:72px;font-weight:900;color:#7c3aed;line-height:1;">${aiResult.score}</div>
            <div style="font-size:18px;color:#6d28d9;font-weight:700;">Grade: ${aiResult.grade}</div>
            <p style="font-size:14px;color:#555;max-width:480px;margin:12px auto 0;line-height:1.7;">${aiResult.summary}</p>
          </div>

          <div style="padding:28px;">
            <!-- Quick Wins -->
            <h2 style="font-size:17px;font-weight:800;color:#111;margin:0 0 14px;">⚡ Quick Wins</h2>
            ${quickWinsHtml}

            <!-- Detailed Sections -->
            <h2 style="font-size:17px;font-weight:800;color:#111;margin:24px 0 14px;">📊 Detailed Analysis</h2>
            ${sectionsHtml}

            <!-- Keywords -->
            ${aiResult.keyword_opportunities?.length ? `
            <h2 style="font-size:17px;font-weight:800;color:#111;margin:24px 0 14px;">🎯 Keyword Opportunities</h2>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;">
              ${aiResult.keyword_opportunities.map(k => `<span style="background:#ede9fe;color:#7c3aed;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;">${k}</span>`).join('')}
            </div>` : ''}

            <!-- CTA -->
            <div style="background:linear-gradient(135deg,#1a0a2e,#3b1f8c);border-radius:14px;padding:28px;text-align:center;margin-top:24px;">
              <h3 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 10px;">Want us to fix all of this for you?</h3>
              <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0 0 20px;">Bildo's AI-powered team handles SEO, ads, social media, and more — so you can focus on running your business.</p>
              <a href="https://buildoai.com/worker-onboarding" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px;padding:14px 32px;font-size:15px;font-weight:800;">Get Started for Free →</a>
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:12px 0 0;">No credit card · Free trial · Response within hours</p>
            </div>
          </div>
        </div>
      `;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `Your SEO Report for ${normalizedUrl} — Score: ${aiResult.score}/100 (Grade ${aiResult.grade})`,
        body: emailBody,
        from_name: 'Bildo SEO Analyzer',
      });
    }

    return Response.json(report);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});