<template>
  <div
    class="category"
    :class="{ selected }"
    :style="{ backgroundColor }"
    @contextmenu="showContextMenu"
    @drop="dropToCategory"
    @dragstart="dragStartCategory"
    @click="$emit('select-category', category)"
  >
    <span v-if="!thisState.editMode">{{ category.name }}</span>
    <span v-else
      ><input
        ref="editor"
        class="category-name-editor"
        :value="category.name"
        type="text"
        @keydown.enter.prevent="updateName"
        @focusout="updateName"
    /></span>
  </div>
</template>
<script setup lang="ts">
import {
  defineEmits,
  defineProps,
  computed,
  reactive,
  toRaw,
  PropType,
  watchEffect,
  ref
} from 'vue'
import { nextTick } from 'vue'
import Category from '../models/category'
import { useAppState } from '@renderer/state'
import { useDialog } from '@renderer/lib/dialog-store'
import { useNotify } from '@renderer/lib/notify-store'
import { useColorSetter } from '@renderer/lib/color-setter-store'
const appState = useAppState()
const dialog = useDialog()
const notify = useNotify()
const colorSetter = useColorSetter()
const { ipcRenderer } = window

defineEmits(['select-category'])

const thisState = reactive({
  editMode: false
})
const props = defineProps({
  category: {
    type: Object as PropType<Category>,
    required: true
  },
  selected: Boolean
})

const backgroundColor = computed(() => {
  const { color: c } = props.category
  if (!c) {
    return ''
  }
  return `rgb(${c.r},${c.g},${c.b})`
})
watchEffect(() => {
  if (thisState.editMode) nextTick(() => enterEdit())
})

function dragStartCategory(ev: DragEvent): void {
  if (!appState.sortMode) {
    ev.stopPropagation()
    ev.preventDefault()
    return
  }
  const dataTransfer = ev.dataTransfer as DataTransfer
  dataTransfer.setData('myl/category', '1')
}
async function showContextMenu(ev: MouseEvent): Promise<void> {
  const select = await ipcRenderer.invoke('show-category-menu', toRaw(appState.ui))
  switch (select) {
    case 'rename': {
      thisState.editMode = true
      break
    }
    case 'openColorSetter': {
      colorSetter.open(props.category)
      break
    }
    case 'delete': {
      dialog.showDialog({
        y: ev.clientY,
        x: ev.clientX,
        message: appState.ui.CONFIRM_DELETE,
        onOk: () => {
          appState.removeCategory(props.category)
        },
        cancelable: true
      })
      break
    }
    default: {
      console.warn('unknown event response', select)
    }
  }
}
const editor = ref(null as null | HTMLInputElement)
function enterEdit(): void {
  nextTick(() => editor.value && editor.value.select())
}
function updateName(event: FocusEvent | KeyboardEvent): void {
  const target = event.target as HTMLInputElement
  const newName = target.value
  thisState.editMode = false
  if (newName === props.category.name) {
    return
  }
  notify.showNotify(appState.ui.NAME_UPDATED)
  appState.updateCategoryName(props.category, newName)
}
async function dropToCategory(ev: DragEvent): Promise<void> {
  console.log(ev)
  const dt = ev.dataTransfer as DataTransfer
  const fromCategory = dt.getData('myl/category')
  if (fromCategory) {
    ev.stopPropagation()
    return
  }
  const fromThis = dt.getData('myl/item')
  if (!fromThis) {
    return
  }
  ev.stopPropagation()
  return appState.moveItem(props.category)
}
</script>
<style lang="scss">
.category {
  min-height: 20px;
  background-color: var(--cate-bg);
  color: var(--cate-color);
  width: 100%;
  cursor: pointer;
  font-size: 13px;
  word-wrap: break-all;
  input,
  textarea {
    font-size: inherit;
    padding: inherit;
  }
  &:nth-child(even) {
    background-color: var(--cate-even-bg);
    color: var(--cate-even-color);
  }
  &.selected {
    font-weight: bold;
    opacity: 0.7;
  }
  &:hover {
    background-color: var(--cate-hover);
  }
  .category-name-editor {
    width: 100%;
  }
}
</style>
