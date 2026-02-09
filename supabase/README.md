# Supabase Configuration for ОлимпИУМ

## Architecture

This project uses **client-side only** Supabase implementation:

### ✅ Used Features
- **Supabase Auth** - User authentication and session management
- **Supabase Database** - PostgreSQL with Row Level Security (RLS)
- **Realtime** - For PvP duels synchronization

### ❌ NOT Used
- **Edge Functions** - All logic is client-side
- **Storage** - Not required for this application

## Why No Edge Functions?

Edge Functions are intentionally disabled because:
1. All authentication uses Supabase Auth (no custom auth logic needed)
2. Database access is controlled via RLS policies
3. All business logic is handled client-side
4. Simplifies deployment and maintenance

## Database Structure

See the SQL migration scripts in the project root for:
- Tables: `users`, `problems`, `subjects`, `statistics`, `matches`
- RLS Policies for secure data access
- Initial data seeding

## Deployment

No Edge Functions to deploy! Just:
1. Set up your Supabase project
2. Run the SQL migrations
3. Configure environment variables
4. Deploy the React app
