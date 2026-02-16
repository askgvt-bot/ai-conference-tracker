#!/usr/bin/env python3
"""
Research and enrich speaker data for top speakers
"""
import json
import time
from datetime import datetime

# High-value speakers we know are real and important
PRIORITY_SPEAKERS = [
    "Jensen Huang",
    "Ashok Elluswamy", 
    "H.E. Omar Sultan Al Olama",
    "Nitin Akarte",
    "Akshay Singh Dalal",
    "Anwesha Kar",
    "Faraz Shafiq"
]

# Manually curated speaker data for the most important ones
SPEAKER_ENRICHMENTS = {
    "Jensen Huang": {
        "title": "Founder and CEO",
        "organization": "NVIDIA",
        "bio": "Co-founded NVIDIA in 1993 and has served as CEO since inception, leading the company's transformation into the world's most valuable semiconductor company and a leader in AI computing.",
        "linkedin": "https://www.linkedin.com/in/jenhsunhuang/",
        "twitter": "@JenHsun",
        "photo_url": "",
        "importance_score": 98,
        "focus_areas": ["AI hardware", "GPU computing", "enterprise AI", "robotics", "autonomous vehicles"]
    },
    "Ashok Elluswamy": {
        "title": "VP, AI Software",
        "organization": "Tesla",
        "bio": "VP of AI Software at Tesla, leading the development of Full Self-Driving (FSD) capabilities and neural network architectures for autonomous driving.",
        "linkedin": "https://www.linkedin.com/in/ashok-elluswamy/",
        "twitter": "@aelluswamy",
        "photo_url": "",
        "importance_score": 85,
        "focus_areas": ["autonomous vehicles", "computer vision", "neural networks", "robotics", "AI software"]
    },
    "H.E. Omar Sultan Al Olama": {
        "title": "Minister of State for AI, Digital Economy and Remote Work Applications",
        "organization": "UAE Government",
        "bio": "UAE's Minister of State for Artificial Intelligence, Digital Economy and Remote Work Applications, leading the UAE's national AI strategy and digital transformation.",
        "linkedin": "https://www.linkedin.com/in/omarsultanalolama/",
        "twitter": "@AlOlamaOmar",
        "photo_url": "",
        "importance_score": 80,
        "focus_areas": ["AI policy", "digital transformation", "government AI", "AI strategy", "emerging markets"]
    }
}

def enrich_speaker_data(speaker):
    """Enrich speaker data with research"""
    name = speaker['name']
    
    if name in SPEAKER_ENRICHMENTS:
        enrichment = SPEAKER_ENRICHMENTS[name]
        
        # Update speaker data
        speaker['title'] = enrichment['title']
        speaker['organization'] = enrichment['organization'] 
        speaker['bio'] = enrichment['bio']
        speaker['linkedin'] = enrichment['linkedin']
        speaker['twitter'] = enrichment['twitter']
        speaker['photo_url'] = enrichment['photo_url']
        speaker['importance_score'] = enrichment['importance_score']
        speaker['focus_areas'] = enrichment['focus_areas']
        
        print(f"✅ Enriched: {name}")
    else:
        # For others, do basic scoring based on organization
        org = speaker.get('organization', '').lower()
        title = speaker.get('title', '').lower()
        
        score = 50  # Default
        
        # Organization-based scoring
        if any(x in org for x in ['google', 'microsoft', 'amazon', 'apple', 'meta', 'tesla', 'nvidia', 'openai']):
            score += 25
        elif any(x in org for x in ['government', 'ministry', 'state']):
            score += 20
        elif any(x in org for x in ['university', 'mit', 'stanford', 'berkeley']):
            score += 15
        
        # Title-based scoring
        if any(x in title for x in ['ceo', 'founder', 'chief', 'president', 'minister']):
            score += 15
        elif any(x in title for x in ['vp', 'vice president', 'director']):
            score += 10
        
        speaker['importance_score'] = min(score, 95)  # Cap at 95
        
        print(f"⚡ Scored: {name} ({score})")
    
    return speaker

def main():
    print("🔬 Researching and enriching speaker data...")
    
    # Load speakers
    with open('/Users/nicholashalstead/Projects/ai-conference-tracker/data/speakers.json', 'r') as f:
        data = json.load(f)
    
    speakers = data['speakers']
    
    # Enrich each speaker
    enriched_count = 0
    for speaker in speakers:
        if speaker['name'] in PRIORITY_SPEAKERS or any(keyword in speaker['name'] for keyword in PRIORITY_SPEAKERS):
            enrich_speaker_data(speaker)
            enriched_count += 1
        else:
            # Basic scoring for non-priority speakers
            enrich_speaker_data(speaker)
    
    # Resort speakers by importance score, then conference count
    speakers.sort(key=lambda x: (x.get('importance_score', 50), x['conference_count']), reverse=True)
    
    # Update total and metadata
    data['speakers'] = speakers
    data['enriched_speakers'] = enriched_count
    data['enrichment_date'] = datetime.now().isoformat()
    
    # Save updated data
    with open('/Users/nicholashalstead/Projects/ai-conference-tracker/data/speakers.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Enriched {enriched_count} priority speakers")
    print("🏆 Top 10 speakers by importance:")
    
    for i, speaker in enumerate(speakers[:10]):
        print(f"  {i+1:2d}. {speaker['name']} (Score: {speaker.get('importance_score', 50)}, {speaker['conference_count']} conferences)")
        if speaker.get('bio'):
            print(f"      {speaker['bio'][:100]}...")
    
    return speakers

if __name__ == '__main__':
    main()