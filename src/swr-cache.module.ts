import { DynamicModule, Module, Global } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';
import { SwrCacheService } from './swr-cache.service';

@Module({})
export class SwrCacheModule {
    static forRoot(redisOptions: RedisOptions): DynamicModule {
        const redisProvider = {
            provide: Redis,
            useValue: new Redis(redisOptions),
        };

        return {
            providers: [SwrCacheService, redisProvider],
            exports: [SwrCacheService],
            module: SwrCacheModule,
        };
    }
}
