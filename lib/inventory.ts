export type SizeStockMap = Record<string, number>;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeStock(value: unknown): number {
  const stock = Number(value);
  return Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
}

export function parseSizesToMap(value: unknown): SizeStockMap {
  let raw = value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return {};
    }
  }

  const sizes: SizeStockMap = {};
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (isRecord(item) && typeof item.size === 'string' && item.size.trim()) {
        sizes[item.size.trim().toUpperCase()] = normalizeStock(item.stock);
      }
    }
  } else if (isRecord(raw)) {
    for (const [size, stock] of Object.entries(raw)) {
      if (size.trim()) {
        sizes[size.trim().toUpperCase()] = normalizeStock(stock);
      }
    }
  }

  return sizes;
}

export function getTotalStock(sizes: SizeStockMap): number {
  return Object.values(sizes).reduce((total, stock) => total + normalizeStock(stock), 0);
}

export function getSizeStock(sizes: SizeStockMap, size: string): number {
  return sizes[size.trim().toUpperCase()] ?? 0;
}

export function decrementSizeStock(
  sizes: SizeStockMap,
  size: string,
  quantity: number
): SizeStockMap | null {
  const normalizedSize = size.trim().toUpperCase();
  const normalizedQuantity = Math.floor(quantity);
  const available = getSizeStock(sizes, normalizedSize);

  if (
    !normalizedSize ||
    !Number.isSafeInteger(normalizedQuantity) ||
    normalizedQuantity <= 0 ||
    available < normalizedQuantity
  ) {
    return null;
  }

  return {
    ...sizes,
    [normalizedSize]: available - normalizedQuantity,
  };
}
