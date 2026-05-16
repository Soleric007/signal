# ⚡ SIGNAL — AI Prediction Battles

> AI personalities debate, predict, and battle over future events.
> Built for the Mantle Turing Test Hackathon 2026.

---

## 🚀 Deploy in 15 minutes (all free)

### 1. Free accounts you need

| Service | Free Tier | Sign up |
|---|---|---|
| Vercel | Unlimited hobby projects | vercel.com |
| Supabase | 500MB DB, 2GB bandwidth | supabase.com |
| Pusher | 200 connections, 200k msgs/day | pusher.com |
| OpenAI | Pay-per-use (~$0.05/battle) | platform.openai.com |

---

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Go to **SQL Editor** → paste the entire contents of `supabase-schema.sql` → Run
3. Go to **Project Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

---

### 3. Set up Pusher

1. Go to [pusher.com](https://pusher.com) → Create app
2. Choose **Channels** → free Sandbox plan
3. Copy from the app dashboard:
   - App ID → `PUSHER_APP_ID`
   - Key → `NEXT_PUBLIC_PUSHER_KEY`
   - Secret → `PUSHER_SECRET`
   - Cluster → `NEXT_PUBLIC_PUSHER_CLUSTER`

---

### 4. Get OpenAI key

1. Go to [platform.openai.com](https://platform.openai.com) → API Keys → Create
2. Add $5 credit (battles cost ~$0.005 each = 1000 battles per $5)
3. Copy key → `OPENAI_API_KEY`

> **Demo mode**: Even without an OpenAI key, the app works with built-in fallback responses.

---

### 5. Deploy to Vercel

```bash
# Clone or download this project
cd signal

# Copy env template
cp .env.local.example .env.local
# Fill in your values in .env.local

# Install and run locally
npm install
npm run dev
# → http://localhost:3000

# Deploy to Vercel
npx vercel
# Follow prompts, add env vars when asked
```

**Or deploy via GitHub:**
1. Push to GitHub repo
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add all environment variables
4. Deploy → get your URL

---

## 🏗 Project structure

```
signal/
├── app/
│   ├── page.tsx              # Landing page
│   ├── explore/              # Browse all battles
│   ├── create/               # Create new battle
│   ├── battle/[id]/          # Live battle arena
│   ├── leaderboard/          # Agent rankings
│   └── api/
│       ├── battles/          # CRUD for battles
│       ├── battles/message/  # AI agent response generation
│       ├── votes/            # Voting system
│       ├── pusher/auth/      # Pusher channel auth
│       └── og/               # OG share image generation
├── components/
│   ├── landing/              # Homepage sections
│   ├── shared/               # Navbar, BattleCard
│   └── arena/                # (extend here)
├── hooks/
│   ├── useBattleRealtime.ts  # Pusher subscription hook
│   └── useTypewriter.ts      # Typewriter text effect
├── lib/
│   ├── agents.ts             # AI personality definitions
│   ├── supabase.ts           # DB client
│   ├── pusher.ts             # Realtime client
│   └── utils.ts              # Helpers
├── types/
│   └── index.ts              # TypeScript types
└── supabase-schema.sql       # Run this in Supabase SQL editor
```

---

## 💡 How it works

1. **User enters a prediction** → stored in Supabase `predictions` table
2. **Battle starts** → frontend calls `/api/battles/message` for each of 6 agents in sequence
3. **Each agent** → OpenAI GPT-4o-mini called with personality system prompt → response streamed back
4. **Confidence values** extracted from response → stored in Supabase + broadcast via Pusher
5. **Frontend** receives Pusher event → updates confidence chart + debate feed live
6. **Users vote** → stored in Supabase votes table
7. **Share** → `/api/og` generates shareable image card

---

## 🎨 Design system

- **Background**: `#050508` (near-black)
- **Accent**: `#7c6af7` (purple)
- **Teal**: `#00d4aa`
- **Fonts**: Syne (display) + Space Grotesk (body)
- **Motion**: Framer Motion throughout

---

## 🔧 Extending

**Add new agent:**
```ts
// lib/agents.ts
newagent: {
  id: 'newagent',
  name: 'The Contrarian',
  // ...
}
```

**Add Mantle blockchain:**
- Deploy `contracts/SignalBattle.sol` to Mantle testnet
- Use wagmi + viem in the frontend
- Call `resolveBattle()` on prediction close

**Add auth:**
- Enable Supabase Auth
- Replace `user_session` (localStorage) with actual user IDs

---

## 📊 Cost estimate

| Service | Monthly cost at 1000 battles/day |
|---|---|
| Vercel | $0 (Hobby) |
| Supabase | $0 (Free tier) |
| Pusher | $0 (Free tier) |
| OpenAI | ~$1.50/day → $45/month |

**Hackathon demo**: Total cost = ~$0.50 for the whole demo day.

---

Built with ❤️ for the Mantle Turing Test Hackathon 2026
