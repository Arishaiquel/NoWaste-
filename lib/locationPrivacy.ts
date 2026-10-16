export function privacySafeCoordinates(latitude: number, longitude: number, seed: string) {
  let hash = 0; for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  const angle = (Math.abs(hash) % 360) * Math.PI / 180; const distanceKm = .25 + (Math.abs(hash >> 8) % 351) / 1000;
  return { publicLatitude: latitude + distanceKm / 111 * Math.cos(angle), publicLongitude: longitude + distanceKm / (111 * Math.cos(latitude * Math.PI / 180)) * Math.sin(angle) };
}
