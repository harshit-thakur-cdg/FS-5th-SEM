import { defineConfig } from 'vite';
export default defineConfig({server:{port:3002,strictPort:true,proxy:{'/api':'http://localhost:8300'}}});
