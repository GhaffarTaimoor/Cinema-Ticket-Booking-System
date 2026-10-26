-- ============================================================
-- CineVista – Add 20 new movies + schedules
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. MOVIES ────────────────────────────────────────────────

INSERT INTO movies (id, title, genre, director, duration, release_date, price, poster, description, rating, showtimes) VALUES

('m11', 'Gladiator II',           'Action / Drama',       'Ridley Scott',       148, '2024-11-22', 950,  '/posters/gladiator2.jpg',          'Lucius is forced into the Colosseum as a gladiator and must look to his past to find the strength to return power to the people of Rome.',                                          'PG-13', '["11:00 AM","2:30 PM","6:00 PM","9:30 PM"]'),
('m12', 'Wicked',                 'Musical / Fantasy',    'Jon M. Chu',         160, '2024-11-22', 850,  '/posters/wicked.jpg',              'The untold story of the witches of Oz. Elphaba and Glinda form an unlikely friendship before their destinies lead them down divergent paths.',                                   'PG',    '["12:00 PM","3:30 PM","7:00 PM"]'),
('m13', 'Moana 2',                'Animation / Adventure','David Derrick Jr.',  100, '2024-11-27', 700,  '/posters/moana2.jpg',              'Moana reunites with the demigod Maui for a new voyage across the seas of Oceania encountering ancient mysteries and new unexpected allies.',                                  'PG',    '["10:00 AM","1:00 PM","4:00 PM","7:00 PM"]'),
('m14', 'Deadpool & Wolverine',   'Action / Comedy',      'Shawn Levy',         128, '2024-07-26', 1000, '/posters/deadpool_wolverine.jpg',   'Deadpool is recruited by the TVA and teams up with a reluctant Wolverine to face a common threat that could unravel the Marvel universe.',                                     'R',     '["11:30 AM","3:00 PM","6:30 PM","10:00 PM"]'),
('m15', 'Inside Out 2',           'Animation / Drama',    'Kelsey Mann',        100, '2024-06-14', 750,  '/posters/inside_out2.jpg',         'Riley enters adolescence and the new emotion Anxiety moves in threatening to throw her mind and her life into complete chaos.',                                               'PG',    '["10:30 AM","1:30 PM","4:30 PM","7:30 PM"]'),
('m16', 'The Wild Robot',         'Animation / Drama',    'Chris Sanders',      102, '2024-09-27', 750,  '/posters/wild_robot.jpg',          'Shipwrecked on an uninhabited island a robot must adapt to her surroundings and raise an orphaned gosling as her own child.',                                               'PG',    '["11:00 AM","2:00 PM","5:00 PM"]'),
('m17', 'Alien: Romulus',         'Horror / Sci-Fi',      'Fede Alvarez',       119, '2024-08-16', 850,  '/posters/alien_romulus.jpg',       'Young space colonizers come face-to-face with the most terrifying life form in the universe while raiding an abandoned space station.',                                      'R',     '["1:00 PM","4:00 PM","7:00 PM","10:00 PM"]'),
('m18', 'Twisters',               'Action / Thriller',    'Lee Isaac Chung',    122, '2024-07-19', 800,  '/posters/twisters.jpg',            'A storm chaser returns to the Oklahoma plains to test new experimental storm-intercepting technology against the forces of nature.',                                        'PG-13', '["12:30 PM","3:30 PM","7:00 PM","10:00 PM"]'),
('m19', 'Godzilla x Kong',        'Action / Sci-Fi',      'Adam Wingard',       115, '2024-03-29', 900,  '/posters/godzilla_kong.jpg',       'Kong and Godzilla face a colossal undiscovered threat hidden within the hollow Earth that could destroy their world and ours.',                                            'PG-13', '["11:00 AM","2:00 PM","5:30 PM","9:00 PM"]'),
('m20', 'Kingdom of the Planet of the Apes','Sci-Fi / Action','Wes Ball',       145, '2024-05-10', 850,  '/posters/planet_apes.jpg',         'Many years after Caesar reign a young ape undertakes a journey that forces him to question everything he knew about his world and his future.',                                 'PG-13', '["1:00 PM","4:30 PM","8:00 PM"]'),
('m21', 'A Quiet Place: Day One', 'Horror / Thriller',    'Michael Sarnoski',    99, '2024-06-28', 800,  '/posters/quiet_place_day_one.jpg', 'A woman in New York City tries to survive the alien invasion that forces the world into silence where any sound can mean instant death.',                                       'PG-13', '["2:00 PM","5:00 PM","8:30 PM"]'),
('m22', 'Bad Boys: Ride or Die',  'Action / Comedy',      'Adil El Arbi',       115, '2024-06-07', 800,  '/posters/bad_boys4.jpg',           'Miami detectives Mike Lowrey and Marcus Burnett go rogue after being framed by a deadly cartel and must fight to clear their names.',                                         'R',     '["12:00 PM","3:30 PM","7:00 PM","10:30 PM"]'),
('m23', 'Furiosa: A Mad Max Saga','Action / Adventure',   'George Miller',      148, '2024-05-24', 900,  '/posters/furiosa.jpg',             'Young Furiosa is snatched from the Green Place by a great Warlord and must survive many brutal trials as she builds the strength to find her way home.',                        'R',     '["1:30 PM","5:00 PM","9:00 PM"]'),
('m24', 'The Fall Guy',           'Action / Comedy',      'David Leitch',       126, '2024-05-03', 800,  '/posters/fall_guy.jpg',            'A fading stuntman turned reluctant bounty hunter is thrown into a deadly Hollywood conspiracy when his movie star boss mysteriously goes missing.',                           'PG-13', '["11:00 AM","2:30 PM","6:00 PM","9:00 PM"]'),
('m25', 'Civil War',              'Action / Thriller',    'Alex Garland',       109, '2024-04-12', 800,  '/posters/civil_war.jpg',           'A team of journalists races to reach Washington D.C. before rebel factions tear the nation apart while traveling through a devastated war-torn America.',                    'R',     '["2:00 PM","5:00 PM","8:00 PM"]'),
('m26', 'Monkey Man',             'Action / Thriller',    'Dev Patel',          113, '2024-04-05', 750,  '/posters/monkey_man.jpg',          'A young man driven by vengeance hunts the corrupt authorities who brutally murdered his mother and destroyed his village.',                                                  'R',     '["1:00 PM","4:00 PM","7:30 PM","10:30 PM"]'),
('m27', 'Argylle',                'Action / Comedy',      'Matthew Vaughn',     139, '2024-02-02', 800,  '/posters/argylle.jpg',             'A bestselling spy novelist suddenly finds herself in the middle of a real global espionage operation that mirrors her own fiction perfectly.',                                  'PG-13', '["12:00 PM","3:30 PM","7:00 PM"]'),
('m28', 'The Beekeeper',          'Action / Thriller',    'David Ayer',         105, '2024-01-12', 750,  '/posters/beekeeper.jpg',           'A man discovers the company that scammed his landlady is connected to a shadowy criminal organization and unleashes devastating fury upon them.',                              'R',     '["2:30 PM","5:30 PM","9:00 PM"]'),
('m29', 'Longlegs',               'Horror / Thriller',    'Osgood Perkins',     101, '2024-07-12', 800,  '/posters/longlegs.jpg',            'FBI agent Lee Harker is assigned to an unsolved serial killer case and uncovers a deeply personal connection to the terrifying occult killer known as Longlegs.',           'R',     '["3:00 PM","6:00 PM","9:30 PM"]'),
('m30', 'Transformers One',       'Animation / Sci-Fi',   'Josh Cooley',        104, '2024-09-20', 750,  '/posters/transformers_one.jpg',    'The untold origin story of Optimus Prime and Megatron from brothers-in-arms to eternal enemies on their home planet of Cybertron.',                                          'PG',    '["10:00 AM","1:00 PM","4:00 PM","7:30 PM"]');


-- ── 2. SCHEDULES ─────────────────────────────────────────────
-- c1=Multan  c2=Lahore  c3=Karachi

INSERT INTO schedules (movie_id, cinema_id, showtimes) VALUES

-- Gladiator II – all 3 cities
('m11','c1','["11:00 AM","2:30 PM","6:00 PM","9:30 PM"]'),
('m11','c2','["12:00 PM","3:30 PM","7:00 PM","10:30 PM"]'),
('m11','c3','["10:30 AM","2:00 PM","5:30 PM","9:00 PM"]'),

-- Wicked – all 3 cities
('m12','c1','["12:00 PM","3:30 PM","7:00 PM"]'),
('m12','c2','["1:00 PM","4:30 PM","8:00 PM"]'),
('m12','c3','["11:30 AM","3:00 PM","6:30 PM"]'),

-- Moana 2 – Lahore + Karachi
('m13','c2','["10:00 AM","1:00 PM","4:00 PM","7:00 PM"]'),
('m13','c3','["10:30 AM","1:30 PM","4:30 PM","7:30 PM"]'),

-- Deadpool & Wolverine – all 3 cities
('m14','c1','["11:30 AM","3:00 PM","6:30 PM","10:00 PM"]'),
('m14','c2','["12:30 PM","4:00 PM","7:30 PM","10:30 PM"]'),
('m14','c3','["11:00 AM","2:30 PM","6:00 PM","9:30 PM"]'),

-- Inside Out 2 – all 3 cities
('m15','c1','["10:30 AM","1:30 PM","4:30 PM","7:30 PM"]'),
('m15','c2','["11:00 AM","2:00 PM","5:00 PM","8:00 PM"]'),
('m15','c3','["10:00 AM","1:00 PM","4:00 PM","7:00 PM"]'),

-- The Wild Robot – Lahore + Karachi
('m16','c2','["11:00 AM","2:00 PM","5:00 PM"]'),
('m16','c3','["12:00 PM","3:00 PM","6:00 PM"]'),

-- Alien: Romulus – Multan + Lahore
('m17','c1','["1:00 PM","4:00 PM","7:00 PM","10:00 PM"]'),
('m17','c2','["2:00 PM","5:00 PM","8:30 PM"]'),

-- Twisters – Multan + Lahore
('m18','c1','["12:30 PM","3:30 PM","7:00 PM"]'),
('m18','c2','["1:30 PM","4:30 PM","8:00 PM","11:00 PM"]'),

-- Godzilla x Kong – all 3 cities
('m19','c1','["11:00 AM","2:00 PM","5:30 PM","9:00 PM"]'),
('m19','c2','["12:00 PM","3:00 PM","6:30 PM","10:00 PM"]'),
('m19','c3','["10:30 AM","2:00 PM","5:00 PM","8:30 PM"]'),

-- Kingdom of the Planet of the Apes – Lahore + Karachi
('m20','c2','["1:00 PM","4:30 PM","8:00 PM"]'),
('m20','c3','["2:00 PM","5:30 PM","9:00 PM"]'),

-- A Quiet Place: Day One – Lahore + Karachi
('m21','c2','["2:00 PM","5:00 PM","8:30 PM"]'),
('m21','c3','["3:00 PM","6:00 PM","9:30 PM"]'),

-- Bad Boys: Ride or Die – all 3 cities
('m22','c1','["12:00 PM","3:30 PM","7:00 PM","10:30 PM"]'),
('m22','c2','["1:00 PM","4:00 PM","7:30 PM","11:00 PM"]'),
('m22','c3','["11:30 AM","3:00 PM","6:30 PM","10:00 PM"]'),

-- Furiosa – Multan + Karachi
('m23','c1','["1:30 PM","5:00 PM","9:00 PM"]'),
('m23','c3','["2:30 PM","6:00 PM","9:30 PM"]'),

-- The Fall Guy – Multan + Lahore
('m24','c1','["11:00 AM","2:30 PM","6:00 PM"]'),
('m24','c2','["12:00 PM","3:30 PM","7:00 PM","10:00 PM"]'),

-- Civil War – Multan + Karachi
('m25','c1','["2:00 PM","5:00 PM","8:00 PM"]'),
('m25','c3','["3:00 PM","6:00 PM","9:00 PM"]'),

-- Monkey Man – Multan + Lahore
('m26','c1','["1:00 PM","4:00 PM","7:30 PM"]'),
('m26','c2','["2:00 PM","5:00 PM","8:30 PM","11:00 PM"]'),

-- Argylle – Lahore + Karachi
('m27','c2','["12:00 PM","3:30 PM","7:00 PM"]'),
('m27','c3','["1:00 PM","4:00 PM","7:30 PM"]'),

-- The Beekeeper – Multan + Karachi
('m28','c1','["2:30 PM","5:30 PM","9:00 PM"]'),
('m28','c3','["3:00 PM","6:30 PM","10:00 PM"]'),

-- Longlegs – Lahore + Karachi
('m29','c2','["3:00 PM","6:00 PM","9:30 PM"]'),
('m29','c3','["4:00 PM","7:00 PM","10:00 PM"]'),

-- Transformers One – all 3 cities
('m30','c1','["10:00 AM","1:00 PM","4:00 PM","7:30 PM"]'),
('m30','c2','["11:00 AM","2:00 PM","5:00 PM","8:00 PM"]'),
('m30','c3','["10:30 AM","1:30 PM","4:30 PM","8:00 PM"]');
