// The site's own address: SITE_URL if set, else the Vercel production address, else local.
// Used for social preview images and for the media links Instagram downloads.
export function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
