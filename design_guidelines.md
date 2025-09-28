## Design Approach Documentation

**Selected Approach:** Reference-Based Design inspired by healthcare and productivity tools like Linear, Notion, and modern healthcare applications. The application is utility-focused with clear information hierarchy and efficient workflows for ASHA workers.

**Key Design Principles:**
- Clarity and efficiency for rural healthcare workers
- Visual status indicators with color-coding system
- Touch-friendly interface for mobile-first usage
- Cultural sensitivity with local language support

## Core Design Elements

### A. Color Palette
**Primary Colors (Dark Mode):**
- Background: 15 15% 10% (rich dark slate)
- Surface: 20 12% 15% (elevated cards)
- Primary: 210 90% 60% (healthcare blue)
- Text: 0 0% 95% (soft white)

**Primary Colors (Light Mode):**
- Background: 210 20% 98% (clean white)
- Surface: 210 15% 95% (card background)
- Primary: 210 85% 55% (healthcare blue)
- Text: 220 15% 15% (dark gray)

**Status Colors:**
- Success (Complete): 142 76% 36% (medical green)
- Warning (Pending): 45 93% 47% (alert amber)
- Error (Critical): 0 84% 60% (urgent red)
- Info: 210 90% 60% (system blue)

### B. Typography
**Font System:** Inter (Google Fonts)
- Headers: Inter 600-700 (semibold-bold)
- Body: Inter 400-500 (regular-medium)
- Captions: Inter 400 (regular)

**Hierarchy:**
- Page titles: text-2xl font-semibold
- Section headers: text-lg font-medium
- Body text: text-base font-normal
- Labels: text-sm font-medium

### C. Layout System
**Tailwind Spacing Primitives:** 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, m-2 (form elements)
- Standard spacing: p-4, gap-4 (cards, sections)
- Generous spacing: p-8, mb-12 (page sections)

**Grid System:**
- Mobile-first: Single column with full-width cards
- Dashboard grid: 2x3 grid for main navigation buttons
- Cards: Consistent p-6 padding with rounded-lg borders

### D. Component Library

**Navigation Elements:**
- Main dashboard: 6-button grid with large icons and labels
- Bottom tab bar: Home, Reports, Profile, Settings
- Language toggle: Top-right corner dropdown

**Data Display:**
- Summary cards: Elevated surfaces with count animations
- Patient lists: Row-based layout with status indicators
- Forms: Clean input styling with proper labels

**Interactive Elements:**
- Primary buttons: Filled style with primary color
- Secondary buttons: Outline style with subtle borders
- FAB (Add): Floating action button bottom-right
- Status badges: Color-coded pills for health conditions

**Feedback Systems:**
- Alert strip: Horizontal banner for notifications
- Toast messages: Corner notifications for actions
- Loading states: Skeleton loaders for data fetching

### E. Animations
**Subtle Micro-Interactions Only:**
- Card entrance: Staggered fade-in with slight translate-y
- Count animation: Number increment from 0 to actual value
- Button press: Gentle scale feedback
- Page transitions: Slide animations between sections

## Images Section
**No large hero image required.** This is a utility application focused on data management.

**Icon Requirements:**
- Use Heroicons for consistent iconography
- Health-specific icons: 🏠 (families), 👩‍🍼 (pregnancy), 👶 (children), 🩺 (patients)
- Status indicators: Colored dots or badges
- Navigation icons: Simple line-style icons

**Avatar/Profile Images:**
- Default user avatar placeholder for ASHA worker profile
- No patient photos required for privacy compliance

## Special Considerations

**Accessibility:**
- High contrast ratios for rural lighting conditions
- Large touch targets (minimum 44px)
- Clear visual hierarchy with consistent spacing
- Support for screen readers in local languages

**Cultural Adaptation:**
- RTL text support capability
- Color sensitivity (avoid cultural taboos)
- Simple iconography that translates across languages
- Respectful representation of health conditions

**Offline-First Visual Feedback:**
- Connection status indicator
- Sync progress indicators
- Local data badges to show offline capability
- Clear visual distinction between synced/unsynced data