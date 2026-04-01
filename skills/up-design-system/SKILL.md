---
name: up-design-system
description: "Design System Research, Creator and Generator skill for the Object-Oriented Unified Process. Positioned after Interface Design (the last Construction activity), this skill uses specialized MCP tools (shadcn, radix, flyonui) and internet research to survey the current design system landscape, select the most appropriate visual technology stack for the project, and GENERATE the complete visual specification and source code for the application's interface. Detects aesthetic preferences passively throughout the UP process. Covers: design system survey, aesthetic preference detection, visual token definition (colors, typography, spacing), component mapping from interface-design specs, and code generation using live MCP tools (shadcn_*, radix_*, flyonui_*)."
---

# Skill: up-design-system — Design System Research, Creator & Generator

## Objective

You are the **UP VISUAL ARCHITECT**. Your role is to execute three interconnected phases:

1. **RESEARCH** — Survey the current design system and UI technology landscape using specialized MCP tools and internet search
2. **SELECT** — Choose the most appropriate design system based on the project's tech stack, target audience, aesthetic requirements, and accessibility constraints
3. **GENERATE** — Produce the complete visual specification AND working source code for every screen defined in `08-interface-design.md`, using the design system's MCP tools to generate real, production-quality components

> **Key principle:** Functional correctness without visual excellence produces systems that work but are not adopted. The goal is to produce interfaces that are correct, beautiful, accessible, and that users actually want to use.

> **Primary tools:** `shadcn_*`, `radix_mcp_server_*`, and `flyonui_*` MCP tools — these generate real source code, not abstractions.

---

## Why This Activity Happens Here (After Interface Design, Last in Construction)

| Available at this point | What it enables |
|---|---|
| `08-interface-design.md` | Complete screen inventory, navigation flows, form specs, listing columns — ready for component mapping |
| `11-tech-stack.md` | Frontend framework chosen → determines which design systems are compatible |
| `02-requirements.md` | Accessibility NFRs (WCAG level), performance constraints, usability requirements |
| `07-dcp.md` | Domain model → determines data display patterns (tables, cards, forms) |
| `12-design-patterns.md` | Architectural patterns → informs component composition strategy |
| `10-tdd-plan.md` | Frontend test tools chosen → code generation must match test framework |

> **Why after interface design?** The interface design produces technology-agnostic screens. The design system step TRANSFORMS those agnostic specs into actual, runnable visual code. You need the complete screen inventory before you can generate components for each one.

---

## Step 0: 5W2H Analysis for Design System (Mandatory)

### 1. WHAT — What visual quality standards will make end users perceive this system as worth using — and have those standards been explicitly defined anywhere in the requirements?
> Beyond WCAG compliance and performance budgets, every successful interface has an aesthetic coherence that communicates trustworthiness and intentionality. Identify what that coherence looks like for THIS system's domain and user base. "Modern" for a healthcare dashboard is not the same as "modern" for a Gen Z consumer app. If visual quality standards have never been explicitly stated, make them explicit before choosing a design system.

### 2. WHY — Why would choosing the technically correct design system for the stack still produce a visually mediocre application if aesthetic preferences and user segment expectations are not researched first?
> Design systems encode visual opinions as code. Choosing Shadcn/UI with a default configuration for a luxury e-commerce platform produces the same visual output as choosing it for an internal admin tool — which is to say, a neutral, professional aesthetic that may be exactly wrong for one of those contexts. Understand what emotional response the application should provoke in its users before selecting the design system that will encode that response.

### 3. WHO — Who are the actual end users in terms of their visual expectations — enterprise professionals expecting density, consumers expecting warmth, or technical users expecting control?
> Survey the actors from `02-use-case-list.md`. For each actor type, identify their visual environment (what other software they use daily), their cognitive load tolerance (experts vs. novices), their device context (desktop-primary vs. mobile-primary), and their aesthetic expectations. These user profiles drive design system selection more reliably than framework compatibility charts.

### 4. WHEN — When will the generated component code become a maintenance liability rather than an asset?
> Code generation creates strong coupling to the chosen design system version. Identify: what is the design system's release cadence, how breaking are major version changes, and what is the migration cost when the system evolves? A design system that generates beautiful code today but requires a full rewrite every 18 months is more expensive than a simpler alternative with stable APIs.

### 5. WHERE — Where in the visual hierarchy will the design system boundary be most visible — and which layers (component library, design tokens, CSS architecture, animation system) genuinely matter for this system?
> Not every system needs a motion design system. Not every system needs a full token architecture. Identify which visual layers actually affect user experience for this specific system. A data-intensive admin dashboard needs powerful table and filter components. A consumer app needs polished illustrations and micro-animations. Align the design system depth to the genuine complexity of the interface.

### 6. HOW — How will the agent detect unstated aesthetic preferences from the requester's language, domain references, and product context — and translate those signals into design system constraints?
> Aesthetic preferences are rarely stated explicitly but are always present. A requester who says "we need something like Linear.app" has communicated a full visual vocabulary. A requester who says "healthcare system for elderly patients" has communicated accessibility requirements, font size preferences, color contrast needs, and cognitive load tolerance — none of which they stated directly. Scan ALL previous UP artifacts and conversation history for aesthetic signals.

### 7. HOW MUCH — How much code generation is appropriate at this stage — full production-ready components, styled scaffolds, or specification-grade templates?
> The output should be "developer-ready, not developer-finished": complete enough to run immediately and demonstrate the visual direction, specific enough that developers can extend rather than rewrite. For each screen, generate the complete component with real data bindings from the DCD, correct accessibility attributes from the WCAG requirement, and the specific design tokens from the chosen system.

> **Output:** Save 5W2H to `docs/up/5w2h/5W2H-design-system.md`.

---

## Step 1: Aesthetic Preference Detection

Scan ALL prior UP artifacts and conversation history for visual preference signals:

```
DOMAIN SIGNALS (from 01-vision.md):
  → "Healthcare system" → calm, trustworthy, WCAG AA mandatory, large touch targets
  → "E-commerce" → conversion-optimized, product-first, CTA hierarchy critical
  → "Enterprise dashboard" → data density, dark mode often preferred, keyboard nav
  → "Consumer social app" → playful, animated, mobile-first, emotional engagement
  → "Internal tool" → functional over beautiful, but still professional

EXPLICIT SIGNALS (from any artifact or conversation):
  → Competitor/inspiration mentions ("like Stripe Docs", "similar to Notion")
  → Color or brand mentions ("our brand is blue", "avoid red")
  → User base mentions ("used by medical professionals", "teenagers")
  → Device mentions ("must work on tablets", "mobile-first")

NFR SIGNALS (from 02-requirements.md):
  → WCAG AA/AAA → strict accessibility constraints
  → Performance budget → limits on CSS frameworks and icon libraries
  → Internationalization → RTL support, font compatibility

TECH STACK SIGNALS (from 11-tech-stack.md):
  → React/Vue/Angular/Svelte → determines compatible component libraries
  → TypeScript → type-safe component APIs preferred
  → SSR/SSG → server component compatibility required
```

Document detected signals before proceeding to research.

---

## Step 2: Research Tool Discovery

```
PRIORITY ORDER (specialized MCP tools first):

1. shadcn_list_items_in_registries()  — List all available shadcn components
2. shadcn_search_items_in_registries() — Search components by name/description
3. shadcn_view_items_in_registries()  — View component code and details
4. shadcn_get_item_examples_from_registries() — Get usage examples with full code
5. shadcn_get_add_command_for_items() — Get CLI install commands

6. radix_mcp_server_themes_list_components()      — List Radix Themes components
7. radix_mcp_server_themes_get_component_source() — Get Radix component source
8. radix_mcp_server_themes_get_component_documentation() — Get Radix docs
9. radix_mcp_server_themes_get_getting_started() — Radix getting started guide
10. radix_mcp_server_primitives_list_components() — List Radix primitives
11. radix_mcp_server_colors_list_scales()         — List Radix color scales
12. radix_mcp_server_colors_get_scale()           — Get specific color scale

13. flyonui_get-blocks-metadata()   — Get FlyonUI block catalog
14. flyonui_get-block-meta-content() — Get block metadata details
15. flyonui_get-block-content()     — Get ACTUAL FlyonUI block source code

16. /skill:brave-search  — Internet: current design system landscape
17. /skill:web-search    — Internet: alternatives and comparisons
18. /skill:context7      — Library-specific: component docs, APIs
19. /skill:web-fetch     — Specific: design system websites, showcase pages
```

---

## Step 3: Design System Research

### Phase A: Market Survey (Internet Research)

```
QUERY 1 (current landscape):
  "best design systems [frontend framework from stack] [YEAR] comparison"
  → What's the current consensus on the best options?

QUERY 2 (by aesthetic profile):
  "[aesthetic profile detected in Step 1] UI component library [YEAR]"
  → Tailored to the detected visual style

QUERY 3 (by domain):
  "[domain] UI design system [YEAR] examples best practices"
  → Domain-specific visual best practices

QUERY 4 (accessibility):
  "accessible component library WCAG [required level] [framework] [YEAR]"
  → Validate WCAG compliance of candidates

QUERY 5 (performance):
  "[candidate library] bundle size CSS performance [YEAR]"
  → Performance impact assessment

QUERY 6 (trend):
  "design system trends [YEAR] UI component library popularity"
  → State of JS, npm downloads, GitHub stars
```

### Phase B: MCP Catalog Exploration

Execute the following to inventory available components in each system:

```typescript
// Shadcn/UI catalog:
shadcn_list_items_in_registries({ registries: ['@shadcn'] })

// Search for specific component types needed:
shadcn_search_items_in_registries({
  registries: ['@shadcn'],
  query: "[component type from interface-design, e.g., 'data table', 'form', 'navigation']"
})

// FlyonUI blocks:
flyonui_get-blocks-metadata()

// Radix themes components:
radix_mcp_server_themes_list_components()

// Radix color scales:
radix_mcp_server_colors_list_scales()
```

### Phase C: Component Coverage Analysis

For each major interface element in `08-interface-design.md`, verify coverage:

| Interface Element | Shadcn/UI | Radix Themes | FlyonUI | Other |
|---|---|---|---|---|
| Navigation/Sidebar | ? | ? | ? | ? |
| Data Table | ? | ? | ? | ? |
| Forms (Entry Units) | ? | ? | ? | ? |
| Modals/Dialogs | ? | ? | ? | ? |
| Notifications/Alerts | ? | ? | ? | ? |
| Charts/Data Viz | ? | ? | ? | ? |

> **Rule:** The selected design system must cover ≥ 90% of the interface elements in `08-interface-design.md` natively. Missing coverage must be resolved via extension or secondary library.

---

## Step 4: Design System Selection

### Selection Criteria Matrix

Evaluate each candidate design system:

| Criterion | Weight | Rationale |
|---|---|---|
| **Tech stack compatibility** | Critical | Must work with framework from `11-tech-stack.md` |
| **Aesthetic alignment** | High | Matches detected visual preferences and domain |
| **Component coverage** | High | Covers the screens defined in `08-interface-design.md` |
| **Accessibility** | High | Meets WCAG level from `02-requirements.md` |
| **Performance footprint** | Medium | Bundle size compatible with performance NFRs |
| **Type safety** | Medium | TypeScript support for type-safe component APIs |
| **Dark mode** | Medium | Required or not based on target audience |
| **Community / maintenance** | Medium | Active development, not abandonware |
| **License** | Medium | Compatible with project's commercial constraints |
| **Code generation quality** | High | MCP tools can produce real, usable code |

### Design System Options Reference

| System | Primary Stack | Aesthetic | Accessibility | MCP Available |
|---|---|---|---|---|
| Shadcn/UI | React | Modern, minimal, neutral | Excellent (Radix primitives) | ✅ `shadcn_*` |
| Radix Themes | React | Clean, opinionated | Excellent | ✅ `radix_*` |
| FlyonUI | HTML/Tailwind/Alpinejs | Modern, comprehensive | Good | ✅ `flyonui_*` |
| Tailwind UI | Any | Professional, dense | Good | Via internet |
| MUI (Material) | React | Material Design | Excellent | Via internet |
| Ant Design | React | Enterprise, data-rich | Good | Via internet |
| Chakra UI | React | Clean, accessible | Excellent | Via internet |
| DaisyUI | Any + Tailwind | Fun, colorful | Good | Via internet |
| PrimeVue/PrimeReact | Vue/React | Rich, data-intensive | Good | Via internet |

---


## Step 5: Visual Token Architecture (Creative, Not Prescriptive)

> **Philosophy:** Tokens are the DNA of the visual system — they MUST be **discovered and crafted** for THIS specific project, not copy-pasted from a generic template. The agent uses MCP tools, domain signals, and the UI/UX Directives to create a token set that is unique, coherent, and beautiful.
>
> **Anti-pattern:** DO NOT mechanically reproduce the same token values for every project. A healthcare dashboard and a consumer app should have radically different token personalities.

### How to Create Tokens (Process, Not Template)

```
DISCOVER → CURATE → COMPOSE → VALIDATE

1. DISCOVER — Use MCP tools to extract raw material:
   radix_mcp_server_colors_list_scales()     → available color scales
   radix_mcp_server_colors_get_scale({…})  → extract specific scales
   shadcn_view_items_in_registries()          → see how existing themes define tokens
   /skill:context7                          → fetch latest Tailwind/Radix token docs

2. CURATE — Select and adapt based on domain signals:
   → Domain from 01-vision.md (healthcare? fintech? social?)
   → Aesthetic preferences from Step 1 analysis
   → Directive 2 dark palette anchors (non-negotiable)
   → Directive 5 font choices (non-negotiable)
   → Brand colors if mentioned in any artifact

3. COMPOSE — Build the token architecture:
   → Layer 1: Primitives (raw values from MCP tools)
   → Layer 2: Semantic aliases (purpose-based, project-specific)
   → Layer 3: Component tokens (per component variant/state)
   → Layer 4: State patterns (behavioral, not value-based)

4. VALIDATE — WCAG contrast + visual quality gate:
   → All text/background combos pass contrast ratios
   → Dark mode palette follows Directive 2 anchors
   → Fonts follow Directive 5 approved list
   → Visual Quality Gate (Directive 6) passes
```

### Mandatory Anchors (Non-Negotiable Across All Projects)

#### Dark Mode Base Palette (Directive 2)

```
These values are FIXED — they define the dark mode personality:

  Backgrounds:  #030303 → #050505 → #0a0a0a → #111111 → #1a1a1a
                 (deepest)    (deep)      (surface)   (elevated)  (overlay)

  Borders:      rgba(255,255,255, 0.05) → 0.10 → 0.20 → 0.30
                 (subtle)               (default)     (strong)  (focus)

  Glows:        0 0 20px rgba(primary, 0.15)   — card hover
                0 0 40px rgba(primary, 0.08)   — section emphasis
                0 0 60px rgba(accent, 0.12)    — hero/CTA

RULE: Dark mode is designed FIRST. Light mode is derived from it.
```

#### Typography (Directive 5)

```
Choose ONE stack from the approved list — NEVER use rejected fonts:

  PRIMARY:   Geist Sans | Inter | Plus Jakarta Sans
  DISPLAY:   Clash Display | Cal Sans | Bricolage Grotesque
  MONO:      Geist Mono | JetBrains Mono

  REJECTED:  system-ui, Arial, Helvetica, Roboto, Open Sans, Lato

  Strategy:  Use variable fonts. Min 3 weights (400/500/600).
             Headings: bold + tight tracking. Body: regular.
             Labels: medium + wide tracking.
```

### Token Architecture (What to Generate — Not What Values to Use)

The agent must produce these files, but the VALUES inside are project-specific:

```
OUTPUT FILES:
  docs/up/13-ui-code/tokens/tokens.css    — CSS custom properties (source of truth)
  docs/up/13-ui-code/tokens/tokens.ts     — TypeScript exports
  docs/up/13-ui-code/tokens/tokens.json  — Design tool handoff (Figma)
  docs/up/13-ui-code/STYLE-GUIDE.md       — Developer usage guide
```

#### Token Structure (categories to populate — values are YOUR creative choice)

```
COLORS:
  → Brand primary scale (extract via Radix MCP — pick the right hue for THIS domain)
  → Neutral scale (slate/zinc/stone — pick based on warm/cool personality)
  → Semantic scales: error, success, warning, info
  → Alpha variants for overlays and glass effects
  → Dark mode anchors (Directive 2 — mandatory values above)

TYPOGRAPHY:
  → Font families (Directive 5 — mandatory approved list)
  → Size scale (fluid or fixed — choose based on project density needs)
  → Weight, leading, tracking tokens

SPACING:
  → Base unit (4px standard, or customize for this project's density)
  → Named layout tokens (page padding, section gap, card padding, etc.)
  → Component-specific spacing (button, input, table cell)

EFFECTS:
  → Border radius scale (match the personality: sharp? rounded? pill-heavy?)
  → Shadow/elevation layers (subtle for light themes, glow-based for dark)
  → Animation durations + easing (match Directive 4 Framer Motion specs)
  → Z-index layers (standard layering pattern)

SEMANTIC ALIASES (the layer components actually reference):
  → Background: base, subtle, muted, overlay
  → Surface: default, raised, overlay
  → Text: primary, secondary, tertiary, disabled, inverse, link
  → Interactive: default, hover, active, focus, muted
  → Borders: default, strong, subtle, focus, error
  → State colors: error/success/warning/info (bg, border, text, icon)
```

#### Component Tokens (Per Component — Values Vary by Project)

```
For each component type the system uses, define tokens for:
  → Variants (primary, secondary, ghost, destructive, outline)
  → States (default, hover, active, focus, disabled, loading)
  → Dimensions (height, padding, radius, gap)
  → Special effects (glow on hover, border animation, backdrop-blur)

Common components: Button, Input, Card, Table, Badge, Dialog, Navigation, Toast.
Component list is determined by 08-interface-design.md — NOT by a fixed template.
```

---

### State Patterns (Behavioral Specifications)

These are BEHAVIOR rules, not value prescriptions. Components must implement these patterns using the project's own tokens.

```
LOADING:
  → Skeleton animation matches the EXACT dimensions of content it replaces
  → Inline spinners for buttons, page-level overlay for navigation
  → Staggered entrance for list items (Directive 4)
  → Minimum 200ms display time (prevents flash)

EMPTY STATE:
  → Every list/table screen MUST have one
  → Title explains WHY it's empty (not just THAT it's empty)
  → "No results" ≠ "No data yet" — different illustrations and CTAs
  → Include a CTA button when there's a clear next action

ERROR STATE:
  → ALWAYS pair red text with an icon (never text alone)
  → Inline errors below fields, banner errors at section top
  → Network errors show retry action within 1 second
  → Page-level errors follow empty state layout with retry CTA

SUCCESS STATE:
  → Auto-dismiss unless user action is required
  → Confirm WHAT succeeded (not just "Done")
  → Toast: slide-in, auto-dismiss 4s

DISABLED STATE:
  → 50% opacity, not-allowed cursor, pointer-events: none
  → No hover/focus styles on disabled elements
  → aria-disabled="true" on all disabled interactives

FOCUS STATE:
  → :focus-visible on ALL interactive elements
  → outline: none is FORBIDDEN without accessible alternative
  → Focus ring: 3:1 contrast against adjacent background
  → Skip link as first focusable element on every page
```

---

### WCAG Compliance Validation (Non-Negotiable)

```
MINIMUM CONTRAST RATIOS:
  Normal text (<18pt): 4.5:1  (WCAG AA)
  Large text (≥18pt/bold ≥14pt): 3:1
  Non-text UI (icons, borders): 3:1

VALIDATE THESE COMBINATIONS (using YOUR project's tokens):
  ✓ text-primary on bg-base
  ✓ text-secondary on bg-base
  ✓ text-primary on bg-subtle
  ✓ text-inverse on interactive-default
  ✓ text-inverse on destructive-bg
  ✓ text-link on bg-base
  ✓ error-text on error-bg
  ✓ success-text on success-bg
  ✓ warning-text on warning-bg
  ✗ text-disabled on bg-base  (allowed to FAIL)
```

### Visual Quality Gate (Directive 6 — Applied After Token Generation)

```
BEFORE proceeding to component generation, verify:

  □ Do these tokens produce a 2025+ visual identity, or a 2020 template?
  □ Is there DEPTH? (layered backgrounds, glows, gradient subtlety)
  □ Is there SHINE? (border effects, highlight animations, glass blur)
  □ Is there LIFE? (animation tokens that enable Directive 4 micro-interactions)
  □ Is there PERSONALITY? (distinctive fonts, non-generic palette, intentional spacing rhythm)

If ANY answer is NO → refine the tokens before generating components.
Do NOT proceed with mediocre tokens hoping components will fix it later.
```

---
## Step 6: Component Mapping

For each interface element in `08-interface-design.md`, map to a specific component:

### Screen-by-Screen Mapping

For each screen/component defined in the interface design:

```
SCREEN: [Screen name from 08-interface-design.md]
TYPE: [Index/Menu | Data Unit | Multidata Unit | Entry Unit | Selection Unit | Operation Unit]

MCP COMPONENT LOOKUP:
  shadcn_search_items_in_registries({ query: "[component description]" })
  → Component selected: [component name]
  → MCP tool to use for generation: [shadcn_view_items_in_registries / flyonui_get-block-content]

COMPONENT DETAILS:
  shadcn_view_items_in_registries({ items: ['@shadcn/[component]'] })
  OR
  flyonui_get-block-content({ endpoint: "[block endpoint]", type: "[type]" })

DATA BINDING (from 07-dcp.md):
  → [Which class/attribute from the DCD populates this component]

ACCESSIBILITY:
  → aria-label, role, keyboard nav pattern required
```

---

## Step 7: Code Generation

### For Each Screen, Generate:

1. **Component file**: Full, functional component code using the selected design system
2. **Data binding**: Connected to the DCD class attributes
3. **Accessibility**: ARIA attributes, keyboard navigation, focus management
4. **Responsive**: Mobile breakpoints if applicable (from interface design NFRs)
5. **Theme integration**: Using the design tokens defined in Step 5

### Code Generation Workflow

```typescript
// For each major screen component:

// 1. Get the base component from MCP:
const componentCode = await shadcn_view_items_in_registries({
  items: ['@shadcn/[component-name]']
})

// 2. Get usage examples:
const examples = await shadcn_get_item_examples_from_registries({
  registries: ['@shadcn'],
  query: '[component]-demo'
})

// 3. For FlyonUI blocks:
const blockCode = await flyonui_get-block-content({
  endpoint: '[block-endpoint]',
  type: 'html'
})

// 4. For Radix:
const radixSource = await radix_mcp_server_themes_get_component_source({
  componentName: '[component-name]'
})
```

### Generated File Structure

```
docs/up/13-ui-code/
├── design-tokens.css          # CSS custom properties for all tokens
├── design-tokens.ts           # TypeScript token exports (if applicable)
├── components/                # Generated component files
│   ├── layout/
│   │   ├── Navigation.tsx     # Main navigation component
│   │   ├── Sidebar.tsx        # Sidebar (if applicable)
│   │   └── PageLayout.tsx     # Page wrapper
│   ├── screens/               # Screen-level components
│   │   ├── [Screen1].tsx      # One file per screen from 08-interface-design.md
│   │   ├── [Screen2].tsx
│   │   └── ...
│   ├── shared/                # Shared UI primitives
│   │   ├── DataTable.tsx      # Table with sorting/filtering
│   │   ├── FormFields.tsx     # Reusable form field components
│   │   └── ...
│   └── index.ts               # Barrel export
├── install-commands.sh        # shadcn/flyonui CLI install commands
└── README.md                  # Setup and usage documentation
```

### Quality Criteria for Generated Code

- ✅ Runs immediately after `npm install` (no manual setup required)
- ✅ All form fields match the field specs from `08-interface-design.md`
- ✅ All data tables match the column specs from `08-interface-design.md`
- ✅ All navigation flows match the flowchart from `08-interface-design.md`
- ✅ Accessibility attributes (aria-label, role, tabIndex) on all interactive elements
- ✅ Responsive breakpoints if mobile is required (from NFRs)
- ✅ Design tokens applied consistently (no hardcoded colors or sizes)
- ✅ TypeScript types derived from DCD class attributes (if TS is the chosen language)

---

## Step 8: Save the Artifacts

```
up_save_artifact(
  path: "13-design-system.md",
  title: "Design System Specification — [System Name]",
  content: [design system spec using design-system-spec-template.md],
  phase: "construction",
  activity: "design-system"
)

// For each generated file:
up_save_artifact(
  path: "13-ui-code/[filename]",
  title: "UI Code — [filename]",
  content: [generated source code],
  phase: "construction",
  activity: "design-system"
)

up_update_state(updates: '{"completedActivities":[...,"design-system"],"currentPhase":"construction"}')
```

---

## Note: Conditional Execution

This skill is applicable ONLY when the system has a user interface.

**Check before executing:**
```
1. Does docs/up/08-interface-design.md exist with content?
2. Does the tech stack include a frontend layer (not API-only)?
3. Does the system have at least one human actor?
```

If all three are YES → execute this skill.
If any is NO → skip this skill, mark as N/A in the process plan, proceed to Transition.

---

## Reference Template

- `templates/design-system-spec-template.md` — Full design system specification document
