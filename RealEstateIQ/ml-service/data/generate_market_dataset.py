"""
Script to generate a rich, realistic Sri Lanka real estate market dataset (1,200 records).

Locations: Colombo, Kandy, Galle, Negombo
Features:
- area: 750 - 4,800 sqft
- bedrooms: 1 - 6
- bathrooms: 1 - 5
- location: Colombo, Kandy, Galle, Negombo
- house_age: 0 - 25 years
- parking: 1 - 3 spaces
- price: calculated with realistic Sri Lankan hedonic market pricing + real variance
"""

import os
import numpy as np
import pandas as pd

np.random.seed(42)

def generate_dataset(n_samples: int = 1200) -> pd.DataFrame:
    locations = ["Colombo", "Kandy", "Galle", "Negombo"]
    loc_weights = [0.35, 0.25, 0.22, 0.18]
    
    # Base price per sqft by location
    loc_sqft_rates = {
        "Colombo": 235.0,
        "Galle": 198.0,
        "Kandy": 182.0,
        "Negombo": 168.0,
    }
    
    loc_base_premiums = {
        "Colombo": 45000.0,
        "Galle": 30000.0,
        "Kandy": 25000.0,
        "Negombo": 20000.0,
    }

    records = []
    
    # 1. First keep the original 100 benchmark rows for consistency
    original_path = os.path.join(os.path.dirname(__file__), "house_data_extended.csv")
    if os.path.exists(original_path):
        orig_df = pd.read_csv(original_path)
        for _, row in orig_df.iterrows():
            records.append({
                "area": int(row["area"]),
                "bedrooms": int(row["bedrooms"]),
                "bathrooms": int(row["bathrooms"]),
                "location": str(row["location"]),
                "house_age": int(row["house_age"]),
                "parking": int(row["parking"]),
                "price": int(row["price"]),
            })

    # 2. Generate additional realistic market listings up to n_samples
    remaining = n_samples - len(records)
    
    chosen_locations = np.random.choice(locations, size=remaining, p=loc_weights)
    
    for loc in chosen_locations:
        # Realistic area distribution (peaks around 1600-2400 sqft)
        area = int(np.clip(np.random.normal(2100, 650), 750, 4800))
        # Round area to nearest 25 or 50 sqft as common in listings
        area = (area // 25) * 25

        # Bedrooms realistically tied to area
        if area < 1150:
            bedrooms = np.random.choice([1, 2], p=[0.35, 0.65])
        elif area < 1700:
            bedrooms = np.random.choice([2, 3], p=[0.45, 0.55])
        elif area < 2500:
            bedrooms = np.random.choice([3, 4], p=[0.55, 0.45])
        elif area < 3400:
            bedrooms = np.random.choice([4, 5], p=[0.60, 0.40])
        else:
            bedrooms = np.random.choice([4, 5, 6], p=[0.25, 0.60, 0.15])

        # Bathrooms realistically tied to bedrooms
        if bedrooms == 1:
            bathrooms = 1
        elif bedrooms == 2:
            bathrooms = np.random.choice([1, 2], p=[0.55, 0.45])
        elif bedrooms == 3:
            bathrooms = np.random.choice([2, 3], p=[0.65, 0.35])
        elif bedrooms == 4:
            bathrooms = np.random.choice([2, 3, 4], p=[0.20, 0.60, 0.20])
        else:
            bathrooms = np.random.choice([3, 4, 5], p=[0.35, 0.50, 0.15])

        # Parking
        if area < 1400:
            parking = 1
        elif area < 2600:
            parking = np.random.choice([1, 2], p=[0.45, 0.55])
        else:
            parking = np.random.choice([2, 3], p=[0.60, 0.40])

        # House age (0-25 years)
        house_age = int(np.clip(np.random.exponential(6), 0, 25))

        # Hedonic pricing calculation
        rate = loc_sqft_rates[loc]
        base_val = loc_base_premiums[loc]
        area_val = area * rate
        bed_val = bedrooms * 16500.0
        bath_val = bathrooms * 22000.0
        park_val = parking * 14000.0
        
        # Age depreciation: ~0.8% per year
        depreciation = (1.0 - (house_age * 0.008))
        
        # Natural market noise: N(0, 8500)
        noise = np.random.normal(0, 8500)
        
        raw_price = (base_val + area_val + bed_val + bath_val + park_val) * depreciation + noise
        
        # Round price to nearest 1,000 for realistic market listing
        price = int(max(150000, round(raw_price / 1000) * 1000))

        records.append({
            "area": area,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "location": loc,
            "house_age": house_age,
            "parking": parking,
            "price": price,
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), "house_data_extended.csv")
    df = generate_dataset(1200)
    df.to_csv(out_file, index=False)
    print(f"Generated {len(df)} records saved to {out_file}")
    print("\nDataset Summary by Location:")
    print(df.groupby("location")["price"].agg(["count", "mean", "min", "max"]))
