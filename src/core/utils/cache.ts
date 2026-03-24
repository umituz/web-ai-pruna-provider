/**
 * LRU Cache Implementation
 * @description Tree-shakeable LRU cache for request deduplication and result caching
 */

interface CacheNode<K, V> {
  key: K;
  value: V;
  prev: CacheNode<K, V> | null;
  next: CacheNode<K, V> | null;
  expiresAt: number;
}

export interface CacheOptions<K, V> {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  onEvict?: (key: K, value: V) => void;
}

/**
 * LRU (Least Recently Used) Cache implementation
 */
export class LRUCache<K, V> {
  private maxSize: number;
  private ttl: number;
  private onEvict?: (key: K, value: V) => void;
  private cache: Map<K, CacheNode<K, V>>;
  private head: CacheNode<K, V> | null;
  private tail: CacheNode<K, V> | null;

  constructor(options: CacheOptions<K, V> = {}) {
    this.maxSize = options.maxSize ?? 50;
    this.ttl = options.ttl ?? 5 * 60 * 1000; // 5 minutes default
    this.onEvict = options.onEvict;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  /**
   * Get a value from cache
   * Returns undefined if not found or expired
   */
  get(key: K): V | undefined {
    const node = this.cache.get(key);

    if (!node) return undefined;

    // Check if expired
    if (Date.now() > node.expiresAt) {
      this.delete(key);
      return undefined;
    }

    // Move to head (most recently used)
    this.moveToHead(node);
    return node.value;
  }

  /**
   * Set a value in cache
   */
  set(key: K, value: V): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      // Update existing node
      existingNode.value = value;
      existingNode.expiresAt = Date.now() + this.ttl;
      this.moveToHead(existingNode);
      return;
    }

    // Create new node
    const newNode: CacheNode<K, V> = {
      key,
      value,
      prev: null,
      next: null,
      expiresAt: Date.now() + this.ttl,
    };

    this.cache.set(key, newNode);
    this.addToHead(newNode);

    // Check if we need to evict
    if (this.cache.size > this.maxSize) {
      this.removeTail();
    }
  }

  /**
   * Delete a specific key
   */
  delete(key: K): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.removeNode(node);
    this.cache.delete(key);
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: K[] = [];

    for (const [key, node] of this.cache) {
      if (now > node.expiresAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
  }

  /**
   * Add node to head of list (most recently used)
   */
  private addToHead(node: CacheNode<K, V>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  /**
   * Move existing node to head
   */
  private moveToHead(node: CacheNode<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * Remove node from list
   */
  private removeNode(node: CacheNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  /**
   * Remove tail node (least recently used)
   */
  private removeTail(): void {
    if (!this.tail) return;

    const key = this.tail.key;
    const value = this.tail.value;

    this.removeNode(this.tail);
    this.cache.delete(key);

    this.onEvict?.(key, value);
  }
}

/**
 * Create a cache with default options
 */
export function createCache<K, V>(options?: CacheOptions<K, V>): LRUCache<K, V> {
  return new LRUCache<K, V>(options);
}
