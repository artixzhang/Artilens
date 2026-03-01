<template>
  <div 
    class="sort-control" 
    :class="{ expanded: isHovered }"
    @mouseenter="isHovered = true" 
    @mouseleave="isHovered = false"
  >
    <!-- Main Icon Header -->
    <div class="sort-header" @click="toggleExpand">
       <div class="icon-box">
         <div class="mask-icon main-icon"
          :style="{ maskImage: `url(/api/static/site/icons/arrow.up.arrow.down.svg)`, WebkitMaskImage: `url(/api/static/site/icons/arrow.up.arrow.down.svg)` }">
        </div>
       </div>
    </div>

    <!-- Options List -->
    <div class="sort-options" :class="{ visible: isHovered }">
       <!-- Date Option -->
       <div 
         class="sort-option" 
         :class="{ active: modelValue.field === 'date' }"
         @click="select('date')"
       >
         <div class="indicator-box">
            <div v-if="modelValue.field === 'date'" class="mask-icon arrow-icon"
              :style="{ maskImage: `url(/api/static/site/icons/chevron.${modelValue.order === 'asc' ? 'up' : 'down'}.svg)`, WebkitMaskImage: `url(/api/static/site/icons/chevron.${modelValue.order === 'asc' ? 'up' : 'down'}.svg)` }">
            </div>
         </div>
         <div class="icon-box">
            <div class="mask-icon type-icon"
            :style="{ maskImage: `url(/api/static/site/icons/calendar.svg)`, WebkitMaskImage: `url(/api/static/site/icons/calendar.svg)` }">
            </div>
         </div>
       </div>

       <!-- Views Option -->
       <div 
         class="sort-option" 
         :class="{ active: modelValue.field === 'views' }"
         @click="select('views')"
       >
         <div class="indicator-box">
            <div v-if="modelValue.field === 'views'" class="mask-icon arrow-icon"
              :style="{ maskImage: `url(/api/static/site/icons/chevron.${modelValue.order === 'asc' ? 'up' : 'down'}.svg)`, WebkitMaskImage: `url(/api/static/site/icons/chevron.${modelValue.order === 'asc' ? 'up' : 'down'}.svg)` }">
            </div>
         </div>
         <div class="icon-box">
            <div class="mask-icon type-icon"
            :style="{ maskImage: `url(/api/static/site/icons/cursorarrow.rays.svg)`, WebkitMaskImage: `url(/api/static/site/icons/cursorarrow.rays.svg)` }">
            </div>
         </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ field: 'date', order: 'desc' })
  }
})

const emit = defineEmits(['update:modelValue'])

const isHovered = ref(false)
const isMobile = ref(false)

const toggleExpand = () => {
  // 在手机上点击header来切换展开状态
  if (isMobile.value) {
    isHovered.value = !isHovered.value
  }
}

const select = (field) => {
  const current = props.modelValue
  let newOrder = 'desc' // Default to descending (Newest/Highest)

  if (current.field === field) {
    // Toggle order if clicking same field
    newOrder = current.order === 'desc' ? 'asc' : 'desc'
  }

  emit('update:modelValue', { field, order: newOrder })
  
  // 在手机上选择后自动关闭
  if (isMobile.value) {
    setTimeout(() => {
      isHovered.value = false
    }, 100)
  }
}

const detectMobile = () => {
  isMobile.value = window.innerWidth <= 768 || window.ontouchstart !== undefined
}

onMounted(() => {
  detectMobile()
  window.addEventListener('resize', detectMobile)
})

</script>

<style scoped>
.sort-control {
  /* Position handled by parent */
  width: 50px;
  height: 50px;
  border-radius: 25px;
  padding: 4px; /* 50px - 2*1px border - 2*4px padding = 40px content box */
  box-sizing: border-box;
  
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              border-radius 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.4s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch; /* Stretch children to fill content box */
}

.sort-control.expanded {
  width: 90px;
  height: 140px; /* 40 (header) + 5 + 40 (opt) + 5 + 40 (opt) + 4+4 (pad) = 138 -> ~140 */
  background: rgba(255, 255, 255, 0.6);
  border-radius: 25px;
}

/* Icons Generic */
.mask-icon {
  background-color: #555;
  -webkit-mask-size: contain; mask-size: contain;
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  -webkit-mask-position: center; mask-position: center;
  transition: background-color 0.2s;
}

/* Header */
.sort-header {
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Push icon box to right */
  user-select: none;
}

.main-icon {
  width: 20px; height: 20px;
}

/* Options Container */
.sort-options {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 5px; /* Spacing between header and list */
  opacity: 0;
  transition: opacity 0.2s ease 0.1s;
  pointer-events: none;
}
.sort-options.visible {
  opacity: 1;
  pointer-events: auto;
}

/* Option Item */
.sort-option {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  cursor: pointer;
  border-radius: 20px; /* Concentric with 25px outer - 5px gap */
  transition: background 0.2s;
}

.sort-option:last-child {
  margin-bottom: 0;
}

.sort-option:hover {
  background: rgba(0,0,0,0.05);
}

.sort-option.active {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.sort-option.active .mask-icon {
  background-color: #000;
}

/* Inner Layout */
.indicator-box {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box {
    width: 40px; /* Fixed width to align vertically with header icon */
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.arrow-icon {
  width: 12px; height: 12px;
}
.type-icon {
  width: 20px; height: 20px;
}
</style>