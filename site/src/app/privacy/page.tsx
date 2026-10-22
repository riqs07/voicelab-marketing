import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy · VoiceLab" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-10 pt-6 text-lg leading-relaxed sm:px-8 lg:pt-12">
      <h1 className="m-0 font-serif text-5xl font-semibold">Privacy</h1>
      <p className="m-0">This page covers the VoiceLab website. We keep it short because we collect very little.</p>
      <h2 className="mb-0 mt-4 font-serif text-2xl font-semibold">The waitlist</h2>
      <p className="m-0">
        When you join, we keep your email and anything you picked (what you want to get better at, your phone). It’s stored with our email provider, Buttondown, and used only to tell you about VoiceLab. Every email has an unsubscribe link, and you can ask us to delete your details at any time.
      </p>
      <h2 className="mb-0 mt-4 font-serif text-2xl font-semibold">The free Rapid Fire</h2>
      <p className="m-0">
        Your voice is measured inside the page, on your device: pitch, loudness and pauses. The recording is kept only in the page’s memory so you can play it back, and is never uploaded to us. Your browser’s own speech recognition turns your words into text; depending on your browser, that’s done by Apple or Google under their terms. Everything is gone when you leave the page.
      </p>
      <h2 className="mb-0 mt-4 font-serif text-2xl font-semibold">Everything else</h2>
      <p className="m-0">No ads, no tracking cookies, and we don’t sell anything to anyone.</p>
      <h2 className="mb-0 mt-4 font-serif text-2xl font-semibold">Contact</h2>
      <p className="m-0">[Your contact email]</p>
    </article>
  );
}
