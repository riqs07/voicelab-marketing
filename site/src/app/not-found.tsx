// A missing page: the blob, puzzled ("hmm"), never ashamed
import { BouncyLink } from "@/components/Bouncy";
import { Blob } from "@/components/Characters";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-20 text-center">
      <Blob size={160} face="puzzled" />
      <h1 className="m-0 font-serif text-5xl font-semibold">Hmm.</h1>
      <p className="m-0 text-lg text-muted">
        This page isn’t here. Maybe it paused for a little too long.
      </p>
      <BouncyLink href="/">Back to the start</BouncyLink>
    </section>
  );
}
