-- Generation counter for the public page cache. Bumping it changes the cache key.
CREATE TABLE app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO app_meta (key, value) VALUES ('public_cache', '1');
