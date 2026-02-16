#!/usr/bin/env python3
"""
Update conferences.json to link speakers by ID instead of storing full data
"""
import json
import re

def generate_speaker_id(name):
    """Generate a URL-friendly ID from speaker name (same as extract_speakers.py)"""
    # Clean the name first
    clean_name = name.strip()
    clean_name = re.sub(r'^(Dr\.?|Prof\.?|Professor|Mr\.?|Ms\.?|Mrs\.?)\s+', '', clean_name, flags=re.IGNORECASE)
    clean_name = re.sub(r',?\s+(PhD|Ph\.D\.|MD|M\.D\.|MSc|M\.Sc\.|BSc|B\.Sc\.).*$', '', clean_name, flags=re.IGNORECASE)
    clean_name = ' '.join(clean_name.split())
    
    # Convert to lowercase, replace spaces with hyphens, remove special chars
    speaker_id = re.sub(r'[^a-z0-9\s-]', '', clean_name.lower())
    speaker_id = re.sub(r'\s+', '-', speaker_id)
    speaker_id = re.sub(r'-+', '-', speaker_id)  # Multiple hyphens to single
    return speaker_id.strip('-')

def main():
    print("🔗 Updating conferences to link speakers by ID...")
    
    # Load conferences and speakers data
    with open('/Users/nicholashalstead/Projects/ai-conference-tracker/data/conferences.json', 'r') as f:
        conferences_data = json.load(f)
    
    with open('/Users/nicholashalstead/Projects/ai-conference-tracker/data/speakers.json', 'r') as f:
        speakers_data = json.load(f)
    
    # Create speaker name to ID mapping
    speaker_name_to_id = {}
    for speaker in speakers_data['speakers']:
        speaker_name_to_id[speaker['name']] = speaker['id']
    
    print(f"📊 Processing {len(conferences_data['conferences'])} conferences...")
    
    updated_conferences = 0
    total_speaker_links = 0
    
    for conference in conferences_data['conferences']:
        conf_id = conference['id']
        old_speakers = conference.get('speakers', [])
        
        new_speakers = []
        
        for speaker in old_speakers:
            if isinstance(speaker, dict):
                speaker_name = speaker.get('name', '').strip()
                
                # Skip generic/empty speakers
                if not speaker_name or speaker_name in ['Various speakers', 'TBD', 'To be announced']:
                    continue
                
                # Find matching speaker ID
                speaker_id = None
                
                # Direct match first
                if speaker_name in speaker_name_to_id:
                    speaker_id = speaker_name_to_id[speaker_name]
                else:
                    # Fallback: generate ID and check if it exists
                    generated_id = generate_speaker_id(speaker_name)
                    for existing_speaker in speakers_data['speakers']:
                        if existing_speaker['id'] == generated_id:
                            speaker_id = generated_id
                            break
                
                if speaker_id:
                    new_speakers.append({
                        "id": speaker_id,
                        "name": speaker_name,
                        "title": speaker.get('title', ''),
                        "organization": speaker.get('organization', '')
                    })
                    total_speaker_links += 1
                else:
                    print(f"⚠️  Could not find speaker ID for: {speaker_name} in {conf_id}")
        
        conference['speakers'] = new_speakers
        
        if new_speakers:
            updated_conferences += 1
    
    print(f"✅ Updated {updated_conferences} conferences with {total_speaker_links} speaker links")
    
    # Save updated conferences
    with open('/Users/nicholashalstead/Projects/ai-conference-tracker/data/conferences.json', 'w') as f:
        json.dump(conferences_data, f, indent=2)
    
    print("💾 Saved updated conferences.json")
    
    # Show some examples
    print("\n📋 Example conference with linked speakers:")
    for conf in conferences_data['conferences'][:3]:
        if conf.get('speakers'):
            print(f"  🎯 {conf['name']}: {len(conf['speakers'])} speakers")
            for speaker in conf['speakers'][:2]:  # Show first 2
                print(f"     - {speaker['name']} (ID: {speaker['id']})")
            break

if __name__ == '__main__':
    main()