import { NextRequest, NextResponse } from 'next/server';
import { getConferenceRecommendations, getRecommendationsSummary, UserProfile } from '@/lib/recommendations';
import { generateCode, serializeRecommendation, AnalysisResult } from '@/lib/analysis-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Build UserProfile from form data
    const profile: UserProfile = {
      name: body.name || 'Anonymous',
      company: body.company || '',
      base_location: body.location || '',
      focus_areas: body.focusAreas || [],
      goals: body.goals || [],
      target_speakers: body.targetSpeakers || [],
      target_orgs: body.targetOrgs || [],
      preferred_regions: body.regions || [],
      quarterly_budget: body.budget || 2000,
      max_conferences_per_quarter: 4,
    };

    // Add other interests to focus areas
    if (body.otherInterests) {
      const extras = body.otherInterests.split(',').map((s: string) => s.trim()).filter(Boolean);
      profile.focus_areas = [...profile.focus_areas, ...extras];
    }

    // Parse target people/orgs from free text
    if (body.targetPeopleOrgs) {
      const lines = body.targetPeopleOrgs.split('\n').map((s: string) => s.trim()).filter(Boolean);
      for (const line of lines) {
        // Heuristic: if it looks like a person name (2-3 words, no Inc/Corp), add as speaker
        if (line.split(' ').length <= 3 && !/(inc|corp|ltd|llc|co\.|labs)/i.test(line)) {
          profile.target_speakers.push(line);
        } else {
          profile.target_orgs.push(line);
        }
      }
    }

    // TODO: Stripe checkout session here
    // if (body.requirePayment) {
    //   const session = await stripe.checkout.sessions.create({ ... });
    //   return NextResponse.json({ checkoutUrl: session.url });
    // }

    // Run scoring engine
    const recommendations = getConferenceRecommendations(undefined, profile);
    const summary = getRecommendationsSummary(undefined, profile);

    // Filter to non-skip results
    const meaningful = recommendations.filter(r => r.tier !== 'skip');
    const serialized = meaningful.map(serializeRecommendation);

    const code = generateCode();

    const analysis: AnalysisResult = {
      code,
      profile,
      recommendations: serialized,
      summary,
      isPaid: false, // TODO: Set true after Stripe payment confirmation
      createdAt: new Date().toISOString(),
    };

    // For Vercel serverless: encode in response (client stores in localStorage)
    return NextResponse.json({ code, analysis });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
