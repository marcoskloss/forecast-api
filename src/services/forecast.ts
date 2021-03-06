import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';
import logger from '@src/logger';
import { Beach } from '@src/models/beach';
import { Rating } from '@src/services/rating';
import { InternalError } from '@src/util/errors/internal-error';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {
  rating: number;
}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class ForecastInternalProcessingError extends InternalError {
  constructor(message: string) {
    const internalMessage = 'Unexpected error during the forecast processing';
    super(`${internalMessage}: ${message}`);
  }
}

export class Forecast {
  constructor(
    protected stormGlass = new StormGlass(),
    protected RatingService: typeof Rating = Rating
  ) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    try {
      const beachForecast = await this.calculateRating(beaches);
      const timesForecast = this.mapForecastByTime(beachForecast);
      return timesForecast.map(timeForecast => ({
        time: timeForecast.time,
        forecast: [...timeForecast.forecast.sort((a, b) => b.rating - a.rating)]
      }))
    } catch (err) {
      logger.error(err);
      throw new ForecastInternalProcessingError(err.message);
    }
  }
 
  private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];
    logger.info(`Preparing the forecast for ${beaches.length} beaches`);

    const points = await Promise.all(
      beaches.map(beach => this.stormGlass.fetchPoints(beach.lat, beach.lng))
    )

    for (let i = 0; i < beaches.length; i++) {
      const rating = new this.RatingService(beaches[i]);
      const enrichedBeachData = this.enrichedBeachData(
        points[i], 
        beaches[i],
        rating
      );
      pointsWithCorrectSources.push(...enrichedBeachData);
    }
    return pointsWithCorrectSources;
  }

  private enrichedBeachData(
    points: ForecastPoint[],
    beach: Beach,
    rating: Rating
  ): BeachForecast[] {
    return points.map((point) => ({
      lat: beach.lat,
      lng: beach.lng,
      name: beach.name,
      position: beach.position,
      rating: rating.getRateForPoint(point),
      ...point,
    }));
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];

    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time);
      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }

    return forecastByTime;
  }
}
