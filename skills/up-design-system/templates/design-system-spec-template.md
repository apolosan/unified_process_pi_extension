# Design System Specification — [System Name]

> **Interface Design Source:** `docs/up/08-interface-design.md`
> **Tech Stack Reference:** `docs/up/11-tech-stack.md`
> **5W2H Analysis:** `docs/up/5w2h/5W2H-design-system.md`
> **Date:** [date] | **Iteration:** [N]
> **Status:** TOKENS DEFINED → COMPONENTS MAPPED → CODE GENERATED → VALIDATED
> **Applies to:** [Yes — has user interface / No — API-only, skill skipped]
> 
> ⚠️ **Zero Hardcoded Values:** All generated components reference tokens exclusively.
> Every color, size, spacing, radius, shadow, duration references a CSS custom property.

---

## 1. Aesthetic Preference Profile

### 1.1 Detected Signals

| Signal | Source | Type | Visual Implication |
|---|---|---|---|
| [e.g., "healthcare system for professionals"] | `01-vision.md` | Domain | Clinical, trustworthy, accessible, information-dense |
| [e.g., "must work on tablets"] | `02-requirements.md` | Device constraint | Touch-first, large targets, responsive |
| [e.g., requester mentioned "Stripe-like"] | Conversation | Explicit reference | Minimal, developer-aesthetic, dark mode capable |
| [e.g., WCAG AA required] | NFR-04 | Accessibility | Strict contrast ratios, keyboard navigation mandatory |

### 1.2 Visual Profile Summary

| Attribute | Value | Reasoning |
|---|---|---|
| **Primary aesthetic** | [Modern minimal / Corporate dense / Consumer playful / Technical clean] | [Based on detected signals] |
| **Color temperament** | [Warm / Cool / Neutral / High-contrast] | [Domain + audience] |
| **Motion philosophy** | [None / Subtle / Expressive] | [Domain + performance constraints] |
| **Typography style** | [Sans-serif professional / Display expressive / Monospace technical] | [Audience expectations] |
| **Dark mode** | [Required / Optional / Not needed] | [Target environment] |
| **Density preference** | [Compact (data-rich) / Comfortable (balanced) / Spacious (consumer)] | [User type] |

---

## 2. Design System Research Summary

### 2.1 MCP Tool Inventory Used

| Tool | Used? | Findings |
|---|---|---|
| `shadcn_list_items_in_registries()` | ✅/❌ | [N components available] |
| `radix_mcp_server_themes_list_components()` | ✅/❌ | [N components available] |
| `flyonui_get-blocks-metadata()` | ✅/❌ | [N blocks available] |
| `brave-search / web-search` | ✅/❌ | [Key findings] |

### 2.2 Candidates Evaluated

| Design System | MCP Available | Aesthetic | WCAG | Bundle | Stack Fit | Coverage |
|---|---|---|---|---|---|---|
| Shadcn/UI | ✅ | Modern minimal | Excellent | ~15KB base | React/TS | [%] |
| Radix Themes | ✅ | Clean, opinionated | Excellent | ~20KB | React/TS | [%] |
| FlyonUI | ✅ | Comprehensive | Good | Tailwind-based | Any | [%] |
| [Other] | ❌ | [aesthetic] | [level] | [size] | [stack] | [%] |

### 2.3 Internet Research Findings

| Query | Key Finding | Impact on Selection |
|---|---|---|
| "[design system landscape query]" | [what was found] | [how it influenced decision] |

---

## 3. Selected Design System

### ✅ [Design System Name] — [Version]

| Attribute | Value |
|---|---|
| **Name** | [e.g., Shadcn/UI + Tailwind CSS] |
| **Version** | [e.g., 0.8.x / Tailwind 3.4] |
| **Component source** | [MCP tool used: shadcn_* / radix_* / flyonui_*] |
| **Install command** | `[e.g., npx shadcn-ui@latest init]` |
| **Documentation** | [URL] |
| **Stack compatibility** | [Confirmed: React 18 + TypeScript + Vite] |
| **WCAG compliance** | [Level AA — via Radix primitives] |

**Why this was chosen over alternatives:**
> [Specific reasoning that references the detected signals and evaluation criteria]

---

## 4. Design Token Foundation

> **Rule:** Every value below is a CSS custom property. Every generated component references these tokens — no exceptions.

### 4.1 Primitive Color Tokens

Source: `radix_mcp_server_colors_get_scale({ scaleName: '[scale]' })`

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--prim-primary-9` | [hex] | [hex] | Brand color — interactive elements |
| `--prim-primary-11` | [hex] | [hex] | Brand text, links |
| `--prim-neutral-1` | [hex] | [hex] | Page background |
| `--prim-neutral-12` | [hex] | [hex] | Primary text |
| `--prim-error-9` | [hex] | [hex] | Error solid |
| `--prim-success-9` | [hex] | [hex] | Success solid |
| `--prim-warning-9` | [hex] | [hex] | Warning solid |
| *(full 12-step scales for each color)* | | | |

### 4.2 Semantic Color Tokens

| Token | Resolves To | Purpose |
|---|---|---|
| `--color-bg-base` | `var(--prim-neutral-1)` | Page background |
| `--color-bg-subtle` | `var(--prim-neutral-2)` | Subtle sections, card bg |
| `--color-text-primary` | `var(--prim-neutral-12)` | Headings, primary content |
| `--color-text-secondary` | `var(--prim-neutral-11)` | Descriptions, subtitles |
| `--color-text-disabled` | `var(--prim-neutral-7)` | Disabled elements |
| `--color-text-inverse` | `#ffffff` | Text on colored bg |
| `--color-interactive-default` | `var(--prim-primary-9)` | Buttons, links, focus |
| `--color-border-default` | `var(--prim-neutral-6)` | Standard borders |
| `--color-border-focus` | `var(--prim-primary-8)` | Focus rings |
| `--color-error-bg` | `var(--prim-error-3)` | Error backgrounds |
| `--color-error-text` | `var(--prim-error-11)` | Error text |
| *(complete semantic set from SKILL.md Layer 2)* | | |

### 4.3 Typography Tokens

| Token | Value | Used For |
|---|---|---|
| `--prim-font-sans` | [font stack] | Body, labels, UI text |
| `--prim-font-display` | [font stack] | Headings |
| `--prim-font-mono` | [font stack] | Code, technical values |
| `--text-style-h1` | [size/height/family/weight] | Page titles |
| `--text-style-h2` | [size/height/family/weight] | Section titles |
| `--text-style-body` | [size/height/family/weight] | Content text |
| `--text-style-body-sm` | [size/height/family/weight] | Secondary content |
| `--text-style-label` | [size/height/family/weight] | Form labels, table headers |
| `--text-style-caption` | [size/height/family/weight] | Metadata, timestamps |
| `--text-style-code-inline` | [size/height/family/weight] | Inline code |
| *(all 14 text styles defined)* | | |

### 4.4 Spacing Tokens

| Token | Value | Used For |
|---|---|---|
| `--space-page-padding-x` | `1.5rem (24px)` | Horizontal page margin |
| `--space-page-padding-y` | `2rem (32px)` | Vertical page margin |
| `--space-section-gap` | `4rem (64px)` | Between major sections |
| `--space-card-padding` | `1.5rem (24px)` | Card internal padding |
| `--space-form-gap` | `1.25rem (20px)` | Between form fields |
| `--space-button-padding-x-md` | `1rem (16px)` | Button horizontal padding |
| `--space-button-padding-y-md` | `0.625rem (10px)` | Button vertical padding |
| `--space-navbar-height` | `4rem (64px)` | Navigation bar height |
| `--space-sidebar-width` | `16rem (256px)` | Sidebar width |
| *(full semantic spacing set from SKILL.md)* | | |

### 4.5 Size Tokens

| Token | Value | WCAG Compliant? |
|---|---|---|
| `--size-button-height-md` | `2.5rem (40px)` | ✅ Yes (>44px threshold) |
| `--size-input-height-md` | `2.5rem (40px)` | ✅ Yes |
| `--size-touch-target-min` | `44px` | ✅ WCAG 2.5.5 |
| `--size-icon-md` | `1.25rem (20px)` | — |
| `--size-icon-lg` | `1.5rem (24px)` | — |
| `--size-container-full` | `80rem (1280px)` | — max page width |

### 4.6 Geometry Tokens

| Token | Value | Used For |
|---|---|---|
| `--radius-sm` | `0.25rem (4px)` | Badges, inputs |
| `--radius-md` | `0.5rem (8px)` | Buttons, cards |
| `--radius-lg` | `0.75rem (12px)` | Panels, dialogs |
| `--radius-pill` | `9999px` | Tags, pills |
| `--prim-shadow-sm` | [shadow value] | Default card elevation |
| `--prim-shadow-lg` | [shadow value] | Popover, toast elevation |

### 4.7 Motion Tokens

| Token | Value | Used For |
|---|---|---|
| `--prim-duration-fast` | `150ms` | Hover transitions |
| `--prim-duration-normal` | `200ms` | Standard transitions |
| `--prim-duration-slow` | `300ms` | Complex animations |
| `--prim-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `--prim-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |
| `--prim-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful elements |

### 4.8 Component Tokens Summary

| Component | Key Tokens Defined |
|---|---|
| Button | bg, hover, active, text, radius, disabled-opacity, focus-ring |
| Input | bg, border, hover, focus, error, radius, placeholder-color |
| Card | bg, border, radius, shadow, padding |
| Table | header-bg, row-hover, row-selected, border, cell-text |
| Badge | radius, font-size, font-weight, padding |
| Dialog | bg, radius, shadow, overlay-bg, max-width |
| Navigation | height, bg, item-hover, item-active, item-radius |
| Toast | radius, shadow, max-width, auto-dismiss |

### 4.9 WCAG Validation Results

| Combination | Contrast Ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|---|---|---|---|
| `--color-text-primary` on `--color-bg-base` | [ratio]:1 | ✅/❌ | ✅/❌ |
| `--color-text-secondary` on `--color-bg-base` | [ratio]:1 | ✅/❌ | ✅/❌ |
| `--color-text-inverse` on `--color-interactive-default` | [ratio]:1 | ✅/❌ | ✅/❌ |
| `--color-text-link` on `--color-bg-base` | [ratio]:1 | ✅/❌ | ✅/❌ |
| `--color-error-text` on `--color-error-bg` | [ratio]:1 | ✅/❌ | ✅/❌ |

### 4.10 State Pattern Specifications

| State | Visual Treatment |
|---|---|
| **Loading (skeleton)** | Shimmer animation, `--color-bg-subtle` to `--color-bg-muted`, 1.5s loop |
| **Loading (inline)** | Spinner at `--size-icon-sm`, `--color-interactive-default` |
| **Empty state** | Centered, `--size-container-sm` max-width, icon + title (h5) + description (body-sm) + CTA |
| **Error (inline)** | `--color-error-text` icon + text below field, `--text-style-caption` |
| **Error (banner)** | `--color-error-bg` background, `--color-error-border` border, dismissible |
| **Success (toast)** | `--color-success-bg`, auto-dismiss 4000ms |
| **Disabled** | `--button-disabled-opacity` (50%), `cursor: not-allowed`, `aria-disabled="true"` |
| **Focus** | `--button-focus-ring-width` outline, `--button-focus-ring-color`, offset 2px |

---

## 5. Component Mapping (Interface Design → Design System)

> Maps each element from `08-interface-design.md` to a specific component in the selected design system.

| Interface Element | Type | Design System Component | MCP Tool Used | Install Command |
|---|---|---|---|---|
| Main Navigation | Index/Menu | [e.g., shadcn NavigationMenu] | `shadcn_view_items_in_registries` | `npx shadcn-ui add navigation-menu` |
| [Screen 1 — Entity List] | Multidata Unit | [e.g., shadcn DataTable] | `shadcn_get_item_examples` | `npx shadcn-ui add data-table` |
| [Screen 2 — Entity Form] | Entry Unit | [e.g., shadcn Form + Input + Button] | `shadcn_view_items` | `npx shadcn-ui add form input button` |
| [Modal/Dialog] | Operation Unit | [e.g., shadcn AlertDialog] | `shadcn_view_items` | `npx shadcn-ui add alert-dialog` |
| Notification/Toast | Feedback | [e.g., shadcn Sonner] | `shadcn_view_items` | `npx shadcn-ui add sonner` |
| [Select/Dropdown] | Selection Unit | [e.g., shadcn Select + Command] | `shadcn_view_items` | `npx shadcn-ui add select command` |
| [Report Table] | Data display | [e.g., FlyonUI table block] | `flyonui_get-block-content` | TailwindCSS config |

---

## 6. Generated Code Summary

| File | Description | Lines | Status |
|---|---|---|---|
| `design-tokens.css` | CSS custom properties for all tokens | ~80 | ✅ Generated |
| `design-tokens.ts` | TypeScript token exports | ~50 | ✅ Generated |
| `components/layout/Navigation.tsx` | Main navigation | ~120 | ✅ Generated |
| `components/layout/PageLayout.tsx` | Page wrapper with sidebar | ~60 | ✅ Generated |
| `components/screens/[Screen1].tsx` | [Screen 1 name] | ~[N] | ✅ Generated |
| `components/screens/[Screen2].tsx` | [Screen 2 name] | ~[N] | ✅ Generated |
| `components/shared/DataTable.tsx` | Reusable data table | ~150 | ✅ Generated |
| `components/shared/FormFields.tsx` | Reusable form fields | ~100 | ✅ Generated |
| `install-commands.sh` | All shadcn/flyonui install commands | ~20 | ✅ Generated |
| `README.md` | Setup and usage documentation | ~80 | ✅ Generated |

---

## 7. Accessibility Compliance Report

| Screen | WCAG AA Color Contrast | Keyboard Nav | ARIA Labels | Focus Management | Status |
|---|---|---|---|---|---|
| [Screen 1] | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| [Screen 2] | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |

---

## 8. Install and Setup Guide

### Quick Start

```bash
# 1. Install the design system
[e.g., npx shadcn-ui@latest init]

# 2. Install all required components
[e.g., npx shadcn-ui add button card table form input select dialog sheet toast]

# 3. Configure design tokens
# Copy design-tokens.css to your CSS entry point

# 4. Run the development server
npm run dev
```

### File Placement

```
src/
├── components/     ← Copy contents of docs/up/13-ui-code/components/
├── styles/
│   └── tokens.css  ← Copy design-tokens.css here
└── app/
    └── ...         ← Use generated screens as route components
```

---

## 9. Design Alternatives Considered and Rejected

| Design System | Rejection Reason |
|---|---|
| [Alternative 1] | [Specific: aesthetic mismatch / accessibility gap / bundle too large / not maintained] |
| [Alternative 2] | [Specific reason] |
