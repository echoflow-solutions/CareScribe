# AI Report Generation Setup

This guide will help you set up AI-powered report generation for the CareScribe demo.

## Quick Start

1. **Choose Your AI Provider**
   - OpenAI (GPT-4 or GPT-3.5)
   - Anthropic (Claude 3)

2. **Get Your API Key**
   - **OpenAI**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) and create an API key
   - **Anthropic**: Visit [Anthropic Console](https://console.anthropic.com/) and create an API key

3. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   ```

4. **Edit `.env.local`** and add your configuration:
   ```env
   # For OpenAI GPT-4 (recommended for best quality)
   NEXT_PUBLIC_AI_PROVIDER=openai
   AI_API_KEY=sk-your-openai-api-key-here

   # For OpenAI GPT-3.5 (more cost-effective)
   NEXT_PUBLIC_AI_PROVIDER=gpt-3.5
   AI_API_KEY=sk-your-openai-api-key-here

   # For Anthropic Claude
   NEXT_PUBLIC_AI_PROVIDER=anthropic
   AI_API_KEY=sk-ant-your-anthropic-api-key-here
   ```

5. **Restart the Development Server**
   ```bash
   npm run dev
   ```

## How It Works

1. **Initial Report**: When a user starts a report by describing an incident, the AI analyzes the description and begins asking relevant follow-up questions.

2. **Conversational Flow**: The AI engages in a natural conversation to gather all necessary details:
   - Safety status of all involved
   - Timeline and triggers
   - Specific behaviors observed
   - Interventions used
   - Outcomes and follow-up needs

3. **Report Generation**: After gathering information, the AI generates a professional, NDIS-compliant incident report including:
   - Incident summary
   - Antecedent (triggers)
   - Behavior description
   - Consequences (interventions and outcomes)
   - Recommendations

## Cost Considerations

- **OpenAI GPT-4**: ~$0.03-0.06 per report (highest quality)
- **OpenAI GPT-3.5**: ~$0.002-0.004 per report (good quality, very cost-effective)
- **Anthropic Claude 3**: ~$0.015-0.03 per report (excellent quality)

## Testing the Feature

1. Click on "Quick Report" from the dashboard
2. Either:
   - Type a description like "James became upset during lunch and threw his plate"
   - Click "Voice Report" to simulate voice input
3. Answer the AI's follow-up questions
4. Review the generated report

## Troubleshooting

### "API key not configured" Error
- Ensure you've added the API key to `.env.local`
- Restart the development server after adding the key

### "API request failed" Error
- Check that your API key is valid and has credits
- Ensure you're using the correct provider name in `NEXT_PUBLIC_AI_PROVIDER`

### Reports Not Generating
- Check the browser console for errors
- Verify the API endpoints are accessible (not blocked by firewall/proxy)

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive configuration
- In production, consider using server-side API routes to hide keys from client code