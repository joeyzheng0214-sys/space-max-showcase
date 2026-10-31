import {defineConfig} from 'vite';
// Relative asset URLs support both project Pages paths and local static hosting.
export default defineConfig({base:'./',build:{sourcemap:false},server:{host:'127.0.0.1',port:4173,strictPort:true},preview:{host:'127.0.0.1',port:4173,strictPort:true}});
