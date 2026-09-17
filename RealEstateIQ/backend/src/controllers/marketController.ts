import { Response, NextFunction } from 'express';
import { Property } from '../models/Property';
import { AuthRequest } from '../middleware/auth';

// ── Market analytics ──────────────────────────────────────────────────────
export const getMarketAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { location, propertyType } = req.query;
    const filter: Record<string, unknown> = {};
    if (location) filter.location = location;
    if (propertyType) filter.propertyType = propertyType;

    const [overallStats, byLocation, byPropertyType, priceDistribution] =
      await Promise.all([
        // Overall aggregate stats from actual stored properties
        Property.aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              avgPrice: { $avg: '$askingPrice' },
              minPrice: { $min: '$askingPrice' },
              maxPrice: { $max: '$askingPrice' },
              avgArea: { $avg: '$area' },
              avgBedrooms: { $avg: '$bedrooms' },
            },
          },
        ]),

        // Stats by location
        Property.aggregate([
          { $match: { askingPrice: { $exists: true, $gt: 0 } } },
          {
            $group: {
              _id: '$location',
              count: { $sum: 1 },
              avgPrice: { $avg: '$askingPrice' },
              minPrice: { $min: '$askingPrice' },
              maxPrice: { $max: '$askingPrice' },
              avgArea: { $avg: '$area' },
            },
          },
          { $sort: { count: -1 } },
        ]),

        // Stats by property type
        Property.aggregate([
          { $match: { askingPrice: { $exists: true, $gt: 0 } } },
          {
            $group: {
              _id: '$propertyType',
              count: { $sum: 1 },
              avgPrice: { $avg: '$askingPrice' },
            },
          },
          { $sort: { count: -1 } },
        ]),

        // Price range distribution (bucket)
        Property.aggregate([
          { $match: { askingPrice: { $exists: true, $gt: 0 }, ...filter } },
          {
            $bucket: {
              groupBy: '$askingPrice',
              boundaries: [0, 200000, 400000, 600000, 800000, 1000000, 2000000],
              default: '2000000+',
              output: { count: { $sum: 1 } },
            },
          },
        ]),
      ]);

    // Median price requires sorting — compute manually
    const pricesForMedian = await Property.find(
      { askingPrice: { $exists: true, $gt: 0 }, ...filter },
      'askingPrice'
    ).sort({ askingPrice: 1 });

    let medianPrice: number | null = null;
    const prices = pricesForMedian.map((p) => p.askingPrice!);
    if (prices.length > 0) {
      const mid = Math.floor(prices.length / 2);
      medianPrice =
        prices.length % 2 !== 0
          ? prices[mid]
          : (prices[mid - 1] + prices[mid]) / 2;
    }

    // Avg price per sqft
    const sqftData = await Property.aggregate([
      { $match: { askingPrice: { $gt: 0 }, area: { $gt: 0 }, ...filter } },
      {
        $project: {
          pricePerSqft: { $divide: ['$askingPrice', '$area'] },
        },
      },
      { $group: { _id: null, avgPricePerSqft: { $avg: '$pricePerSqft' } } },
    ]);

    res.json({
      success: true,
      data: {
        overall: {
          ...(overallStats[0] || { count: 0, avgPrice: null }),
          medianPrice,
          avgPricePerSqft: sqftData[0]?.avgPricePerSqft ?? null,
        },
        byLocation,
        byPropertyType,
        priceDistribution,
        note: 'Analytics are based on properties stored in the database.',
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Recommendations ────────────────────────────────────────────────────────
export const getRecommendations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      budget,
      location,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      propertyType,
    } = req.query;

    // Fetch candidate properties
    const filter: Record<string, unknown> = {};
    if (location) filter.location = location;
    if (propertyType) filter.propertyType = propertyType;

    const properties = await Property.find(filter).limit(100);

    // Rule-based match scoring
    const scored = properties
      .map((prop) => {
        let score = 0;
        let maxScore = 0;

        // Budget match (40 points)
        if (budget && prop.askingPrice) {
          maxScore += 40;
          const budgetNum = Number(budget);
          if (prop.askingPrice <= budgetNum) {
            const ratio = prop.askingPrice / budgetNum;
            score += ratio >= 0.7 ? 40 : ratio >= 0.5 ? 25 : 10;
          }
        } else if (!budget) {
          maxScore += 40;
          score += 20; // neutral
        }

        // Bedrooms (20 points)
        if (bedrooms) {
          maxScore += 20;
          const bedsWanted = Number(bedrooms);
          if (prop.bedrooms === bedsWanted) score += 20;
          else if (Math.abs(prop.bedrooms - bedsWanted) === 1) score += 12;
          else if (Math.abs(prop.bedrooms - bedsWanted) === 2) score += 5;
        } else {
          maxScore += 20;
          score += 10;
        }

        // Bathrooms (15 points)
        if (bathrooms) {
          maxScore += 15;
          const bathsWanted = Number(bathrooms);
          if (prop.bathrooms === bathsWanted) score += 15;
          else if (Math.abs(prop.bathrooms - bathsWanted) === 1) score += 8;
        } else {
          maxScore += 15;
          score += 7;
        }

        // Area (25 points)
        if (minArea || maxArea) {
          maxScore += 25;
          const min = minArea ? Number(minArea) : 0;
          const max = maxArea ? Number(maxArea) : Infinity;
          if (prop.area >= min && prop.area <= max) score += 25;
          else if (prop.area >= min * 0.8 && prop.area <= max * 1.2) score += 12;
        } else {
          maxScore += 25;
          score += 12;
        }

        const matchPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

        return { property: prop, matchPercentage, score };
      })
      .filter((r) => r.matchPercentage >= 30)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        recommendations: scored,
        matchingCriteria: {
          budget: budget || null,
          location: location || null,
          bedrooms: bedrooms || null,
          bathrooms: bathrooms || null,
          minArea: minArea || null,
          maxArea: maxArea || null,
          propertyType: propertyType || null,
        },
        note: 'Recommendations use rule-based weighted scoring, not an ML model.',
      },
    });
  } catch (err) {
    next(err);
  }
};
