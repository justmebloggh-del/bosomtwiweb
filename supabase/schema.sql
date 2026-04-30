-- Run this once in your Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste & run

-- ── Articles table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.articles (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL,
  category     TEXT NOT NULL,
  author       TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  excerpt      TEXT DEFAULT '',
  content      TEXT DEFAULT '',
  image        TEXT DEFAULT '',
  video_url    TEXT DEFAULT '',
  status       TEXT DEFAULT 'published'
);

-- ── Row Level Security ───────────────────────────────────────────
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can read published articles
CREATE POLICY "Public can read published articles"
  ON public.articles FOR SELECT
  USING (status = 'published');

-- Authenticated users (journalists/editors/admins) can insert
CREATE POLICY "Authenticated users can insert articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update articles
CREATE POLICY "Authenticated users can update articles"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated users can delete articles
CREATE POLICY "Authenticated users can delete articles"
  ON public.articles FOR DELETE
  TO authenticated
  USING (true);

-- ── Seed articles (April 2026) ───────────────────────────────────
-- Safe to re-run: ON CONFLICT DO NOTHING skips duplicates
INSERT INTO public.articles (id, title, slug, category, author, published_at, excerpt, content, image, status)
VALUES
  ('seed-001', 'Ashanti Region Marks 30 Years of Regional Governance',
   'ashanti-region-marks-30-years', 'Manhyia', 'Bosomtwi Desk', '2026-04-28T08:00:00Z',
   'Ceremonies at Manhyia Palace commemorated three decades of decentralised governance in the Ashanti Region.',
   'Senior chiefs, government officials, and thousands of residents gathered at Manhyia Palace on Monday to mark 30 years since the formal establishment of regional assemblies under Ghana''s 1992 constitution. The Asantehene, Otumfuo Osei Tutu II, called on the youth to take ownership of local development and reject divisive politics. Cultural displays, traditional durbars, and a youth innovation fair ran throughout the day.',
   'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-002', 'Lake Bosomtwi Water Level Rises After Heavy Rains',
   'lake-bosomtwi-water-level-rises', 'Manhyia', 'Bosomtwi Desk', '2026-04-27T07:30:00Z',
   'Scientists and local fishermen report the highest water level in five years following sustained April rains across the Ashanti Region.',
   'The Ghana Meteorological Authority confirmed that cumulative rainfall in April 2026 exceeded the 30-year average by 18 percent, pushing Lake Bosomtwi — the only natural lake in Ghana — to its highest recorded level since 2021. Fishing communities around the crater lake welcomed the development, saying it would replenish fish stocks that had declined during the 2024–2025 dry season. Environmental researchers warned, however, that erosion along unprotected shorelines needs urgent attention.',
   'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-003', 'Parliament Passes New Digital Economy Bill',
   'parliament-passes-digital-economy-bill', 'Politics', 'Bosomtwi Desk', '2026-04-28T10:00:00Z',
   'Ghana''s parliament has passed a landmark Digital Economy Bill aimed at regulating fintech, e-commerce, and AI-driven services.',
   'The Digital Economy Bill, passed 183–42 on Tuesday, creates a unified regulatory framework for fintech companies, digital marketplaces, and artificial-intelligence-driven services operating in Ghana. Proponents say the law will attract foreign investment and protect consumers; critics warn some provisions could stifle start-ups. The bill now awaits presidential assent. The ICT Ministry said implementing regulations would be gazetted within 90 days.',
   'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-004', 'Kumasi City FC Advance to CAF Confederation Cup Quarter-Finals',
   'kumasi-city-fc-caf-confederation-quarterfinals', 'Sports', 'Bosomtwi Sports', '2026-04-27T20:00:00Z',
   'A late goal from striker Emmanuel Asante sent Kumasi City through on away goals after a 2-2 aggregate draw with AS Vita Club.',
   'Emmanuel Asante''s 88th-minute header at Baba Yara Sports Stadium sealed a memorable night for Kumasi City FC, who advanced to the CAF Confederation Cup quarter-finals for the first time in the club''s history. The match ended 1-1 on the night — 2-2 on aggregate — with the away-goals rule deciding the tie in Kumasi City''s favour. Coach James Frimpong praised the crowd''s support and said the squad would rest before preparing for the last-eight draw.',
   'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-005', 'Cocoa Farmers Receive Highest Farm-Gate Price in a Decade',
   'cocoa-farmers-highest-farm-gate-price', 'Business', 'Bosomtwi Desk', '2026-04-26T09:00:00Z',
   'COCOBOD has set the farm-gate price at GH₵3,200 per bag, rewarding farmers amid strong global demand for Ghanaian cocoa.',
   'The Ghana Cocoa Board (COCOBOD) announced a new farm-gate price of GH₵3,200 per 64-kg bag, the highest in nominal terms since records began. The increase reflects buoyant global cocoa prices driven by tight supply from Côte d''Ivoire and sustained demand from European chocolate manufacturers. Farmer cooperatives in the Ashanti and Western regions welcomed the announcement but called for faster payment timelines and improved rural road access to buying centres.',
   'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-006', 'Kumasi Tech Hub Opens Applications for 2026 Cohort',
   'kumasi-tech-hub-2026-cohort', 'Technology', 'Bosomtwi Tech', '2026-04-25T08:00:00Z',
   'The Kumasi Technology and Innovation Hub is accepting applications from early-stage start-ups for its six-month accelerator programme.',
   'The Kumasi Technology and Innovation Hub (KTIH) has opened applications for its 2026 accelerator cohort, targeting early-stage start-ups in agri-tech, health-tech, and climate solutions. Selected teams will receive seed funding of up to $15,000, mentorship from industry professionals, and access to co-working space. The deadline for applications is 31 May 2026. Last year''s cohort of 12 start-ups collectively raised over $2 million in follow-on investment within six months of graduation.',
   'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-007', 'New Pedestrian Bridges to Ease Congestion in Kumasi Central',
   'pedestrian-bridges-kumasi-central', 'Manhyia', 'Bosomtwi Desk', '2026-04-24T07:00:00Z',
   'The Kumasi Metropolitan Assembly has approved funding for three overhead pedestrian bridges along Kejetia-Adum corridor.',
   'The Kumasi Metropolitan Assembly (KMA) voted to approve GH₵18 million for the construction of three overhead pedestrian bridges along the busy Kejetia-to-Adum corridor. The bridges, expected to be completed by December 2026, aim to reduce pedestrian fatalities and ease traffic gridlock in one of West Africa''s busiest urban commercial zones. The project will be carried out by a local contractor in partnership with the Ghana Highway Authority.',
   'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-008', 'Ghana Named Top Destination for Diaspora Investment in 2026',
   'ghana-top-diaspora-investment-destination-2026', 'Business', 'Bosomtwi Desk', '2026-04-23T10:00:00Z',
   'A new report by the African Development Bank ranks Ghana first among sub-Saharan African nations for diaspora remittances converted into direct investment.',
   'Ghana has topped the African Development Bank''s inaugural Diaspora Investment Index, which measures the proportion of remittances channelled into productive investment rather than household consumption. The report credits Ghana''s improved investment climate, stable currency, and targeted diaspora bond programme for the result. Finance Ministry officials said the government would build on the ranking by expanding tax incentives for diaspora investors and streamlining business registration for non-residents.',
   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-009', 'Afrobeats Festival Set to Transform Kumasi This August',
   'afrobeats-festival-kumasi-august-2026', 'Entertainment', 'Bosomtwi Culture', '2026-04-22T12:00:00Z',
   'A three-day Afrobeats and highlife festival in Kumasi is expected to draw over 50,000 visitors and boost the local hospitality industry.',
   'Organisers of the inaugural Kumasi Afrobeats & Highlife Festival have announced a three-day event from 14–16 August 2026 at the Kumasi Sports Stadium grounds. Headline acts include several top-charting Ghanaian and Nigerian artists. Hotel associations in Kumasi are already reporting advance bookings, and the KMA estimates the festival could inject GH₵25 million into the local economy. A portion of proceeds will support music education programmes for secondary school students in the Ashanti Region.',
   'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-010', 'Ashanti Health Service Launches Free Maternal Care Drive',
   'ashanti-health-service-free-maternal-care', 'Lifestyle', 'Bosomtwi Health', '2026-04-21T08:00:00Z',
   'District hospitals across the Ashanti Region are offering free antenatal and postnatal services throughout May as part of a maternal health campaign.',
   'The Ashanti Regional Health Service has launched a month-long free maternal care initiative covering antenatal consultations, delivery services, and postnatal follow-up visits at all 22 district hospitals. The campaign, funded by a combination of government allocation and NGO support, aims to reduce the region''s maternal mortality ratio which, while declining, still stands above the national target. Community health workers are conducting door-to-door outreach to register expectant mothers ahead of the May rollout.',
   'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=800', 'published')
ON CONFLICT (id) DO NOTHING;

-- ── International seed articles (April 2026) ─────────────────────
INSERT INTO public.articles (id, title, slug, category, author, published_at, excerpt, content, image, status)
VALUES
  ('seed-int-001', 'African Union Summit Backs New Continental Free-Trade Enforcement Body',
   'au-summit-free-trade-enforcement', 'International', 'Bosomtwi World', '2026-04-28T09:00:00Z',
   'Heads of state meeting in Addis Ababa agreed to establish a standing body to resolve disputes under the AfCFTA and accelerate intra-African trade.',
   'The 40th African Union Summit concluded with a landmark agreement to create a permanent AfCFTA Dispute Resolution and Enforcement Secretariat. The body, to be headquartered in Accra, will have binding arbitration powers over trade disagreements between member states. Ghana''s President hailed the move as "the most important step in African economic integration since the AfCFTA''s launch." Implementation timelines and funding contributions from member states are to be finalised at a follow-up ministerial meeting in June.',
   'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-int-002', 'IMF Raises West Africa Growth Forecast to 5.8% for 2026',
   'imf-west-africa-growth-forecast-2026', 'International', 'Bosomtwi World', '2026-04-27T10:00:00Z',
   'The International Monetary Fund''s latest Regional Economic Outlook upgrades West Africa''s growth projection, citing commodity export recovery and stronger domestic demand.',
   'The IMF''s April 2026 Sub-Saharan Africa Regional Economic Outlook revised West Africa''s aggregate GDP growth forecast upward to 5.8 percent, the highest projection for any developing region globally this year. Ghana, Côte d''Ivoire, and Senegal were cited as the primary growth engines, driven by oil and cocoa revenues, infrastructure spending, and expanding fintech sectors. The Fund cautioned that fiscal consolidation and debt management remain critical risks for several nations in the region.',
   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-int-003', 'UN Climate Council Approves $50bn Africa Green Energy Fund',
   'un-climate-africa-green-energy-fund', 'International', 'Bosomtwi World', '2026-04-26T08:00:00Z',
   'A new $50 billion fund will support solar, wind, and mini-grid projects across 35 African nations over the next decade.',
   'The UN Climate Council voted 142–8 to establish the Africa Green Energy Transition Fund, the largest dedicated climate-finance instrument for the continent in history. The fund will deploy $50 billion over ten years to support utility-scale solar and wind installations, off-grid mini-grids in rural communities, and green hydrogen pilot projects. Ghana is among twelve countries on the priority access list, expected to receive early tranches to accelerate its 2030 renewable energy target.',
   'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-int-004', 'Nigeria and Ghana Sign Landmark Border Trade Facilitation Pact',
   'nigeria-ghana-border-trade-pact', 'International', 'Bosomtwi World', '2026-04-25T07:30:00Z',
   'The two largest West African economies have agreed to a joint border-management protocol to cut cross-border clearance times from 72 hours to under 8 hours.',
   'Presidents of Nigeria and Ghana signed a Border Trade Facilitation Pact in Accra on Friday, pledging to deploy a joint digital customs clearance system at the Aflao-Seme crossing by the end of 2026. The agreement is expected to boost bilateral trade, currently estimated at $2.3 billion annually, by at least 30 percent within three years. Business associations in both countries welcomed the move, calling it overdue given the two nations'' historical ties and complementary economies.',
   'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800', 'published'),

  ('seed-int-005', 'Chinese Investment in African Infrastructure Hits Record $38bn in 2025',
   'chinese-investment-african-infrastructure-2025', 'International', 'Bosomtwi World', '2026-04-24T09:00:00Z',
   'A new Johns Hopkins SAIS report finds Chinese state-backed lenders and contractors committed a record $38 billion to African infrastructure in 2025, reversing a five-year decline.',
   'The China-Africa Research Initiative at Johns Hopkins SAIS released its annual report showing Chinese financial commitments to African infrastructure reached $38 billion in 2025 — the highest since 2016 and a 22 percent increase over 2024. Roads, railways, and energy projects accounted for the bulk of investment. Researchers noted a shift toward smaller, commercially structured deals replacing the sovereign-guaranteed mega-loans of the previous decade, reducing debt-distress risks for recipient nations.',
   'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800', 'published')
ON CONFLICT (id) DO NOTHING;

-- ── Supabase Storage — article image uploads ─────────────────────
-- Run these in the Supabase SQL Editor AFTER creating the bucket
-- via Dashboard → Storage → New bucket (name: article-images, Public: ON)

-- Allow authenticated users to upload images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Auth users can upload article images'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Auth users can upload article images"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'article-images');
    $policy$;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public can view article images'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Public can view article images"
        ON storage.objects FOR SELECT TO public
        USING (bucket_id = 'article-images');
    $policy$;
  END IF;
END $$;
