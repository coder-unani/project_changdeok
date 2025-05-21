import { ExtendedPrismaClient } from '../../library/database';
import { BaseService } from './service';

// 캐시 TTL (5분)
const CACHE_TTL = 5 * 60 * 1000;

export class CacheService extends BaseService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(prisma: ExtendedPrismaClient) {
    super(prisma);
  }

  /**
   * 캐시에서 데이터 가져오기
   * @param key 캐시 키
   * @returns 캐시된 데이터 또는 null
   */
  public get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * 캐시에 데이터 설정
   * @param key 캐시 키
   * @param data 캐시할 데이터
   */
  public set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * 캐시에서 데이터 삭제
   * @param key 캐시 키
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 특정 패턴과 일치하는 모든 캐시 삭제
   * @param pattern 캐시 키 패턴
   */
  public deleteByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 모든 캐시 삭제
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * 캐시 크기 반환
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * 캐시된 키 목록 반환
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }
}
