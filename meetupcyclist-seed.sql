-- for `users` table
INSERT INTO users (first_name, last_name, email, password, bio, pfp_url, is_admin, created_at)
VALUES
-- Example (25) Users - first two are Admins
-- password is 'changeme'
-- (!) make sure to change the password for the admin users
('John', 'Doe', 'john.doe@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Motorcycle enthusiast and adventurer.', '', TRUE, NOW()),
('Jane', 'Smith', 'jane.smith@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Loves long rides and road trips.', '', TRUE, NOW()),

('Alice', 'Johnson', 'alice.j@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Experienced mechanic with a love for bikes.', '', FALSE, NOW()),
('Bob', 'Brown', 'bob.brown@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', '', '', FALSE, NOW()),
('Charlie', 'Davis', 'charlie.d@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Riding across states is my passion.', '', FALSE, NOW()),
('Emily', 'Wilson', 'emily.w@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', NULL, '', FALSE, NOW()),
('Frank', 'Garcia', 'frank.g@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Adventure seeker and weekend rider.', '', FALSE, NOW()),
('Grace', 'Lee', 'grace.lee@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Motorcycle tour guide and blogger.', '', FALSE, NOW()),
('Henry', 'Martinez', 'henry.martinez@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'New to biking, excited to learn!', '', FALSE, NOW()),
('Ivy', 'Clark', 'ivy.clark@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', NULL, '', FALSE, NOW()),
('Jack', 'Lopez', 'jack.lopez@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', NULL, '', FALSE, NOW()),
('Karen', 'Hernandez', 'karen.h@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Solo traveler on two wheels.', '', FALSE, NOW()),
('Luke', 'Scott', 'luke.s@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Motorcycle collector.', '', FALSE, NOW()),
('Mia', 'Evans', 'mia.evans@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Cruiser rider.', '', FALSE, NOW()),
('Noah', 'Adams', 'noah.adams@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', NULL, '', FALSE, NOW()),
('Olivia', 'Wright', 'olivia.wright@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Love planning group rides.', '', FALSE, NOW()),
('Paul', 'Hill', 'paul.hill@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', NULL, '', FALSE, NOW()),
('Quinn', 'Green', 'quinn.green@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Beginner biker, ready for adventures.', '', FALSE, NOW()),
('Ruby', 'Baker', 'ruby.baker@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Cafe racer enthusiast.', '', FALSE, NOW()),
('Sam', 'Perez', 'sam.perez@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', NULL, '', FALSE, NOW()),
('Tina', 'White', 'tina.white@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'MotoGP fan and blogger.', '', FALSE, NOW()),
('Umar', 'Thompson', 'umar.t@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', NULL, '', FALSE, NOW()),
('Victor', 'Diaz', 'victor.diaz@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Dirt biking is my life!', '', FALSE, NOW()),
('Wendy', 'Moore', 'wendy.moore@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', NULL, '', FALSE, NOW()),
('Xander', 'Morgan', 'xander.morgan@example.com', '$2b$12$xqqVGJsRoZz8v71Kc8YPtea2vo3LPFZE9LQ018f9/bV5XAmidfDKe', 'Exploring the world on my motorcycle.', '', FALSE, NOW());


-- for `events` table
INSERT INTO events (title, description, date, location, pfp_url, created_by, created_at)
VALUES
-- Example (25) Events
-- Upcoming Events
('Desert Trail Ride', 'Ride through the scenic desert trails.', NOW() + INTERVAL '1 DAY', 'Golden Sands, Arizona', '', 6, NOW()),
('Cafe Racer Meetup', 'Meet other cafe racer enthusiasts.', NOW() + INTERVAL '10 DAY', 'Bikers Cafe, Downtown', '', 7, NOW()),
('Track Day Practice', 'Improve your skills on a professional track.', NOW() + INTERVAL '20 DAY', 'Springfield Raceway', '', 8, NOW()),
('Spring Rally', 'Celebrate the beginning of spring with a rally.', NOW() + INTERVAL '50 DAY', 'Green Meadows Park, Springfield', '', 9, NOW()),
('Women Riders Day', 'A special day for women riders.', NOW() + INTERVAL '100 DAY', 'Lakeside View, Willow Lake', '', 10, NOW()),

('Vintage Bike Expo', 'Showcase and celebrate vintage bikes.', NOW() + INTERVAL '150 DAY', 'City Expo Hall, Downtown', '', 11, NOW()),
('Off-Road Madness', 'A thrilling off-road adventure.', NOW() + INTERVAL '160 DAY', 'Red Canyon Trails, Utah', '', 12, NOW()),
('Annual Bike Parade', 'Join us for the annual parade.', NOW() + INTERVAL '170 DAY', 'Main Boulevard, Springfield', '', 13, NOW()),
('Evening Ride Social', 'Casual evening ride followed by a meetup.', NOW() + INTERVAL '180 DAY', 'Downtown Loop, Springfield', '', 14, NOW()),
('Skills Workshop', 'Improve your riding techniques.', NOW() + INTERVAL '190 DAY', 'Community Center, Springfield', '', 15, NOW()),

('Weekend Road Trip', 'Explore scenic routes with fellow riders.', NOW() + INTERVAL '200 DAY', 'Scenic Highway, Blue Ridge', '', 16, NOW()),
('Hill Climb Challenge', 'Take on the hill climb adventure.', NOW() + INTERVAL '210 DAY', 'Hillside Trails, Colorado', '', 17, NOW()),
('Custom Bike Show', 'Show off your custom bike designs.', NOW() + INTERVAL '220 DAY', 'Expo Grounds, City Center', '', 18, NOW()),
('Adventure Campout', 'Weekend campout for adventurous riders.', NOW() + INTERVAL '230 DAY', 'Campgrounds, Mountain Edge', '', 19, NOW()),
('Urban Exploration Ride', 'Explore the hidden gems of the city.', NOW() + INTERVAL '240 DAY', 'Central Plaza, Springfield', '', 20, NOW()),

('Sunday Morning Ride', 'Join us for a relaxed ride through the countryside.', NOW() + INTERVAL '1 YEAR' + INTERVAL '1 DAY', 'Riverside Park, Springfield', NULL, 1, NOW()),
('Motorcycle Mechanics Workshop', 'Learn the basics of motorcycle maintenance.', NOW() + INTERVAL '1 YEAR' + INTERVAL '2 DAY', 'Downtown Community Center, Springfield', NULL, 3, NOW()),
('Mountain Adventure Tour', 'Experience the thrill of mountain rides.', NOW() + INTERVAL '1 YEAR' + INTERVAL '3 DAY', 'Eagle Peak, Montana', NULL, 2, NOW()),
('Night Ride Extravaganza', 'City night ride followed by dinner.', NOW() + INTERVAL '1 YEAR' + INTERVAL '4 DAY', 'Main Square, City Center', NULL, 4, NOW()),
('Charity Bike Show', 'Show your bikes for a good cause.', NOW() + INTERVAL '1 YEAR' + INTERVAL '5 DAY', 'Expo Grounds, Springfield', NULL, 5, NOW()),

-- Past Events
('Dirt Bike Championship', 'Test your skills in a dirt bike competition.', '2024-05-26 08:00:00+00', 'Dirt Arena, Hillside', NULL, 21, NOW()),
('Group Dinner Ride', 'Ride and dine with fellow bikers.', '2024-06-02 18:30:00+00', 'The Ridge Restaurant, Springfield', NULL, 22, NOW()),
('Beginner Workshop', 'Guided workshop for new riders.', '2024-06-09 09:00:00+00', 'Rider Training Facility, Springfield', NULL, 23, NOW()),
('Sunday Brunch Ride', 'Morning ride ending with brunch.', '2024-06-16 08:30:00+00', 'Lakeside Diner, Willow Lake', NULL, 24, NOW()),
('Beachside Bonanza', 'Beach ride and picnic.', '2024-06-23 10:00:00+00', 'Sunny Beach, Bayview', NULL, 25, NOW());


-- for `event_attendees` table
INSERT INTO event_attendees (user_id, event_id, created_at)
VALUES
-- Insert attendance records for 25 users with different events
(1, 1, NOW()), (1, 3, NOW()),
(2, 2, NOW()), (2, 5, NOW()),
(3, 1, NOW()), (3, 2, NOW()),
(4, 4, NOW()), (4, 7, NOW()),
(5, 1, NOW()), (5, 5, NOW()), (5, 8, NOW()),

(6, 9, NOW()), (6, 12, NOW()),
(7, 2, NOW()), (7, 10, NOW()), (7, 14, NOW()),
(8, 3, NOW()), (8, 15, NOW()), (8, 11, NOW()),
(9, 4, NOW()), (9, 6, NOW()), (9, 16, NOW()),

(10, 5, NOW()), (10, 6, NOW()),
(11, 3, NOW()), (11, 18, NOW()),
(12, 19, NOW()),
(13, 20, NOW()), (13, 7, NOW()),
(14, 8, NOW()), (14, 9, NOW()), (14, 21, NOW()),

(15, 10, NOW()), (15, 11, NOW()),
(16, 1, NOW()), (16, 22, NOW()),
(17, 12, NOW()), (17, 14, NOW()),
(18, 15, NOW()),
(19, 17, NOW()), (19, 23, NOW()),

(20, 24, NOW()),
(21, 13, NOW()),
(22, 25, NOW()), (22, 8, NOW()),
(23, 9, NOW()),
(24, 10, NOW()),
(25, 12, NOW()), (25, 24, NOW()), (25, 18, NOW());


-- for `event_posts` table
INSERT INTO event_posts (user_id, event_id, text, created_at)
VALUES
-- Insert 5 posts for 5 events with example user interactions

-- Posts for event 1
(1, 1, 'Looking forward to this ride!', NOW()),
(3, 1, 'Who else is joining the countryside ride?', NOW()),
(5, 1, 'Can we confirm the meeting spot?', NOW()),
(8, 1, 'First big ride for me. Excited!', NOW()),
(16, 1, 'Hope the weather stays clear.', NOW()),

-- Posts for event 2
(7, 2, 'I need help with my clutch adjustment during the workshop.', NOW()),
(2, 2, 'Are tools provided, or do we need to bring our own?', NOW()),
(11, 2, 'Can’t wait to improve my skills at the workshop.', NOW()),
(3, 2, 'Will there be a Q&A session?', NOW()),
(6, 2, 'I’ll share my bike’s quirks with the group.', NOW()),

-- Posts for event 3
(8, 3, 'Mountain rides are always a blast!', NOW()),
(9, 3, 'Excited to try the adventure routes!', NOW()),
(12, 3, 'I heard the peak views are breathtaking.', NOW()),
(5, 3, 'How are the roads leading to the base?', NOW()),
(1, 3, 'Planning on bringing a GoPro!', NOW()),

-- Posts for event 4
(4, 4, 'Dinner spot after the ride confirmed?', NOW()),
(10, 4, 'First-time night riding, any tips?', NOW()),
(14, 4, 'Are we splitting into smaller groups?', NOW()),
(9, 4, 'Which route has the best city views?', NOW()),
(16, 4, 'The night air is going to be refreshing.', NOW()),

-- Posts for event 5
(10, 5, 'I’m showing my custom build at the show.', NOW()),
(7, 5, 'Do participants need pre-registration?', NOW()),
(2, 5, 'Looking forward to seeing everyone’s bikes!', NOW()),
(5, 5, 'Are we fundraising on-site or online?', NOW()),
(15, 5, 'Bringing some friends to watch.', NOW());


-- for `groups` table
INSERT INTO groups (name, description, pfp_url, created_by) 
VALUES
-- Example (25) Groups
('Cruisers Collective', 'A group for lovers of cruiser motorcycles and long highway rides.', '', 1),
('Sportbike Society', 'For adrenaline junkies who live for speed and twisty roads.', '', 2),
('Touring Tribe', 'Motorcyclists who enjoy long-distance touring and exploring new places.', '', 3),
('Cafe Racer Enthusiasts', 'A club for cafe racer fans who appreciate retro style and performance.', '', 4),
('Chopper Gang', 'Custom chopper builders and riders exchanging ideas and rides.', '', 5),
('Adventure Riders', 'Motorcycle adventurers conquering rugged terrains and scenic landscapes.', '', 6),
('Vintage Motorheads', 'Restoring, preserving, and riding vintage motorcycles.', '', 7),
('Scooter Crew', 'Scooter riders sharing urban adventures and quick getaways.', '', 8),
('Dirt Devils', 'Trail riders and off-road enthusiasts looking for the next muddy thrill.', '', 9),
('Track Day Warriors', 'For bikers who love hitting the race track and pushing the limits.', '', 10),
('Motorcycle Photography', 'Riders who capture the beauty of bikes and landscapes.', '', 11),
('Ladies on Wheels', 'Empowering women riders and fostering a strong biking community.', '', 12),
('Bike Builders Collective', 'Custom builders and gearheads collaborating on motorcycle projects.', '', 13),
('Night Riders Club', 'Urban bikers who own the night streets with style and power.', '', 14),
('Harley Owners Hub', 'Harley-Davidson owners sharing rides, stories, and events.', '', 15),
('Stunt Riders Alliance', 'Showcasing jaw-dropping stunts and pushing motorcycle skills.', '', 16),
('Electric Explorers', 'Motorcyclists diving into the future of electric motorcycles.', '', 17),
('Moto Journalists', 'Writers, bloggers, and storytellers in the motorcycle world.', '', 18),
('Weekend Wanderers', 'Casual riders exploring nearby routes on weekends.', '', 19),
('Bike Camping Crew', 'Motorcyclists who combine riding with camping under the stars.', '', 20),
('Classic Bike Lovers', 'Appreciating the timeless elegance of classic motorcycles.', '', 21),
('Two-Stroke Legends', 'Riders and fans of iconic two-stroke motorcycles.', '', 22),
('Streetfighter Syndicate', 'Custom streetfighters and aggressive motorcycle designs.', '', 23),
('Hill Climbers United', 'Taking bikes to the heights with thrilling hill-climbing challenges.', '', 24),
('Moto Tech Gurus', 'Motorcycle maintenance, repairs, and tuning expertise.', '', 25);


-- for `group_members` table
INSERT INTO group_members (user_id, group_id, created_at)
VALUES
-- Insert membership records for 10 users with different groups
(1, 1, NOW()), (1, 2, NOW()), (1, 5, NOW()), (1, 8, NOW()), (1, 15, NOW()), (1, 16, NOW()),
(2, 1, NOW()), (2, 4, NOW()), (2, 10, NOW()), (2, 13, NOW()), (2, 21, NOW()),
(3, 3, NOW()), (3, 7, NOW()), (3, 10, NOW()), (3, 14, NOW()), (3, 17, NOW()),
(4, 5, NOW()), (4, 6, NOW()), (4, 8, NOW()), (4, 18, NOW()), (4, 20, NOW()),
(5, 2, NOW()), (5, 6, NOW()), (5, 9, NOW()), (5, 11, NOW()), (5, 12, NOW()),
(6, 8, NOW()), (6, 11, NOW()), (6, 13, NOW()), (6, 15, NOW()), (6, 24, NOW()),
(7, 3, NOW()), (7, 5, NOW()), (7, 12, NOW()), (7, 18, NOW()), (7, 23, NOW()),
(8, 4, NOW()), (8, 7, NOW()), (8, 14, NOW()), (8, 19, NOW()), (8, 22, NOW()),
(9, 9, NOW()), (9, 13, NOW()), (9, 16, NOW()), (9, 17, NOW()), (9, 20, NOW()),
(10, 11, NOW()), (10, 14, NOW()), (10, 17, NOW()), (10, 19, NOW()), (10, 25, NOW());


-- for `group_events` table
INSERT INTO group_events (event_id, group_id, created_at)
VALUES
(1, 1, NOW()), (2, 1, NOW()), (3, 1, NOW()),
(4, 2, NOW()), (5, 2, NOW()), (6, 3, NOW()), 
(7, 4, NOW()), (8, 4, NOW()), (9, 4, NOW()),
(10, 5, NOW()), (11, 5, NOW()), (12, 6, NOW()),
(13, 6, NOW()), (14, 7, NOW()), (15, 8, NOW()),
(16, 9, NOW()), (17, 9, NOW()), (18, 10, NOW()),
(19, 11, NOW()), (20, 12, NOW()), (21, 13, NOW()),
(22, 14, NOW()), (23, 15, NOW()), (24, 16, NOW()),
(25, 17, NOW()), (25, 18, NOW());


-- for `group_posts` table
INSERT INTO group_posts (user_id, group_id, text, created_at, updated_at)
VALUES
-- Insert 5 posts for 10 groups with example user interactions

-- Group 1 posts
(1, 1, 'Cruising along the coast today, love this bike!', NOW(), NULL),
(2, 1, 'Great weekend ride through the hills, feeling the power!', NOW(), NULL),
(3, 1, 'Who is up for a group ride next weekend?', NOW(), NULL),
(4, 1, 'Picked up some new gear today! Ready for more adventures!', NOW(), NULL),
(5, 1, 'Trying out a new route today, this view is amazing!', NOW(), NULL),

-- Group 2 posts
(2, 2, 'Anyone else in the sportbike crew feeling the thrill lately?', NOW(), NULL),
(6, 2, 'Looking forward to the next track day. Let’s make it epic!', NOW(), NULL),
(7, 2, 'Just got a new helmet. Safety first!', NOW(), NULL),
(8, 2, 'Great ride today, the roads were perfect for sportbikes!', NOW(), NULL),
(9, 2, 'Can’t wait to get back on the track next weekend.', NOW(), NULL),

-- Group 3 posts
(10, 3, 'Road trip plans for the holidays. Long miles ahead!', NOW(), NULL),
(11, 3, 'New touring bike setup is incredible! Comfy and fast.', NOW(), NULL),
(12, 3, 'Looking for ride buddies for a week-long tour this summer.', NOW(), NULL),
(13, 3, 'Checked out this cool scenic spot, perfect for our next tour!', NOW(), NULL),
(14, 3, 'Is it just me, or is there always a sense of freedom on long rides?', NOW(), NULL),

-- Group 4 posts
(15, 4, 'Finally finished my cafe racer build! Feels amazing on the road!', NOW(), NULL),
(16, 4, 'What’s everyone’s favorite cafe racer event this year?', NOW(), NULL),
(17, 4, 'The weather’s perfect for some retro-riding this weekend.', NOW(), NULL),
(18, 4, 'Tuning the bike a bit more – need your tips on suspension!', NOW(), NULL),
(19, 4, 'Coffee stops and racing history, the perfect Saturday ride.', NOW(), NULL),

-- Group 5 posts
(2, 5, 'Had the best day exploring new trails on my dirt bike.', NOW(), NULL),
(6, 5, 'Dirt tracks have been crazy lately, can’t get enough of this adrenaline!', NOW(), NULL),
(10, 5, 'Built a new ramp for off-road challenges, come check it out!', NOW(), NULL),
(11, 5, 'Staying on top of maintenance for those tough trails ahead.', NOW(), NULL),
(13, 5, 'Started modifying my suspension for better off-road handling.', NOW(), NULL),

-- Group 6 posts
(3, 6, 'Who else is gearing up for an adventure through the desert?', NOW(), NULL),
(8, 6, 'The trails here are full of surprises, what’s your craziest ride?', NOW(), NULL),
(9, 6, 'My last adventure was full of rain, mud, and fun!', NOW(), NULL),
(5, 6, 'Caught some stunning mountain views during today’s ride.', NOW(), NULL),
(6, 6, 'Can’t decide between the forest or coastal trail for the weekend.', NOW(), NULL),

-- Group 7 posts
(7, 7, 'Nothing beats the sound of a vintage bike roaring to life!', NOW(), NULL),
(8, 7, 'Found a classic Harley I’m thinking of restoring, need advice!', NOW(), NULL),
(13, 7, 'Has anyone ever come across a vintage race bike in great condition?', NOW(), NULL),
(3, 7, 'Restoring a 1978 bike this winter. So much fun!', NOW(), NULL),
(10, 7, 'Old bikes have this charm that new ones just can’t match.', NOW(), NULL),

-- Group 8 posts
(7, 8, 'Scooter rides around the city are the best. No traffic, just breeze.', NOW(), NULL),
(6, 8, 'Took a new route through the city – smoothest ride yet!', NOW(), NULL),
(2, 8, 'Sundays are perfect for a quick scooter getaway around town.', NOW(), NULL),
(8, 8, 'Just swapped out some parts for a faster scooter!', NOW(), NULL),
(11, 8, 'Who else is taking their scooter through the city this weekend?', NOW(), NULL),

-- Group 9 posts
(1, 9, 'Tried my dirt bike on a mud track today – challenge accepted!', NOW(), NULL),
(13, 9, 'The toughest ride of my life, but we made it through the hills.', NOW(), NULL),
(14, 9, 'Gearing up for the next big off-road challenge!', NOW(), NULL),
(12, 9, 'Anyone into night riding? Dirt trails by the moonlight.', NOW(), NULL),
(3, 9, 'Modified my bike’s tires for a smoother off-road experience.', NOW(), NULL),

-- Group 10 posts
(12, 10, 'Ready for a track day with all the bikers, who’s joining?', NOW(), NULL),
(14, 10, 'I think we can all agree – racing on the track beats city roads.', NOW(), NULL),
(11, 10, 'When’s the next event? Can’t wait to show what I’ve got!', NOW(), NULL),
(6, 10, 'Motorcycle races are so intense! Need to push harder next time.', NOW(), NULL),
(5, 10, 'Anyone have tips for a successful time trial?', NOW(), NULL);


-- for `locations` table
INSERT INTO locations (name, description, address, pfp_url, created_by)
VALUES
-- Example (5) Locations
('The Cyclist Cafe', 'A cozy spot where local riders gather for coffee and share stories.', '123 Motorbike Ave, Los Angeles, CA 90012', '', 1),
('Twist and Turn Bar & Grill', 'A popular bar and grill with garage vibes, perfect for a post-ride meal.', '456 Ride Street, Los Angeles, CA 90023', '', 1),
('Sunset Vista Overlook', 'A scenic rest stop offering amazing views for bikers riding along the coast.', '789 Coastline Dr, Los Angeles, CA 90046', '', 2),
('Hollywood Bike Garage', 'The go-to place for custom bike builds, repairs, and a community of bike enthusiasts.', '101 Biker Blvd, Los Angeles, CA 90028', '', 2),
('Malibu Beach Rides', 'A peaceful beach stop where riders can relax and enjoy the sea breeze after a ride.', '202 Beachfront Road, Malibu, CA 90265', '', 1);

-- for `location_reviews` table
INSERT INTO location_reviews (user_id, location_id, text, rate, created_at)
VALUES
-- Insert 3 reviews for 5 locations

-- Reviews for The Cyclist Cafe (location_id = 1)
(1, 1, 'Great spot! I love stopping here after a long ride, perfect coffee and friendly staff.', 5, NOW()),
(2, 1, 'Nice atmosphere, but the coffee could be a bit stronger. Still a good place for bikers.', 3, NOW()),
(3, 1, 'The cafe has a perfect vibe for us bikers. The staff is amazing, and the place is cozy.', 4, NOW()),

-- Reviews for Twist and Turn Bar & Grill (location_id = 2)
(4, 2, 'The burgers are amazing here! A must-visit after a long ride. Perfect atmosphere for bikers.', 5, NOW()),
(5, 2, 'Good food and beer selection. Just wish it was less crowded on weekends.', 4, NOW()),
(6, 2, 'Great place to unwind after a ride, but the service can be slow sometimes.', 3, NOW()),

-- Reviews for Sunset Vista Overlook (location_id = 3)
(7, 3, 'The views are breathtaking! Perfect stop during a long ride along the coast. Highly recommended!', 5, NOW()),
(8, 3, 'Beautiful spot, especially at sunset. However, parking can get tight during peak hours.', 4, NOW()),
(9, 3, 'Amazing rest stop for bikers, but wish there were more benches and seating areas.', 4, NOW()),

-- Reviews for Hollywood Bike Garage (location_id = 4)
(10, 4, 'The best garage for bike repairs and custom work! I’ve taken my bike here for years.', 5, NOW()),
(11, 4, 'This place is amazing if you’re looking for motorcycle accessories. Staff is very knowledgeable.', 5, NOW()),
(12, 4, 'Decent garage, but they could have a better waiting area. Still a solid choice for repairs.', 3, NOW()),

-- Reviews for Malibu Beach Rides (location_id = 5)
(13, 5, 'Perfect place to stop after a ride. Beautiful views and peaceful atmosphere. Love this spot!', 5, NOW()),
(14, 5, 'Great place to relax. The vibe is amazing, though sometimes it gets a little too busy for my liking.', 4, NOW()),
(15, 5, 'Awesome location, perfect for a group ride. I just wish it had more food trucks nearby!', 4, NOW());
