import type { Milestone } from "./types";

export interface BadgeInfo {
  title: string;
  emoji: string;
  color: string;
  ribbon: string;
}

export const BADGES: Record<Milestone, BadgeInfo> = {
  1: { title: "First Star", emoji: "⭐", color: "#FFB703", ribbon: "#FB8500" },
  7: { title: "Week Wonder", emoji: "🏅", color: "#FF7A45", ribbon: "#E63973" },
  14: { title: "Two-Week Rocket", emoji: "🚀", color: "#8B5CF6", ribbon: "#6D28D9" },
  21: { title: "Rainbow Champ", emoji: "🌈", color: "#3A86FF", ribbon: "#1D4ED8" },
  30: { title: "Super Star", emoji: "👑", color: "#E63973", ribbon: "#9D174D" },
};

const NUMBER_WORDS: Record<Milestone, string> = {
  1: "One",
  7: "Seven",
  14: "Fourteen",
  21: "Twenty-one",
  30: "Thirty",
};

/** What the mascot says when an award is earned. Always upbeat. */
export function awardSpeech(milestone: Milestone, name: string, reward: string): string {
  if (milestone === 1) {
    return reward
      ? `You started your streak! First star award! Your reward is ${reward}!`
      : "You started your streak! First star award!";
  }
  const lead = `Wow, ${name}! ${NUMBER_WORDS[milestone]} days in a row! You earned the ${BADGES[milestone].title} award!`;
  return reward ? `${lead} Your reward is ${reward}!` : lead;
}
