To install dependencies:
```sh
bun install
```

To run the development server and rebuild browser assets:
```sh
bun run dev
```

Open http://localhost:3000

To type-check and build the client assets:
```sh
bun run typecheck
bun run build
```

Available pages:

- `/`
- `/timetable`
- `/speakers`
- `/access`
- `/faq`
- `/sessions/:id`
- `/speakers/:id`

## Docker and Cloudflare Tunnel

The production container serves the Hono app on port `3000`. `cloudflared` runs as a separate Compose service and connects to the `web` service through the internal Docker network.

Copy `.env.example` to `.env`, set the dashboard-managed Cloudflare Tunnel token, and configure the public hostname origin as `http://web:3000` in Cloudflare Zero Trust.

```sh
cp .env.example .env
docker compose up -d --build
```

Do not commit `.env` or the tunnel token.

## Speaker images and OGP

Place speaker assets under `public/images/`, then edit the matching speaker in `src/data/speakers.ts`:

```ts
{
  id: 'macchatee',
  // ...
  icon: '/images/speakers/macchatee.webp',
  ogpImage: '/images/ogp/speakers/macchatee.png',
}
```

`icon` is used in speaker cards and detail pages. `ogpImage` is used as the `og:image` and Twitter image for `/speakers/:id`. Paths are relative to `public/`, so rebuilding the site after editing the data automatically includes the new assets.

Pages without a page-specific OGP use `public/assets/ogp.jpg` via `event.defaultOgpImage`. The top page continues to use the generated speaker-based OGP at `public/ogp/event.png`.

The event top page OGP is generated from the same 1200x630 visual system as the speaker OGP generator. The selected speaker images are placed in the icon cards and the main speaker image. Change `event.ogpSpeakerIds` in `src/data/event.ts` to change the composition, then run `bun run generate:ogp` or `bun run build`.
