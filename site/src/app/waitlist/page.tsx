import type { Metadata } from "next";
import { WaitlistBody } from "./WaitlistBody";

export const metadata: Metadata = { title: "Join the waitlist · VoiceLab" };

export default function WaitlistPage() {
  return <WaitlistBody />;
}
