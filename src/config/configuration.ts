export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  supabase: {
    url: process.env.SUPABASE_URL,
    key:
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY,
  },
});
