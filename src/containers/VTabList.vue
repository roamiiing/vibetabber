<template>
    <TransitionGroup
        class="flex w-full flex-col px-3 py-2"
        tag="div"
        enter-active-class="transform-gpu"
        enter-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="absolute transform-gpu"
        leave-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-full"
        @before-leave="beforeLeave"
    >
        <div
            v-for="tab in tabsStore.pinnedTabs"
            :key="tab.id"
            class="group w-full py-1 transition-all duration-200"
            @click.left="tabsStore.activateTab(tab.id)"
            @click.right="tabsStore.changePinState(tab.id)"
        >
            <VTabListItem :tab="tab" :is-active="tab.id === tabsStore.activeTabId" @remove="tabsStore.removeTab(tab.id)" />
        </div>

        <div v-if="tabsStore.pinnedTabs.length > 0" class="w-full py-2 transition-all duration-200">
            <hr class="border-slate-400" />
        </div>

        <div class="w-full py-2 transition-all duration-200">
            <div
                class="flex w-full origin-center items-center truncate rounded-md px-3 py-2 text-slate-500 transition-all duration-50 ease-in select-none hover:scale-[1.01] hover:bg-slate-500/20 hover:text-slate-700"
                @click="tabsStore.createNewTab"
            >
                <PlusIcon class="mr-2 h-4 w-4" />
                <span>New tab</span>
            </div>
        </div>

        <div
            v-for="tab in tabsStore.unpinnedTabs.toReversed()"
            :key="tab.id"
            class="group w-full py-1 transition-all duration-200"
            @click.left="tabsStore.activateTab(tab.id)"
            @click.right="tabsStore.changePinState(tab.id)"
        >
            <VTabListItem :tab="tab" :isActive="tab.id === tabsStore.activeTabId" @remove="tabsStore.removeTab(tab.id)" />
        </div>
    </TransitionGroup>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/16/solid'

import VTabListItem from '@/components/VTabListItem.vue'
import { useTabsStore } from '@/stores/tabs'

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
