-- ============================================================
-- CineVista – Update Cinemas & Schedules
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. CLEAR EXISTING DATA ──────────────────────────────────
-- We need to truncate/delete existing bookings and schedules 
-- because cinema IDs are changing.
TRUNCATE TABLE tickets CASCADE;
TRUNCATE TABLE schedules CASCADE;
DELETE FROM cinemas;

-- ── 2. INSERT NEW CINEMAS ────────────────────────────────────
-- c1, c2: Multan
-- c3, c4: Lahore
-- c5, c6, c7: Karachi

INSERT INTO cinemas (id, name, city, seating_layout) VALUES
('c1', 'Universal Cinemas (Boulevard Mall)', 'Multan', '{"rows":["A","B","C","D","E","F","G","H"], "seatsPerRow":12}'),
('c2', 'The Arena (Multan)', 'Multan', '{"rows":["A","B","C","D","E","F"], "seatsPerRow":10}'),
('c3', 'Cue Cinemas (Gulberg)', 'Lahore', '{"rows":["A","B","C","D","E","F","G","H","I","J"], "seatsPerRow":14}'),
('c4', 'Universal Cinemas (Emporium Mall)', 'Lahore', '{"rows":["A","B","C","D","E","F","G","H"], "seatsPerRow":12}'),
('c5', 'Nueplex Cinemas (DHA)', 'Karachi', '{"rows":["A","B","C","D","E","F","G","H","I"], "seatsPerRow":13}'),
('c6', 'Cinepax (Ocean Mall)', 'Karachi', '{"rows":["A","B","C","D","E","F","G","H"], "seatsPerRow":12}'),
('c7', 'Atrium Cinema (Saddar)', 'Karachi', '{"rows":["A","B","C","D","E","F","G","H","I","J"], "seatsPerRow":15}');

-- ── 3. INSERT REBUILT SCHEDULES ──────────────────────────────
-- Distribute movies m1 to m30 across the new cinemas.

INSERT INTO schedules (movie_id, cinema_id, showtimes) VALUES
-- --- MOVIES 1-10 ---
-- m1: Interstellar (Lahore/Karachi)
('m1', 'c3', '{"1:00 PM", "5:00 PM", "9:00 PM"}'),
('m1', 'c5', '{"2:00 PM", "6:00 PM", "10:00 PM"}'),

-- m2: The Dark Knight (All cities, all cinemas)
('m2', 'c1', '{"12:00 PM", "3:30 PM", "7:00 PM"}'),
('m2', 'c2', '{"1:30 PM", "5:00 PM", "8:30 PM"}'),
('m2', 'c3', '{"1:00 PM", "4:30 PM", "8:00 PM"}'),
('m2', 'c4', '{"12:00 PM", "3:30 PM", "7:00 PM"}'),
('m2', 'c5', '{"1:00 PM", "4:30 PM", "8:00 PM"}'),
('m2', 'c6', '{"11:00 AM", "2:30 PM", "6:00 PM"}'),
('m2', 'c7', '{"2:00 PM", "5:30 PM", "9:00 PM"}'),

-- m3: Inception (Lahore/Karachi)
('m3', 'c4', '{"2:00 PM", "5:00 PM", "8:30 PM"}'),
('m3', 'c7', '{"1:30 PM", "4:30 PM", "7:30 PM"}'),

-- m4: Oppenheimer (Lahore/Karachi)
('m4', 'c3', '{"1:30 PM", "5:00 PM", "9:00 PM"}'),
('m4', 'c5', '{"12:30 PM", "4:00 PM", "7:30 PM"}'),

-- m5: Dune: Part Two (All cities)
('m5', 'c2', '{"1:00 PM", "4:30 PM", "8:00 PM"}'),
('m5', 'c4', '{"2:00 PM", "5:30 PM", "9:00 PM"}'),
('m5', 'c6', '{"12:00 PM", "3:30 PM", "7:00 PM"}'),

-- m6: Avatar (Lahore/Karachi)
('m6', 'c3', '{"11:00 AM", "3:00 PM", "7:00 PM"}'),
('m6', 'c7', '{"12:00 PM", "4:00 PM", "8:00 PM"}'),

-- m7: Spider-Man (All cities)
('m7', 'c1', '{"10:30 AM", "1:30 PM", "4:30 PM", "7:30 PM"}'),
('m7', 'c4', '{"11:30 AM", "2:30 PM", "5:30 PM", "8:30 PM"}'),
('m7', 'c5', '{"10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"}'),

-- m8: Aquaman (Multan/Karachi)
('m8', 'c2', '{"3:00 PM", "6:00 PM", "9:00 PM"}'),
('m8', 'c6', '{"2:00 PM", "5:00 PM", "8:00 PM"}'),

-- m9: Mission Impossible (Lahore/Karachi)
('m9', 'c3', '{"1:30 PM", "4:30 PM", "7:30 PM"}'),
('m9', 'c7', '{"2:30 PM", "5:30 PM", "8:30 PM"}'),

-- m10: Killers of the Flower Moon (Lahore/Karachi)
('m10', 'c4', '{"1:00 PM", "5:00 PM", "9:00 PM"}'),
('m10', 'c5', '{"12:00 PM", "4:00 PM", "8:00 PM"}'),

-- --- MOVIES 11-30 ---
-- m11: Gladiator II (All cities, all cinemas)
('m11', 'c1', '{"11:00 AM", "2:30 PM", "6:00 PM", "9:30 PM"}'),
('m11', 'c2', '{"1:00 PM", "4:30 PM", "8:00 PM", "11:30 PM"}'),
('m11', 'c3', '{"12:00 PM", "3:30 PM", "7:00 PM", "10:30 PM"}'),
('m11', 'c4', '{"11:30 AM", "3:00 PM", "6:30 PM", "10:00 PM"}'),
('m11', 'c5', '{"10:30 AM", "2:00 PM", "5:30 PM", "9:00 PM"}'),
('m11', 'c6', '{"12:30 PM", "4:00 PM", "7:30 PM", "11:00 PM"}'),
('m11', 'c7', '{"11:30 AM", "3:00 PM", "6:30 PM", "10:00 PM"}'),

-- m12: Wicked (All cities, all cinemas)
('m12', 'c1', '{"11:00 AM", "2:30 PM", "6:00 PM", "9:30 PM"}'),
('m12', 'c2', '{"12:00 PM", "3:30 PM", "7:00 PM"}'),
('m12', 'c3', '{"12:30 PM", "4:00 PM", "7:30 PM", "11:00 PM"}'),
('m12', 'c4', '{"1:00 PM", "4:30 PM", "8:00 PM"}'),
('m12', 'c5', '{"12:00 PM", "3:30 PM", "7:00 PM", "10:30 PM"}'),
('m12', 'c6', '{"11:30 AM", "3:00 PM", "6:30 PM"}'),
('m12', 'c7', '{"12:30 PM", "4:00 PM", "7:30 PM", "11:00 PM"}'),

-- m13: Moana 2 (Lahore/Karachi)
('m13', 'c3', '{"10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"}'),
('m13', 'c7', '{"10:30 AM", "1:30 PM", "4:30 PM", "7:30 PM"}'),

-- m14: Deadpool & Wolverine (All cities, all cinemas)
('m14', 'c1', '{"11:30 AM", "3:00 PM", "6:30 PM", "10:00 PM"}'),
('m14', 'c2', '{"12:00 PM", "3:30 PM", "7:00 PM", "10:30 PM"}'),
('m14', 'c3', '{"1:30 PM", "5:00 PM", "8:30 PM", "11:00 PM"}'),
('m14', 'c4', '{"12:30 PM", "4:00 PM", "7:30 PM", "10:30 PM"}'),
('m14', 'c5', '{"11:00 AM", "2:30 PM", "6:00 PM", "9:30 PM"}'),
('m14', 'c6', '{"12:00 PM", "3:30 PM", "7:00 PM", "10:30 PM"}'),
('m14', 'c7', '{"1:00 PM", "4:30 PM", "8:00 PM", "11:30 PM"}'),

-- m15: Inside Out 2 (All cities, all cinemas)
('m15', 'c1', '{"10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"}'),
('m15', 'c2', '{"10:30 AM", "1:30 PM", "4:30 PM", "7:30 PM"}'),
('m15', 'c3', '{"11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM"}'),
('m15', 'c4', '{"10:30 AM", "1:30 PM", "4:30 PM", "7:30 PM"}'),
('m15', 'c5', '{"11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM"}'),
('m15', 'c6', '{"10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"}'),
('m15', 'c7', '{"11:30 AM", "2:30 PM", "5:30 PM", "8:30 PM"}'),

-- m16: The Wild Robot (Lahore/Karachi)
('m16', 'c4', '{"11:00 AM", "2:00 PM", "5:00 PM"}'),
('m16', 'c7', '{"12:00 PM", "3:00 PM", "6:00 PM"}'),

-- m17: Alien: Romulus (Multan/Lahore)
('m17', 'c1', '{"1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM"}'),
('m17', 'c3', '{"2:00 PM", "5:00 PM", "8:30 PM"}'),

-- m18: Twisters (Multan/Lahore)
('m18', 'c2', '{"12:30 PM", "3:30 PM", "7:00 PM"}'),
('m18', 'c4', '{"1:30 PM", "4:30 PM", "8:00 PM", "11:00 PM"}'),

-- m19: Godzilla x Kong (All cities)
('m19', 'c1', '{"11:00 AM", "2:00 PM", "5:30 PM", "9:00 PM"}'),
('m19', 'c3', '{"12:00 PM", "3:00 PM", "6:30 PM", "10:00 PM"}'),
('m19', 'c5', '{"10:30 AM", "2:00 PM", "5:00 PM", "8:30 PM"}'),

-- m20: Kingdom of the Planet of the Apes (Lahore/Karachi)
('m20', 'c4', '{"1:00 PM", "4:30 PM", "8:00 PM"}'),
('m20', 'c6', '{"2:00 PM", "5:30 PM", "9:00 PM"}'),

-- m21: A Quiet Place Day One (Lahore/Karachi)
('m21', 'c3', '{"2:00 PM", "5:00 PM", "8:30 PM"}'),
('m21', 'c7', '{"3:00 PM", "6:00 PM", "9:30 PM"}'),

-- m22: Bad Boys Ride or Die (All cities)
('m22', 'c2', '{"12:00 PM", "3:30 PM", "7:00 PM", "10:30 PM"}'),
('m22', 'c4', '{"1:00 PM", "4:00 PM", "7:30 PM", "11:00 PM"}'),
('m22', 'c5', '{"11:30 AM", "3:00 PM", "6:30 PM", "10:00 PM"}'),

-- m23: Furiosa (Multan/Karachi)
('m23', 'c1', '{"1:30 PM", "5:00 PM", "9:00 PM"}'),
('m23', 'c6', '{"2:30 PM", "6:00 PM", "9:30 PM"}'),

-- m24: The Fall Guy (Multan/Lahore)
('m24', 'c2', '{"11:00 AM", "2:30 PM", "6:00 PM"}'),
('m24', 'c3', '{"12:00 PM", "3:30 PM", "7:00 PM", "10:00 PM"}'),

-- m25: Civil War (Multan/Karachi)
('m25', 'c1', '{"2:00 PM", "5:00 PM", "8:00 PM"}'),
('m25', 'c7', '{"3:00 PM", "6:00 PM", "9:00 PM"}'),

-- m26: Monkey Man (Multan/Lahore)
('m26', 'c2', '{"1:00 PM", "4:00 PM", "7:30 PM"}'),
('m26', 'c4', '{"2:00 PM", "5:00 PM", "8:30 PM", "11:00 PM"}'),

-- m27: Argylle (Lahore/Karachi)
('m27', 'c3', '{"12:00 PM", "3:30 PM", "7:00 PM"}'),
('m27', 'c5', '{"1:00 PM", "4:00 PM", "7:30 PM"}'),

-- m28: The Beekeeper (Multan/Karachi)
('m28', 'c1', '{"2:30 PM", "5:30 PM", "9:00 PM"}'),
('m28', 'c6', '{"3:00 PM", "6:30 PM", "10:00 PM"}'),

-- m29: Longlegs (Lahore/Karachi)
('m29', 'c4', '{"3:00 PM", "6:00 PM", "9:30 PM"}'),
('m29', 'c7', '{"4:00 PM", "7:00 PM", "10:00 PM"}'),

-- m30: Transformers One (All cities)
('m30', 'c2', '{"10:00 AM", "1:00 PM", "4:00 PM", "7:30 PM"}'),
('m30', 'c3', '{"11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM"}'),
('m30', 'c5', '{"10:30 AM", "1:30 PM", "4:30 PM", "8:00 PM"}');
