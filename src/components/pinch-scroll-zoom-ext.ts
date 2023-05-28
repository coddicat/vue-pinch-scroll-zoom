export function getDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const sqrDistance = (x1 - x2) ** 2 + (y1 - y2) ** 2;
  const distance = Math.sqrt(sqrDistance);
  return distance;
}
