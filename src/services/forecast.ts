import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';

export enum BeachPosition {
  S = 'S',
  N = 'N',
  W = 'W',
  E = 'E',
}

export interface Beach {
  name: string;
  lat: number;
  lng: number;
  position: BeachPosition;
  user: string;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<BeachForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];

    for (const beach of beaches) {
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
      const enrichedBeachData = points.map((point) => ({
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1,
        ...point,
      }));

      pointsWithCorrectSources.push(...enrichedBeachData);
    }
    return pointsWithCorrectSources;
  }
}
