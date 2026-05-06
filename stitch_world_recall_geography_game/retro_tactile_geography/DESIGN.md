---
name: Retro-Tactile Geography
colors:
  surface: '#210e0b'
  surface-dim: '#210e0b'
  surface-bright: '#4c332f'
  surface-container-lowest: '#1b0907'
  surface-container-low: '#2b1613'
  surface-container: '#2f1a17'
  surface-container-high: '#3b2420'
  surface-container-highest: '#472f2b'
  on-surface: '#ffdad4'
  on-surface-variant: '#ebbbb4'
  inverse-surface: '#ffdad4'
  inverse-on-surface: '#422a27'
  outline: '#b18780'
  outline-variant: '#603e39'
  surface-tint: '#ffb4a8'
  primary: '#ffb4a8'
  on-primary: '#690100'
  primary-container: '#ff5540'
  on-primary-container: '#5c0000'
  inverse-primary: '#c00100'
  secondary: '#b9c3ff'
  on-secondary: '#002389'
  secondary-container: '#0038ca'
  on-secondary-container: '#aab8ff'
  tertiary: '#acc7ff'
  on-tertiary: '#002f67'
  tertiary-container: '#488fff'
  on-tertiary-container: '#00285b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930100'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b9c3ff'
  on-secondary-fixed: '#001356'
  on-secondary-fixed-variant: '#0034bf'
  tertiary-fixed: '#d7e2ff'
  tertiary-fixed-dim: '#acc7ff'
  on-tertiary-fixed: '#001a40'
  on-tertiary-fixed-variant: '#004491'
  background: '#210e0b'
  on-background: '#ffdad4'
  surface-variant: '#472f2b'
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  margin: 32px
---

## Brand & Style

This design system establishes a "Retro-Modern Board Game" aesthetic, merging the high-energy friction of 8-bit NES gaming with the premium, tactile weight of a physical tabletop experience. The brand personality is nostalgic yet polished, designed to evoke the excitement of unboxing a brand-new cartridge or unfolding a linen-finish world map. 

The style utilizes a **Tactile-Brutalist** hybrid approach:
- **NES-Era Energy:** High-saturation primaries and high-contrast borders reminiscent of classic 8-bit sprites and UI.
- **Physicality:** Every element is treated as a physical "tile" or "token" on a board, utilizing depth and hard shadows to create a sense of verticality.
- **Craftsmanship:** Subtle textures (linen, paper, halftone dots) bridge the gap between digital pixels and physical printed media.

## Colors

The palette is anchored by the aggressive, iconic Red and Blue of early console gaming, set against a deep "Night Forest" Navy that provides the premium backdrop for a geography-focused world map.

- **Primary Red & Blue:** Used for major UI actions, team designations, or "Player 1 vs Player 2" states.
- **Neon Mint:** Reserved exclusively for geographic markers, discovered countries, and successful identifications.
- **Bright Amber:** Used for UI highlights, notifications, and "Level Up" moments to ensure maximum visibility against the dark background.
- **Background:** The Navy background should never be flat; it requires a 5% opacity linen or paper texture overlay to simulate a heavy cardstock board.

## Typography

The typography strategy balances the "Cartridge Label" look with modern readability requirements. 

**Space Grotesk** is used for all headlines and major titles. Its geometric, slightly quirky terminals mimic the industrial design of late 80s tech and board game branding. It should always be set with tight tracking for a "locked-in" feel.

**Inter** handles all functional UI and body text. Because geography games involve reading many specific names and statistics, Inter provides the necessary clarity and neutral weight to balance the loud headline style. Labels should frequently use All-Caps with increased tracking to simulate the metadata printed on the side of a game box.

## Layout & Spacing

The layout follows a **Rigid Grid** philosophy. Elements should feel like they are snapped into a physical tray or slotted into a game board. 

- **The Grid:** Use a 12-column grid for desktop and a 4-column grid for mobile.
- **Rhythm:** All spacing and padding must be multiples of 4px. This "pixel-perfect" adherence reinforces the 8-bit retro theme.
- **The "Tray" Effect:** Large containers should have generous internal padding (24px+) to mimic the spacing found in plastic board game inserts. 
- **Halftone Overlays:** Apply a very subtle halftone dot pattern to large empty areas of the layout to prevent them from feeling "digitally empty."

## Elevation & Depth

This design system rejects ambient, soft shadows in favor of **Hard Physical Depth**.

- **Shadows:** Use 100% opacity or high-opacity (80%+) shadows with 0 blur. Offset shadows by 4px or 6px at a 45-degree angle to create a "thick tile" effect.
- **Borders:** Every interactive or container element must have a solid black (#000000) border between 2px and 4px thick. This defines the shape against the deep navy background.
- **Z-Axis Hierarchy:** Higher elevation is represented by larger shadow offsets and thicker borders, not by lighter background colors. Elements on the "board" (the background) have no shadow; elements "floating" above (cards, menus) have the largest offsets.

## Shapes

Shapes are defined by the "Tile" metaphor. 

- **Corner Radius:** Standard interactive elements use a 10px radius. This is rounded enough to feel friendly like a plastic game piece, but sharp enough to maintain a modern, geometric edge.
- **The Pressed State:** When an element is active or pressed, its shadow offset should decrease to 0, and the element should translate visually along the Y-axis to simulate physical compression into the board.
- **Cut-outs:** Progress bars and input wells should use "inner shadows" or inset borders to look like carved-out sections of the board.

## Components

### Buttons
Buttons are the most tactile element in the system. They feature a 3D effect created by a bottom border/shadow that is darker than the surface color. On hover, the button scales slightly (1.02x). On click, the button shifts down and the shadow disappears to signal a "click-in."

### Game Cards
Cards represent countries or regions. They should feature a thick 4px white or black border, a linen texture overlay, and use the "Headline" typography for the title. The "Neon Mint" accent is used for the card header if the country has been "captured" or "named."

### Chips & Markers
Used for status indicators or categories. These are perfectly circular or pill-shaped, using high-contrast background colors (Amber or Red) with white text.

### Progress Bars
Designed to look like "Health Bars" from an 8-bit RPG. They are chunky, have 0px or 2px radius, and fill with a solid, non-gradient color (usually Neon Mint).

### Input Fields
Inputs should look like "Console Command" lines. Dark navy backgrounds with a 2px white border. The cursor should be a solid block (halftone or solid color) to reinforce the retro terminal feel.

### Map Pins
Markers on the world map should be high-contrast "tokens." They should have a heavy black outline and a small hard-drop shadow so they appear to be sitting on top of the map surface.