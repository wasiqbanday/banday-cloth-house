import { getCloudflareContext } from "@opennextjs/cloudflare";

type JsonKV = {
  get<T = unknown>(key: string, type: "json"): Promise<T | null>;
  put(key: string, value: string): Promise<void>;
};

type StoreEnv = {
  STORE_KV?: JsonKV;
};

export async function getStoreKV() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as StoreEnv).STORE_KV ?? null;
  } catch {
    return null;
  }
}

export async function readStoreList<T>(kv: JsonKV, key: string) {
  return (await kv.get<T[]>(key, "json")) ?? [];
}

export async function writeStoreList<T>(kv: JsonKV, key: string, items: T[]) {
  await kv.put(key, JSON.stringify(items));
}

export function newStoreId() {
  return crypto.randomUUID();
}

export function nowIso() {
  return new Date().toISOString();
}
