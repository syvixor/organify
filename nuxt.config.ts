// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ["@nuxt/ui"],
    devtools: { enabled: false },
    future: { compatibilityVersion: 4 },
    colorMode: { preference: "dark" },
    css: ["~/assets/css/main.css"]
});