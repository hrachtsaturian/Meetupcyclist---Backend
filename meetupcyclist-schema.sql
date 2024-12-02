CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
    CHECK (position('@' IN email) > 1),
  password TEXT NOT NULL,
  bio TEXT,
  pfp_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- add admin user when seeding db?

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name TEXT  NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- delete these from database and recreate

CREATE TABLE event_attendees (
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(id), 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
)

CREATE TABLE group_members (
  user_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
)

CREATE TABLE event_favorites (
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(id), 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
)

CREATE TABLE group_favorites (
  user_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES users(id), 
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
)

CREATE TABLE location_favorites (
  user_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, location_id),
  FOREIGN KEY (user_id) REFERENCES users(id), 
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
)
