# HoldFlow-Server

NestJS API backed by [Supabase](https://supabase.com).

## Setup

1. Copy environment template and fill in your Supabase credentials:

   ```bash
   cp .env.example .env
   ```

   Get values from **Supabase Dashboard → Project Settings → API**:
   - `SUPABASE_URL` — Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — preferred for server-side (bypasses RLS)
   - `SUPABASE_ANON_KEY` — fallback if you rely on RLS policies

2. Install and run:

   ```bash
   npm install
   npm run start:dev
   ```

3. Verify:
   - `GET http://localhost:3000` → `HoldFlow API`
   - `GET http://localhost:3000/health` → Supabase connectivity status

## Using Supabase in modules

Inject `SupabaseService` anywhere:

```typescript
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class MyService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase
      .getClient()
      .from('my_table')
      .select('*');

    if (error) throw error;
    return data;
  }
}
```

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run start:dev` | Dev server with hot reload |
| `npm run build`     | Production build           |
| `npm run start:prod`| Run compiled app           |
| `npm test`          | Unit tests                 |
