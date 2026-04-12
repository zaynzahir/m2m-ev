# Design System Specification: The Ethereal DePIN Interface

## 1. Overview & Creative North Star: "The Digital Observatory"
This design system is built for M2M, a Solana-based DePIN project that demands an interface as sophisticated as its underlying infrastructure. Our Creative North Star is **"The Digital Observatory."** We are not building a dashboard; we are creating a window into a decentralized machine network.

To break the "template" look, we move away from rigid, boxed grids in favor of **Intentional Layering**. Elements should feel as though they are floating in a deep, void-like space. We achieve this through:
*   **Asymmetric Breathing Room:** Using large gaps from our Spacing Scale (`20`, `24`) to give high-value data points gravity.
*   **Overlapping Translucency:** Components should rarely sit side-by-side on a flat plane; they should overlap, allowing the `backdrop-blur` to create a sense of three-dimensional depth.
*   **Tonal Authority:** High-contrast typography scales (e.g., `display-lg` paired with `label-sm`) create an editorial feel that screams "Premium."

---

## 2. Colors & Surface Philosophy
The palette is rooted in the deep void of space, punctuated by the electric pulse of the Solana ecosystem.

### The Palette
*   **Core Background:** `background` (`#0e0e11`) — A rich, near-black slate.
*   **Primary Accent:** `primary` (`#34fea0`) — The "Solana Green" pulse.
*   **Secondary Accent:** `secondary` (`#b984ff`) — The "Solana Purple" depth.
*   **Surface Hierarchy:** 
    *   `surface_container_lowest`: Use for the deepest background layers.
    *   `surface_container_high`: Use for primary glass cards.
    *   `surface_bright`: Use for active, hovering, or highlighted states.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Boundaries must be defined solely through background color shifts. To separate a "Node Status" section from the "Earnings" section, place the status in a `surface_container_low` block against the `background` floor. Use vertical white space (`spacing-12` or `spacing-16`) instead of dividers.

### The Glass & Gradient Rule
All floating containers must use the **Glassmorphism Spec**:
*   **Fill:** `surface_container_highest` at 40%–60% opacity.
*   **Effect:** `backdrop-filter: blur(20px)`.
*   **Signature Texture:** Use a linear gradient (`primary` to `secondary`) at 10% opacity as a subtle overlay on large glass cards to provide a "chromatic aberration" effect found in high-end lens glass.

---

## 3. Typography
We use a dual-font strategy to balance technical precision with editorial elegance.

*   **Display & Headlines (Manrope):** Used for data highlights and section titles. The wider apertures of Manrope feel futuristic and expansive.
    *   *Usage:* `display-lg` for total network earnings; `headline-sm` for card titles.
*   **Body & Labels (Inter):** Used for all functional reading and micro-copy. Inter’s tall x-height ensures legibility even when rendered over complex glass backgrounds.
    *   *Usage:* `body-md` for descriptions; `label-sm` for "M2M" hardware IDs.

**Hierarchy Strategy:** Always pair a large headline with a significantly smaller, high-tracking (`letter-spacing: 0.05em`) label to create an "Architectural" feel.

---

## 4. Elevation & Depth: Tonal Layering
Depth is not a shadow; it is a relationship between light and opacity.

*   **The Layering Principle:** Stack `surface-container` tiers. A `surface-container-highest` card should sit atop a `surface-container-low` section. This creates a soft, natural lift.
*   **Ambient Shadows:** For "Floating" elements (Modals, Popovers), use a custom shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(52, 254, 160, 0.05)`. The hint of `primary` in the shadow mimics the glow of a hardware LED.
*   **The "Ghost Border":** If accessibility requires a border, use `outline_variant` at 15% opacity. It should look like a caught reflection on the edge of a glass pane, not a stroke.

---

## 5. Components

### Buttons (The "Core Glow")
*   **Primary:** Fill with a gradient (`primary` to `primary_container`). Use a subtle outer glow (`box-shadow`) of the same color at 20% opacity. Shape: `rounded-full`.
*   **Secondary (Glass):** No fill. `backdrop-blur(10px)`. `Ghost Border` (20% white). Text color: `on_surface`.
*   **Tertiary:** Ghost button. Text only in `primary_fixed`, uppercase, `label-md`.

### Glassmorphic Cards
*   **Structure:** No dividers. Use `spacing-5` for internal padding. 
*   **Header:** `title-md` text.
*   **Footer:** Use a `surface_variant` background at the bottom 20% of the card to house actions, creating a "docked" appearance.

### Input Fields
*   **Default:** `surface_container_lowest` fill, `rounded-md`.
*   **Focus:** Border shifts to 40% `primary`. No "heavy" focus rings; instead, increase the `backdrop-blur` intensity.

### DePIN Specific: Status Nodes
*   **Active:** A pulsing `primary` glow behind a 4px circular dot.
*   **Inactive:** `inverse_on_surface` flat dot.

---

## 6. Do's and Don'ts

### Do:
*   **Do** embrace negative space. If a layout feels "crowded," double the spacing token.
*   **Do** use `primary` and `secondary` gradients sparingly—only for the most important CTAs or data peaks.
*   **Do** ensure text contrast ratios are met by increasing the opacity of glass backgrounds under body text.

### Don't:
*   **Don't** use pure white (#FFFFFF). Use `on_surface` (`#f0edf1`) to maintain the "dark room" aesthetic.
*   **Don't** use 90-degree corners. Use `rounded-lg` or `rounded-xl` for all containers to soften the futuristic look.
*   **Don't** use standard "Drop Shadows" from a library. Use the Ambient Shadow spec to ensure the UI feels lit from within.

---

*Director's Note: Every pixel in this system should feel like it was machined from a single block of obsidian and light. If an element looks "default," it doesn't belong.*