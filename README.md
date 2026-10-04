# Oracle Grove

A painted, animated storybook for thinking through an everyday choice. Quill offers practical perspective, Ember considers risks, and Willow reflects on values. The final choice always belongs to the reader.

## Experience

The book drops into the winter grove, opens to a welcome spread, and turns through a question, three perspectives, glowing roots, and a downloadable keepsake. Original supplied artwork and the eight-second winter loop are reused. A fully narrated sample works without API credits.

## Run locally

Requires Node.js 22.13 or later.

1. Run `npm run install:ci`.
2. Copy `.env.example` to `.env.local` and add your keys locally.
3. Run `node --env-file=.env.local scripts/run-framework.mjs dev`.
4. Open the localhost URL printed by the server.

In the original development checkout, Gemini and ElevenLabs are in separate ignored files. Start that checkout with `node --env-file=.env.gemini.local --env-file=.env.elevenlabs.local scripts/run-framework.mjs dev`.

## Services

- `POST /api/council`: validates the question and two options, checks safety, requests one structured Gemini response with all three perspectives, and signs short-lived narration tickets.
- `POST /api/voice`: accepts a signed ticket and generates ElevenLabs speech. Raw arbitrary text is not accepted by this endpoint.
- Quill: George. Ember: Callum. Willow: Lily. Voice IDs can be overridden through environment variables.
- Generated speech is cached in browser memory for the current story. Questions are not persisted by this app. Google Gemini receives the question/options; ElevenLabs receives advice text when narration is requested. Provider retention policies still apply.

The three perspectives come from one AI; agreement is not independent evidence or a prediction. The app is for reflection and does not provide professional or crisis care. A safety response replaces the council for concerning inputs.

## Configuration and deployment

Keep credentials in ignored local environment files or hosted secret storage. Never place them in client code or commit them. Configure the same secret names in Sites before deployment. The supplied Sites manifest identifies this project's private hosting target; production builds use the bundled Sites workflow and Cloudflare Workers.

`GEMINI_MODEL` defaults to `gemini-2.5-flash`. Safety blocks are handled without presenting generated advice; structured responses are validated before display. The sample story is explicitly labeled.

## Checks

- `node node_modules/typescript/bin/tsc --noEmit`
- `npm run build`
- Test the sample from welcome through keepsake, narration, mobile layout, invalid/duplicate options, and the safety route.

Narration generation for the sample: `node --env-file=.env.local scripts/generate-sample-audio.mjs`. Existing files are skipped.

## Operational limits

Request limits are best-effort per running server instance (six advice requests and 24 voice requests per ten minutes per IP). Before a public launch, add durable rate limiting and provider spending limits. New sites are private by default. No database or user account system is required for the current experience.

The browser tool `stage_grove_question` fills the visible form only. It does not submit a question or call paid services.
