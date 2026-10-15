import { createHandler, createRepository } from './handler.js';

const env = (name: string) => Deno.env.get(name);
const repository = createRepository(env);
Deno.serve(createHandler({ env, repository }));
