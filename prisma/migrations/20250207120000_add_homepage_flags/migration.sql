-- Add landing page highlight flags
ALTER TABLE "activities"
  ADD COLUMN "showOnHomepage" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE "announcements"
  ADD COLUMN "showOnHomepage" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE "galleries"
  ADD COLUMN "showOnHomepage" BOOLEAN NOT NULL DEFAULT FALSE;
