#!/usr/bin/env python3
"""
Extract and normalize speaker data from conferences.json
"""
import json
import re
from collections import defaultdict
from difflib import SequenceMatcher

def clean_name(name):
    """Clean and normalize speaker names"""
    # Remove titles like Dr., Prof., etc.
    name = re.sub(r'^(Dr\.?|Prof\.?|Professor|Mr\.?|Ms\.?|Mrs\.?)\s+', '', name, flags=re.IGNORECASE)
    
    # Remove degrees like PhD, MD, etc.
    name = re.sub(r',?\s+(PhD|Ph\.D\.|MD|M\.D\.|MSc|M\.Sc\.|BSc|B\.Sc\.).*$', '', name, flags=re.IGNORECASE)
    
    # Clean up extra whitespace
    name = ' '.join(name.split())
    
    return name.strip()

def name_similarity(name1, name2):
    """Calculate similarity between two names (0-1)"""
    return SequenceMatcher(None, name1.lower(), name2.lower()).ratio()

def should_merge_names(name1, name2, threshold=0.85):
    """Determine if two names should be merged"""
    # Exact match after cleaning
    if clean_name(name1).lower() == clean_name(name2).lower():
        return True
    
    # High similarity match
    if name_similarity(name1, name2) >= threshold:
        return True
        
    # Common cases: "John Smith" vs "J. Smith" or "John P. Smith"
    clean1 = clean_name(name1).lower()
    clean2 = clean_name(name2).lower()
    
    # Split into words
    words1 = clean1.split()
    words2 = clean2.split()
    
    if len(words1) >= 2 and len(words2) >= 2:
        # Last names match and first names are similar
        if words1[-1] == words2[-1]:  # Same last name
            if name_similarity(words1[0], words2[0]) >= 0.7:
                return True
    
    return False

def generate_speaker_id(name):
    """Generate a URL-friendly ID from speaker name"""
    # Clean the name first
    clean = clean_name(name)
    # Convert to lowercase, replace spaces with hyphens, remove special chars
    speaker_id = re.sub(r'[^a-z0-9\s-]', '', clean.lower())
    speaker_id = re.sub(r'\s+', '-', speaker_id)
    speaker_id = re.sub(r'-+', '-', speaker_id)  # Multiple hyphens to single
    return speaker_id.strip('-')

def main():
    print("🎯 Loading conferences data...")
    
    with open('/Users/nicholashalstead/Projects/ai-conference-tracker/data/conferences.json', 'r') as f:
        data = json.load(f)
    
    conferences = data.get('conferences', [])
    print(f"📊 Found {len(conferences)} conferences")
    
    # Extract all speakers
    raw_speakers = []
    conference_speakers = defaultdict(list)  # conference_id -> list of speakers
    
    for conference in conferences:
        conf_id = conference['id']
        speakers = conference.get('speakers', [])
        
        print(f"  📋 {conf_id}: {len(speakers)} speakers")
        
        for speaker in speakers:
            if isinstance(speaker, dict):
                name = speaker.get('name', '').strip()
                if name and name not in ['Various speakers', 'TBD', 'To be announced', 'Various Fortune 500 Executives']:
                    speaker_entry = {
                        'name': name,
                        'title': speaker.get('title', '').strip(),
                        'organization': speaker.get('organization', '').strip(),
                        'importance': speaker.get('importance', 'medium'),
                        'bio': speaker.get('bio', '').strip(),
                        'conference_id': conf_id
                    }
                    raw_speakers.append(speaker_entry)
                    conference_speakers[conf_id].append(speaker_entry)
    
    print(f"📊 Total raw speaker entries: {len(raw_speakers)}")
    
    # Now deduplicate and normalize
    print("🔄 Deduplicating speakers...")
    
    normalized_speakers = {}  # speaker_id -> speaker_data
    speaker_conferences = defaultdict(set)  # speaker_id -> set of conference_ids
    
    for speaker in raw_speakers:
        name = speaker['name']
        
        # Find if this speaker already exists (fuzzy matching)
        found_match = None
        for existing_id, existing_speaker in normalized_speakers.items():
            if should_merge_names(name, existing_speaker['name']):
                found_match = existing_id
                break
        
        if found_match:
            # Merge with existing speaker
            existing = normalized_speakers[found_match]
            
            # Use the most complete information
            if not existing.get('title') and speaker.get('title'):
                existing['title'] = speaker['title']
            if not existing.get('organization') and speaker.get('organization'):
                existing['organization'] = speaker['organization']
            if not existing.get('bio') and speaker.get('bio'):
                existing['bio'] = speaker['bio']
                
            # Track conference
            speaker_conferences[found_match].add(speaker['conference_id'])
            
        else:
            # Create new normalized speaker
            speaker_id = generate_speaker_id(name)
            
            # Handle ID conflicts
            original_id = speaker_id
            counter = 1
            while speaker_id in normalized_speakers:
                speaker_id = f"{original_id}-{counter}"
                counter += 1
            
            normalized_speakers[speaker_id] = {
                'id': speaker_id,
                'name': clean_name(name),
                'title': speaker.get('title', ''),
                'organization': speaker.get('organization', ''),
                'conferences': [],  # Will be filled below
                'conference_count': 0,  # Will be calculated below
                'focus_areas': [],  # Will be derived from conferences
                'bio': speaker.get('bio', ''),
                'linkedin': '',
                'twitter': '',
                'photo_url': '',
                'importance_score': 50  # Default, will be calculated later
            }
            
            speaker_conferences[speaker_id].add(speaker['conference_id'])
    
    print(f"✅ Normalized to {len(normalized_speakers)} unique speakers")
    
    # Calculate conference counts and focus areas
    print("📊 Calculating conference counts and focus areas...")
    
    conference_focus_map = {conf['id']: conf.get('focus_areas', []) for conf in conferences}
    
    for speaker_id, conf_ids in speaker_conferences.items():
        speaker = normalized_speakers[speaker_id]
        speaker['conferences'] = sorted(list(conf_ids))
        speaker['conference_count'] = len(conf_ids)
        
        # Derive focus areas from conferences
        all_focus_areas = []
        for conf_id in conf_ids:
            all_focus_areas.extend(conference_focus_map.get(conf_id, []))
        
        # Count focus area frequency and take most common ones
        focus_count = defaultdict(int)
        for area in all_focus_areas:
            focus_count[area] += 1
        
        # Take top 3 most frequent focus areas
        speaker['focus_areas'] = [area for area, _ in sorted(focus_count.items(), key=lambda x: x[1], reverse=True)[:3]]
    
    # Sort speakers by conference count
    sorted_speakers = sorted(normalized_speakers.values(), key=lambda x: x['conference_count'], reverse=True)
    
    print("🏆 Top 10 speakers by conference count:")
    for i, speaker in enumerate(sorted_speakers[:10]):
        print(f"  {i+1:2d}. {speaker['name']} ({speaker['conference_count']} conferences) - {speaker.get('organization', 'N/A')}")
    
    # Create the final speakers.json structure
    speakers_data = {
        'total_speakers': len(sorted_speakers),
        'speakers': sorted_speakers
    }
    
    # Save the initial speakers.json
    print("💾 Saving speakers.json...")
    with open('/Users/nicholashalstead/Projects/ai-conference-tracker/data/speakers.json', 'w') as f:
        json.dump(speakers_data, f, indent=2)
    
    print(f"✅ Saved {len(sorted_speakers)} speakers to data/speakers.json")
    print("🔍 Next step: Research top 50 speakers for enriched data")
    
    return sorted_speakers

if __name__ == '__main__':
    main()