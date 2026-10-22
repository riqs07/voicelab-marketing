"use client";
// The site's bounce: springy buttons, and sections that hop into place as they scroll into view.
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const MotionLink = motion.create(Link);

// A soft spring with a little overshoot
export const SPRING = { type: "spring", stiffness: 380, damping: 16 } as const;

type ButtonProps = { href: string; children: ReactNode; variant?: "primary" | "quiet" | "light"; className?: string };

const LOOKS = {
  primary: "bg-accent text-white shadow-[0_6px_0_#1f4029] hover:bg-accent-dark",
  quiet: "border-2 border-line bg-transparent text-ink hover:border-accent",
  light: "bg-white text-ink shadow-[0_6px_0_#c9d0ca]",
};

// A link styled as a button that squashes when pressed and bounces on hover
export function BouncyLink({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const still = useReducedMotion();
  return (
    <MotionLink
      href={href}
      whileHover={still ? undefined : { scale: 1.05, rotate: -1 }}
      whileTap={still ? undefined : { scale: 0.94, y: 3 }}
      transition={SPRING}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-lg font-bold no-underline ${LOOKS[variant]} ${className}`}
    >
      {children}
    </MotionLink>
  );
}

// Content that hops up into place the first time it scrolls into view
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const still = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={still ? false : { opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...SPRING, stiffness: 220, delay }}
    >
      {children}
    </motion.div>
  );
}

// A headline whose words drop in one after another with a bounce
export function BounceWords({ text, className = "" }: { text: string; className?: string }) {
  const still = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}${index}`}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={still ? false : { opacity: 0, y: -40, rotate: index % 2 ? 6 : -6 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ ...SPRING, stiffness: 260, damping: 11, delay: 0.15 + index * 0.08 }}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
