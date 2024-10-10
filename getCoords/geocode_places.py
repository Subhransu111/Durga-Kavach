import requests
import pandas as pd
import json
import time

def get_lat_lng(place):
    url = 'https://nominatim.openstreetmap.org/search'
    headers = {
        'User-Agent': 'WomenSafetyApp/1.0 (contact@womensafetyapp.com)'
    }
    params = {
        'q': place,
        'format': 'json',
        'limit': 1
    }
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        if data:
            lat = data[0]['lat']
            lon = data[0]['lon']
            return lat, lon
        else:
            print(f"No coordinates found for {place}")
            return None, None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching coordinates for {place}: {e}")
        return None, None

def main():
    # Load the Excel file
    input_file = '/Users/satyajitpatra/Desktop/DOC-20240831-WA0002.xlsx'
    df = pd.read_excel(input_file)

    # Prepare the list to store the data
    data = []

    # Geocode each place with a delay to avoid 403 errors
    for index, row in df.iterrows():
        place = row['Place']
        intensity = row['Intensity']
        lat, lon = get_lat_lng(place)
        if lat and lon:
            print(f"{place}: {lat}, {lon}, Intensity: {intensity}")
            data.append({
                'Place': place,
                'Intensity': intensity,
                'Latitude': lat,
                'Longitude': lon
            })
        else:
            print(f"Failed to get coordinates for {place}, Intensity: {intensity}")
        
        # Add a delay to avoid overwhelming the server
        time.sleep(1.5)  # 1.5 seconds delay

    # Save the data to a JSON file
    with open('output_coordinates.json', 'w') as f:
        json.dump(data, f, indent=4)

if __name__ == '__main__':
    main()