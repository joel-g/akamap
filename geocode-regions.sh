#!/bin/bash

# Geocode Linode Regions Script
# This script extracts unique region labels from list-regions.json and geocodes them using Nominatim
# Output: coordinates.json with location -> coordinates mapping

echo "🗺️  Geocoding Linode Regions..."

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is required but not installed. Install with: brew install jq"
    exit 1
fi

# Check if list-regions.json exists
if [ ! -f "list-regions.json" ]; then
    echo "❌ Error: list-regions.json not found in current directory"
    exit 1
fi

# Extract unique labels from the JSON file
echo "📍 Extracting unique region labels..."
labels=$(jq -r '.data[].label' list-regions.json | sort -u)

# Initialize the coordinates JSON file
echo "{" > coordinates.json

first=true
total=$(echo "$labels" | wc -l | xargs)
current=0

echo "🌍 Found $total unique locations to geocode"
echo "⏱️  This will take approximately $((total * 2)) seconds (1 second delay per request)"
echo ""

# Loop through each unique label and geocode it
while IFS= read -r label; do
    current=$((current + 1))
    echo "[$current/$total] Geocoding: $label"
    
    # URL encode the label for the API call
    encoded_label=$(echo "$label" | sed 's/ /%20/g' | sed 's/,/%2C/g')
    
    # Make the API call to Nominatim
    response=$(curl -s "https://nominatim.openstreetmap.org/search?format=json&q=${encoded_label}&limit=1" \
                    -H "User-Agent: Akamap/1.0 (geocoding script for Linode regions map)")
    
    # Parse the response and extract coordinates
    if [ "$response" != "[]" ] && [ -n "$response" ]; then
        lat=$(echo "$response" | jq -r '.[0].lat // empty')
        lon=$(echo "$response" | jq -r '.[0].lon // empty')
        
        if [ -n "$lat" ] && [ -n "$lon" ] && [ "$lat" != "null" ] && [ "$lon" != "null" ]; then
            # Add comma if not the first entry
            if [ "$first" = false ]; then
                echo "," >> coordinates.json
            else
                first=false
            fi
            
            # Add the coordinates to the JSON file
            echo "  \"$label\": {" >> coordinates.json
            echo "    \"lat\": $lat," >> coordinates.json
            echo "    \"lng\": $lon" >> coordinates.json
            echo -n "  }" >> coordinates.json
            
            echo "  ✅ Found: $lat, $lon"
        else
            echo "  ⚠️  No coordinates found"
            # Still add an entry but with null values
            if [ "$first" = false ]; then
                echo "," >> coordinates.json
            else
                first=false
            fi
            echo "  \"$label\": null" >> coordinates.json
        fi
    else
        echo "  ❌ API request failed or returned empty"
        # Add null entry for failed requests
        if [ "$first" = false ]; then
            echo "," >> coordinates.json
        else
            first=false
        fi
        echo -n "  \"$label\": null" >> coordinates.json
    fi
    
    # Be respectful to Nominatim - 1 second delay between requests
    if [ $current -lt $total ]; then
        echo "  ⏳ Waiting 1 second..."
        sleep 1
    fi
    echo ""
done <<< "$labels"

# Close the JSON file
echo "" >> coordinates.json
echo "}" >> coordinates.json

echo "✅ Geocoding complete! Results saved to coordinates.json"
echo ""
echo "📊 Summary:"
successful=$(jq '[.[] | select(. != null)] | length' coordinates.json 2>/dev/null || echo "0")
total_processed=$(jq 'keys | length' coordinates.json 2>/dev/null || echo "0")
echo "  - Total locations processed: $total_processed"
echo "  - Successfully geocoded: $successful"
echo "  - Failed/missing: $((total_processed - successful))"
echo ""
echo "🎉 Ready to use coordinates.json in your React app!"
