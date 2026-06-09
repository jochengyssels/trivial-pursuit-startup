# v0.app prompt — "The Trivial Pursuit of a Startup Idea"

Paste everything below the line into v0.app. It rebuilds the game as a polished React/Next.js app you can remix and deploy from v0 directly.

---

Build a single-page, shared-screen facilitation web app called **"The Trivial Pursuit of a Startup Idea"** — a 90-minute exercise for **three co-founders** (a CEO, a CTO, and a CCO) sitting around one laptop or TV, hunting for a fundable **AI-first** startup idea. It is a guided, single-screen facilitator (no login, no backend) that drives them through a structured flow. Persist all state to `localStorage` so a refresh never loses the board. Use a dark, premium "game-night-meets-boardroom" aesthetic with the six real Trivial Pursuit wedge colors.

## Core metaphor
A fundable AI-first idea needs **all six wedges** of the pie. If one is missing, the idea is incomplete. Play in two laps: **Lap 1 = diverge** (scatter problems across all six categories), **Lap 2 = converge** (take ONE candidate idea and try to earn all six wedges for it). The first idea to **complete the pie** is the lead candidate.

## The six wedges (keep these exact colors, lenses, and gating rules)
1. 🔵 **Blue — Market** (orig. Geography): a *specific, reachable* group with money. Example: not "SMBs" but "12-person dental practices in the Benelux." **Fail if** the market is "everyone."
2. 🩷 **Pink — Pain** (orig. Entertainment): a real, frequent, painful problem they endure *today* and hack around. **Fail if** it's a vitamin, not a painkiller.
3. 🟢 **Green — AI capability** (orig. Science & Nature): something AI can do *now* that was impossible/too expensive ~2 years ago. **This is the AI-first gate. Fail if** the idea is ~as good without AI (AI is decoration).
4. 🟡 **Yellow — Why now** (orig. History): what changed in the last ~18 months — model, cost curve, regulation, behavior, new API. **Fail if** it's "why not earlier" with no real change.
5. 🟤 **Brown — Unfair insight** (orig. Arts & Literature): the founders' secret — what they believe that most experts would argue with, often from lived experience. **Fail if** any consultant would say it too.
6. 🟠 **Orange — The win** (orig. Sports & Leisure): distribution channel + a moat that compounds. **Fail if** it's "we'll out-execute them" with no structural advantage.

## Screens / phases (a top progress bar shows all six; a global per-phase countdown timer with start/pause/reset lives in the header)
1. **Setup** — name the three founders, assign each a seat (CEO/CTO/CCO). Explain that the **Question Master (QM)** rotates every category; the app tracks whose turn it is.
2. **Warm-up (5 min)** — each founder types one industry they've worked in or are obsessed with. These seed the wall as Market stickies.
3. **Lap 1 · Diverge (~40 min, ~6–7 min/category)** — go category by category OR **roll a die** (animated 1–6 → the six colors) to pick the next color randomly so they don't camp in a comfort zone. For the current category: show a **prompt card** drawn from that category's deck (button to draw another), an optional **"Trivia jolt"** button (shows a random trivia *answer* like "Amazon River" plus a reframing question, used to break fixation), and an input to add **colored sticky notes** to a wall (each note: text + author + anonymous vote dots + delete). A category nav shows counts per wedge. Banner reminder: "Lap 1 goal is breadth, not a single idea. Resist convergence."
4. **Pick contenders (10 min)** — show the whole wall grouped by color. Founders **dot-vote** by clicking stickies (click = add dot, shift-click = remove). Then a candidate builder: name 2–3 candidate ideas and attach stickies to each (usually one Pain + one Market).
5. **Lap 2 · Play for the pie (~30 min)** — pick **ONE** candidate. Show a big **SVG six-wedge pie** that fills in color wedge-by-wedge as each is earned, plus a clickable legend. Go wedge by wedge: show the wedge's gating criteria, a prompt card, a text answer field, and the explicit **"Don't award if…" fail rule**. The QM only **awards** a wedge when *all three agree* the answer is specific and true (an "✓ All three agree — award wedge" button). If a wedge can't be filled, a **"Can't fill it — record gap"** button captures *why* and sets the idea aside to start the next candidate. Auto-advance to the next unearned wedge after awarding; rotate the QM each step.
6. **Synthesis (10 min)** — for each completed pie, auto-fill and display this statement using the six earned answers, with each blank highlighted in its wedge color:
   > *For **[market]**, who struggle with **[pain]**, we use **[AI capability]** — newly viable because **[why now]**. Unlike others, we see that **[insight]**, and we'll win by **[distribution + moat]**.*
   Also list what the *other*, incomplete candidates taught you (their recorded gaps). Buttons: **Print/Save PDF** and **Play again (new session)**. If no pie was completed, show an encouraging "an incomplete pie is the session working" message and a review of all gaps.

## Prompt decks (include all of these, drawn at random per category)
**Blue/Market:** "Who has this problem so badly they've built a spreadsheet/duct-tape fix for it?" · "Whose budget is already being spent here, just inefficiently?" · "Which group do WE have unusual access to?" · "Name the smallest viable beachhead: the 100 customers you could actually reach."
**Pink/Pain:** "What task here is tedious, repetitive, and universally hated?" · "What do people apologize for being slow at?" · "Where does money or time leak with no owner?" · "What would make someone say 'finally, someone built this'?"
**Green/AI:** "What can a model do NOW that it couldn't reliably 2 years ago — and is that the crux?" · "If it works just as well WITHOUT AI it's not AI-first. What breaks without the AI?" · "What needed an expert human that AI now makes cheap and instant?" · "What volume of judgment was impossible by hand?"
**Yellow/Why now:** "What changed in the last 18 months — a price, model, law, habit?" · "Why did this fail before, and what's different today?" · "What are people only NOW willing to trust software to do?" · "Is there a deadline the world is walking into?"
**Brown/Insight:** "What do we believe that experts would argue with?" · "What painful truth did one of us learn the hard way?" · "What does our experience say that conventional wisdom misses?" · "Why are WE the right people to see this?"
**Orange/Win:** "How does the 1,001st customer find us?" · "What gets BETTER as we get bigger (data, network, lock-in)?" · "Why can't a competitor copy this in a weekend?" · "What do we own in a year a newcomer would need years to rebuild?"

## Two rules to surface prominently
1. **Specificity over cleverness** — the QM must reject vague answers ("businesses need better data"). Demand "a 12-person dental practice loses ~3 hrs/week reconciling claims by hand."
2. **AI-first discipline** — the Green wedge is the gate. No Green wedge → no pie.

## Tech
Next.js + React + Tailwind, all in client components, no backend, state in `localStorage`. Animated die, SVG pie that fills per wedge, subtle transitions, fully responsive but optimized for one big shared screen. Make it feel like a real board game: tactile sticky notes, a felt-dark table background, the six saturated wedge colors.
