import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Create a postgres client
const client = postgres(process.env.DATABASE_URL!);

// Create the drizzle client
export const db = drizzle(client, { schema });