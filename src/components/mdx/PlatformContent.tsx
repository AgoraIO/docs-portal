export function PlatformInline(): never {
  throw new Error('PlatformInline should be transformed at MDX compile time.');
}

export function PlatformStructured(): never {
  throw new Error(
    'PlatformStructured should be transformed at MDX compile time.',
  );
}

export function PlatformProcessedMarker(): null {
  return null;
}
