import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://bryantleft.com",
	integrations: [
		sitemap(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
