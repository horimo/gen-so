"use client";

import { Container } from "pixi.js";

/**
 * オブジェクトプーリングの設定
 */
export interface PoolConfig<T extends Container> {
  create: () => T;
  reset?: (obj: T) => void; // オブジェクトを再利用可能な状態にリセット
  maxSize?: number; // プールの最大サイズ（未指定の場合は無制限）
}

/**
 * 汎用的なオブジェクトプーリングクラス
 */
export class ObjectPool<T extends Container> {
  private pool: T[] = [];
  private active: Set<T> = new Set();
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  constructor(config: PoolConfig<T>) {
    this.createFn = config.create;
    this.resetFn = config.reset;
    this.maxSize = config.maxSize ?? Infinity;
  }

  /**
   * オブジェクトを取得（プールから再利用、または新規作成）
   */
  acquire(): T {
    let obj: T;

    if (this.pool.length > 0) {
      // プールから再利用
      obj = this.pool.pop()!;
    } else {
      // 新規作成
      obj = this.createFn();
    }

    this.active.add(obj);
    return obj;
  }

  /**
   * オブジェクトをプールに返却
   */
  release(obj: T): void {
    if (!this.active.has(obj)) {
      return; // 既に返却済み
    }

    this.active.delete(obj);

    // リセット関数があれば実行
    if (this.resetFn) {
      this.resetFn(obj);
    }

    // プールの最大サイズを超えないように制限
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    } else {
      // 最大サイズを超える場合は破棄
      if (obj instanceof Container) {
        obj.destroy({ children: true });
      }
    }
  }

  /**
   * すべてのアクティブなオブジェクトを返却
   */
  releaseAll(): void {
    const activeArray = Array.from(this.active);
    activeArray.forEach((obj) => this.release(obj));
  }

  /**
   * プールのサイズを取得
   */
  getPoolSize(): number {
    return this.pool.length;
  }

  /**
   * アクティブなオブジェクトの数を取得
   */
  getActiveCount(): number {
    return this.active.size;
  }

  /**
   * プールをクリア
   */
  clear(): void {
    // アクティブなオブジェクトをすべて返却
    this.releaseAll();

    // プール内のオブジェクトを破棄
    this.pool.forEach((obj) => {
      if (obj instanceof Container) {
        obj.destroy({ children: true });
      }
    });
    this.pool = [];
  }

  /**
   * プールを破棄
   */
  destroy(): void {
    this.clear();
    this.active.clear();
  }
}

/**
 * オブジェクトプーリングのマネージャー
 * 複数のプールを管理
 */
export class ObjectPoolManager {
  private pools: Map<string, ObjectPool<any>> = new Map();

  /**
   * プールを登録
   */
  registerPool<T extends Container>(
    name: string,
    config: PoolConfig<T>
  ): ObjectPool<T> {
    const pool = new ObjectPool<T>(config);
    this.pools.set(name, pool);
    return pool;
  }

  /**
   * プールを取得
   */
  getPool<T extends Container>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name);
  }

  /**
   * すべてのプールをクリア
   */
  clearAll(): void {
    this.pools.forEach((pool) => pool.clear());
  }

  /**
   * すべてのプールを破棄
   */
  destroy(): void {
    this.pools.forEach((pool) => pool.destroy());
    this.pools.clear();
  }

  /**
   * プールの統計情報を取得
   */
  getStats(): Record<string, { poolSize: number; activeCount: number }> {
    const stats: Record<string, { poolSize: number; activeCount: number }> = {};
    this.pools.forEach((pool, name) => {
      stats[name] = {
        poolSize: pool.getPoolSize(),
        activeCount: pool.getActiveCount(),
      };
    });
    return stats;
  }
}

