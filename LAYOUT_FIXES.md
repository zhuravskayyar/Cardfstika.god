# CSS Layout Fixes - Bottom Nav Scroll + Unified Background

## Summary of Changes

All fixes have been applied to enable BottomNav to scroll with content and unify background image usage across all screens.

## Files Modified

### 1. **App.jsx** - Structure Fix
**Problem:** BottomNav was outside `game-screen__content`, preventing it from scrolling with content.

**Fix:** Moved BottomNav inside `game-screen__content` so it scrolls together with the page content.

```jsx
// BEFORE:
<GameScreen>
  <TopBar />
  <div className="game-screen__content">
    {screens[state.activeTab]}
  </div>
  <BottomNav />  {/* Outside, doesn't scroll */}
</GameScreen>

// AFTER:
<GameScreen>
  <TopBar />
  <div className="game-screen__content">
    {screens[state.activeTab]}
    <BottomNav />  {/* Inside, scrolls with content */}
  </div>
</GameScreen>
```

### 2. **GameScreen.css** - Content Scrolling
**Problem:** Reserved space for fixed bottom-nav with `padding-bottom: var(--bottom-nav-height)` and `overflow: hidden`.

**Fix:**
- Changed `overflow: hidden` → `overflow-y: auto; overflow-x: hidden`
- Changed `flex: 1` → `flex: 1 1 auto`
- Changed `padding-bottom: var(--bottom-nav-height)` → `padding-bottom: 0`

```css
.game-screen__content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 0;
}
```

### 3. **shop.css** - Banner Overlay & Structure
**Problem 1:** Banner overlay had heavy darkening (rgba 0.62 opacity).
**Problem 2:** `.shop-category` had old padding values for fixed menus.

**Fixes:**
- Reduced `.shop-banner__overlay` gradient opacity: `0.62 → 0.32` and `0.28 → 0.14`
- Ensured `.shop-category` has no bottom padding (was `128px`): now `padding: 6px 0 0`

```css
.shop-banner__overlay {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.32) 0%,      /* was 0.62 */
    rgba(0, 0, 0, 0.14) 52%,     /* was 0.28 */
    transparent 100%
  );
}

.shop-category {
  padding: 6px 0 0 !important;   /* was 6px 0 128px */
}
```

### 4. **CollectionsScreen.css** - Remove Fixed-Nav Padding
**Problem:** `.collections-panel` had `padding-bottom: 128px` for old fixed bottom-nav layout.

**Fix:**
- Changed `padding: 7px 10px 128px` → `padding: 7px 10px 0`
- Added `background: transparent !important`

```css
.collections-panel {
  min-height: 100%;
  padding: 7px 10px 0;
  background: transparent !important;
}
```

### 5. **DeckScreen.css** - Remove Fixed-Nav Padding
**Problem:** `.deck-panel` had `padding-bottom: 128px` for old fixed bottom-nav layout.

**Fix:**
- Changed `padding: 7px 10px 128px` → `padding: 7px 10px 0`
- Added `background: transparent !important`

```css
.deck-panel {
  min-height: 100%;
  padding: 7px 10px 0;
  background: transparent !important;
}
```

### 6. **BottomNav.css** - Image Scaling
**Problem:** Nav icons had too much scaling (`118%`) and offset (`translateY(8px)`), could cause clipping.

**Fix:**
- Changed width/height: `118% → 112%`
- Changed offset: `translateY(8px) → translateY(5px)`

```css
.bottom-nav__tab img {
  width: 112%;
  height: 112%;
  transform: translateY(5px);
}
```

### 7. **patch.css** (NEW) - Consolidated Fixes
Created a comprehensive patch file containing all layout fixes for documentation and easy reference.
- Ensures `.bottom-nav` is `position: relative` (not fixed)
- Confirms all screens use `--game-bg-image` background
- Removes all old safe-zone bottom padding
- Unifies overflow behavior

### 8. **main.jsx** - Import Patch
Added import for the new patch.css to ensure all fixes are loaded:
```jsx
import './styles/patch.css';
```

## Verification Checklist

✅ **BottomNav Structure**
- BottomNav is now inside `game-screen__content`
- Can scroll with content (not fixed overlay)

✅ **Scrolling Behavior**
- `.game-screen__content` has `overflow-y: auto`
- `padding-bottom: 0` (no space reservation)
- `.bottom-nav` uses `position: relative` + `flex: 0 0 96px`
- `margin-top: 16px` provides spacing from content

✅ **Background Image**
- All screens (GameScreen, Shop, Deck, Collections) use `--game-bg-image`
- No conflicting background colors

✅ **Visual Consistency**
- Banner overlay is subtle (reduced opacity)
- No extra padding creating blank spaces
- Images scale appropriately (`112%` instead of `118%`)

## Expected Behavior After Fixes

1. **Scrolling**: Content scrolls smoothly; BottomNav moves with it
2. **Background**: All screens show the same `bg.png` background image
3. **Space**: No extra blank space at bottom of screens
4. **Navigation**: BottomNav is always accessible, never hidden behind fixed elements
5. **Banners**: Shop banners are more visible with lighter overlay

## Testing Notes

- Test on mobile (mobile Safari, Chrome)
- Test scrolling on each screen (home, deck, collections, shop)
- Verify BottomNav is visible at all scroll positions
- Check background continuity across screens
