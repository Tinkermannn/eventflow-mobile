// Utility: cek apakah titik (lat, lng) ada di dalam polygon area (GeoJSON)
export function isPointInPolygon(point: { latitude: number, longitude: number }, area: any): boolean {
  // area: GeoJSON Polygon, area.area.coordinates[0] = array of [lng, lat]
  const x = point.longitude;
  const y = point.latitude;
  const poly = area.coordinates[0];
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi + 0.0000001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
