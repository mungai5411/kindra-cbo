import os
from pathlib import Path

media_root = Path(r"c:\Users\munga\OneDrive\Desktop\kindra\backend\media")

print(f"Listing {media_root}:")
if media_root.exists():
    for item in media_root.iterdir():
        print(f"  {item.name} ({'DIR' if item.is_dir() else 'FILE'})")
else:
    print(f"  {media_root} does not exist.")

media_profiles = media_root / "profiles"
print(f"\nListing {media_profiles}:")
if media_profiles.exists():
    for item in media_profiles.iterdir():
        print(f"  {item.name}")
else:
    print(f"  {media_profiles} does not exist.")

media_media = media_root / "media"
print(f"\nListing {media_media}:")
if media_media.exists():
    for item in media_media.iterdir():
        print(f"  {item.name} ({'DIR' if item.is_dir() else 'FILE'})")
    
    media_media_profiles = media_media / "profiles"
    print(f"\nListing {media_media_profiles}:")
    if media_media_profiles.exists():
        for item in media_media_profiles.iterdir():
            print(f"  {item.name}")
else:
    print(f"  {media_media} does not exist.")
