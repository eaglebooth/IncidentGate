# IncidentGate visual system

## Source asset reading

The supplied logo uses a near-black field, a bright mint architectural gate, and a white door. The product interface extends those cues into a cinematic control-room system without copying Agent Tank layout or components.

The revised compact asset removes the embedded wordmark, making the gate/door symbol legible at 38–44 px. The interface renders the wordmark as live text: `Incident` in white and `Gate` in mint, preserving crisp typography at every density.

## Tokens

- Void: `#050807`
- Raised panel: `#0B100E`
- Mint signal: `#3DF4B1`
- Mint highlight: `#9AFFDA`
- Primary text: `#F5F7F4`
- Muted text: `#8E9B96`
- Block signal: `#FF695E`
- Hairline: `#25312D`

## Typography and motion

- Display/body: Manrope, tight editorial display tracking.
- Operational metadata: DM Mono, uppercase, wide tracking.
- First impression: staggered editorial reveal followed by a scanning gate animation.
- Motion communicates inspection and authorization; reduced-motion users receive static content.

## Layout

- Generous hero with an original CSS gate sculpture.
- Linear proof strip makes trust properties visible above the fold.
- Four-step signal path explains the product before the transaction console.
- Console is dense and technical; the rest of the page remains spacious.
- One document scrollbar only; no nested scroll containers.

## Moving trust rails

The two supplied references reinforce a low-profile operational ticker: one-pixel green-gray borders, uppercase monospaced labels, mint checkmarks, and generous horizontal spacing. Both proof rails therefore use a seamless leftward marquee, pause on hover, clip at their own boundary, and collapse to a static wrapped list when reduced motion is requested.
