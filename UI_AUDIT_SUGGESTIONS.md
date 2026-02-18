# OAK Estimator - Comprehensive UI Audit & Improvement Suggestions

**Date:** 2026-02-18
**Scope:** Full React application (`oak-estimator-react/`)
**Audited Components:** 58 React components, 4 contexts, 16 UI primitives, all CSS/styling

---

## Executive Summary

OAK Estimator is a well-built construction cost estimation tool using React 19, TypeScript, Tailwind CSS, and Radix UI. The foundation is solid, but the UI suffers from **feature overload**, **toolbar clutter**, **hidden discoverability**, and **inconsistent information hierarchy**. The suggestions below are organized from highest-impact to lowest.

---

## 1. TOOLBAR OVERLOAD (Critical)

**Problem:** The desktop toolbar (`DesktopToolbar` in `EstimatorApp.tsx:136-279`) crams **20+ icon buttons** into a single horizontal row split across three groups. Most buttons are icon-only with no labels, making them indistinguishable to new users.

**Specific issues:**
- Left group: 8 icon buttons (Dashboard, Undo, Redo, Divisions, Folders, Duplicate, Version History, Attachments)
- Center group: 7 buttons (Materials Catalog, Library, Assembly Manager, Schedule, Labor Rates, Change Orders, Profit Chart)
- Right group: 4 buttons (Import, Export, Share, Keyboard Shortcuts)
- Plus a floating `ProjectTotalBadge` at the far right

**Suggestions:**
- **Group related actions into dropdown menus** instead of individual buttons. For example:
  - "Project" menu: Duplicate, Folders, Version History, Attachments
  - "Tools" menu: Materials Catalog, Assembly Library/Manager, Schedule, Labor Rates, Change Orders, Profit Chart
  - "Data" menu: Import, Export, Share
- **Keep only the most-used actions as standalone buttons:** Undo/Redo, Dashboard, Divisions, and the Project Total badge
- **Add text labels** to the remaining standalone buttons (not just icons)
- This would reduce the toolbar from ~20 buttons to ~6 buttons + 3 dropdown menus

---

## 2. SUMMARY PANEL DISCOVERABILITY (High)

**Problem:** The Cost Summary is the single most important output of the app, yet it's hidden behind an overlay panel that requires clicking the `ProjectTotalBadge` to open (`EstimatorApp.tsx:273-276`). Users have no persistent visibility into their estimate total while editing line items.

**Suggestions:**
- **Show a persistent mini-summary bar** below the toolbar (or pinned to the bottom) that always displays: Subtotal, Markup, Tax, and Total Cost
- Clicking the mini-summary should expand the full summary panel
- On desktop screens wider than 1440px, consider a **persistent right sidebar** layout instead of an overlay
- The current `ProjectTotalBadge` is a great start - extend it to include subtotal and a one-click expand

---

## 3. LINE ITEMS TABLE - INFORMATION DENSITY (High)

**Problem:** The `LineItemsTable` (`LineItemsTable.tsx`) shows 9 columns (checkbox, division, description, type, quantity, unit, unit cost, total, actions). On most screens, the Division dropdown with long names (`01 - General Requirements`) consumes disproportionate width, and the Type column is rarely changed after initial entry.

**Suggestions:**
- **Use division code only** in the table (e.g., "01" instead of "01 - General Requirements"), show full name on hover/tooltip
- **Make the Type column collapsible/hidden by default** since most users set it once. Show a color-coded dot or badge instead (e.g., green dot for Material, blue for Labor)
- **Add a "Notes" column toggle** - currently notes are only editable in the AddLineItemDialog but not visible in the table
- **Show row numbers** to help users reference specific line items in conversations
- **Add inline row total highlight** - make the Total column more visually prominent (bold, slightly larger, or a subtle background color)
- **Consider a column visibility toggle** (like spreadsheet apps) so users can show/hide columns they need

---

## 4. QUICK ADD ROW UX (High)

**Problem:** The `QuickAddRow` (`QuickAddRow.tsx`) requires clicking "Quick Add Row" to activate, then filling all fields inline. The collapsed state shows a dashed border button that looks like a secondary action rather than a primary workflow.

**Suggestions:**
- **Keep the Quick Add Row always visible** (not collapsed behind a button). Many estimators enter items rapidly and the extra click to activate adds friction
- **Auto-focus the Description field** and support Tab-through navigation across fields
- **Show a preview of the calculated total** as the user types quantity and cost (already implemented, good)
- **Add an "Enter to add, then keep adding" flow** - after pressing Enter, the row should clear and stay focused for the next entry (partially implemented but could be more prominent)
- **Visually differentiate the Quick Add Row** more - use a subtle highlight/background to make it obvious it's the entry point

---

## 5. NAVIGATION & WAYFINDING (High)

**Problem:** The app has two separate "views" (Dashboard vs. Project workspace) but no clear navigation hierarchy. The Dashboard button is just another icon in the toolbar. The Header shows the project name but there's no breadcrumb or clear way to understand where you are.

**Suggestions:**
- **Add breadcrumb navigation** below the header: `Dashboard > [Project Name]`
- **Make the project name clickable** to return to a project list/dashboard (instead of requiring a separate button)
- **Add a clear "Back to Dashboard" link** visible at all times, not just as an icon button
- **Show the project status** (Draft, Sent, Approved) prominently next to the project name in the header
- **Add a "Getting Started" stepper** for new projects: Step 1: Company Settings, Step 2: Project Details, Step 3: Add Line Items, Step 4: Review Summary

---

## 6. MOBILE EXPERIENCE (High)

**Problem:** Mobile users face a `MobileBottomSheet` (`EstimatorApp.tsx:281-351`) with 15 action buttons in a 4-column grid. This is essentially the same toolbar clutter as desktop, just reformatted. The FAB (Floating Action Button) at bottom-right competes with the content area.

**Suggestions:**
- **Reduce the mobile bottom sheet to 6-8 essential actions**: Add Item, Summary, Export, Import, Share, Settings
- **Move less-used tools** (Assembly Library, Labor Rates, Change Orders, Profit Chart) behind a "More Tools" submenu
- **Replace the FAB with a bottom tab bar** (4 tabs): Items, Summary, Tools, Settings - this is the standard mobile pattern for apps with multiple views
- **Optimize the mobile card layout** for line items - the current 3-column grid (Qty, Unit Cost, Total) is good, but add swipe-to-delete instead of requiring a dedicated trash button per row
- **Make the mobile summary panel sticky** at the top or bottom rather than an inline toggle

---

## 7. EMPTY STATES & ONBOARDING (Medium)

**Problem:** The welcome state (`EstimatorApp.tsx:440-464`) shows a generic "Welcome to OAK Estimator" card with a single "Create Your First Project" button. There's no guidance on what the tool does or how to use it.

**Suggestions:**
- **Add a feature tour/walkthrough** for first-time users using a lightweight tooltip-based guide (e.g., pointing to toolbar, table, summary)
- **Show sample/demo project** - offer a "Load Demo Project" button so users can immediately see the app in action with pre-populated data
- **Improve the empty state for Line Items** - currently shows "No line items yet. Click Add Item to get started." Add quick-start suggestions:
  - "Start from a template" button
  - "Import from Excel" button
  - "Browse Materials Catalog" button
- **Add contextual empty states** per feature (e.g., when opening the Assembly Library for the first time)

---

## 8. VISUAL HIERARCHY & SPACING (Medium)

**Problem:** The dark theme (`index.css`) uses very subtle contrast differences between backgrounds (8%, 11%, 13%, 14% lightness), making it hard to distinguish card boundaries, input fields, and interactive areas.

**Suggestions:**
- **Increase contrast between card backgrounds and the page background** - bump card from 11% to 13-14% lightness, or add a more visible border
- **Make interactive elements more prominent** - input fields at 14% lightness on an 11% card are nearly invisible until focused. Add a slightly brighter border or 1px inset shadow
- **Use the orange primary color more strategically** - currently it's used for the logo, focus rings, and scattered buttons. Consider using it consistently for:
  - Primary CTAs (Add Item, Save, Export)
  - The total cost display
  - Progress indicators
- **Reduce the number of font sizes** - the app uses text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl. Standardize to 3-4 sizes for a cleaner hierarchy
- **Add more visual separation between toolbar sections** - use a thin vertical divider or more spacing between the left/center/right button groups

---

## 9. HEADER COMPLEXITY (Medium)

**Problem:** The `Header` (`Header.tsx:21-301`) packs too many elements into a 64px-high bar: logo, project name with edit button, company settings button, settings button, projects dropdown, and user avatar dropdown. The company settings button uses the same `Building2` icon as the logo, creating confusion.

**Suggestions:**
- **Remove the Company Settings button from the header** - move it into the Settings dialog or make it accessible from the Project Details dialog
- **Simplify the user avatar dropdown** - currently it only has "Sign out". Either add more options (Profile, Preferences, Help) or remove the dropdown and just show a sign-out icon
- **Use a different icon for Company Settings** - `Building2` is already the app logo. Use `Briefcase`, `Shield`, or `Building` instead
- **Make the project name more prominent** - increase font size and remove the muted background container. It's the most important piece of context
- **Consider moving the Projects dropdown** to a sidebar or dedicated view instead of a header dropdown that's limited to 320px height

---

## 10. FORM & DIALOG CONSISTENCY (Medium)

**Problem:** The app has 10+ dialog components, each with slightly different layout patterns. Some have section headers (`ProjectDetailsDialog`), some don't. Some use grid layouts, others use stacked layouts. The "Save" button placement varies.

**Suggestions:**
- **Standardize dialog layout**: Header with icon + title + description, then content, then footer with Cancel/Save buttons (always bottom-right, always same order)
- **Use consistent section grouping** - adopt the `ProjectDetailsDialog` pattern everywhere: uppercase tracking-wider section headers with dividers
- **Standardize dialog widths**: Small (max-w-md) for confirmations, Medium (max-w-lg) for simple forms, Large (max-w-3xl) for complex forms
- **Add unsaved changes warnings** - currently `ProjectDetailsDialog` tracks `isDirty` but other dialogs don't. Warn users when closing a dialog with unsaved changes

---

## 11. COST SUMMARY CARD (Medium)

**Problem:** The `SummaryCard` (`SummaryCard.tsx`) uses emoji icons for cost categories (box, construction worker, tractor, handshake, clipboard) which look unprofessional in a construction estimation tool and render inconsistently across platforms.

**Suggestions:**
- **Replace emoji icons with Lucide icons** - use `Package`, `HardHat`/`User`, `Truck`, `Handshake`, `ClipboardList` for consistent, professional appearance
- **Add a visual bar chart** next to cost categories showing relative proportions (like the Dashboard status bars)
- **Make the markup/tax editing more obvious** - the current click-to-edit pattern with a tiny `Edit2` icon is easily missed. Use an always-visible input with a % suffix, or a slider
- **Add cost per square foot** calculation if project area is provided - this is a standard metric in construction estimation
- **Show a visual indicator** when costs change (brief highlight/flash animation)

---

## 12. DARK-ONLY THEME (Medium)

**Problem:** The app only supports a dark theme (`index.css` line 9: `color-scheme: dark`). While dark themes are popular, many construction professionals work in bright environments (job sites, well-lit offices) where dark themes cause eye strain.

**Suggestions:**
- **Add a light theme option** with a toggle in Settings. The `ThemeContext.tsx` already exists but only supports dark mode
- **Add an "Auto" mode** that follows the OS system preference via `prefers-color-scheme`
- **As a minimum**, ensure the PDF/print exports use light backgrounds with dark text (currently handled via print CSS)

---

## 13. KEYBOARD SHORTCUTS DISCOVERABILITY (Low)

**Problem:** Keyboard shortcuts are documented in a separate dialog (`KeyboardShortcutsDialog`), but users must find and open it to learn them. Shortcuts are not shown inline in tooltips or menus.

**Suggestions:**
- **Show shortcuts in button tooltips** - e.g., the Undo button tooltip should read "Undo (Ctrl+Z)" (partially done in `title` attributes but inconsistently)
- **Show shortcuts in dropdown menu items** - when shortcuts exist for menu actions, display them right-aligned in the menu item (standard desktop pattern)
- **Add a first-use hint** - on the first visit, show a subtle banner: "Tip: Press Ctrl+Z to undo, Ctrl+N for new project. See all shortcuts with Ctrl+/"

---

## 14. LOGIN SCREEN (Low)

**Problem:** The `LoginScreen` (`LoginScreen.tsx`) only offers Google Sign-In. It shows a vague "Terms of Service and Privacy Policy" text that isn't linked to actual documents.

**Suggestions:**
- **Add email/password authentication** as an alternative (many construction companies restrict Google account usage)
- **Link the Terms of Service and Privacy Policy** to actual documents or remove the text
- **Add a brief feature showcase** below the sign-in button (3 key features with icons) so users understand the value before signing in
- **Show a background image** or subtle construction-themed illustration instead of plain gradient

---

## 15. DIVISION SIDEBAR (Low)

**Problem:** The `DivisionSidebar` (`DivisionSidebar.tsx`) shows all CSI divisions as a flat list of buttons, regardless of whether they have any items. This creates a very long list (23 divisions) where most entries show "0" items.

**Suggestions:**
- **Show only divisions with items by default**, with a "Show all divisions" toggle at the bottom
- **Group divisions into categories** (e.g., "Site Work", "Structure", "Finishes", "MEP") with collapsible sections
- **Add a search/filter** within the division list for quick navigation
- **Show a mini cost breakdown** per division (total cost, not just item count)
- **Use color-coded badges** for item counts (e.g., green for populated divisions)

---

## 16. ACCESSIBILITY IMPROVEMENTS (Low but Important)

**Current gaps found:**
- The `OverlaySidePanel` (`EstimatorApp.tsx:354-394`) lacks `role="dialog"` and `aria-modal="true"` attributes
- The `MobileBottomSheet` wraps some components in `<div onClick={onClose}>` which is not keyboard accessible
- The table uses custom checkbox buttons (`Square`/`CheckSquare` icons) instead of native checkboxes - these need explicit `role="checkbox"` and `aria-checked` attributes
- Focus is not trapped in overlay panels (users can tab behind the overlay)
- No skip-to-content link for keyboard navigation
- Color contrast for `--muted-foreground` (55% lightness on 8% background) may not meet WCAG AA for small text

**Suggestions:**
- Add `role="dialog"`, `aria-modal="true"`, and focus trapping to `OverlaySidePanel`
- Use `role="checkbox"` with `aria-checked` on custom checkbox buttons
- Add a "Skip to main content" link at the top of the page
- Add `aria-live="polite"` regions for dynamic updates (toast notifications, total cost changes)
- Verify all color contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large text)

---

## 17. PERFORMANCE-RELATED UI SUGGESTIONS

- **Add loading skeletons** for the Dashboard cards and Line Items table during initial data fetch
- **Add a progress indicator** for bulk operations (bulk delete, import)
- **Show a "Saving..." indicator** in the header or toolbar when debounced Firestore writes are pending
- **Lazy-load dialog components** - many dialogs (Assembly Library, Materials Catalog, Client Report) are heavy. Load them only when opened

---

## Summary of Priority Actions

| Priority | Suggestion | Impact | Effort |
|----------|-----------|--------|--------|
| P0 | Consolidate toolbar into dropdown menus | Very High | Medium |
| P0 | Make cost summary persistently visible | Very High | Low |
| P1 | Simplify mobile bottom sheet | High | Low |
| P1 | Add breadcrumb/navigation hierarchy | High | Low |
| P1 | Always show Quick Add Row | High | Low |
| P1 | Simplify line items table columns | High | Medium |
| P2 | Replace emoji icons with Lucide icons | Medium | Low |
| P2 | Improve empty states & onboarding | Medium | Medium |
| P2 | Increase contrast in dark theme | Medium | Low |
| P2 | Simplify header | Medium | Low |
| P2 | Standardize dialog layouts | Medium | Medium |
| P2 | Add light theme option | Medium | High |
| P3 | Show keyboard shortcuts in tooltips | Low | Low |
| P3 | Improve Division Sidebar filtering | Low | Medium |
| P3 | Accessibility improvements | Low visual, High compliance | Medium |
| P3 | Add loading states & skeletons | Low | Medium |
