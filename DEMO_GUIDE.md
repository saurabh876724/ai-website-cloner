# Demo Video Guide (5-10 minutes)

## Recording Checklist

### 1. Setup (0:00 - 0:30)
- Show terminal with `npm run dev` running
- Open browser to `http://localhost:3000`
- Briefly explain the project goal

### 2. Enter Website URL (0:30 - 1:00)
- Type a test URL into the input field
  - Recommended: `https://example.com` (simple, fast)
  - Alternative: `https://www.apple.com` (visually rich)
- Click "Analyze" button
- Show the loading state

### 3. Website Analysis Results (1:00 - 2:30)
- Show detected title
- Highlight detected components (Navigation, Buttons, HeroSection, etc.)
- Scroll through sections found
- Explain what the analyzer extracted:
  - Colors palette
  - Typography
  - Layout structure
  - Navigation items

### 4. AI Code Generation (2:30 - 4:00)
- Click "Generate Frontend"
- Show the generation process
- Display generated files list
- Open a few key files to show:
  - `src/app/page.tsx` - main page component
  - `src/components/Navbar.tsx` - navigation component
  - Any other interesting components
- Point out:
  - TypeScript usage
  - Tailwind CSS classes
  - Reusable component structure
  - Responsive design patterns

### 5. Preview & Responsive View (4:00 - 5:30)
- Show the code preview interface
- Demonstrate file switching
- Open browser DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Show mobile view (375px width)
- Show tablet view (768px width)
- Show desktop view (1200px+ width)
- Discuss responsive breakpoints

### 6. AI Modification (5:30 - 7:30)
- In the modification textarea, type: `"Change the primary color to blue"`
- Click "Apply Modification"
- Show the updated code
- Highlight the changed color values
- Try another modification: `"Add a testimonials section"`
- Show the new component added
- Optional third modification: `"Make the navbar sticky"`

### 7. Architecture Overview (7:30 - 8:30)
- Switch to VS Code or file explorer
- Show project structure:
  ```
  website-cloner/
  ├── src/
  │   ├── app/
  │   │   ├── api/
  │   │   │   ├── analyze/route.ts
  │   │   │   └── generate/route.ts
  │   │   ├── page.tsx
  │   │   └── preview/page.tsx
  │   └── lib/
  │       ├── analyzer.ts
  │       ├── generator.ts
  │       └── validator.ts
  ├── package.json
  └── README.md
  ```
- Briefly explain each component's role

### 8. Closing (8:30 - 9:00)
- Summarize key features:
  - URL analysis with Puppeteer
  - AI-powered code generation with GPT-4o
  - Natural language modifications
  - Clean Next.js + TypeScript output
- Mention limitations honestly
- Thank the reviewer

## Tips for Recording

1. **Pre-load test sites**: Have 2-3 URLs ready to avoid typing delays
2. **Use screen recording software**: OBS Studio, Loom, or QuickTime
3. **Zoom in**: Make text readable (125-150% zoom)
4. **Speak clearly**: Explain what you're doing as you do it
5. **Pause between steps**: Let viewers absorb each section
6. **Show errors gracefully**: If something fails, explain why and move on
7. **Keep it under 10 minutes**: Respect the reviewer's time

## Suggested Test URLs

1. **Simple**: `https://example.com` - Basic HTML, fast analysis
2. **Medium**: `https://tailwindui.com` - Modern design, good components
3. **Complex**: `https://stripe.com` - Rich UI, multiple sections

## Backup Plan

If API calls are slow or fail during recording:
- Pre-generate results and show them statically
- Explain the flow without live execution
- Focus on code quality and architecture
