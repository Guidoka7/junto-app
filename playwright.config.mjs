import {defineConfig} from '@playwright/test';
import {testConfig} from './tests/e2e/auth-fixture.mjs';
export default defineConfig({testDir:'tests/e2e',timeout:45000,workers:1,reporter:'list',use:{serviceWorkers:'block',baseURL:'http://127.0.0.1:5173',viewport:{width:390,height:844},launchOptions:{...(process.env.JUNTO_CHROME?{executablePath:process.env.JUNTO_CHROME}:{}),args:['--no-sandbox']}},webServer:{env:{SUPABASE_URL:testConfig.url,SUPABASE_PUBLISHABLE_KEY:testConfig.publishableKey},command:'node scripts/serve.mjs',url:'http://127.0.0.1:5173',reuseExistingServer:false,timeout:30000}});
