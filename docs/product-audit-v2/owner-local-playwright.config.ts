import base from '../../playwright.config';import{defineConfig}from'@playwright/test';
export default defineConfig({...base,testDir:process.cwd()+'/docs/product-audit-v2',testMatch:'owner-local-connections.spec.ts',outputDir:process.cwd()+'/output/playwright/v6-results',use:{...base.use,baseURL:'http://127.0.0.1:3010'},webServer:undefined});
