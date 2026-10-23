// /social: the Instagram post queue, for checking a branch's preview before merging it.
// Merging into main is the approval: the live site posts each one on its date. Hidden on the live site.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import queueFile from "@/data/socialQueue.json";
import type { Post, Queue } from "@/lib/social/queue";

export const metadata: Metadata = { title: "Post queue · VoiceLab", robots: { index: false, follow: false } };

const queue = queueFile as Queue;

function nice(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

function Media({ post }: { post: Post }) {
  if (post.kind === "reel")
    return (
      <video controls preload="metadata" poster={post.cover ? `/${post.cover}` : undefined} className="aspect-[9/16] w-48 shrink-0 rounded-2xl bg-ink object-cover">
        <source src={`/${post.video}`} type="video/mp4" />
      </video>
    );
  return (
    <div className="flex snap-x gap-2 overflow-x-auto pb-1">
      {post.images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- a plain preview of the exact file Instagram gets
        <img key={src} src={`/${src}`} alt={`Slide ${i + 1}`} className="aspect-[4/5] w-48 shrink-0 snap-start rounded-2xl object-cover" />
      ))}
    </div>
  );
}

export default function SocialQueuePage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  const posts = [...queue.posts].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-8 lg:pt-12">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-serif text-5xl font-semibold">Post queue</h1>
        <p className="m-0 text-lg text-muted">
          These go to Instagram once a day, on their date ({queue.timeZone.replace("_", " ")} time). Merging this branch approves them. Change a date or caption in{" "}
          <code>src/data/socialQueue.json</code>.
        </p>
      </div>
      {posts.map((post) => (
        <section key={post.id} className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="m-0 font-serif text-2xl font-semibold">{nice(post.date)}</h2>
            <span className="text-sm font-bold text-muted">{post.kind === "reel" ? "Reel" : `Carousel · ${post.images.length} slides`}</span>
          </div>
          <Media post={post} />
          <p className="m-0 whitespace-pre-line leading-relaxed">{post.caption}</p>
        </section>
      ))}
    </article>
  );
}
