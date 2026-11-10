-- Demo accounts for RoomPair, generated from the original prototype data.
-- Safe to run more than once. Demo people are fictional; their accounts cannot
-- be signed in to: each gets a random password that is never stored anywhere,
-- and the .example addresses are reserved and receive no mail.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', demo.id, 'authenticated', 'authenticated',
  demo.email, extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object('name', demo.name), now(), now(), '', '', '', ''
from (values
  ('00000000-0000-4000-a000-000000000001'::uuid, 'ella@demo.roompair.example', 'Ella'),
  ('00000000-0000-4000-a000-000000000002'::uuid, 'leo@demo.roompair.example', 'Leo'),
  ('00000000-0000-4000-a000-000000000003'::uuid, 'maya@demo.roompair.example', 'Maya'),
  ('00000000-0000-4000-a000-000000000004'::uuid, 'noah@demo.roompair.example', 'Noah'),
  ('00000000-0000-4000-a000-000000000005'::uuid, 'sofia@demo.roompair.example', 'Sofia'),
  ('00000000-0000-4000-a000-000000000006'::uuid, 'oliver@demo.roompair.example', 'Oliver'),
  ('00000000-0000-4000-a000-000000000007'::uuid, 'ines@demo.roompair.example', 'Ines'),
  ('00000000-0000-4000-a000-000000000008'::uuid, 'felix@demo.roompair.example', 'Felix'),
  ('00000000-0000-4000-a000-000000000009'::uuid, 'anna@demo.roompair.example', 'Anna'),
  ('00000000-0000-4000-a000-000000000010'::uuid, 'lucas@demo.roompair.example', 'Lucas')
) as demo (id, email, name)
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now(), now()
from auth.users u
where u.email like '%@demo.roompair.example'
  and not exists (
    select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
  );

-- The sign-up trigger has already created a bare profile for each account.
update public.profiles p set
  name = d.name, age = d.age, occupation = d.occupation, university = d.university,
  city = d.city, neighborhood = d.neighborhood, bio = d.bio, photo_url = d.photo_url,
  photos = d.photos, tags = d.tags, prompt_question = d.prompt_question,
  prompt_answer = d.prompt_answer, intent = d.intent, budget_min = d.budget_min,
  budget_max = d.budget_max, move_date = d.move_date, stay_months = d.stay_months,
  cleanliness = d.cleanliness, social = d.social, sleep = d.sleep, smokes = d.smokes,
  has_pets = d.has_pets, verified = d.verified, active = d.active,
  demo_likes_newcomers = d.demo_likes_newcomers, is_demo = true, onboarded = true
from (values
  ('00000000-0000-4000-a000-000000000001'::uuid, 'Ella', 23, 'Design student', 'Art Academy of Latvia',
   'Riga', 'Āgenskalns',
   'Design student, weekend market regular, and the person who always brings home one more plant. Looking for a calm home with good company.',
   '/images/ella.jpg', array['/images/ella.jpg', '/images/room-1.jpg']::text[], array['Plant parent', 'Slow mornings', 'Design & art']::text[],
   'A small thing that makes a home',
   'A kitchen you can linger in. Someone asking if you want tea. Plants that are mostly still alive.',
   'have-room', 350, 650, date '2027-02-01', 12,
   4, 3, 'flexible', false, false,
   true, true, true),
  ('00000000-0000-4000-a000-000000000002'::uuid, 'Leo', 24, 'Architecture student', 'Riga Technical University',
   'Riga', 'Centrs',
   'Usually cycling somewhere, sketching a building, or making too much pasta. I like a tidy space and a flatmate I can call a friend.',
   '/images/leo.jpg', array['/images/leo.jpg']::text[], array['Cycling', 'Pasta nights', 'Architecture']::text[],
   'My ideal Sunday at home',
   'Coffee, a really long breakfast, and opening every window for five minutes. Then a bike ride before it gets dark.',
   'find-room', 400, 600, date '2027-02-05', 12,
   4, 3, 'flexible', false, false,
   true, true, true),
  ('00000000-0000-4000-a000-000000000003'::uuid, 'Maya', 22, 'Psychology student', 'University of Latvia',
   'Riga', 'Avoti',
   'A quiet reader with a very social kitchen. I love independent films, fresh bread, and a home where everyone can just be themselves.',
   '/images/maya.jpg', array['/images/maya.jpg', '/images/room-3.jpg']::text[], array['Book club', 'Film nights', 'Baking']::text[],
   'Living with me means',
   'There is usually banana bread. I will respect your closed door, and I will absolutely ask about your book.',
   'have-room', 350, 550, date '2027-02-01', 12,
   4, 2, 'flexible', false, false,
   true, true, true),
  ('00000000-0000-4000-a000-000000000004'::uuid, 'Noah', 25, 'Software engineering student', 'Riga Technical University',
   'Riga', 'Skanste',
   'Code by day, climbing by evening. Moving to Riga for my master’s and looking for a relaxed place with enough desk space for a second monitor.',
   '/images/noah.jpg', array['/images/noah.jpg']::text[], array['Bouldering', 'Good coffee', 'Gaming']::text[],
   'My one house rule',
   'Let’s say things before they turn into things. Also, the last person to make coffee starts the next pot.',
   'find-room', 450, 650, date '2027-02-08', 12,
   4, 3, 'late', false, false,
   true, true, false),
  ('00000000-0000-4000-a000-000000000005'::uuid, 'Sofia', 24, 'Medical student', 'Rīga Stradiņš University',
   'Riga', 'Āgenskalns',
   'Early starts, evening yoga, and a weakness for beautiful ceramics. I keep a predictable routine and would love to share a warm, peaceful home.',
   '/images/sofia.jpg', array['/images/sofia.jpg', '/images/room-2.jpg']::text[], array['Yoga', 'Early bird', 'Weekend walks']::text[],
   'You can count on me for',
   'Taking the bins out without a reminder, a well-stocked tea cupboard, and cheering on whatever you are working toward.',
   'have-room', 350, 600, date '2027-02-01', 12,
   5, 3, 'early', false, false,
   true, true, false),
  ('00000000-0000-4000-a000-000000000006'::uuid, 'Oliver', 23, 'Music student', 'Jāzeps Vītols Latvian Academy of Music',
   'Riga', 'Centrs',
   'Jazz records, weekend cooking projects, and a very well-organised spice drawer. I practise at the academy and keep home for winding down.',
   '/images/oliver.jpg', array['/images/oliver.jpg']::text[], array['Jazz records', 'Cooking', 'Night owl']::text[],
   'The best kind of house night',
   'Everyone makes something, someone picks a record, and we forget to look at our phones for a bit.',
   'find-room', 300, 500, date '2027-02-15', 10,
   3, 4, 'late', false, false,
   true, true, true),
  ('00000000-0000-4000-a000-000000000007'::uuid, 'Ines', 22, 'Environmental science student', 'University of Latvia',
   'Riga', 'Teika',
   'Forest walks, second-hand finds, and meals built around whatever is in season. My cat Fig is an excellent, if quiet, conversation partner.',
   '/images/ines.jpg', array['/images/ines.jpg', '/images/room-3.jpg']::text[], array['Has a cat', 'Nature walks', 'Thrifting']::text[],
   'A little heads-up',
   'Fig thinks all sunny windows belong to him. He will probably love you before he learns your name.',
   'have-room', 300, 550, date '2027-02-01', 12,
   4, 3, 'flexible', false, true,
   true, true, false),
  ('00000000-0000-4000-a000-000000000008'::uuid, 'Felix', 26, 'Business master’s student', 'Stockholm School of Economics in Riga',
   'Riga', 'Quiet Centre',
   'Back at university after a few years working. I love dinner with friends, morning runs, and keeping shared spaces ready for the next person.',
   '/images/felix.jpg', array['/images/felix.jpg']::text[], array['Morning runs', 'Dinner parties', 'Podcasts']::text[],
   'The way to my heart',
   'A shared shopping list that actually gets used. And someone who will taste-test a new recipe honestly.',
   'find-room', 500, 750, date '2027-02-01', 12,
   4, 4, 'early', false, false,
   false, true, true),
  ('00000000-0000-4000-a000-000000000009'::uuid, 'Anna', 23, 'Photography student', 'Art Academy of Latvia',
   'Riga', 'Grīziņkalns',
   'Analog photos, fresh flowers, and walks with no particular destination. Looking for a home with a little character and people who communicate.',
   '/images/anna.jpg', array['/images/anna.jpg']::text[], array['Film photography', 'Flower markets', 'Long walks']::text[],
   'My favourite little ritual',
   'Making the flat look nice before friends come over. Not perfect. Just putting on a record and lighting a candle.',
   'find-room', 300, 500, date '2027-02-10', 12,
   3, 3, 'flexible', false, false,
   true, true, false),
  ('00000000-0000-4000-a000-000000000010'::uuid, 'Lucas', 24, 'Film student', 'Latvian Academy of Culture',
   'Riga', 'Avoti',
   'Always up for a film recommendation or a late breakfast. I spend a lot of time on set, and want home to feel relaxed when I get back.',
   '/images/lucas.jpg', array['/images/lucas.jpg']::text[], array['Cinema', 'Brunch', 'Creative projects']::text[],
   'Something to know about me',
   'My schedule moves around with filming. I smoke outdoors, and I am upfront about that before we talk about sharing a place.',
   'find-room', 350, 600, date '2027-02-01', 12,
   3, 4, 'late', true, false,
   true, true, false)
) as d (
  id, name, age, occupation, university, city, neighborhood, bio, photo_url, photos,
  tags, prompt_question, prompt_answer, intent, budget_min, budget_max, move_date,
  stay_months, cleanliness, social, sleep, smokes, has_pets, verified, active,
  demo_likes_newcomers
)
where p.id = d.id;

insert into public.rooms (id, owner_id, title, description, price, photo_url, city, neighborhood)
values
  ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000001', 'A sunny room in Āgenskalns',
   'Your own light-filled bedroom in a two-bedroom apartment. A shared kitchen, wooden floors, and a little balcony for slow mornings. €420/month including estimated utilities.',
   420, '/images/room-1.jpg', 'Riga', 'Āgenskalns'),
  ('00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000003', 'A peaceful corner in Avoti',
   'A furnished room in a cosy three-bedroom flat, with a shared living room and space for your books. €380/month including estimated utilities.',
   380, '/images/room-3.jpg', 'Riga', 'Avoti'),
  ('00000000-0000-4000-b000-000000000005', '00000000-0000-4000-a000-000000000005', 'A calm, light-filled flat',
   'A private bedroom with a large desk in a quiet two-bedroom flat. Shared kitchen and courtyard access. €460/month including estimated utilities.',
   460, '/images/room-2.jpg', 'Riga', 'Āgenskalns'),
  ('00000000-0000-4000-b000-000000000007', '00000000-0000-4000-a000-000000000007', 'Green views in Teika',
   'A bright private room in a friendly two-bedroom home shared with one student and one cat. €360/month including estimated utilities.',
   360, '/images/room-3.jpg', 'Riga', 'Teika')
on conflict (id) do nothing;
