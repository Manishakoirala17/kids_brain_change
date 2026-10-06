import type { Metadata } from "next";
import { AwardsScreen } from "@/components/AwardsScreen";

export const metadata: Metadata = { title: "My Awards · Star Streak" };

export default function AwardsPage() {
  return <AwardsScreen />;
}
