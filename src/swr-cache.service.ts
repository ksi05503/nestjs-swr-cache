import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { deserialize, serialize } from 'node:v8';

type PossibleStaleCache<TValue extends object> = {
  staleAt: number;
  value: TValue;
};

/**
 *  Stale-While-Revalidate Cache Service
 */
@Injectable()
export class SwrCacheService {
  constructor(private redis: Redis) {}

  private async getBufferAndPttl(key: string): Promise<{ pttl: number; value: Buffer } | null> {
    const results = await this.redis.pipeline().pttl(key).getBuffer(key).exec();

    if (!results) return null;

    const [pttlError, pttl] = results[0];
    const [getError, value] = results[1];

    if (pttlError) throw pttlError;
    if (getError) throw getError;

    return value
      ? {
          pttl: pttl as number,
          value: value as Buffer,
        }
      : null;
  }

  protected readCache(key: string): Promise<{ pttl: number; value: Buffer } | null> {
    return this.getBufferAndPttl(key);
  }

  protected serialize<TValue extends object>(data: PossibleStaleCache<TValue>): Buffer {
    return serialize(data);
  }

  protected deserialize<TValue extends object>(serializedData: Buffer): PossibleStaleCache<TValue> {
    return deserialize(serializedData);
  }

  public async getStaleAndRevalidate<TValue extends object>(
    key: string,
    staleTimeInMs: number,
    fetch: () => Promise<TValue>,
  ): Promise<TValue> {
    const refresh = async () => {
      const data: PossibleStaleCache<TValue> = {
        value: await fetch(),
        staleAt: Date.now() + staleTimeInMs,
      };

      const serializedResult = this.serialize(data);
      this.redis.set(key, serializedResult).catch((err) => console.log(err)); // TODO: Error Handle

      return data;
    };

    const cache = await this.readCache(key);

    // fetch if cache missed
    if (!cache) {
      return (await refresh()).value;
    }

    const deserializedCache = this.deserialize<TValue>(cache.value);

    // revalidate and refresh if cache staled
    if (Date.now() > deserializedCache.staleAt) {
      refresh().catch((err) => console.log(err)); // TODO: Error Handle
    }

    // return possible stale cache value
    return deserializedCache.value;
  }
}