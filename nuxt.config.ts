// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ["@nuxt/ui"],
    devtools: { enabled: false },
    colorMode: { preference: "dark" },
    css: ["~/assets/css/global.css"],
    ui: { fonts: false }
});