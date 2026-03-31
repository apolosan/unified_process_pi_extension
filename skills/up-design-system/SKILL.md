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

## Step 5: Design Token Foundation (Complete Visual Standard)

> **Non-negotiable rule:** After this step is complete, **ZERO hardcoded values** may appear in any generated component. Every color, size, spacing, radius, shadow, duration, and z-index MUST reference a token. This is the contract that makes the generated system maintainable.

> **Output of this step:** 4 files saved before any component is generated:
> - `docs/up/13-ui-code/tokens/tokens.css` — CSS custom properties (the source of truth)
> - `docs/up/13-ui-code/tokens/tokens.ts` — TypeScript exports for type-safe usage
> - `docs/up/13-ui-code/tokens/tokens.json` — Design tool handoff format
> - `docs/up/13-ui-code/STYLE-GUIDE.md` — Usage documentation for developers

---

### Layer 1: Primitive Tokens (Raw Values — Never Use Directly in Components)

Primitive tokens are the **raw material** of the design system. They are never used directly in components — only through semantic aliases.

#### 1.1 Color Primitives

Use `radix_mcp_server_colors_get_scale()` to extract canonical color scales:

```typescript
// Extract color scales from Radix (canonical, accessible scales):
radix_mcp_server_colors_list_scales()  // see all available scales
radix_mcp_server_colors_get_scale({ scaleName: 'blue' })   // primary candidate
radix_mcp_server_colors_get_scale({ scaleName: 'slate' })  // neutral/gray candidate
radix_mcp_server_colors_get_scale({ scaleName: 'red' })    // error candidate
radix_mcp_server_colors_get_scale({ scaleName: 'green' })  // success candidate
radix_mcp_server_colors_get_scale({ scaleName: 'amber' })  // warning candidate
```

For each color scale, define 12 steps (Radix system) or 11 steps (Tailwind system):

```css
/* Color Primitives — NEVER used directly in components */
--prim-[name]-1:  [hex];  /* Lightest background */
--prim-[name]-2:  [hex];  /* Subtle background */
--prim-[name]-3:  [hex];  /* Interactive bg (hover) */
--prim-[name]-4:  [hex];  /* Interactive bg (active) */
--prim-[name]-5:  [hex];  /* Interactive lines/borders */
--prim-[name]-6:  [hex];  /* Subtle borders */
--prim-[name]-7:  [hex];  /* Default borders */
--prim-[name]-8:  [hex];  /* Solid colors — interactive focus */
--prim-[name]-9:  [hex];  /* Solid backgrounds — primary */
--prim-[name]-10: [hex];  /* Solid backgrounds — hover */
--prim-[name]-11: [hex];  /* Low-contrast text */
--prim-[name]-12: [hex];  /* High-contrast text */

/* Alpha variants (for overlays and glass effects) */
--prim-[name]-a1 through --prim-[name]-a12
```

Required scales:
- **Primary brand** (choose the most fitting: blue, violet, indigo, emerald, etc.)
- **Neutral** (slate, gray, zinc, or stone — for text and backgrounds)
- **Error** (red, rose, or tomato)
- **Success** (green, teal, or grass)
- **Warning** (amber, yellow, or orange)
- **Info** (sky, cyan, or blue)
- **Pure black and white** (#000000, #ffffff)

#### 1.2 Typography Primitives

```css
/* Font families */
--prim-font-sans:    [e.g., 'Inter', 'Geist', system-ui, -apple-system, sans-serif];
--prim-font-display: [e.g., 'Cal Sans', 'Bricolage Grotesque', var(--prim-font-sans)];
--prim-font-mono:    [e.g., 'JetBrains Mono', 'Geist Mono', 'Consolas', monospace];

/* Size scale (fluid or fixed — choose ONE approach) */
--prim-size-10: 0.625rem;  /* 10px */
--prim-size-11: 0.6875rem; /* 11px */
--prim-size-12: 0.75rem;   /* 12px */
--prim-size-13: 0.8125rem; /* 13px */
--prim-size-14: 0.875rem;  /* 14px */
--prim-size-15: 0.9375rem; /* 15px */
--prim-size-16: 1rem;      /* 16px — base */
--prim-size-18: 1.125rem;  /* 18px */
--prim-size-20: 1.25rem;   /* 20px */
--prim-size-24: 1.5rem;    /* 24px */
--prim-size-28: 1.75rem;   /* 28px */
--prim-size-32: 2rem;      /* 32px */
--prim-size-36: 2.25rem;   /* 36px */
--prim-size-40: 2.5rem;    /* 40px */
--prim-size-48: 3rem;      /* 48px */
--prim-size-56: 3.5rem;    /* 56px */
--prim-size-64: 4rem;      /* 64px */

/* Font weights */
--prim-weight-thin:       100;
--prim-weight-extralight: 200;
--prim-weight-light:      300;
--prim-weight-regular:    400;
--prim-weight-medium:     500;
--prim-weight-semibold:   600;
--prim-weight-bold:       700;
--prim-weight-extrabold:  800;
--prim-weight-black:      900;

/* Line heights */
--prim-leading-none:     1;
--prim-leading-tight:    1.25;
--prim-leading-snug:     1.375;
--prim-leading-normal:   1.5;
--prim-leading-relaxed:  1.625;
--prim-leading-loose:    2;

/* Letter spacing */
--prim-tracking-tighter: -0.05em;
--prim-tracking-tight:   -0.025em;
--prim-tracking-normal:   0em;
--prim-tracking-wide:     0.025em;
--prim-tracking-wider:    0.05em;
--prim-tracking-widest:   0.1em;
```

#### 1.3 Spacing Primitives

```css
/* Base unit: 4px — ALL spacing derived from multiples of this */
--prim-space-0:    0;
--prim-space-px:   1px;
--prim-space-0-5:  0.125rem;  /* 2px  */
--prim-space-1:    0.25rem;   /* 4px  */
--prim-space-1-5:  0.375rem;  /* 6px  */
--prim-space-2:    0.5rem;    /* 8px  */
--prim-space-2-5:  0.625rem;  /* 10px */
--prim-space-3:    0.75rem;   /* 12px */
--prim-space-3-5:  0.875rem;  /* 14px */
--prim-space-4:    1rem;      /* 16px */
--prim-space-5:    1.25rem;   /* 20px */
--prim-space-6:    1.5rem;    /* 24px */
--prim-space-7:    1.75rem;   /* 28px */
--prim-space-8:    2rem;      /* 32px */
--prim-space-9:    2.25rem;   /* 36px */
--prim-space-10:   2.5rem;    /* 40px */
--prim-space-11:   2.75rem;   /* 44px */
--prim-space-12:   3rem;      /* 48px */
--prim-space-14:   3.5rem;    /* 56px */
--prim-space-16:   4rem;      /* 64px */
--prim-space-20:   5rem;      /* 80px */
--prim-space-24:   6rem;      /* 96px */
--prim-space-28:   7rem;      /* 112px */
--prim-space-32:   8rem;      /* 128px */
--prim-space-36:   9rem;      /* 144px */
--prim-space-40:   10rem;     /* 160px */
```

#### 1.4 Other Primitive Scales

```css
/* Border radius */
--prim-radius-none: 0;
--prim-radius-sm:   0.125rem;  /* 2px  */
--prim-radius-md:   0.25rem;   /* 4px  */
--prim-radius-lg:   0.5rem;    /* 8px  */
--prim-radius-xl:   0.75rem;   /* 12px */
--prim-radius-2xl:  1rem;      /* 16px */
--prim-radius-3xl:  1.5rem;    /* 24px */
--prim-radius-full: 9999px;

/* Shadows (elevation layers) */
--prim-shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--prim-shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--prim-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--prim-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--prim-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--prim-shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--prim-shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
--prim-shadow-none: 0 0 #0000;

/* Animation durations */
--prim-duration-instant:  0ms;
--prim-duration-fastest:  50ms;
--prim-duration-faster:   100ms;
--prim-duration-fast:     150ms;
--prim-duration-normal:   200ms;
--prim-duration-slow:     300ms;
--prim-duration-slower:   400ms;
--prim-duration-slowest:  500ms;

/* Easing functions */
--prim-ease-linear:    linear;
--prim-ease-in:        cubic-bezier(0.4, 0, 1, 1);
--prim-ease-out:       cubic-bezier(0, 0, 0.2, 1);
--prim-ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);
--prim-ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
--prim-ease-bounce:    cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Z-index layers */
--prim-z-below:      -1;
--prim-z-base:        0;
--prim-z-raised:     10;
--prim-z-dropdown:   100;
--prim-z-sticky:     200;
--prim-z-overlay:    300;
--prim-z-modal:      400;
--prim-z-popover:    500;
--prim-z-toast:      600;
--prim-z-tooltip:    700;
--prim-z-maximum:    9999;

/* Opacity */
--prim-opacity-0:     0;
--prim-opacity-5:     0.05;
--prim-opacity-10:    0.1;
--prim-opacity-20:    0.2;
--prim-opacity-25:    0.25;
--prim-opacity-30:    0.3;
--prim-opacity-40:    0.4;
--prim-opacity-50:    0.5;
--prim-opacity-60:    0.6;
--prim-opacity-70:    0.7;
--prim-opacity-75:    0.75;
--prim-opacity-80:    0.8;
--prim-opacity-90:    0.9;
--prim-opacity-95:    0.95;
--prim-opacity-100:   1;

/* Breakpoints */
--prim-bp-xs:  320px;
--prim-bp-sm:  640px;
--prim-bp-md:  768px;
--prim-bp-lg:  1024px;
--prim-bp-xl:  1280px;
--prim-bp-2xl: 1536px;
```

---

### Layer 2: Semantic Tokens (Purpose-Based Aliases — USE THESE in Components)

Semantic tokens give meaning to primitive values. They are THE tokens that components reference.

#### 2.1 Semantic Color Tokens

```css
/* Background layers */
--color-bg-base:        var(--prim-neutral-1);  /* Page background */
--color-bg-subtle:      var(--prim-neutral-2);  /* Card backgrounds, subtle sections */
--color-bg-muted:       var(--prim-neutral-3);  /* Disabled backgrounds */
--color-bg-overlay:     rgba(0,0,0,0.5);        /* Modal backdrop */

/* Surface layers (elevation above background) */
--color-surface-default: #ffffff;               /* Cards, panels */
--color-surface-raised:  var(--prim-neutral-1); /* Popovers, dropdowns */
--color-surface-overlay: #ffffff;               /* Modals */

/* Text hierarchy */
--color-text-primary:   var(--prim-neutral-12); /* Headings, primary content */
--color-text-secondary: var(--prim-neutral-11); /* Subtitles, descriptions */
--color-text-tertiary:  var(--prim-neutral-9);  /* Captions, metadata */
--color-text-disabled:  var(--prim-neutral-7);  /* Disabled elements */
--color-text-inverse:   #ffffff;                /* Text on dark/colored backgrounds */
--color-text-link:      var(--prim-primary-11); /* Links */
--color-text-link-hover:var(--prim-primary-12); /* Links on hover */

/* Interactive (brand primary) */
--color-interactive-default: var(--prim-primary-9);  /* Default state */
--color-interactive-hover:   var(--prim-primary-10); /* Hover state */
--color-interactive-active:  var(--prim-primary-11); /* Pressed/active state */
--color-interactive-focus:   var(--prim-primary-8);  /* Focus ring base */
--color-interactive-muted:   var(--prim-primary-3);  /* Subtle interactive bg */
--color-interactive-subtle:  var(--prim-primary-4);  /* Hover on subtle interactive bg */

/* Borders */
--color-border-default:  var(--prim-neutral-6); /* Standard borders */
--color-border-strong:   var(--prim-neutral-8); /* Emphasized borders */
--color-border-subtle:   var(--prim-neutral-5); /* Subtle separators */
--color-border-focus:    var(--prim-primary-8); /* Focus rings */
--color-border-error:    var(--prim-error-8);   /* Error state borders */

/* Semantic states */
--color-error-bg:        var(--prim-error-3);
--color-error-border:    var(--prim-error-7);
--color-error-text:      var(--prim-error-11);
--color-error-icon:      var(--prim-error-9);

--color-success-bg:      var(--prim-success-3);
--color-success-border:  var(--prim-success-7);
--color-success-text:    var(--prim-success-11);
--color-success-icon:    var(--prim-success-9);

--color-warning-bg:      var(--prim-warning-3);
--color-warning-border:  var(--prim-warning-7);
--color-warning-text:    var(--prim-warning-11);
--color-warning-icon:    var(--prim-warning-9);

--color-info-bg:         var(--prim-info-3);
--color-info-border:     var(--prim-info-7);
--color-info-text:       var(--prim-info-11);
--color-info-icon:       var(--prim-info-9);

/* Icons */
--color-icon-default:    var(--prim-neutral-11);
--color-icon-secondary:  var(--prim-neutral-9);
--color-icon-disabled:   var(--prim-neutral-7);
--color-icon-inverse:    #ffffff;
--color-icon-interactive: var(--prim-primary-9);
```

**Dark Mode equivalents**: Define the same semantic tokens under `.dark` or `[data-theme="dark"]` with adjusted primitive references.

#### 2.2 Semantic Typography Tokens (Text Styles)

```css
/* HEADING STYLES — used for page/section titles */
--text-style-h1:       var(--prim-size-48) / var(--prim-leading-tight)   var(--prim-font-display)  var(--prim-weight-bold);
--text-style-h2:       var(--prim-size-36) / var(--prim-leading-tight)   var(--prim-font-display)  var(--prim-weight-semibold);
--text-style-h3:       var(--prim-size-28) / var(--prim-leading-snug)    var(--prim-font-display)  var(--prim-weight-semibold);
--text-style-h4:       var(--prim-size-24) / var(--prim-leading-snug)    var(--prim-font-sans)     var(--prim-weight-semibold);
--text-style-h5:       var(--prim-size-20) / var(--prim-leading-normal)  var(--prim-font-sans)     var(--prim-weight-medium);
--text-style-h6:       var(--prim-size-18) / var(--prim-leading-normal)  var(--prim-font-sans)     var(--prim-weight-medium);

/* BODY STYLES — used for content and descriptions */
--text-style-body-lg:  var(--prim-size-18) / var(--prim-leading-relaxed) var(--prim-font-sans)     var(--prim-weight-regular);
--text-style-body:     var(--prim-size-16) / var(--prim-leading-normal)  var(--prim-font-sans)     var(--prim-weight-regular);
--text-style-body-sm:  var(--prim-size-14) / var(--prim-leading-normal)  var(--prim-font-sans)     var(--prim-weight-regular);
--text-style-body-xs:  var(--prim-size-12) / var(--prim-leading-normal)  var(--prim-font-sans)     var(--prim-weight-regular);

/* LABEL STYLES — used for form labels, table headers, nav items */
--text-style-label-lg: var(--prim-size-15) / var(--prim-leading-tight)   var(--prim-font-sans)     var(--prim-weight-medium);
--text-style-label:    var(--prim-size-14) / var(--prim-leading-tight)   var(--prim-font-sans)     var(--prim-weight-medium);
--text-style-label-sm: var(--prim-size-12) / var(--prim-leading-tight)   var(--prim-font-sans)     var(--prim-weight-medium);

/* CAPTION and OVERLINE — used for metadata, timestamps, helper text */
--text-style-caption:      var(--prim-size-12) / var(--prim-leading-normal) var(--prim-font-sans) var(--prim-weight-regular);
--text-style-overline:     var(--prim-size-11) / var(--prim-leading-none)   var(--prim-font-sans) var(--prim-weight-medium);  /* letter-spacing: wide */

/* CODE STYLES */
--text-style-code-inline:  var(--prim-size-14) / var(--prim-leading-normal)  var(--prim-font-mono) var(--prim-weight-regular);
--text-style-code-block:   var(--prim-size-13) / var(--prim-leading-relaxed) var(--prim-font-mono) var(--prim-weight-regular);
```

#### 2.3 Semantic Spacing Tokens (Named Layout Values)

```css
/* PAGE LAYOUT */
--space-page-padding-x:      var(--prim-space-6);   /* 24px — horizontal page margin */
--space-page-padding-y:      var(--prim-space-8);   /* 32px — vertical page margin */
--space-section-gap:         var(--prim-space-16);  /* 64px — between major sections */
--space-content-gap:         var(--prim-space-8);   /* 32px — between content blocks */

/* COMPONENT STRUCTURE */
--space-card-padding:        var(--prim-space-6);   /* 24px — card internal padding */
--space-card-gap:            var(--prim-space-4);   /* 16px — gap between card elements */
--space-form-gap:            var(--prim-space-5);   /* 20px — gap between form fields */
--space-form-field-gap:      var(--prim-space-2);   /* 8px  — label to input gap */
--space-inline-gap:          var(--prim-space-2);   /* 8px  — gap between inline elements */

/* INTERACTIVE ELEMENTS */
--space-button-padding-x-sm: var(--prim-space-3);   /* 12px */
--space-button-padding-x-md: var(--prim-space-4);   /* 16px */
--space-button-padding-x-lg: var(--prim-space-6);   /* 24px */
--space-button-padding-y-sm: var(--prim-space-1-5); /* 6px  */
--space-button-padding-y-md: var(--prim-space-2-5); /* 10px */
--space-button-padding-y-lg: var(--prim-space-3);   /* 12px */
--space-input-padding-x:     var(--prim-space-3);   /* 12px */
--space-input-padding-y:     var(--prim-space-2-5); /* 10px */
--space-table-cell-padding-x: var(--prim-space-4);  /* 16px */
--space-table-cell-padding-y: var(--prim-space-3);  /* 12px */

/* NAVIGATION */
--space-navbar-height:       var(--prim-space-16);  /* 64px */
--space-navbar-padding-x:    var(--prim-space-6);   /* 24px */
--space-sidebar-width:       16rem;                  /* 256px */
--space-sidebar-collapsed:   var(--prim-space-14);  /* 56px */
```

#### 2.4 Semantic Size Tokens (Component Dimensions)

```css
/* TOUCH TARGETS (minimum 44px per WCAG 2.5.5) */
--size-touch-target-min:    44px;                   /* WCAG minimum */

/* COMPONENT HEIGHTS */
--size-button-height-sm:    var(--prim-space-8);    /* 32px */
--size-button-height-md:    var(--prim-space-10);   /* 40px — WCAG-compliant */
--size-button-height-lg:    var(--prim-space-12);   /* 48px */
--size-input-height-sm:     var(--prim-space-8);    /* 32px */
--size-input-height-md:     var(--prim-space-10);   /* 40px — WCAG-compliant */
--size-input-height-lg:     var(--prim-space-12);   /* 48px */
--size-checkbox-size:       var(--prim-space-5);    /* 20px */
--size-radio-size:          var(--prim-space-5);    /* 20px */
--size-switch-height:       var(--prim-space-6);    /* 24px */
--size-switch-width:        calc(var(--size-switch-height) * 1.75);

/* ICON SIZES */
--size-icon-xs:             var(--prim-space-3);    /* 12px */
--size-icon-sm:             var(--prim-space-4);    /* 16px */
--size-icon-md:             var(--prim-space-5);    /* 20px */
--size-icon-lg:             var(--prim-space-6);    /* 24px */
--size-icon-xl:             var(--prim-space-8);    /* 32px */

/* AVATAR SIZES */
--size-avatar-xs:           var(--prim-space-6);    /* 24px */
--size-avatar-sm:           var(--prim-space-8);    /* 32px */
--size-avatar-md:           var(--prim-space-10);   /* 40px */
--size-avatar-lg:           var(--prim-space-12);   /* 48px */
--size-avatar-xl:           var(--prim-space-16);   /* 64px */
--size-avatar-2xl:          var(--prim-space-24);   /* 96px */

/* CONTAINER WIDTHS */
--size-container-xs:    20rem;    /* 320px  — mobile */
--size-container-sm:    24rem;    /* 384px  — narrow */
--size-container-md:    28rem;    /* 448px  — dialog default */
--size-container-lg:    32rem;    /* 512px  — wide dialog */
--size-container-xl:    36rem;    /* 576px  — form page */
--size-container-2xl:   42rem;    /* 672px  — article */
--size-container-3xl:   48rem;    /* 768px  */
--size-container-4xl:   56rem;    /* 896px  */
--size-container-5xl:   64rem;    /* 1024px */
--size-container-6xl:   72rem;    /* 1152px */
--size-container-full:  80rem;    /* 1280px — max-width */
```

#### 2.5 Semantic Radius Tokens

```css
--radius-none:   var(--prim-radius-none);
--radius-xs:     var(--prim-radius-sm);   /* 2px  — subtle */
--radius-sm:     var(--prim-radius-md);   /* 4px  — inputs, badges */
--radius-md:     var(--prim-radius-lg);   /* 8px  — buttons, cards */
--radius-lg:     var(--prim-radius-xl);   /* 12px — panels, dialogs */
--radius-xl:     var(--prim-radius-2xl);  /* 16px — featured cards */
--radius-2xl:    var(--prim-radius-3xl);  /* 24px — hero sections */
--radius-pill:   var(--prim-radius-full); /* 9999px — pills, tags */
```

---

### Layer 3: Component Tokens (Derived — Specific Per Component)

Component tokens consume semantic tokens and provide explicit values for each component variant and state.

```css
/* ── BUTTON ────────────────────────────────────────────── */
--button-radius:              var(--radius-md);
--button-font-weight:         var(--prim-weight-medium);
--button-font-size-sm:        var(--prim-size-13);
--button-font-size-md:        var(--prim-size-14);
--button-font-size-lg:        var(--prim-size-16);

/* Primary variant */
--button-primary-bg:          var(--color-interactive-default);
--button-primary-bg-hover:    var(--color-interactive-hover);
--button-primary-bg-active:   var(--color-interactive-active);
--button-primary-text:        var(--color-text-inverse);
--button-primary-border:      transparent;

/* Secondary/Outline variant */
--button-secondary-bg:        transparent;
--button-secondary-bg-hover:  var(--color-interactive-muted);
--button-secondary-text:      var(--color-text-primary);
--button-secondary-border:    var(--color-border-default);

/* Ghost variant */
--button-ghost-bg:            transparent;
--button-ghost-bg-hover:      var(--color-bg-subtle);
--button-ghost-text:          var(--color-text-primary);

/* Destructive variant */
--button-destructive-bg:      var(--prim-error-9);
--button-destructive-bg-hover: var(--prim-error-10);
--button-destructive-text:    #ffffff;

/* Disabled (all variants) */
--button-disabled-opacity:    var(--prim-opacity-50);
--button-disabled-cursor:     not-allowed;

/* Focus ring */
--button-focus-ring-width:    2px;
--button-focus-ring-offset:   2px;
--button-focus-ring-color:    var(--color-border-focus);

/* ── INPUT / FORM FIELD ────────────────────────────────── */
--input-bg:                   var(--color-surface-default);
--input-bg-disabled:          var(--color-bg-muted);
--input-border:               var(--color-border-default);
--input-border-hover:         var(--color-border-strong);
--input-border-focus:         var(--color-border-focus);
--input-border-error:         var(--color-border-error);
--input-border-width:         1px;
--input-radius:               var(--radius-sm);
--input-text:                 var(--color-text-primary);
--input-placeholder:          var(--color-text-tertiary);
--input-text-disabled:        var(--color-text-disabled);
--input-label-text:           var(--color-text-primary);
--input-label-font-weight:    var(--prim-weight-medium);
--input-helper-text:          var(--color-text-tertiary);
--input-error-text:           var(--color-error-text);
--input-focus-ring:           var(--button-focus-ring-width) solid var(--color-border-focus);

/* ── CARD ─────────────────────────────────────────────── */
--card-bg:                    var(--color-surface-default);
--card-border:                var(--color-border-subtle);
--card-border-width:          1px;
--card-radius:                var(--radius-lg);
--card-shadow:                var(--prim-shadow-sm);
--card-shadow-hover:          var(--prim-shadow-md);
--card-padding:               var(--space-card-padding);

/* ── TABLE ───────────────────────────────────────────── */
--table-header-bg:            var(--color-bg-subtle);
--table-header-text:          var(--color-text-secondary);
--table-header-font-weight:   var(--prim-weight-medium);
--table-row-bg:               var(--color-surface-default);
--table-row-bg-hover:         var(--color-bg-subtle);
--table-row-bg-selected:      var(--color-interactive-muted);
--table-border:               var(--color-border-subtle);
--table-cell-text:            var(--color-text-primary);

/* ── BADGE / TAG ─────────────────────────────────────── */
--badge-radius:               var(--radius-pill);
--badge-font-size:            var(--prim-size-11);
--badge-font-weight:          var(--prim-weight-medium);
--badge-padding-x:            var(--prim-space-2);
--badge-padding-y:            var(--prim-space-0-5);

/* ── DIALOG / MODAL ──────────────────────────────────── */
--dialog-bg:                  var(--color-surface-overlay);
--dialog-radius:              var(--radius-xl);
--dialog-shadow:              var(--prim-shadow-2xl);
--dialog-overlay-bg:          rgba(0, 0, 0, 0.5);
--dialog-width-sm:            var(--size-container-md);
--dialog-width-md:            var(--size-container-lg);
--dialog-width-lg:            var(--size-container-xl);

/* ── NAVIGATION ──────────────────────────────────────── */
--nav-height:                 var(--space-navbar-height);
--nav-bg:                     var(--color-surface-default);
--nav-border:                 var(--color-border-subtle);
--nav-item-text:              var(--color-text-secondary);
--nav-item-text-active:       var(--color-text-primary);
--nav-item-bg-hover:          var(--color-bg-subtle);
--nav-item-bg-active:         var(--color-interactive-muted);
--nav-item-radius:            var(--radius-md);

/* ── TOAST / NOTIFICATION ────────────────────────────── */
--toast-radius:               var(--radius-lg);
--toast-shadow:               var(--prim-shadow-lg);
--toast-max-width:            24rem;
```

---

### Layer 4: State Patterns (Standard UI State Specifications)

Every system needs consistent visual patterns for the following states. These are NOT components — they are SPECIFICATIONS that components must implement.

#### 4.1 Loading State

```
SKELETON ANIMATION:
  background: linear-gradient(90deg, var(--color-bg-subtle) 25%, var(--color-bg-muted) 50%, var(--color-bg-subtle) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);

RULES:
  - Skeleton matches the EXACT dimensions of the content it replaces
  - Inline spinners use --size-icon-md and --color-interactive-default
  - Page-level loading overlay uses --dialog-overlay-bg at 80% opacity
  - Buttons in loading state: show spinner (--size-icon-sm) + replace text with empty
  - Minimum display time: 200ms (prevents flash for fast responses)
```

#### 4.2 Empty State

```
LAYOUT:
  Container: centered, max-width var(--size-container-sm)
  Padding: var(--space-section-gap)
  Gap between elements: var(--space-content-gap)

ELEMENTS (in order):
  1. Illustration: 120×120px (optional, SVG preferred)
  2. Title: --text-style-h5, --color-text-primary
  3. Description: --text-style-body-sm, --color-text-secondary, max-width: 320px
  4. CTA Button: primary variant, size-md (if applicable)

RULES:
  - Every list/table screen MUST have an empty state designed
  - Empty state title must explain WHY it's empty, not just THAT it's empty
  - Empty state for "no results" is different from "no data yet"
```

#### 4.3 Error State

```
INLINE ERROR (form fields):
  Text color: --color-error-text
  Font: --text-style-caption
  Icon: --size-icon-sm, --color-error-icon
  Displayed below the field, with --space-form-field-gap gap

BANNER ERROR (top of section):
  Background: --color-error-bg
  Border: 1px solid --color-error-border
  Text: --color-error-text
  Radius: --radius-md
  Padding: var(--prim-space-4)

PAGE-LEVEL ERROR:
  Same layout as Empty State
  Icon: warning/error illustration
  Title: --text-style-h4, --color-error-text
  Retry button: primary variant

RULES:
  - Error messages are NEVER red text alone — always include an icon
  - Toast errors use --color-error-bg, border, and dismissible
  - Network errors show retry action within 1 second of failure
```

#### 4.4 Success State

```
INLINE SUCCESS (form submission):
  Icon: checkmark, --size-icon-md, --color-success-icon
  Text: --color-success-text, --text-style-body-sm

TOAST SUCCESS:
  Background: --color-success-bg
  Border: 1px solid --color-success-border
  Auto-dismiss: 4000ms

PAGE-LEVEL SUCCESS (e.g., onboarding complete):
  Full-page celebration layout with CTA to next action

RULES:
  - Success states auto-dismiss unless they require user action
  - Success confirmation must confirm WHAT was successful (not just "Done")
```

#### 4.5 Disabled State

```
ALL INTERACTIVE ELEMENTS:
  Opacity: var(--button-disabled-opacity) — 50%
  Cursor: var(--button-disabled-cursor) — not-allowed
  Pointer-events: none
  Color: --color-text-disabled (for text inside disabled elements)

RULES:
  - Disabled elements never have hover/focus styles
  - Disabled form fields show placeholder-style text
  - Required ARIA: aria-disabled="true" on all disabled interactive elements
  - Disabled buttons NEVER change on hover (no color shift)
```

#### 4.6 Focus State (Keyboard Navigation)

```
UNIVERSAL FOCUS RING:
  outline: var(--button-focus-ring-width) solid var(--button-focus-ring-color);
  outline-offset: var(--button-focus-ring-offset);

RULES:
  - ALL interactive elements MUST have :focus-visible styles
  - Focus rings are NEVER removed (outline: none is forbidden without alternative)
  - Focus ring color must have 3:1 contrast ratio against adjacent background (WCAG 3.4.1)
  - Skip link must be the first focusable element on every page
```

---

### WCAG Compliance Validation

Before proceeding to component generation, validate ALL semantic color combinations:

```
MINIMUM CONTRAST RATIOS:
  Normal text (<18pt): 4.5:1  (WCAG AA Level)
  Large text (≥18pt or bold ≥14pt): 3:1
  Non-text UI elements (icons, borders): 3:1
  Enhanced (AAA): 7:1 for normal, 4.5:1 for large

COMBINATIONS TO VALIDATE:
  ✓ --color-text-primary on --color-bg-base
  ✓ --color-text-secondary on --color-bg-base
  ✓ --color-text-primary on --color-bg-subtle
  ✓ --color-text-inverse on --color-interactive-default
  ✓ --color-text-inverse on --button-destructive-bg
  ✓ --color-text-link on --color-bg-base
  ✓ --color-error-text on --color-error-bg
  ✓ --color-success-text on --color-success-bg
  ✓ --color-warning-text on --color-warning-bg
  ✓ --color-text-disabled on --color-bg-base (allowed to FAIL — disabled)
```

### Token Generation Command

```typescript
// After defining all tokens, generate the token files:
// 1. Save tokens.css — CSS custom properties
// 2. Save tokens.ts  — TypeScript exports
// 3. Save tokens.json — Design tool format (Figma tokens plugin compatible)
// 4. Save STYLE-GUIDE.md — Usage documentation
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
