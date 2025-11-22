## Scope
- Update marketing header navigation, avatar, and routing in `app/(home)/layout.tsx`.
- Modernize avatar dropdown in `components/user-nav.tsx` using `components/ui/avatar.tsx` and `components/ui/dropdown-menu.tsx`.
- Add mobile hamburger menu using `components/ui/sheet.tsx`.
- Implement a desktop mega menu using existing `DropdownMenu`/`Popover` primitives; create a small wrapper if needed.
- Ensure consistent routing to `'/pte/dashboard'` and active state handling via App Router.

## Files To Update
- `app/(home)/layout.tsx` — header structure, nav links, hamburger, mega menu trigger, dashboard link (current `/dashboard` → `/pte/dashboard` at app/(home)/layout.tsx:61).
- `components/user-nav.tsx` — avatar styling, hover/focus states, sizes.
- `components/ui/sheet.tsx` — reuse for mobile drawer; no edits expected.
- `components/ui/dropdown-menu.tsx` and `components/ui/popover.tsx` — reuse for mega menu; no edits expected.
- Optional new: `components/mega-menu.tsx` — accessible mega menu built from `Popover` with Grid; only if reuse becomes too verbose.

## Link Structure & Routing
- Replace any `Link href="/dashboard"` with `Link href="/pte/dashboard"` in public header (app/(home)/layout.tsx:61).
- Audit and ensure all header links use `next/link` and follow `/pte/*` or public routes (`/blog`, `/pricing`, `/contact`).
- Add `prefetch` where appropriate and `aria-current="page"` when `usePathname()` matches.

## Avatar Modernization
- Use `Avatar` + `AvatarFallback` from `components/ui/avatar.tsx` (fallback initial from user name).
- Sizes: `size-9` base, `md:size-10` desktop; spacing `gap-3` around actions.
- Hover/focus: ring and outline via `focus-visible:ring-[3px]` and color-safe variants; ensure `aria-haspopup="menu"`, `aria-expanded`, and keyboard navigation.
- Apply consistent visual hierarchy: elevate dashboard CTA and secondary actions.

## Responsive Layout & Hamburger
- Mobile-first header: compact brand, theme toggle, avatar, and hamburger.
- `md:hidden` for inline nav; `md:flex` for desktop.
- Hamburger opens `Sheet` with touch-friendly menu (`min-h-44`, `py-2`, `space-y-1`), 44px touch-targets, proper roles.
- Include mega menu categories inside the sheet as collapsible sections (`Accordion`) on mobile.

## Mega Menu (Desktop)
- Trigger: top-level "Explore" nav item.
- Build with `Popover`: panel width `max-w-3xl`, Grid (`grid-cols-3 md:grid-cols-4`) of categories:
  - Practice: `/pte/academic/practice/*`, Shadowing, Templates, Vocab.
  - Tests: `/pte/mock-tests/*`, Sectional, Full-length.
  - Insights: `/pte/analytics`, `/pte/profile`.
  - Resources: Blog highlights, `/contact`.
- Add subtle transitions (`transition-opacity`, `motion-safe`), focus trapping, and escape-to-close.

## Accessibility
- `role="navigation"` on header wrappers; `aria-label` for buttons (Hamburger, Theme toggle, Avatar menu).
- Keyboard support: Tab order, Arrow navigation inside mega menu, ESC closes.
- `aria-current="page"` on active links; `sr-only` labels for icons.

## Active States & Indicators
- Use `usePathname()` to compute active and apply `text-foreground` + `font-medium`.
- In sheet, keep current path highlighted for context.

## Performance & Consistency
- Use Flexbox/Grid for layout; minimize custom CSS.
- Keep transitions lightweight; avoid heavy animations.
- No new third-party deps; reuse `components/ui/*` primitives.
- Maintain brand colors and typography (Manrope, gradients in logo).

## Verification
- Run app and manually test links: public pages (`/`, `/blog`, `/pricing`, `/contact`) and PTE routes (`/pte/dashboard`, practice, analytics).
- Confirm mobile behaviors across breakpoints; test keyboard and screen-reader flows.
- Validate consistent routing, active indicators, and that theme toggles continue to work.

## Assumptions
- The PTE dashboard canonical route is `'/pte/dashboard'`.
- Mega menu targets are aligned with existing PTE routes; no backend changes required.

If you approve, I will implement these changes, create the minimal `components/mega-menu.tsx` only if necessary, and verify in the browser with responsive and accessibility checks.