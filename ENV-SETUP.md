# Environment Variables Setup

This project requires certain environment variables to be set up before it can run. Follow these steps to configure your environment:

## Required Environment Variables

1. Create a new file called `.env.local` in the root directory of the project
2. Add the following variables to your `.env.local` file:

```env
# Supabase Configuration
# Your Supabase project URL (found in your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key (found in your Supabase project settings -> API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server Configuration
# Port number for the development server (default: 3000)
PORT=3000
```

## How to Get These Values

1. **Supabase Setup**:
   - Go to [Supabase](https://supabase.com) and create a new project
   - Once your project is created, go to Project Settings
   - Under "API", you'll find:
     - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
     - anon/public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

2. **Server Configuration**:
   - `PORT`: Choose any available port number (default is 3000)
   - Make sure the port you choose isn't being used by another application

## Environment Variable Validation

This project uses Zod for environment variable validation. The validation ensures that:
- `NEXT_PUBLIC_SUPABASE_URL` is a valid URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not empty
- `PORT` is a valid number (defaults to 3000 if not specified)

If any of these validations fail, the application will throw an error during startup.

## Development vs Production

- For local development, use `.env.local`
- For production, set these environment variables in your hosting platform (e.g., Vercel)
- Never commit `.env.local` to version control

## Security Notes

- The `NEXT_PUBLIC_` prefix means these variables will be exposed to the browser
- These variables are used for client-side Supabase authentication
- Keep your production keys secure and never share them
- Consider using different projects/keys for development and production 