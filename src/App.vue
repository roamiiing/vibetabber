<script setup lang="ts">
import { PlusIcon, XMarkIcon } from '@heroicons/vue/16/solid'
import { useTabsStore } from './stores/counter'

const tabsStore = useTabsStore()

function beforeLeave(el: Element) {
    const htmlElement = el as HTMLElement

    const { marginLeft, marginTop, width, height } = window.getComputedStyle(htmlElement)
    htmlElement.style.left = `${htmlElement.offsetLeft - parseFloat(marginLeft)}px`
    htmlElement.style.top = `${htmlElement.offsetTop - parseFloat(marginTop)}px`
    htmlElement.style.width = width
    htmlElement.style.height = height
}
</script>

<template>
    <div class="w-full">
        <TransitionGroup
            class="flex w-full flex-col space-y-3 px-3 py-2"
            enter-active-class="transform-gpu"
            enter-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="absolute transform-gpu"
            leave-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
            @before-leave="beforeLeave"
            tag="div"
        >
            <div class="transition-all duration-200" v-for="tab in tabsStore.tabs" :key="tab.id">
                <div
                    @click="tabsStore.activateTab(tab.id)"
                    class="group relative w-full origin-center truncate rounded-md px-3 py-2 outline outline-1 transition-transform duration-50 ease-in select-none hover:scale-105"
                    :class="tabsStore.activeTabId === tab.id ? 'bg-indigo-500 text-white outline-indigo-500' : 'outline-slate-400'"
                >
                    {{ tab.customTitle || tab.originalTab.title }}

                    <div
                        class="absolute top-1/2 right-2 hidden h-4 w-4 -translate-y-1/2 rounded-sm bg-white/10 backdrop-blur-md group-hover:block hover:scale-110 hover:bg-white/20"
                        @click.stop="tabsStore.removeTab(tab.id)"
                    >
                        <XMarkIcon />
                    </div>
                </div>
            </div>

            <div class="transition-all duration-200">
                <div
                    class="flex w-full origin-center items-center truncate rounded-md px-3 py-2 text-slate-500 transition-transform duration-50 ease-in select-none hover:scale-105 hover:bg-slate-500/20 hover:text-slate-700"
                    @click="tabsStore.newTab"
                >
                    <PlusIcon class="mr-2 h-4 w-4" />
                    <span>New tab</span>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style>
@import 'tailwindcss';
</style>
