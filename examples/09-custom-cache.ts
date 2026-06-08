/**
 * Example 09: Custom Cache & Deduplicator
 * @description Use your own LRUCache / RequestDeduplicator instead of the global singletons.
 */

import { LRUCache, RequestDeduplicator, generate } from '@umituz/pruna-provider';

const myCache = new LRUCache<string, string>({ maxSize: 100, ttl: 60_000 });
const myDeduplicator = new RequestDeduplicator(10_000);

async function generateOnce(apiKey: string, prompt: string) {
  const cacheKey = `${apiKey}:${prompt}`;

  // Reuse a cached result if available
  const cached = myCache.get(cacheKey);
  if (cached) {
    console.log('Cache hit:', cached);
    return { url: cached, model: 'p-image' as const };
  }

  // Coalesce concurrent calls and store the result
  return myDeduplicator.execute(cacheKey, async () => {
    const result = await generate(apiKey, { model: 'p-image', prompt });
    myCache.set(cacheKey, result.url);
    return result;
  });
}

(async () => {
  const result = await generateOnce(process.env.PRUNA_API_KEY ?? '', 'A red door in a stone wall');
  console.log(result);
})();
