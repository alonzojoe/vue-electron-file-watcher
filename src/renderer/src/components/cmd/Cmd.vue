<template>
  <template>
    <button @click="scrollDown">Scroll Down</button>
    <div class="flex justify-content-center flex-wrap">
      <ScrollPanel
        ref="scrollPanelRef"
        style="width: 100%; height: 200px"
        :pt="{
          wrapper: {
            style: { 'border-right': '10px solid var(--surface-ground)' }
          },
          bary: 'hover:bg-primary-400 bg-primary-300 opacity-100'
        }"
      >
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veritatis voluptas earum minus
          odit ea. Quod quos ullam dolores qui sequi. Fuga beatae quo totam eveniet delectus
          laudantium illo voluptatem veniam? Lorem ipsum dolor sit amet consectetur, adipisicing
          elit. Veritatis voluptas earum minus odit ea. Quod quos ullam dolores qui sequi. Fuga
          beatae quo totam eveniet delectus laudantium illo voluptatem veniam? Lorem ipsum dolor sit
          amet consectetur, adipisicing elit. Veritatis voluptas earum minus odit ea. Quod quos
          ullam dolores qui sequi. Fuga beatae quo totam eveniet delectus laudantium illo voluptatem
          veniam?
        </p>
      </ScrollPanel>
    </div>
  </template>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import ScrollPanel from 'primevue/scrollpanel'

const scrollPanelRef = ref()

const scrollDown = () => {
  if (scrollPanelRef.value) {
    scrollPanelRef.value.scrollYTo(scrollPanelRef.value.scrollHeight)
  }
}
</script>

<style lang="scss" scoped></style>
