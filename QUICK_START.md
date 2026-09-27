# Quick Start Guide

## 1. Install Dependencies

```bash
cd website-cloner
npm install
```

## 2. Set Up Environment

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and replace `sk-your-openai-api-key-here` with your actual OpenAI API key.

Get your key from: https://platform.openai.com/api-keys

## 3. Start Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:3000

## 4. Test the Application

1. **Enter a URL**: Try `https://example.com` (simple, fast)
2. **Click Analyze**: Wait for the website analysis to complete
3. **Review Results**: Check detected components and sections
4. **Generate Frontend**: Click "Generate Frontend" to create React code
5. **View Generated Files**: Browse the generated Next.js components
6. **Modify with AI**: Type a natural language instruction like:
   - "Change the primary color to blue"
   - "Add a testimonials section"
   - "Make the navbar sticky"

## 5. Record Demo Video

Follow the guide in `DEMO_GUIDE.md` to record your 5-10 minute demo video.

## Troubleshooting

### Puppeteer fails to launch
- Ensure you have Chrome/Chromium installed
- On Windows, Puppeteer downloads its own Chromium by default
- If blocked by firewall, allow the download

### OpenAI API errors
- Verify your API key is correct in `.env.local`
- Check your OpenAI account has sufficient credits
- Ensure GPT-4o model access is enabled

### Analysis timeout
- Some websites are slow to load; increase timeout in `analyzer.ts`
- Sites with heavy JavaScript may take longer
- Try simpler test sites first

### Generated code has errors
- This is expected; AI-generated code may need minor fixes
- Check the validator output for common issues
- Use the modification feature to refine the code

## Project Structure

```
website-cloner/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts    # Website analysis endpoint
│   │   │   └── generate/route.ts   # Code generation endpoint
│   │   ├── page.tsx                # Main UI
│   │   └── preview/page.tsx        # Code preview page
│   └── lib/
│       ├── analyzer.ts             # Website scraping logic
│       ├── generator.ts            # AI code generation
│       ── validator.ts            # Code validation
├── package.json
├── README.md
├── ARCHITECTURE.md
├── DEMO_GUIDE.md
└── .env.example
```

## Next Steps

1. ✅ Run the application locally
2. ✅ Test with multiple websites
3. ✅ Record demo video (see DEMO_GUIDE.md)
4. ✅ Push to GitHub repository
5. ✅ Submit assignment

Good luck! 🚀
