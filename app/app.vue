<script lang="ts" setup>
import JSZip from "jszip";
import { motion } from "motion-v";

useHead({ htmlAttrs: { lang: "en" } });

const isReady = ref(false);
onMounted(() => isReady.value = true);

const operations = ref(["Rename Only", "Format Only", "Both"]);
const operation = ref("Both");

const images = ref<File[]>([]);
const formats = ref(["JPEG", "PNG", "WEBP", "BMP", "AVIF"]);
const format = ref("JPEG");
const index = ref<number>(1);

const isProcessing = ref(false);

const handleImages = (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (!files) return

    images.value = Array.from(files)
        .filter(file => file.type.startsWith("image/"))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

const formatConvert = async (file: File, type: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const result = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("Canvas context not available!"));
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(blob => {
                    if (blob) resolve(blob);
                    else reject(new Error("BLOB creation failed!"));
                }, type);
            }
            img.onerror = reject
            img.src = result
        }
        reader.onerror = reject
        reader.readAsDataURL(file);
    });
}

const processImages = async () => {
    isProcessing.value = true
    try {
        const zip = new JSZip();
        const total = images.value.length;
        const max = index.value + total - 1;
        const digits = Math.max(3, String(max).length);

        const path = (images.value[0] as any)?.webkitRelativePath;
        const directory = path ? path.split("/")[0] : "organified";

        for (let i = 0; i < total; i++) {
            const file = images.value[i] as File;
            const padded = String(index.value + i).padStart(digits, "0");

            let filename = file.name;
            let blob: Blob;

            if (operation.value === "Rename Only") {
                blob = file;
                filename = `${padded}.${file.name.split(".").pop()}`;
            } else if (operation.value === "Format Only") {
                blob = await formatConvert(file, "image/" + format.value.toLowerCase());
                filename = file.name.replace(/\.\w+$/, `.${format.value.toLowerCase()}`);
            } else {
                blob = await formatConvert(file, "image/" + format.value.toLowerCase());
                filename = `${padded}.${format.value.toLowerCase()}`;
            }

            zip.file(filename, blob);
        }

        const content = await zip.generateAsync({ type: "blob" });

        const url = URL.createObjectURL(content);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${directory}.zip`
        anchor.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error during processing:", error);
    } finally {
        isProcessing.value = false
    }
}
</script>

<template>
    <UApp>

        <Head>
            <Title>Organify - Fast Image Batch Converter, Renamer & ZIP Exporter</Title>
            <Meta name="description" content="Fast Image Batch Converter, Renamer & ZIP Exporter" />
            <Meta name="url" content="https://organify.vercel.app" />
        </Head>
        <div class="flex flex-col justify-center items-center gap-8 h-screen" v-show="isReady">
            <motion.div :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" class="flex flex-col items-center gap-2">
                <div class="flex items-center gap-2">
                    <img src="/organify.png" alt="organify" class="w-12 h-12" />
                    <h1 class="text-4xl font-black">Organify</h1>
                </div>
                <p class="text-base font-normal text-center">
                    Fast Image Batch Converter, Renamer & ZIP Exporter
                </p>
            </motion.div>
            <motion.div :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ delay: 0.2 }"
                class="space-y-2 p-4 md:p-0">
                <UFormField label="Select Directory" class="w-full md:w-80">
                    <UInput type="file" variant="soft" accept="image/*" multiple webkitdirectory
                        @change="handleImages" />
                </UFormField>
                <UFormField label="Select Operation" class="w-full md:w-80">
                    <USelect v-model="operation" :items="operations" variant="soft" class="w-full" />
                </UFormField>
                <UFormField label="Select Format" class="w-full md:w-80">
                    <USelect v-model="format" :items="formats" variant="soft" class="w-full"
                        :disabled="operation === 'Rename Only'" />
                </UFormField>
                <UFormField label="Initial Number" class="w-full md:w-80">
                    <UInput type="number" v-model.number="index" min="1" variant="soft" class="w-full"
                        :disabled="operation === 'Format Only'" />
                </UFormField>
                <div class="w-full md:w-80 mt-8">
                    <UButton :label="`${isProcessing ? 'Processing...' : 'Organify'}`" :disabled="!images.length"
                        @click="processImages" block :loading="isProcessing" />
                </div>
            </motion.div>
        </div>
        <div class="flex justify-center items-center h-screen" v-show="!isReady">
            <UButton label="Loading" color="neutral" variant="link" size="xl" loading />
        </div>
    </UApp>
</template>