CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
    CHECK (position('@' IN email) > 1),
  password TEXT NOT NULL,
  bio TEXT,
  pfp_url TEXT
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

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