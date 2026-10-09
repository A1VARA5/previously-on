---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. A grounded recap from sample chat**
  Becomes usable: `npm run recap:sample` reads a realistic sample channel and prints a TV narrator recap where every line names the real message it came from. Lines pointing at messages that don't exist are dropped.
  Why now: The kernel and the riskiest part (Claude writing a funny but grounded recap) get proven first, before any Discord setup. Bootstrapping (package.json, deps, .env) happens here.
  PRD ref: `prd.md > Features and Behavior > The recap (/previously)`, `prd.md > Product Decisions`
  Spec ref: `spec.md > Recap Writer`, `spec.md > Grounding Check`, `spec.md > Seeder (sample data)`, `spec.md > Stack`
  Build: Scaffold the project, write `data/sample-chat.json` (a few hundred labelled sample messages including mod answers), `src/claude.js`, `src/grounding.js` with tests, the Recap Writer in `src/recap.js`, and `scripts/recap-sample.js`.
  Verify (mechanical): `npm test` passes (grounding drops fake ids, caps lines, strips links); `npm run recap:sample` prints 4 to 6 lines whose ids all exist in the sample file.
  Learner check: Run `npm run recap:sample` and read the recap. Does it sound like a TV narrator and pick the stuff that matters?
  Commit: `Recap writer with grounding check`

- [x] **2. /previously works in Discord**
  Becomes usable: In the test server, typing `/previously` gives a private "📺 Previously on #channel" embed with jump links, covering messages since you last spoke.
  Why now: Puts the kernel where people actually use it. Needs the Discord app, token and test server.
  PRD ref: `prd.md > The Core Journey` (steps 1 to 5), `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Bot Entry`, `spec.md > Recap Command`, `spec.md > History Reader`, `spec.md > Discord Replies`, `spec.md > Seeder (sample data)`
  Build: `src/index.js`, `src/history.js`, `src/replies.js`, the Recap Command, `scripts/register.js`, `scripts/seed.js` (posts the sample chat via webhook).
  Verify (mechanical): Bot logs in with the Message Content intent, `npm run register` succeeds, `npm run seed` posts the sample chat, and `/previously` returns an embed whose links open real messages.
  Learner check: In the test server, type `/previously` and click a couple of the links.
  Commit: `Previously command in Discord`

- [x] **3. Reruns for repeat questions**
  Becomes usable: Posting a question the channel already answered gets a "📺 Rerun!" reply with the link to the old answer and a times asked count. New questions get nothing.
  Why now: Second half of the kernel, built on the same History Reader.
  PRD ref: `prd.md > Features and Behavior > Reruns`
  Spec ref: `spec.md > Question Spotter`, `spec.md > Rerun Matcher`, `spec.md > Rerun Cooldown`, `spec.md > Grounding Check`
  Build: `src/questions.js` with tests, `src/reruns.js`, wire the message listener in `src/index.js`.
  Verify (mechanical): `npm test` passes for the question spotter; a matcher check script confirms "wen airdrop", "when is the airdrop" and "airdrop date??" match the earlier airdrop question and "how do I stake" does not; in Discord, a repeat question gets a rerun with a working link and a new question gets none.
  Learner check: In the test server, ask "wen airdrop??" and then a question nobody asked before.
  Commit: `Reruns for repeat questions`

- [x] **4. Honest edge cases**
  Becomes usable: Quiet channel, too much history, missing permission and Claude failures all show clear messages instead of silence or a fake recap; nobody gets rerun twice in 10 minutes; README explains setup.
  Why now: The demo is solid once the happy path works; these keep it from embarrassing anyone on camera.
  PRD ref: `prd.md > States and Boundaries`
  Spec ref: `spec.md > Important Failure Modes`, `spec.md > Rerun Cooldown`, `spec.md > Where It Runs and How Someone Tries It`
  Build: State messages in the Recap Command, cooldown in reruns, startup warning for the intent, README and `.env.example`.
  Verify (mechanical): Tests cover the cooldown; `/previously` in an empty channel shows the quiet episode message; with a fake bad API key the recap shows the failure message.
  Learner check: Try `/previously` in an empty channel and ask the same repeat question twice.
  Commit: `Edge cases and README`

## Hands-on Checkpoints

- [ ] Early usable behavior explored: after slice 2, `/previously` in the test server
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete: feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete: guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed: offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- Slice 2's commit already wires the rerun listener in `src/index.js`, so it only runs together with slice 3's files. Both were verified the same session (live recap path on #bot-test, 7/7 rerun checks), so they were committed back to back.
- Identical questions are grouped before matching: the sample chat repeats filler questions so often that the 40 most recent questions pushed the real airdrop question out of the window.
- Prompt caching added to both Claude calls (chat and earlier questions are cached, the instruction or new question comes after), plus cost logging that counts cache writes and reads.
