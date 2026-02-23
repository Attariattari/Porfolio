import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@vercel/speed-insights"],
  },
});

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     include: ["@vercel/speed-insights"],
//   },
//   server: {
//     host: "0.0.0.0", // ya 'localhost' ya specific IP
//     port: 5173, // koi bhi port jo tum chaho
//     open: true, // browser khud open ho start pe
//   },
// });
