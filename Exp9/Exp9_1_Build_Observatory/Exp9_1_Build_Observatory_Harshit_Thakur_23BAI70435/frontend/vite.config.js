import {defineConfig} from 'vite';
export default defineConfig({server:{port:5173,strictPort:true,proxy:{'/api':'http://127.0.0.1:8400'}},build:{outDir:'../src/main/resources/static',emptyOutDir:true}});
