# Agentic SDLC Landing Page Specification

## Project Overview
- **Project Name:** Agentic SDLC Landing Page
- **Type:** Marketing landing page
- **Core Functionality:** Showcase the Agentic SDLC project with compelling visuals, feature highlights, and quick start commands
- **Target Users:** Developers, DevOps engineers, AI/ML practitioners

## Design Theme
**Dark Future Tech** - High contrast, deep backgrounds, glowing accents

### Color Palette (Adjusted per requirements)
- **Background:** #0B1120 (Deep Navy/Black)
- **Surface:** #1E293B (Slate 800)
- **Primary Accent:** #6366F1 (Indigo) - as specified by user
- **Secondary Accent:** #10B981 (Emerald) - green, not blue/purple
- **Tertiary Accent:** #F59E0B (Amber) - warm accent Primary:** #F
- **Text8FAFC (Slate 50)
- **Text Secondary:** #94A3B8 (Slate 400)

### Typography
- **Headings:** Space Grotesk (Google Fonts)
- **Body:** Inter (Google Fonts)
- **Code:** JetBrains Mono (Google Fonts)

## UI/UX Specification

### Layout Structure
- **Header:** Fixed navigation with logo, nav links, GitHub button
- **Hero Section:** Full viewport, video/animation background, headline, CTAs
- **Features Grid:** Bento-grid layout (responsive 1-2-3 columns)
- **How It Works:** Visual workflow diagram with animated steps
- **Quick Start:** Code block with copy-to-clipboard functionality
- **Domain Bundles:** Card grid showcasing curated bundles
- **Footer:** Links, copyright, social icons

### Responsive Breakpoints
- Mobile: < 640px (single column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (full layout)

### Visual Effects
- Glassmorphism cards with backdrop-blur
- Glow effects on hover (box-shadow with accent colors)
- Smooth CSS transitions (0.3s ease)
- Subtle gradient overlays
- Floating animation on key elements

## Component Specifications

### 1. Navigation
- Logo: "Agentic SDLC" text with gradient
- Links: Features, Quick Start, GitHub
- Glassmorphism background on scroll

### 2. Hero Section
- Headline: "From Spec to Production: Fully Automated"
- Subheadline: Project description
- CTAs: "Get Started" (primary), "GitHub Star" (secondary)
- Animated background with subtle particles/glow

### 3. Features Grid (Bento)
- 7 feature cards in bento layout:
  1. Autonomous Coding
  2. Self-Healing
  3. Orchestration
  4. Multi-LLM Support
  5. Workflow Management
  6. Skill System
  7. Security Workflow
- Each card: icon, title, description, hover glow

### 4. How It Works
- 4-step visual workflow:
  1. Write Spec
  2. AI Agents Execute
  3. Quality Assurance
  4. Deploy to Production
- Animated connecting lines

### 5. Quick Start Section
- Code block with commands
- Copy button with success feedback
- Terminal-style appearance

### 6. Domain Bundles
- 6 bundle cards:
  - ai-engineering
  - cloud-platform
  - cybersecurity
  - data-ml-eval
  - healthtech
  - climate-tech
- Each with icon and description

### 7. Footer
- GitHub link
- Project links
- Copyright
- Social icons (GitHub, Twitter)

## Functionality
- Copy-to-clipboard for code blocks
- Smooth scroll navigation
- Hover effects on all interactive elements
- Mobile hamburger menu

## Acceptance Criteria
1. Page loads without errors
2. All sections visible and properly styled
3. Copy button works correctly
4. Responsive on mobile/tablet/desktop
5. Animations smooth (60fps)
6. No 404 errors on resources
7. Deployed and accessible via URL
