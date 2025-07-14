## TODO

Do related followup questions.

Handle anonymous requests to the API, rate limit by IP.

Use a chunking system on the crawled information.

Add 'edit' button, and 'rerun from here' button.

Add evals.

Handle conversations longer than the context window by summarizing.

How do you get the LLM to ask followup questions?

## Setup

1. Install dependencies with `pnpm`

```bash
pnpm install
```

2. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

3. Run `./start-database.sh` to start the database.

4. Run `./start-redis.sh` to start the Redis server.

5. Add your Google Generative AI API key to your `.env` file:

```
GENERATIVE_AI_API_KEY=your-google-api-key-here
```

This is required for the Gemini model to function.

6. Add your Discord authentication credentials to your `.env` file:

```
AUTH_DISCORD_ID=your-discord-client-id-here
AUTH_DISCORD_SECRET=your-discord-client-secret-here
```

These are required for Discord login to work.
