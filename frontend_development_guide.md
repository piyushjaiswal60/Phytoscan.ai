# Phyto Scan - React Frontend Strict Development Specification

## 1. Project Overview
Create a highly professional, enterprise-grade, and responsive front-end web application for the "Phyto Scan" project. The application allows users to upload plant images, select specific AI models, and receive disease/classification predictions. The final output must be completely free of visual glitches, layout breaks, and state inconsistencies.

## 2. Tech Stack Requirements
* **Framework:** React 18+ (Use Vite).
* **Styling:** Tailwind CSS (utility-first).
* **Icons:** `lucide-react`.
* **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`). 
* **Animation/Transitions:** Framer Motion (optional but recommended for smooth mounting) or strict Tailwind `transition` classes.

## 3. Strict UI/UX & Layout Guidelines

### A. Layout Structure & Placement
* **Container:** The app should use a centered, max-width layout (e.g., `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8`).
* **Header:** Sticky or fixed top navigation with a glassmorphism effect (backdrop blur) containing the Phyto Scan logo on the left and the Theme Toggle on the right.
* **Main Content Area:** Use a CSS Grid layout. On desktop (`md:` or `lg:`), place the **Image Upload** panel on the left (spanning 1 column) and the **Controls/Results** panel on the right (spanning 1 column). On mobile, these should stack vertically with adequate gap spacing (`gap-6` or `gap-8`).

### B. Professional Aesthetics (Borders, Shadows, and Radii)
* **Borders:** Do not use harsh black borders. Use subtle, refined borders: `border border-gray-200` for light mode and `border-gray-800` or `border-slate-700/50` for dark mode.
* **Border Radius:** Use consistent, modern rounding. Cards and upload zones should use `rounded-2xl` or `rounded-3xl`. Buttons should be `rounded-xl` or `rounded-full`.
* **Shadows:** Apply deep, soft shadows to interactive cards to create depth without looking cheap (`shadow-lg`, `shadow-slate-200/50` in light mode, `shadow-none` in dark mode).

### C. Flawless Theme Management (Dark/Light Mode)
* **Smooth Transitions:** **CRITICAL:** Every interactive element and background MUST include `transition-colors duration-300 ease-in-out` so that switching between dark and light themes fades smoothly rather than flashing instantly and looking broken.
* **Light Theme Palette:** 
  * Background: `bg-slate-50` or `bg-gray-50`.
  * Cards: `bg-white`.
  * Text: `text-slate-900` (primary), `text-slate-500` (secondary).
* **Dark Theme Palette:**
  * Background: `bg-slate-950` or `bg-[#0B0F19]`.
  * Cards: `bg-slate-900` or `bg-[#111827]`.
  * Text: `text-slate-50` (primary), `text-slate-400` (secondary).

## 4. Component & Glitch-Prevention Instructions

### A. Image Upload Interface
* **Dashed Border:** Use a beautifully styled dashed border `border-2 border-dashed border-primary-500/50`. Highlight the border on hover or drag-over events (`hover:bg-primary-50 dark:hover:bg-primary-900/10`).
* **Aspect Ratio:** Maintain a consistent aspect ratio (`aspect-video` or `aspect-square`) for the uploaded image preview using `object-cover` so the UI doesn't stretch or break regardless of the image dimensions.

### B. Model Selection State
* **UI Element:** Use visually distinct, toggleable cards or a segmented control switch for selecting models.
* **Glitch Prevention:** 
  * Ensure the state enforces that *at least one* model is selected at all times. Do not allow the user to uncheck all models (which would crash the backend request).
  * If the user switches models *after* a prediction is already displayed, automatically clear the old results to prevent the user from associating old predictions with the newly selected model.

### C. Robust Prediction Button & Loading States
* **Disabled States:** The "Scan" button MUST be fully disabled (`opacity-50 cursor-not-allowed`) if no image is uploaded.
* **Loading Protection:** When the prediction is running, the button must switch to a loading state with a spinner, and all inputs (upload zone, model toggles) MUST be temporarily disabled so the user cannot trigger conflicting duplicate requests or change parameters mid-scan.

### D. Error Handling
* If the API fails, display a beautifully styled, non-intrusive error banner or toast notification (red/rose color scheme) explaining the issue, rather than breaking the UI or showing raw console errors.

## 5. Execution Instructions for the AI Coding Agent
1. Read the strict layout and color specifications above.
2. Build the React UI ensuring `transition-all duration-300` is applied globally to background and text colors to ensure the dark mode switch is buttery smooth.
3. Implement strict state management: Clear results on new image upload, disable buttons during loading, and catch all API errors gracefully.
4. Output the complete, production-ready React code (you may combine it into a single highly structured file for ease of use) ensuring no default browser styling overrides the custom elegant design.