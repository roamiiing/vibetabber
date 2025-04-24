<script setup lang="ts">
import { PlusIcon, XMarkIcon } from '@heroicons/vue/16/solid'
import { useTabsStore } from './stores/tabs'

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
            class="flex w-full flex-col px-3 py-2"
            enter-active-class="transform-gpu"
            enter-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="absolute transform-gpu"
            leave-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
            @before-leave="beforeLeave"
            tag="div"
        >
            <div
                class="group w-full py-1 transition-all duration-200"
                v-for="tab in tabsStore.pinnedTabs"
                :key="tab.id"
                @click.left="tabsStore.activateTab(tab.id)"
                @click.right="tabsStore.changePinState(tab.id)"
            >
                <div
                    class="group relative w-full origin-center truncate rounded-md px-3 py-2 text-slate-600 transition-all duration-50 ease-in select-none group-hover:scale-[1.01] group-hover:outline group-hover:outline-1"
                    :class="tabsStore.activeTabId === tab.id ? 'bg-indigo-500 text-white outline-indigo-500' : 'outline-slate-400'"
                >
                    {{ tab.customTitle || tab.originalTab.title || tab.originalTab.url || 'what the hell is that?' }}

                    <div
                        class="absolute top-1/2 right-2 hidden h-4 w-4 -translate-y-1/2 rounded-sm bg-white/10 backdrop-blur-md group-hover:block hover:scale-105 hover:bg-white/20"
                        @click.stop="tabsStore.removeTab(tab.id)"
                    >
                        <XMarkIcon />
                    </div>
                </div>
            </div>

            <div v-if="tabsStore.pinnedTabs.length > 0" class="w-full py-2 transition-all duration-200">
                <hr class="border-slate-400" />
            </div>

            <div class="w-full py-2 transition-all duration-200">
                <div
                    class="flex w-full origin-center items-center truncate rounded-md px-3 py-2 text-slate-500 transition-all duration-50 ease-in select-none hover:scale-[1.01] hover:bg-slate-500/20 hover:text-slate-700"
                    @click="tabsStore.newTab"
                >
                    <PlusIcon class="mr-2 h-4 w-4" />
                    <span>New tab</span>
                </div>
            </div>

            <div
                class="group w-full py-1 transition-all duration-200"
                v-for="tab in tabsStore.unpinnedTabs.toReversed()"
                :key="tab.id"
                @click.left="tabsStore.activateTab(tab.id)"
                @click.right="tabsStore.changePinState(tab.id)"
            >
                <div
                    class="group relative w-full origin-center truncate rounded-md px-3 py-2 text-slate-600 transition-all duration-50 ease-in select-none group-hover:scale-[1.01] group-hover:outline group-hover:outline-1"
                    :class="tabsStore.activeTabId === tab.id ? 'bg-indigo-500 text-white outline-indigo-500' : 'outline-slate-400'"
                >
                    {{ tab.customTitle || tab.originalTab.title || tab.originalTab.url || 'what the hell is that?' }}

                    <div
                        class="absolute top-1/2 right-2 hidden h-4 w-4 -translate-y-1/2 rounded-sm bg-white/10 backdrop-blur-md group-hover:block hover:scale-105 hover:bg-white/20"
                        @click.stop="tabsStore.removeTab(tab.id)"
                    >
                        <XMarkIcon />
                    </div>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style>
@import 'tailwindcss';
</style>
