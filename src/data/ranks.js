export const RANKS = [
  { title: 'Rookie', minXp: 0 },
  { title: 'Analyst', minXp: 150 },
  { title: 'Specialist', minXp: 400 },
  { title: 'Senior Analyst', minXp: 700 },
  { title: 'Elite Commander', minXp: 1000 },
];

export function getRankForXp(xp) {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) current = rank;
  }
  return current;
}

export function getNextRank(xp) {
  return RANKS.find((rank) => rank.minXp > xp) || null;
}
