/*
  Warnings:

  - You are about to alter the column `area` on the `VirtualArea` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("geometry")`.

*/
-- create extension postgis if not exists;
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "VirtualArea"
ALTER COLUMN "area" TYPE geometry(Polygon,4326)
USING ST_GeomFromGeoJSON(area::text);
