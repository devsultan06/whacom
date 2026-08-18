# Qora Design Directions

## Approach 1 — The Commerce Ledger

**Very Brief Intro:** A warm, editorial commerce experience that pairs deep emerald with paper-like neutrals and ledger-inspired structure. It makes merchant operations feel tangible, ordered, and premium.

**Probability:** 0.07

## Approach 2 — The Market Signal

**Very Brief Intro:** A high-contrast, product-led visual system where real commerce signals—orders, payments, stock, and sales—flow across asymmetric compositions. It feels entrepreneurial, energetic, and quietly technical rather than futuristic.

**Probability:** 0.04

## Approach 3 — Modern Lagos Studio

**Very Brief Intro:** A sunny, human-centred approach with authentic small-business photography, polished typography, and restrained cash-yellow details. It puts merchant momentum at the centre without leaning on stereotypical visual cues.

**Probability:** 0.08

## Chosen Direction — The Market Signal

### Design Movement

Qora follows **contemporary editorial fintech**: strong type, deliberate whitespace, large product surfaces, and a sense of collected operational intelligence. The visual character takes cues from thoughtful commerce tools rather than generic SaaS dashboards.

### Core Principles

1. **Signals over decoration:** Every visual element should depict a useful business event—an order, payment, product, customer, or insight.
2. **One confident accent:** Deep emerald focuses attention and communicates financial calm; the rest of the system remains warm, neutral, and legible.
3. **Structured asymmetry:** Product screens shift across page planes instead of sitting in repetitive centred card grids.
4. **Tactile calm:** Hairline borders, paper-white surfaces, subtle grain, and muted shadows make digital commerce feel trustworthy and human.

### Color Philosophy

The canvas is a warm off-white to make the experience feel closer to a well-run shop than a sterile software portal. Ink-black provides serious editorial contrast. **Qora Emerald (#0C6B48)** is used deliberately for decisive actions, important figures, active navigation, and the visual thread between WhatsApp activity and commerce outcomes. Leaf green and a small amount of cash-yellow are reserved for successful events and attention moments.

### Layout Paradigm

The landing page is a **signal ribbon**: narrative text is placed on one plane while operative product surfaces overlap and enter from the opposite plane. Long horizontal rules, metadata chips, and step indices create continuity. The dashboard uses a compact sidebar and dense-but-breathable workbench layout; mobile reshapes into a purpose-built tab bar and horizontal metrics rail.

### Signature Elements

1. **Signal line:** a fine emerald route line with numbered points that connects conversion stages and recurring page moments.
2. **Tally stripe:** subtle vertical measurement ticks and operational timestamps to give surfaces a ledger-like rhythm.
3. **Corner labels:** small uppercase module labels anchored at the edge of important panels.

### Interaction Philosophy

Interactions should feel like confirming a business action: direct, brief, and grounded. Buttons compress slightly on press, data cards lift minimally on hover, and product routes have clear visual destinations. Navigation supports escape routes between marketing, dashboard, and storefront views.

### Animation

Use 180–280ms transform and opacity transitions with a crisp ease-out. The hero message, payment, and dashboard stack floats at different tiny offsets; charts draw in once as they enter the view; cards slide 10–16px only. Motion is disabled under `prefers-reduced-motion` and never interrupts reading or high-frequency controls.

### Typography System

**Manrope** is the primary workhorse for product UI, with heavy 700–800 weights for display headlines and 500–600 for data. **DM Mono** marks money movement, timestamps, table metadata, and small labels. Landing headlines use tight tracking and editorial line breaks; dashboard labels remain compact, sentence-cased, and quickly scannable.

### Brand Essence

**Qora is the commerce operating system that turns WhatsApp sales into a business you can run and understand.**

Personality: **assured, practical, magnetic**.

### Brand Voice

Qora speaks in short, tangible sentences. Headlines describe outcomes; CTAs name the merchant’s next action. It avoids inflated technology claims and empty inspiration.

> “Know what sold. Know what you made.”

> “A payment arrived. Your business already moved.”

### Wordmark & Logo

The Qora mark is a bold rounded **Q** formed from an open commerce loop, with a small square “receipt” notch cut from its tail. It is used as a recognisable symbol first and paired with a custom-spaced wordmark in Manrope ExtraBold.

### Signature Brand Color

**Qora Emerald — #0C6B48**

## Style Decisions

- Product imagery must demonstrate an actual Qora commerce moment; never use image-only decoration.
- Headlines are left-aligned inside asymmetric sections. Centred content is reserved for final conversion moments only.
- Dashboard density is intentional: hierarchy comes from scale, whitespace, and linework rather than colorful panels.
- Every route carries at least one Qora signal motif: a signal line, tally stripe, corner label, timestamp, or numbered commerce stage.
- The dashboard is a live merchant workbench before it is an analytics dashboard: orders, payments, stock, customers, and insights should read as connected events.
- Merchant storefronts retain visible Qora commerce signals—fresh inventory, payment readiness, share context, or powered-by operational metadata—without diluting the merchant’s own retail mood.
