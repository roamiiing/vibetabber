<template>
    <div
        class="group relative w-full origin-center truncate rounded-md px-3 py-2 pl-8 text-slate-600 transition-all duration-50 ease-in select-none group-hover:scale-[1.01] group-hover:outline group-hover:outline-1"
        :class="isActive ? 'bg-indigo-500 text-white outline-indigo-500' : 'outline-slate-400'"
    >
        <img
            :src="tab.originalTab.favIconUrl"
            class="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 rounded-sm"
            :class="!tab.originalTab.favIconUrl && 'bg-slate-400/20'"
        />

        {{ tab.customTitle || tab.originalTab.title || tab.originalTab.url || 'what the hell is that?' }}

        <div
            class="absolute top-1/2 right-2 hidden h-4 w-4 -translate-y-1/2 rounded-sm bg-white/10 backdrop-blur-md group-hover:block hover:scale-105 hover:bg-white/20"
            @click.stop="$emit('remove')"
        >
            <XMarkIcon />
        </div>
    </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/16/solid'
import type { Tab } from '@/stores/tabs'

defineProps<{ tab: Tab; isActive?: boolean }>()

defineEmits<{ (e: 'remove'): void }>()
</script>
