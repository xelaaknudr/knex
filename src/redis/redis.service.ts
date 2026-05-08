import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  // --- Strings (Строки) ---
  // Самый простой тип: ключ -> значение
  // Пример: "user:100:name" -> "Ivan"
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  /**
   * Установить или обновить время жизни ключа (в секундах)
   * Возвращает 1, если TTL установлен, и 0, если ключ не существует
   */
  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }


  // --- Lists (Списки) ---
  // Упорядоченная последовательность строк
  // Пример: "tasks" -> ["task3", "task2", "task1"] (lpush добавляет в начало)
  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.client.lpush(key, ...values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.client.rpush(key, ...values);
  }

  // Получить элементы: lrange("tasks", 0, -1) вернет весь список
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }

  // --- Hashes (Хэши / Объекты) ---
  // Плоские объекты (поле -> значение)
  // Пример: "user:100" -> { name: "Ivan", age: "25", city: "Moscow" }
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  // Возвращает весь объект
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  // --- Sets (Множества) ---
  // Неупорядоченная коллекция уникальных строк
  // Пример: "tags:post:1" -> ["news", "tech", "coding"] (дубликатов быть не может)
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  // --- Sorted Sets (Упорядоченные множества) ---
  // Множество, где каждый элемент имеет "score" (вес/рейтинг) для сортировки
  // Пример: "leaderboard" -> { "player1": 100, "player2": 250, "player3": 50 }
  // Redis отсортирует их автоматически: player3 (50), player1 (100), player2 (250)
  async zadd(key: string, score: number, member: string): Promise<number | string> {
    return this.client.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrange(key, start, stop);
  }

  // Список от ЛУЧШИХ к ХУДШИМ (по убыванию score) — полезно для лидербордов
  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrevrange(key, start, stop);
  }

  // Удалить элемент из множества
  async zrem(key: string, member: string): Promise<number> {
    return this.client.zrem(key, member);
  }


  // --- Geo (Гео-индексы) ---
  // Позволяет хранить координаты (долгота, широта) и искать по радиусу
  // Пример: "cities" -> { "Moscow": [37.61, 55.75], "Berlin": [13.40, 52.52] }
  async geoadd(key: string, longitude: number, latitude: number, member: string): Promise<number> {
    return this.client.geoadd(key, longitude, latitude, member);
  }

  // Расстояние между двумя точками
  async geodist(key: string, member1: string, member2: string, unit: 'm' | 'km' | 'mi' | 'ft' = 'm'): Promise<string | null> {
    return this.client.geodist(key, member1, member2, unit as any);
  }

  // Получить координаты объекта
  async geopos(key: string, ...members: string[]): Promise<Array<[string, string] | null>> {
    return this.client.geopos(key, ...members) as any;
  }

  // Поиск объектов в радиусе от точки
  // Пример: найти все магазины в радиусе 5км от текущих координат
  async georadius(key: string, longitude: number, latitude: number, radius: number, unit: 'm' | 'km' | 'mi' | 'ft'): Promise<any> {
    return this.client.georadius(key, longitude, latitude, radius, unit);
  }

  // --- Full-Text Search (RediSearch / Полнотекстовый поиск) ---
  // Позволяет искать по полям внутри Хэшей (Hashes) как в поисковике
  
  /**
   * Создать индекс для поиска
   * Пример: ftCreate('idx:users', ['name', 'TEXT', 'city', 'TEXT'])
   * Это скажет Redis индексировать поля 'name' и 'city' во всех хэшах, подходящих под критерии
   */
  async ftCreate(indexName: string, schema: string[]): Promise<any> {
    return this.client.call('FT.CREATE', indexName, 'ON', 'HASH', 'SCHEMA', ...schema);
  }

  /**
   * Сам поиск
   * Пример: ftSearch('idx:users', '@city:Moscow')
   * Найдет всех пользователей, у которых в поле city написано Moscow
   */
  async ftSearch(indexName: string, query: string): Promise<any> {
    return this.client.call('FT.SEARCH', indexName, query);
  }

  /**
   * Удалить индекс
   */
  async ftDropIndex(indexName: string): Promise<any> {
    return this.client.call('FT.DROPINDEX', indexName);
  }

  // Помощник для доступа к самому клиенту ioredis, если нужны другие команды
  getClient(): Redis {
    return this.client;
  }
}
