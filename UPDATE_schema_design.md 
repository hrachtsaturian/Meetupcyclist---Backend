Users
-----
id PK int IDENTITY
first_name string
last_name string
email string UNIQUE
password string UNIQUE
bio string
pfp_url string default=url
is_active boolean default=true
created_at dateTime default=GETUTCDATE()

Events
-----
id PK int IDENTITY
title string
description string
date dateTime
location string
created_by int FK >- Users.id
created_at dateTime default=GETUTCDATE()

Groups 
-----
id PK int IDENTITY
name string
description string
created_by int FK >- Users.id
created_at dateTime default=GETUTCDATE()

Locations
-----
id PK int IDENTITY
name string UNIQUE
description string
address string
created_at dateTime default=GETUTCDATE()

Likes
-----
id PK int IDENTITY
user_id int FK >- Users.id
event_id int FK >- Events.id
group_id int FK >- Groups.id
location_id int FK >- Locations.id
created_at dateTime default=GETUTCDATE()

Reviews
-----
id PK int IDENTITY
user_id int FK >- Users.id
event_id int FK >- Events.id
group_id int FK >- Groups.id
location_id int FK >- Locations.id
rating int 
review_text string
created_at dateTime default=GETUTCDATE()

Events_attendees
-----
user_id int FK >- Users.id
event_id int FK >- Events.id
attending boolean

Groups_members
-----
user_id int FK >- Users.id
group_id int FK >- Groups.id
created_at dateTime default=GETUTCDATE()