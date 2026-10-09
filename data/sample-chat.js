// SAMPLE DATA. A made up community ("Nodeverse") so the demo has a story to recap.
// Nothing here is a real project, person or link.

const STORY = [
  ["kasia_mod", "gm everyone ☀️ big day today, keep an eye on #announcements"],
  ["newbie_ollie", "hi all, just joined. When does the airdrop start?"],
  ["kasia_mod", "Welcome Ollie! Airdrop snapshot is 31 Oct, claims open 7 Nov in the app. We will never DM you about it.", { replyTo: 1 }],
  ["daveyboi", "lads I think I lost my seed phrase again"],
  ["lina.eth", "dave this is the third time this month 💀"],
  ["daveyboi", "it was on a post it note. the post it note is gone"],
  ["tom_mod", "Dave please don't post anything about your wallet here. DM nobody. Check the recovery guide in #guides."],
  ["hotdog_hater", "unrelated but a hot dog is NOT a sandwich and I will die on this hill"],
  ["ser_pump", "it's literally bread with meat in it. sandwich."],
  ["hotdog_hater", "one piece of bread. ONE. that's a taco at best"],
  ["quietkate", "how do I stake my tokens?"],
  ["tom_mod", "Staking guide is pinned in #guides. Open the app, Wallet, Stake, pick a node. Takes about 2 minutes.", { replyTo: 10 }],
  ["SupportTeam_Officiall", "Hello! Wallet sync issue detected on your account. Verify here to avoid losing funds: nodeverse-support-verify.example"],
  ["lina.eth", "that's a scam, two L's in Official 🚩"],
  ["kasia_mod", "Banned. Reminder: staff will never DM you first or ask you to verify a wallet. Report anyone who does."],
  ["kasia_mod", "📢 Testnet goes live Thursday 16 Oct at 15:00 UTC. Node runners, update to v2.3 before then. Full notes in #announcements."],
  ["mr_fomo", "wait so testnet thursday means price go up?"],
  ["tom_mod", "Testnet is for testing, not a price event. Please keep price talk in #trading."],
  ["ser_pump", "wen airdrop"],
  ["lina.eth", "ser it was literally answered like an hour ago"],
  ["hotdog_hater", "poll: is a hot dog a sandwich. 🌭 = yes, 🥪 = no"],
  ["ser_pump", "🌭🌭🌭"],
  ["quietkate", "🥪 obviously"],
  ["daveyboi", "update: found the post it note. it was in my wallet. the physical one"],
  ["lina.eth", "the irony 😂"],
  ["mr_fomo", "do I need to update my node before thursday?"],
  ["tom_mod", "Yes, v2.3 is required for testnet. Old versions won't connect. Download link is in #announcements.", { replyTo: 25 }],
  ["kasia_mod", "Community call moved to Friday 17 Oct, 18:00 UTC because of the testnet launch. Same Discord stage."],
  ["hotdog_hater", "final poll result: 41 sandwich, 44 not sandwich. democracy has spoken"],
  ["ser_pump", "rigged"],
  ["quietkate", "thanks for the staking help Tom, it worked"],
  ["mr_fomo", "airdrop date??"],
  ["lina.eth", "pinned in this channel AND in announcements mate 🙃"],
];

const FILLER = [
  ["ser_pump", "gm"], ["lina.eth", "gm gm"], ["mr_fomo", "anyone else up"], ["quietkate", "morning"],
  ["hotdog_hater", "what are we doing today"], ["daveyboi", "gn lads"], ["ser_pump", "lfg"],
  ["lina.eth", "the new app update is clean ngl"], ["mr_fomo", "is the dashboard down for anyone else"],
  ["quietkate", "works for me"], ["hotdog_hater", "coffee number three"], ["ser_pump", "who's watching the match later"],
  ["daveyboi", "my cat just walked across my keyboard sorry if I sent anything weird"], ["lina.eth", "lol"],
  ["mr_fomo", "bullish"], ["quietkate", "does anyone know a good guide for node setup"], ["hotdog_hater", "brb"],
  ["ser_pump", "this chat is wild today"], ["lina.eth", "fr"], ["mr_fomo", "😂😂"],
];

// Spread the story over the last 30 hours with filler chat in between.
function build() {
  const out = [];
  const now = Date.UTC(2026, 9, 14, 12, 0, 0); // fixed so the sample is repeatable
  const start = now - 30 * 60 * 60 * 1000;
  let f = 0;
  STORY.forEach(([author, text, extra], i) => {
    out.push({ author, text, storyIndex: i, replyToStory: extra?.replyTo });
    const fillerCount = 3 + (i % 4);
    for (let k = 0; k < fillerCount; k++) {
      const [fa, ft] = FILLER[f++ % FILLER.length];
      out.push({ author: fa, text: ft });
    }
  });
  const step = (now - start) / out.length;
  const storyIdToMsgId = {};
  out.forEach((m, n) => {
    m.id = `m${String(n + 1).padStart(3, "0")}`;
    m.time = new Date(start + n * step).toISOString();
    m.isBot = false;
    if (m.storyIndex !== undefined) storyIdToMsgId[m.storyIndex] = m.id;
  });
  for (const m of out) {
    m.replyTo = m.replyToStory !== undefined ? storyIdToMsgId[m.replyToStory] : null;
    delete m.replyToStory;
    delete m.storyIndex;
  }
  return out;
}

export const SAMPLE_CHANNEL = "general";
export const SAMPLE_MESSAGES = build();
