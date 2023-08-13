# NestJS SWR Cache Module
> NestJS module that implements the server-side Stale-While-Revalidate caching pattern using Redis.

## Installation

```bash
npm install nestjs-swr-cache
```

## Usage

#### Import the SwrCacheModule in your module:
```typescript
import { SwrCacheModule } from 'nestjs-swr-cache';

@Module({
  imports: [
    SwrCacheModule.forRoot({
      host: 'YOUR_REDIS_HOST',
      port: YOUR_REDIS_PORT,
      // ... other Redis options
    }),
  ],
})

export class YourModule {}
```

#### Use the SwrCacheService in your service or controller:

```typescript
import { SwrCacheService } from 'YOUR_NPM_PACKAGE_NAME';

@Injectable()
export class YourService {
  constructor(private swrCacheService: SwrCacheService) {}

  async someFunction() {
    const data = await this.swrCacheService.getStaleAndRevalidate(
      'your_cache_key',
      60000, // stale time
      () => this.fetchDataFunction // This should be a factory function that returns a promise with the data you want to cache
    );

    return data;
  }

  private async fetchDataFunction(): Promise<YourDataType> {
    // Fetch your data from an API, database, etc.
  }
}

````

#### Handle errors:
 
 Ensure you handle potential errors, especially when working with Redis and network operations.
Configuration
You can pass any Redis option to the forRoot method to configure the Redis client.

### License

Copyright (c) 2023 @GITHUB_NICKNAME

[MIT]
