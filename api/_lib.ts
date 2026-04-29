// Shared helpers for all Vercel API routes.
// Underscore prefix = Vercel treats this as a utility, not a route.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export { bcrypt, jwt };

// ── Supabase — safe init (never throws at module load) ────────────
const SB_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL || '';

const SB_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY || '';

let _db: SupabaseClient | null = null;
if (SB_URL && SB_KEY) {
  try {
    _db = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
  } catch (e) {
    console.error('Supabase createClient failed:', e);
  }
} else {
  console.error('Supabase env vars missing. Add SUPABASE_URL + SUPABASE_ANON_KEY to Vercel.');
}

// Call getDb() inside handlers — throws a JSON-safe error if unconfigured.
export function getDb(): SupabaseClient {
  if (!_db) throw new Error('Database not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to your Vercel environment variables.');
  return _db;
}

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// ── CORS ──────────────────────────────────────────────────────────
export function cors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

// ── Auth ──────────────────────────────────────────────────────────
export function requireAuth(req: any, res: any): boolean {
  const token = (req.headers?.authorization || '').split(' ')[1];
  if (!token) { res.status(401).json({ message: 'Authentication required' }); return false; }
  try { jwt.verify(token, JWT_SECRET); return true; }
  catch { res.status(403).json({ message: 'Invalid or expired token' }); return false; }
}

// ── Field mapping ─────────────────────────────────────────────────
export function dbToArticle(r: any) {
  return {
    id: r.id, title: r.title, slug: r.slug, category: r.category,
    author: r.author, publishedAt: r.published_at,
    excerpt: r.excerpt || '', content: r.content || '',
    image: r.image || '', videoUrl: r.video_url || '',
    status: r.status || 'published',
  };
}
export function articleToDb(a: any) {
  return {
    id: a.id, title: a.title, slug: a.slug, category: a.category,
    author: a.author, published_at: a.publishedAt || new Date().toISOString(),
    excerpt: a.excerpt || '', content: a.content || '',
    image: a.image || '', video_url: a.videoUrl || '',
    status: a.status || 'published',
  };
}

// ── Seed data ─────────────────────────────────────────────────────
export const DEFAULT_ARTICLES = [
  {
    id:'1', category:'Business', author:'Kwame Asante', status:'published',
    publishedAt:'2026-04-29T06:00:00.000Z',
    title:'Ghana Cedi Posts Strongest Quarter in a Decade After Bank of Ghana Rate Cut',
    slug:'ghana-cedi-strongest-quarter-2026',
    excerpt:'The local currency gained 11% against the dollar in Q1 2026 following the central bank\'s decisive interest-rate reduction and a surge in remittance inflows.',
    image:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'The Ghana Cedi traded at GH₵13.40 to the dollar on Monday — its strongest position since Q3 2016 — as the Bank of Ghana\'s 150-basis-point rate cut in February continued to unlock credit markets and steady the exchange rate.\n\nRemittances from the Ghanaian diaspora hit a record $5.8 billion in Q1 2026, up 19% year-on-year, providing an additional buffer for the currency.\n\n"We are seeing the fruits of disciplined fiscal management," Finance Minister Kwabena Acheampong told journalists in Accra on Tuesday. "Inflation is down to 9.4%, its lowest point in four years."\n\nAshanti Region manufacturers say the stronger cedi is already cutting import costs. The Kumasi Chamber of Commerce reported a 14% drop in raw-material import bills for member companies over the past three months.\n\nAnalysts at Databank Research caution that the gains remain fragile heading into the second half of 2026, when cocoa forward contracts roll over and global commodity prices could exert renewed pressure.',
  },
  {
    id:'2', category:'Manhyia', author:'Admin User', status:'published',
    publishedAt:'2026-04-28T07:00:00.000Z',
    title:'Otumfuo Marks 27 Years on the Golden Stool with Pan-African Traditional Leaders Summit',
    slug:'otumfuo-27th-anniversary-summit-2026',
    excerpt:'Manhyia Palace hosted monarchs from 18 African nations as the Asantehene commemorated his silver jubilee on the throne with a declaration on cultural preservation.',
    image:'https://images.unsplash.com/photo-1523438097201-512ae7d59c44?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Otumfuo Osei Tutu II marked his 27th anniversary on the Golden Stool on Sunday, welcoming traditional rulers from Nigeria, Côte d\'Ivoire, Mali, Senegal and 14 other African nations to Kumasi for the inaugural Pan-African Traditional Leaders Summit.\n\nThe gathering, held under the theme "Ancestral Wisdom, Modern Governance", produced the Kumasi Declaration — a ten-point communiqué pledging cooperation on oral heritage archiving, land rights, and the protection of sacred sites across the continent.\n\n"The chieftaincy institution is not a relic. It is a living force that can anchor democracy, resolve conflict and drive development," the Asantehene told delegates at the durbar grounds of Manhyia Palace, which was transformed with a sea of kente and traditional regalia.\n\nPresident John Dramani Mahama, who attended alongside the Speaker of Parliament, said the government would work with the National House of Chiefs to codify the Kumasi Declaration into national policy within 90 days.',
  },
  {
    id:'3', category:'Technology', author:'Ama Serwaa', status:'published',
    publishedAt:'2026-04-28T08:30:00.000Z',
    title:'MTN Ghana Completes 5G Rollout Across All 43 Ashanti District Capitals',
    slug:'mtn-ghana-5g-ashanti-rollout-2026',
    excerpt:'The telecoms giant switched on its final cluster of 5G towers in Ashanti Region this week, making it the first region in West Africa to achieve full district-level 5G coverage.',
    image:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'MTN Ghana officially activated 5G service in Mampong, Ejura and Afigya-Sekyere East on Wednesday, completing a two-year rollout that now blankets all 43 district capitals in Ashanti Region with sub-6 GHz 5G connectivity.\n\nThe company says average download speeds in Kumasi Metropolitan have hit 380 Mbps, while rural districts are recording 120–180 Mbps — 30 times faster than the previous 4G LTE average.\n\nChief Executive Selorm Adadevoh called the milestone a "platform moment" for the region, noting that KNUST researchers, small manufacturers and agri-tech startups were already filing applications to the new MTN 5G Innovation Lab in Kumasi.\n\nThe Ghana Investment Promotion Centre estimates the expanded connectivity could attract up to $240 million in digital-sector foreign direct investment to Ashanti over the next three years.\n\nVodafone Ghana says it will complete its own Ashanti 5G network by Q3 2026, intensifying competition that analysts say will drive consumer prices down by at least 20%.',
  },
  {
    id:'4', category:'Politics', author:'Kofi Mensah', status:'published',
    publishedAt:'2026-04-27T09:00:00.000Z',
    title:'Parliament Passes Historic Ashanti Regional Development Authority Bill',
    slug:'ashanti-regional-development-authority-bill-2026',
    excerpt:'Lawmakers approved the landmark legislation that grants Ashanti Region greater autonomy over its natural-resource revenues and infrastructure spending priorities.',
    image:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Ghana\'s Parliament passed the Ashanti Regional Development Authority (ARDA) Bill on Friday by a vote of 214 to 31, granting the region an unprecedented degree of fiscal autonomy to direct revenues from gold, timber and cocoa royalties toward local projects.\n\nThe bill, which had been under debate for three years, creates a 15-member board co-chaired by the Ashanti Regional Minister and a representative of the Manhyia Palace. It mandates that 35% of royalties collected within the region be retained locally — up from the current 3%.\n\nAshanti Regional Minister Cecilia Abena Dapaah hailed the vote as "the most consequential piece of legislation for our people in a generation". She said initial priorities would include a GH₵120 million road rehabilitation programme and a new regional teaching hospital.\n\nThe NPP Minority Leader argued the bill was unconstitutional, vowing a Supreme Court challenge, but legal scholars contacted by Bosomtwi Web said the legislation had been carefully crafted to pass constitutional muster.\n\nAshanti chiefs welcomed the bill at a press conference at Manhyia, saying it aligned with the spirit of the Kumasi Declaration signed days earlier.',
  },
  {
    id:'5', category:'Sports', author:'Kwame Asante', status:'published',
    publishedAt:'2026-04-27T10:00:00.000Z',
    title:'Black Stars Seal 2026 FIFA World Cup Spot with 2-0 Win Over Comoros',
    slug:'black-stars-world-cup-2026-qualification',
    excerpt:'Goals from Jordan Ayew and an Inaki Williams header at Baba Yara Stadium confirmed Ghana\'s qualification for the USA, Canada and Mexico World Cup just 48 hours before the tournament kick-off.',
    image:'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Ghana is going to the World Cup.\n\nA packed Baba Yara Sports Stadium in Kumasi erupted on Thursday night as the Black Stars secured a 2-0 victory over Comoros to clinch Group I of the CAF third-round qualifiers with a game to spare.\n\nJordan Ayew opened the scoring in the 23rd minute with a long-range effort that deflected off a defender, before Inaki Williams — starting his first game for Ghana since returning from injury — powered home a header from a Kudus Mohammed cross on the hour mark.\n\n"This group never gave up," coach Otto Addo told the post-match press conference. "We know we have work to do before we face the world\'s best, but this team has the spirit to compete."\n\nPresident Mahama called the team\'s bus to personally congratulate the squad, while Kumasi streets filled with supporters waving flags and beating drums deep into the night.\n\nGhana are in Pot 3 for the World Cup draw scheduled for May 2026 in New York. The tournament itself begins in June.',
  },
  {
    id:'6', category:'Entertainment', author:'Ama Serwaa', status:'published',
    publishedAt:'2026-04-26T08:00:00.000Z',
    title:'Sarkodie Announces "Obidi" World Tour — Kumasi Show to Open African Leg',
    slug:'sarkodie-obidi-world-tour-2026',
    excerpt:'The rapper revealed dates for a 28-city global tour on Friday, with Kumasi\'s Independence Square set to host 40,000 fans for the African premiere on June 20.',
    image:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Sarkodie dropped the full tour schedule for his "Obidi" world tour on Friday morning, and fans in Kumasi woke up to the news that Ghana\'s Garden City will host the African premiere at Independence Square on June 20.\n\nThe tour follows the release of "Obidi", Sarkodie\'s seventh studio album, which debuted at number one on Apple Music in 14 African countries and cracked the global Spotify Hip-Hop chart at position 38 within 48 hours of release.\n\nKumasi is one of five African dates — alongside Lagos, Nairobi, Johannesburg and Dakar — before the tour moves to London, Amsterdam, Toronto, New York, Atlanta and Houston.\n\n"Coming home first is not tradition, it is a decision," Sarkodie said in a statement. "Kumasi raised me. Kumasi hears me first."\n\nTickets go on sale Saturday at 9am through the Bosomtwi Tickets platform. Organisers say early-bird floor tickets are priced at GH₵350, with VIP packages from GH₵1,200.\n\nSupport acts for the Kumasi show have not yet been announced, though industry insiders say Black Sherif and King Promise are expected to share the stage.',
  },
  {
    id:'7', category:'Business', author:'Kofi Mensah', status:'published',
    publishedAt:'2026-04-26T09:30:00.000Z',
    title:'Ashanti Cocoa Farmers Report 26% Production Surge on Back of New Agri-Tech Programme',
    slug:'ashanti-cocoa-production-surge-2026',
    excerpt:'COCOBOD data released Friday shows Ashanti Region surpassed 500,000 tonnes of dry cocoa beans for the first time, driven by a government-backed smart-farming initiative.',
    image:'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Ashanti Region crossed the half-million-tonne barrier in cocoa production for the 2025/26 main crop season — a 26% year-on-year increase that COCOBOD officials called "a watershed moment for Ghanaian agriculture".\n\nThe milestone is largely attributed to the Smart Cocoa programme, a public-private partnership between the government, Olam Agri and KNUST, which has enrolled 68,000 Ashanti farmers since 2024. The programme provides subsidised soil-testing kits, precision-irrigation equipment and mobile advisory services via a Twi-language app.\n\nFarmer Adwoa Kyeremaa of Juaben District, who grows four hectares of cocoa, said her yield doubled in just one season. "Before the programme I was getting 400 kilos per hectare. This year I got 820," she told Bosomtwi Web.\n\nGlobal cocoa prices remain elevated at around $9,800 per tonne on the London ICE exchange, meaning the production increase translates directly into higher farm-gate incomes. COCOBOD raised the producer price to GH₵3,400 per 64-kilo bag — a 31% rise on last year.\n\nThe surge positions Ghana to reclaim second place globally in cocoa output, behind Côte d\'Ivoire.',
  },
  {
    id:'8', category:'Sports', author:'Kwame Asante', status:'published',
    publishedAt:'2026-04-25T10:00:00.000Z',
    title:'Asante Kotoko Reach CAF Champions League Semi-Finals for First Time in 21 Years',
    slug:'kotoko-caf-champions-league-semi-final-2026',
    excerpt:'The Porcupine Warriors edged TP Mazembe 1-0 on aggregate at Baba Yara to book a historic last-four berth in African club football\'s premier competition.',
    image:'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Asante Kotoko wrote another chapter in their illustrious African football history on Saturday, holding TP Mazembe goalless in Lubumbashi to advance to the CAF Champions League semi-finals 1-0 on aggregate — the club\'s deepest continental run since 2005.\n\nThe decisive goal came from winger Eric Acheampong, who latched onto a misplaced Mazembe pass in the 34th minute of last week\'s home leg and slotted calmly past keeper Mwape Mwape.\n\nCoach David Ocloo praised his side\'s defensive discipline over two legs, saying the performance was a "validation of our three-year rebuild project at Baba Yara".\n\nKotoko will face Al Ahly of Egypt or Wydad Casablanca of Morocco in the two-legged semi-final, with the first leg scheduled for late May.\n\nThousands of supporters flooded the streets of Kumasi on Saturday night in spontaneous celebrations. Manhyia Palace sent a congratulatory message, with palace spokesman Osei Bonsu calling the achievement "a gift to the Asante nation".\n\nTickets for the home semi-final leg go on sale on Monday through the club\'s official website.',
  },
  {
    id:'9', category:'Manhyia', author:'Admin User', status:'published',
    publishedAt:'2026-04-25T07:30:00.000Z',
    title:'Asantehene Commissions GH₵45M Royal Cultural Museum at Manhyia Palace',
    slug:'manhyia-royal-cultural-museum-opening-2026',
    excerpt:'The five-storey museum, three years in the making, opens its doors to the public with artefacts spanning 400 years of Asante history — including two objects returning from British museums.',
    image:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Otumfuo Osei Tutu II cut the ribbon on the Manhyia Royal Cultural Museum on Thursday morning in a ceremony attended by cabinet ministers, foreign ambassadors and thousands of well-wishers who lined the streets of Kumasi.\n\nThe five-storey building, designed by Ghanaian architect Nana Kwabena Boateng, houses over 4,200 artefacts — kente weavings, royal regalia, war swords, bronze castings and oral-history recordings — spanning more than four centuries of Asante civilisation.\n\nHighlight of the opening was the formal return of two items: a 19th-century ceremonial sword and a carved stool, both repatriated from the British Museum following years of diplomacy. The Asantehene received the artefacts personally, to thunderous applause.\n\n"Today we reclaim our story," Otumfuo told the gathering. "These objects are not trophies of the past — they are lessons for the future."\n\nThe museum will be open to the public Tuesday through Sunday, 9am–6pm, with free admission for school children on Tuesdays. An augmented-reality gallery allows visitors to experience Asante court life in the 18th century through VR headsets produced in partnership with KNUST\'s digital arts department.',
  },
  {
    id:'10', category:'Technology', author:'Ama Serwaa', status:'published',
    publishedAt:'2026-04-24T08:00:00.000Z',
    title:'KNUST Launches West Africa\'s First Quantum Computing Research Centre',
    slug:'knust-quantum-computing-centre-2026',
    excerpt:'The Kwame Nkrumah University of Science and Technology inaugurated a $12 million quantum lab on Wednesday, funded jointly by the government, IBM and the African Development Bank.',
    image:'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Kwame Nkrumah University of Science and Technology formally opened the KNUST Quantum Computing and Advanced Algorithms Centre (QCAAC) on Wednesday, positioning Kumasi as a hub for deep-technology research on the African continent.\n\nThe centre is equipped with a 27-qubit IBM Quantum System One — the first commercially operational quantum computer on West African soil — alongside classical high-performance computing clusters and a purpose-built clean room for materials science experiments.\n\nVice Chancellor Prof. Linda Asante-Acheampong said the centre would initially focus on three application domains: drug discovery for tropical diseases, supply-chain optimisation for Ghanaian agriculture, and cryptography research in partnership with the National Cyber Security Authority.\n\n"Quantum is not science fiction. It is the next industrial revolution, and Africa must be inside the room where it happens," Prof. Asante-Acheampong said.\n\nIBM Research Africa director Dr. Seun Owoade, speaking via video link from Nairobi, said KNUST had been selected from 23 applicant universities across sub-Saharan Africa based on the quality of its existing physics and computer science faculties.\n\nTwenty PhD fellowships, each valued at $35,000 per year, are open for applications until May 31.',
  },
  {
    id:'11', category:'Politics', author:'Kofi Mensah', status:'published',
    publishedAt:'2026-04-24T09:00:00.000Z',
    title:'Ashanti Regional Minister Launches GH₵80M Youth Employment Initiative',
    slug:'ashanti-youth-employment-initiative-2026',
    excerpt:'The "Ashanti Works" programme targets 25,000 young people with vocational training placements, apprenticeships and seed grants by the end of 2026.',
    image:'https://images.unsplash.com/photo-1474690870753-1b92efa1f2d8?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Ashanti Regional Minister Cecilia Abena Dapaah launched the "Ashanti Works" Youth Employment Initiative on Thursday, committing GH₵80 million over 18 months to tackle a youth unemployment rate the Regional Coordinating Council puts at 23%.\n\nThe programme has three pillars. The first, "Ashanti Skills", will fund 10,000 placements in TVET institutions and registered apprenticeship schemes across all districts, with a focus on construction, automotive, hospitality and digital trades. The second, "Ashanti Green Jobs", will enrol 8,000 youth in paid positions with the newly established Regional Environmental Agency, covering tree planting, waste management and solar-panel installation. The third, "Ashanti Ventures", will distribute seed grants of GH₵5,000 to 7,000 validated micro-enterprises run by people under 35.\n\nThe minister said applications would open online and at district offices on May 5, with the first cohort due to begin in June.\n\nYouth advocacy group Ghana Youth Alliance praised the initiative but called for independent monitoring to prevent politically motivated selection. "The money is welcome. Transparency in delivery is non-negotiable," said the group\'s Kumasi coordinator, Abena Adu.',
  },
  {
    id:'12', category:'Entertainment', author:'Ama Serwaa', status:'published',
    publishedAt:'2026-04-23T10:00:00.000Z',
    title:'Ghanaian Film "Obi Kwan" Takes Grand Prix at Cannes Film Festival',
    slug:'obi-kwan-cannes-grand-prix-2026',
    excerpt:'Director Akua Asantewaa\'s debut feature, shot entirely in Kumasi and the Ashanti countryside, won the top prize at the world\'s most prestigious film festival, drawing global attention to Ghanaian cinema.',
    image:'https://images.unsplash.com/photo-1541535650810-10d26f5c2abb?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Akua Asantewaa became the first Ghanaian director to win the Grand Prix at the Cannes Film Festival on Saturday, sending shockwaves through the global film industry and setting off celebrations in Kumasi that lasted into the early hours of Sunday morning.\n\n"Obi Kwan" — which translates roughly as "Who is the Stranger?" — is a 94-minute drama filmed over eight months in Kumasi\'s Bantama neighbourhood and the forests of Ashanti Region. It tells the story of a young woman navigating the friction between tradition and ambition in a rapidly changing city.\n\nThe jury, presided over by Spanish filmmaker Pedro Almodóvar, cited the film\'s "extraordinary visual poetry and unflinching emotional honesty".\n\nAsantewaa, 31, accepted the award in a white kente cloth to a standing ovation. "This is for every girl in Kumasi who looked at a camera and believed she could tell the world something worth hearing," she said.\n\nThe film was shot on a budget of $180,000 — a fraction of most Cannes competitors — and features a cast of non-professional actors drawn from the neighbourhoods where it was filmed.\n\nNetflix confirmed Sunday that it has acquired global streaming rights, with a release date to be announced.',
  },
  {
    id:'13', category:'Business', author:'Kwame Asante', status:'published',
    publishedAt:'2026-04-22T08:30:00.000Z',
    title:'Kumasi Free Trade Zone Draws GH₵1.2 Billion in New Foreign Investment',
    slug:'kumasi-free-trade-zone-investment-2026',
    excerpt:'The Kumasi Industrial City attracted 17 new tenants in the first quarter of 2026, including a Chinese EV battery plant, a Dutch agri-processing company and two Kenyan fintech firms.',
    image:'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'The Kumasi Industrial City Free Trade Zone posted GH₵1.2 billion in new committed investment in Q1 2026, more than double the same period last year, as the zone\'s improved logistics links and the new ARDA legislation drew multinational interest.\n\nThe most significant arrival is Sunbright Energy Tech, a subsidiary of Shenzhen-based CATL, which will build a lithium-iron phosphate battery assembly plant expected to employ 2,200 workers when at full capacity in 2028. The plant will supply EV battery packs to the growing West African electric-vehicle market.\n\nDutch agri-processor Royal Fruehauf will construct a $40 million tomato and cassava processing facility, with off-take agreements already signed with three Ashanti farming cooperatives.\n\nGhana Free Zones Authority CEO Kojo Nkrumah-Mensah said the zone\'s occupancy rate had climbed to 74%, up from 51% in 2024, and that an 80-hectare Phase 3 expansion had been approved.\n\nThe Kumasi Metropolitan Assembly said the investment wave had already created 4,100 permanent jobs in the zone and a further estimated 6,000 indirect roles in transport, catering and services.',
  },
  {
    id:'14', category:'Manhyia', author:'Kwame Asante', status:'published',
    publishedAt:'2026-04-21T07:00:00.000Z',
    title:'Otumfuo Foundation Awards 3,200 University Scholarships for 2026 Academic Year',
    slug:'otumfuo-foundation-scholarships-2026',
    excerpt:'The Asantehene\'s charitable foundation announced its largest-ever scholarship cohort, with grants covering full tuition, accommodation and a monthly stipend for students from disadvantaged Ashanti communities.',
    image:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'The Otumfuo Osei Tutu II Foundation announced on Monday that it would award 3,200 university scholarships for the 2026/27 academic year — its biggest cohort since the programme began in 2010 and a 60% increase on last year\'s 2,000 grants.\n\nScholarships cover full tuition at any accredited Ghanaian university, on-campus accommodation, a monthly stipend of GH₵800 and a laptop. Recipients are selected on academic merit and financial need, with priority given to students from rural districts and female applicants in STEM fields.\n\nFoundation CEO Dr. Osei Prempeh said an endowment drive that raised GH₵38 million from Asante diaspora networks in the UK, USA and Canada had made the expanded cohort possible.\n\n"Education is the most powerful tool we can place in the hands of our youth," Otumfuo Osei Tutu II said in a statement. "Every scholarship is a generation transformed."\n\nApplications are open online at otumfuofoundation.org until May 20. Results will be announced in late June, with the scholarship year beginning in September.',
  },
  {
    id:'15', category:'Sports', author:'Kofi Mensah', status:'published',
    publishedAt:'2026-04-20T10:00:00.000Z',
    title:'Kumasi International Marathon 2026 Attracts 15,000 Runners from 42 Nations',
    slug:'kumasi-marathon-2026-record',
    excerpt:'Kenya\'s Beatrice Chebet and Ethiopia\'s Birhanu Legese won the elite women\'s and men\'s titles respectively, while the event set a new record for African marathon participation.',
    image:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'The Kumasi International Marathon delivered another record-breaking edition on Sunday, with 15,237 finishers from 42 countries crossing the line on a course that winds through Kumasi\'s historic neighbourhoods and returns to Baba Yara Stadium.\n\nKenya\'s Beatrice Chebet won the women\'s elite race in 2:19:44, a new course record, while Ethiopian Birhanu Legese claimed the men\'s title in 2:04:31, the fastest time ever recorded on Ghanaian soil.\n\nGhana\'s top finisher was 22-year-old Emmanuel Frimpong-Boateng of the Kumasi Athletics Club, who crossed in 2:11:18 — a significant personal best that earned him selection to the national World Championship squad.\n\nThe event raised GH₵2.3 million for the Otumfuo Foundation\'s scholarship programme through entry fees and corporate sponsorship.\n\nKumasi Metropolitan Chief Executive Osei Assibey-Mensah said the city was bidding to host the 2028 African Athletics Championships on the back of the marathon\'s growing reputation.\n\nNext year\'s race date — the third Sunday of April 2027 — was announced at the closing ceremony, with organisers confirming prize money will increase to $75,000 for first place.',
  },
  {
    id:'16', category:'Technology', author:'Kofi Mensah', status:'published',
    publishedAt:'2026-04-19T09:00:00.000Z',
    title:'GhanaPostGPS Hits 3 Million Active Users, Expands to Six West African Countries',
    slug:'ghanapostgps-3-million-users-expansion-2026',
    excerpt:'The digital address system created in Ghana has been adopted by Togo, Benin, Sierra Leone, Liberia and Gambia as the platform for national last-mile delivery infrastructure.',
    image:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'GhanaPostGPS, the digital-address platform that assigns a unique alphanumeric code to every 5×5-metre square of land in Ghana, announced on Saturday that it had crossed 3 million active monthly users — and that six West African nations have signed licensing agreements to deploy the technology nationally.\n\nTogo and Benin went live with the platform in January, followed by Sierra Leone and Liberia in March. Gambia is expected to activate its deployment in May. Together the six adopter countries add roughly 35 million potential users to the platform ecosystem.\n\nGhanaPost CEO Solomon Lartey said the company was in advanced talks with Côte d\'Ivoire, Ghana\'s largest neighbour, and that a continental deal with the African Union postal union UPU was under negotiation.\n\nFor Ghana itself, the platform is now embedded in the NHIS digital health card, the national vehicle inspection system, and the Ghana Revenue Authority\'s property-rate collection app, generating an estimated GH₵220 million per year in efficiency savings across the public sector.\n\nThe Kumasi Metropolitan Assembly said GhanaPostGPS integration had cut its parcel mis-delivery rate in the city from 34% to under 4% since 2023.',
  },
  {
    id:'17', category:'Politics', author:'Admin User', status:'published',
    publishedAt:'2026-04-18T09:00:00.000Z',
    title:'NDC National Delegates Conference Opens in Kumasi with Mahama Address on Economy',
    slug:'ndc-national-delegates-conference-kumasi-2026',
    excerpt:'President Mahama told 4,000 delegates gathered in Kumasi that Ghana\'s economy has "turned the corner" but warned against complacency ahead of midterm local government elections in October.',
    image:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'President John Dramani Mahama opened the National Democratic Congress National Delegates Conference in Kumasi on Friday before a crowd of 4,000 party faithful, delivering a keynote address that blended economic optimism with a rallying call ahead of October\'s district-level elections.\n\n"Ghana has turned the corner," the President declared at the Kumasi International Conference Centre, citing the cedi\'s recovery, falling inflation and the record cocoa season. "But a corner turned is not a race won."\n\nMahama announced three policy commitments: a GH₵500 million Community Development Fund to be distributed through Metropolitan, Municipal and District Assemblies; a new digital voter-outreach platform ahead of local polls; and a pledge to increase women\'s participation in government appointments to 40% by the end of 2026.\n\nThe conference comes as the NDC eyes retaining its strong showing in Ashanti Region, which the party won in the 2024 general elections for only the second time in its history.\n\nOpposition NPP spokesperson Boahen Aidoo dismissed the speech as "re-packaged promises", telling journalists the government\'s infrastructure commitments remained largely undelivered six months into the year.\n\nThe conference runs through Sunday, with party elections for national officers scheduled for Saturday.',
  },
  {
    id:'18', category:'Entertainment', author:'Kwame Asante', status:'published',
    publishedAt:'2026-04-17T10:00:00.000Z',
    title:'King Promise Sweeps VGMA 2026 with Four Awards Including Artist of the Year',
    slug:'king-promise-vgma-2026-artist-of-year',
    excerpt:'The Ghanaian Afropop sensation dominated the 27th Vodafone Ghana Music Awards held at the Grand Arena in Accra, taking home Artist of the Year, Album of the Year, Afropop Song of the Year and Best Male Vocalist.',
    image:'https://images.unsplash.com/photo-1541535650810-10d26f5c2abb?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'King Promise delivered the performance of his career at the 27th Vodafone Ghana Music Awards on Saturday, walking away with four of the night\'s most coveted prizes and establishing himself as the undisputed face of contemporary Ghanaian music.\n\nHis album "Forever," released in October 2025, swept Album of the Year and spawned the Afropop Song of the Year winner "Ataa," which spent 14 weeks at number one on the Ghana Music Chart and reached the top 50 on Spotify\'s Global Viral chart.\n\nIn his acceptance speech for Artist of the Year, King Promise paid tribute to his Kumasi roots. "Kumasi is where I first learned to sing in the dark," he said, drawing a standing ovation from the 8,000-strong crowd at the Grand Arena.\n\nOther notable winners included Gyakie (Best Female Vocalist), Black Sherif (Hiplife/Hip-hop Song of the Year) and Stonebwoy, who received the Lifetime Achievement Award in a ceremony that drew tears from many in the audience.\n\nThis year\'s VGMA also introduced a new "Digital Creator" category, won by YouTube music channel Sadahzinia, reflecting the growing role of social media in breaking Ghanaian artists internationally.',
  },
  {
    id:'19', category:'Business', author:'Admin User', status:'published',
    publishedAt:'2026-04-16T08:00:00.000Z',
    title:'Bank of Ghana Grants Licence to Ghana\'s First Fully Digital Commercial Bank',
    slug:'ghana-first-digital-bank-licence-2026',
    excerpt:'Kudi Bank, backed by a consortium of Ghanaian and Nigerian investors, will operate with no physical branches, targeting the 6.5 million unbanked adults in Ghana\'s informal sector.',
    image:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'The Bank of Ghana issued Ghana\'s first fully digital commercial banking licence on Tuesday, authorising Kudi Bank to begin operations on June 1 with a service model built entirely around mobile phones and biometric identity verification.\n\nKudi Bank is backed by a GH₵340 million investment from a consortium that includes Ghanaian tech investor Farida Bedwei, Nigerian fintech giant Flutterwave and the IFC arm of the World Bank Group.\n\nThe bank will offer current and savings accounts, micro-loans of up to GH₵50,000, insurance products and cross-border remittances — all accessible through a mobile app available in English, Twi, Ewe and Hausa.\n\nCEO Abena Kyeremateng said Kudi Bank would prioritise market women, smallholder farmers and artisans who currently rely on mobile money but lack access to credit. "Mobile money gave people a wallet. We are giving them a bank," she said at the licence announcement press conference.\n\nBank of Ghana Governor Ernest Addison said the regulator had applied "the highest standards" to the licence review, noting that Kudi Bank had met a GH₵200 million minimum capital requirement — double the standard floor.\n\nAshanti Region is expected to be one of the launch markets, with Kumasi identified as the location of the bank\'s sole physical "support hub" — a walk-in centre for customers who need in-person assistance.',
  },
  {
    id:'20', category:'Sports', author:'Kofi Mensah', status:'published',
    publishedAt:'2026-04-15T09:00:00.000Z',
    title:'Olympic Bronze Medallist Abena Agyei Returns to Hero\'s Welcome in Kumasi',
    slug:'abena-agyei-olympic-homecoming-2026',
    excerpt:'The 23-year-old middle-distance runner was greeted by thousands at Kumasi Asante Kotoko Airport after winning bronze in the 1,500m at the 2026 Commonwealth Games in Glasgow.',
    image:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    videoUrl:'',
    content:'Abena Agyei touched down at Kumasi Asante Kotoko International Airport on Sunday afternoon to a reception that stopped traffic on the Accra-Kumasi motorway for two hours, as thousands of supporters lined the road to celebrate Ghana\'s first Commonwealth Games athletics medal in eight years.\n\nAgyei, 23, from Kuntanase in the Ashanti Region, won bronze in the women\'s 1,500m final in Glasgow with a personal best of 4:01.14, finishing behind Kenya\'s Faith Kipyegon and Ethiopia\'s Gudaf Tsegay.\n\nThe Asantehene sent a personal delegation to the airport and later invited Agyei to Manhyia Palace, where she was honoured with a traditional chieftaincy title — Aberewa Kontihemaa — in a brief but emotional ceremony.\n\nAgyei told reporters she had trained for two years on a red-dirt track in Kuntanase because her family could not afford to relocate her to a national athletics camp. "My parents watered that track with buckets every morning so the dust would not choke me while I ran," she said.\n\nThe Ghana Athletics Association has confirmed Agyei will be seeded for the 2026 Commonwealth Games final squad and has been offered a full scholarship to train at the Accra Sports Complex facility. Ashanti Regional Minister Dapaah said the government would build a tartan athletics track in Kuntanase in her honour.',
  },
];

export const DEFAULT_USERS_PLAIN = [
  { id:'1', name:'Admin User',   email:'admin@bosomtwi.web', role:'admin',      pw:'admin123' },
  { id:'2', name:'Kwame Asante', email:'kwame@bosomtwi.web', role:'editor',     pw:'news2025' },
  { id:'3', name:'Ama Serwaa',   email:'ama@bosomtwi.web',   role:'journalist', pw:'news2025' },
  { id:'4', name:'Kofi Mensah',  email:'kofi@bosomtwi.web',  role:'journalist', pw:'news2025' },
];

// Always upsert the canonical seed articles (IDs '1'–'20').
// User-published articles have timestamp IDs so they are never overwritten.
// Also seeds default users on first run only (avoids resetting passwords).
export async function seedIfEmpty() {
  const db = getDb();
  try {
    const { error: artErr } = await db
      .from('articles')
      .upsert(DEFAULT_ARTICLES.map(articleToDb), { onConflict: 'id' });
    if (artErr) throw artErr;

    const { count: uc } = await db
      .from('users')
      .select('*', { count: 'exact', head: true });
    if ((uc ?? 0) === 0) {
      const hashed = await Promise.all(DEFAULT_USERS_PLAIN.map(async u => ({
        id: u.id, name: u.name, email: u.email, role: u.role,
        password: await bcrypt.hash(u.pw, 10),
      })));
      const { error: usrErr } = await db
        .from('users')
        .upsert(hashed, { onConflict: 'id' });
      if (usrErr) throw usrErr;
    }
  } catch (err) {
    console.error('Seed failed — ensure supabase/schema.sql has been run and env vars are set:', err);
    throw err;
  }
}
