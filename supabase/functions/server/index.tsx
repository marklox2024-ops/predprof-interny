// This Edge Function has been disabled
// All authentication and database operations are handled client-side via Supabase Auth

Deno.serve(() => {
  return new Response(
    JSON.stringify({ 
      error: "This function has been disabled. Use Supabase Auth client-side." 
    }),
    { 
      status: 410, // Gone
      headers: { "Content-Type": "application/json" }
    }
  );
});
