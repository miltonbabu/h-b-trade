# Plan: Mobile Bottom Tab Navigation with Glassmorphism

## Summary

Add a mobile-only bottom tab navigation bar (fixed, non-movable) with glassmorphism/glass-liquid-morphism style. Content scrolls while tabs remain fixed at the bottom. This creates a native mobile-app feel.

## Current State

- **Layout** (`src/app/layout.tsx`): Wraps `<Navbar />` + `{children}` + `<Footer />`
- **Navbar** (`src/components/layout/Navbar.tsx`): Sticky top bar with desktop nav links (Home, About, Services, Product Request, Track Shipment, Contact)
- **Footer** (`src/components/layout/Footer.tsx`): Standard page footer
- **CSS** (`src/app/globals.css`): Already has `.glass`, `.safe-area-inset-bottom`, mobile-responsive utilities
- **No existing bottom tab bar** — this is a new component

## Proposed Changes

### 1. Create `src/components/layout/MobileBottomTabs.tsx` (NEW)

**What:** A `"use client"` component with 5 tab buttons fixed to the bottom of the screen.

**Tabs:**
| Tab | Icon (lucide-react) | Route |
|-----|---------------------|-------|
| Home | `Home` | `/` |
| Products | `ShoppingCart` | `/wholesale-products` |
| Request | `PlusCircle` | `/product-request` |
| Track | `Package` | `/tracking` |
| Contact | `Phone` | `/contact` |

**Glassmorphism Style:**
```css
.bottom-tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  
  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 -8px 32px rgba(13, 148, 136, 0.08);
  
  /* Safe area */
  padding-bottom: env(safe-area-inset-bottom);
}

/* Active tab */
.tab-active {
  color: hsl(var(--primary));
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.12), rgba(249, 115, 22, 0.08));
  border-radius: 12px;
}

/* Inactive tab */
.tab-inactive {
  color: #9ca3af;
}
```

**Key behaviors:**
- `position: fixed; bottom: 0` — stays non-movable
- Active tab detection via `usePathname()` from `next/navigation`
- Smooth transition on tab switch (scale + color transition)
- Only visible on mobile: `md:hidden`

### 2. Update `src/app/layout.tsx` (EDIT)

**What:** Insert `<MobileBottomTabs />` between `{children}` and `<Footer />`, inside the `<CartProvider>`.

**Change:**
```tsx
// Add import
import MobileBottomTabs from '@/components/layout/MobileBottomTabs';

// Add before Footer
<main className="flex-1 pb-16 md:pb-0">
  {children}
</main>
<MobileBottomTabs />
<Footer />
```

**Why `pb-16 md:pb-0`:** Prevents content from being hidden behind the fixed bottom tabs on mobile.

### 3. Update `src/app/globals.css` (EDIT)

**What:** Add dedicated CSS for the bottom tabs glassmorphism and micro-interactions.

**Add:**
```css
/* Bottom Tab Navigation - Glassmorphism */
.mobile-tab-bar {
  @apply fixed bottom-0 left-0 right-0 z-50 md:hidden;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 -8px 32px rgba(13, 148, 136, 0.08);
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-tab-active {
  @apply relative;
  color: hsl(var(--primary));
}

.mobile-tab-active::before {
  content: '';
  @apply absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full;
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)));
}

.mobile-tab-icon {
  @apply transition-all duration-300 ease-out;
}

.mobile-tab-active .mobile-tab-icon {
  @apply scale-110;
  filter: drop-shadow(0 2px 4px rgba(13, 148, 136, 0.3));
}
```

## Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Tab count | 5 tabs | Covers all key user journeys: home, browse, request, track, contact |
| Active indicator | Top colored dot + color change | Minimal, elegant, mobile-app-like |
| Visibility | `md:hidden` only | Desktop already has top navbar |
| Glass opacity | 72% | Semi-transparent but readable over any content |
| Icons | lucide-react (already in project) | Consistent with existing code |
| Padding strategy | `pb-16` on main + `safe-area-inset-bottom` on tabs | Handles both regular and notched devices |

## Files to Change

| File | Action |
|------|--------|
| `src/components/layout/MobileBottomTabs.tsx` | **CREATE** — new component |
| `src/app/layout.tsx` | **EDIT** — add import + component + pb-16 |
| `src/app/globals.css` | **EDIT** — add bottom tab styles |

## Verification

1. Visit `https://hbtrade.ltd` on mobile/phone — see 5 bottom tabs
2. Scroll page content — tabs stay fixed at bottom
3. Tap each tab — navigates to correct page, active tab highlights
4. Switch to desktop/tablet — tabs disappear, normal navbar shows
5. Content never hides behind tabs (no clipping)
6. Glassmorphism effect visible — semi-transparent, blurred background seen through tabs