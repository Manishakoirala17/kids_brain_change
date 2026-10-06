import type { Metadata } from "next";
import { ParentScreen } from "@/components/ParentScreen";

export const metadata: Metadata = { title: "Parent corner · Star Streak" };

export default function ParentPage() {
  return <ParentScreen />;
}
