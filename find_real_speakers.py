#!/usr/bin/env python3
"""
Find real named speakers (not generic placeholders) for enrichment
"""
import json
import re

def is_real_speaker(name):
    """Determine if this is a real person's name vs generic placeholder"""
    # Patterns that indicate generic/placeholder entries
    generic_patterns = [
        r'various.*speakers?',
        r'.*leaders?$',
        r'.*experts?$', 
        r'.*executives?$',
        r'.*researchers?$',
        r'research.*leaders?',
        r'industry.*leaders?',
        r'business.*leaders?',
        r'tech.*leaders?',
        r'.*conference.*speakers?',
        r'fortune.*executives?',
        r'c-suite',
        r'keynote.*speakers?',
        r'panel.*experts?',
        r'tbd',
        r'to be announced',
        r'confirmed soon'
    ]
    
    name_lower = name.lower()
    
    for pattern in generic_patterns:
        if re.search(pattern, name_lower):
            return False
    
    # Real names typically have 2+ words and don't contain "Inc", "Corp", etc.
    words = name.split()
    if len(words) < 2:
        return False
    
    # Check for company indicators
    company_indicators = ['inc', 'corp', 'ltd', 'llc', 'corporation', 'company', 'enterprises']
    for word in words:
        if word.lower() in company_indicators:
            return False
    
    return True

def main():
    print("🔍 Looking for real named speakers...")
    
    with open('/Users/nicholashalstead/Projects/ai-conference-tracker/data/speakers.json', 'r') as f:
        data = json.load(f)
    
    real_speakers = []
    placeholder_speakers = []
    
    for speaker in data['speakers']:
        if is_real_speaker(speaker['name']):
            real_speakers.append(speaker)
        else:
            placeholder_speakers.append(speaker)
    
    print(f"📊 Found {len(real_speakers)} real speakers and {len(placeholder_speakers)} placeholder entries")
    
    print("\n🏆 Real speakers (top 20 by conference count):")
    for i, speaker in enumerate(real_speakers[:20]):
        print(f"  {i+1:2d}. {speaker['name']} ({speaker['conference_count']} conferences) - {speaker.get('organization', 'N/A')}")
    
    # Save just the real speakers for research
    research_speakers = {
        'real_speakers': len(real_speakers),
        'speakers_for_research': real_speakers[:50],  # Top 50 for research
        'placeholder_count': len(placeholder_speakers)
    }
    
    with open('/Users/nicholashalstead/Projects/ai-conference-tracker/data/speakers_for_research.json', 'w') as f:
        json.dump(research_speakers, f, indent=2)
    
    print(f"\n✅ Saved top {min(50, len(real_speakers))} real speakers for research")
    return real_speakers

if __name__ == '__main__':
    main()