# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI Website Cloning Agent                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────────┐    ┌──────────────────┐    ┌───────────┐
│  User    │───▶│  Frontend UI │───▶│  API Routes      │───▶│  Core     │
│  (URL)   │    │  (Next.js)   │    │  /api/*          │    │  Modules  │
──────────┘    └──────────────    └──────────────────┘    └─────┬─────┘
                                                                  │
                    ┌─────────────────────────────────────────────┤
                    │                                             │
              ┌─────▼──────┐                              ┌──────▼──────┐
              │  Analyzer  │                              │  Generator  │
              │            │                              │             │
              │ • Puppeteer│                              │ • OpenAI    │
              │ • Cheerio  │                              │   GPT-4o    │
              │ • Color    │                              │ • Prompt    │
              │   Extract  │                              │   Engine    │
              │ • Layout   │                              │ • Code      │
              │   Detect   │                              │   Formatter │
              │ • Component│                              │ • File      │
              │   ID       │                              │   Builder   │
              └─────┬──────┘                              └──────┬──────┘
                    │                                             │
                    │         ┌──────────────────┐               │
                    └────────▶│   Validator      │◀──────────────┘
                              │                  │
                              │ • Syntax Check   │
                              │ • Type Verify    │
                              │ • Structure      │
                              │ • Cost Estimate  │
                              └──────────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │  Generated Next.js│
                              │  Project Files    │
                              │                  │
                              │ • page.tsx        │
                              │ • layout.tsx      │
                              │ • components/     │
                              │ • styles/         │
                              └──────────────────┘
                                         │
                                         ▼
                              ┌──────────────────
                              │  Local Preview   │
                              │  & Modification  │
                              │                  │
                              │ • Code Viewer    │
                              │ • AI Prompts     │
                              │ • Live Updates   │
                              └──────────────────┘
```

## Data Flow

### Analysis Phase
```
URL → Puppeteer Browser → HTML/CSS Extraction → Structured Data
                                    ↓
                    ┌───────────────────────────────────┐
                    │  WebsiteAnalysis Interface        │
                    │  {                                │
                    │    url, title, meta, colors,      │
                    │    typography, sections,          │
                    │    navigation, images, layout,    │
                    │    components                     │
                    │  }                                │
                    └───────────────────────────────────┘
```

### Generation Phase
```
WebsiteAnalysis → Prompt Builder → GPT-4o API → JSON Response
                                              ↓
                                    Parsed File Structure
                                              ↓
                                    ┌──────────────────────┐
                                    │  GeneratedCode        │
                                    │  {                    │
                                    │    files: [           │
                                    │      {path, content}  │
                                    │    ],                 │
                                    │    entryPoint         │
                                    │  }                    │
                                    └──────────────────────┘
```

### Modification Phase
```
Existing Files + Natural Language Prompt → GPT-4o API
                                                    ↓
                                          Modified File Set
                                                    ↓
                                          Validation & Preview
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14+ App Router | UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| Language | TypeScript | Type safety |
| Scraping | Puppeteer | Browser automation |
| Parsing | Cheerio | HTML parsing |
| AI | OpenAI GPT-4o | Code generation |
| API | Next.js API Routes | Backend endpoints |
| Validation | Custom validator | Code quality checks |

## Key Design Decisions

1. **Server-side scraping**: Puppeteer runs on server to avoid CORS issues
2. **Structured prompts**: Carefully crafted prompts ensure consistent output format
3. **JSON response parsing**: Robust fallback for malformed AI responses
4. **Component detection heuristics**: Pattern-based rather than template-based
5. **Modification context**: Full file set sent to AI for coherent updates
6. **Cost tracking**: Token estimation for budget awareness

## Error Handling Strategy

```
User Input → Validation → API Call → Error? → User Feedback
                                        ↓ No
                                   Success → Response
```

- Input validation before API calls
- Try-catch around all async operations
- Meaningful error messages to user
- Graceful degradation on partial failures
