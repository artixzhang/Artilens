<template>
    <div class="toc-wrapper">
        <!-- Sidebar Container -->
        <nav 
            class="toc-sidebar"
            :class="{ expanded: isExpanded, pinned: isPinned }"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
        >
            <!-- Toggle Button -->
            <button class="toc-btn" @click.stop="handleBtnClick" title="Toggle Table of Contents">
                <Transition name="icon-fade">
                    <div 
                        :key="currentIcon"
                        class="icon-mask"
                        :style="{ maskImage: `url(${currentIcon})`, WebkitMaskImage: `url(${currentIcon})` }"
                    ></div>
                </Transition>
            </button>

            <!-- Content -->
            <div class="toc-content" v-show="isExpanded">
                <div class="toc-scroll-area">
                    <ul class="toc-list">
                        <li v-if="headers.length === 0" class="empty-toc">No contents</li>
                        <li 
                            v-for="(h, index) in headers" 
                            :key="h.id || index" 
                            :class="['toc-item', `level-${h.level}`, { active: activeHeader === h.id }]"
                        >
                            <a href="#" @click.prevent="scrollTo(h.id)">{{ h.text }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { NAV_HEIGHT } from '../config/constants'

const props = defineProps({
    contentSelector: {
        type: String,
        default: '.markdown-body'
    }
})

// State
const isHovered = ref(false)
const isPinned = ref(false)
const headers = ref([])
const activeHeader = ref('')

// Computed State
const isExpanded = computed(() => isPinned.value || isHovered.value)

// Icons
const iconBase = '/api/static/site/icons'
const currentIcon = computed(() => {
    if (isPinned.value) return `${iconBase}/pin.slash.svg`
    if (isExpanded.value) return `${iconBase}/pin.svg`
    return `${iconBase}/sidebar.left.svg`
})

// Interaction Handlers
const handleMouseEnter = () => {
    isHovered.value = true
}

const handleMouseLeave = () => {
    isHovered.value = false
}

const handleBtnClick = () => {
    isPinned.value = !isPinned.value
}

const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
        const navHeight = parseInt(NAV_HEIGHT) || 0
        const offset = navHeight + 24 // Added buffer for better visibility
        const elementPosition = el.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.scrollY - offset
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        })
    }
}

// Header Extraction
const scanHeaders = () => {
    const root = document.querySelector(props.contentSelector)
    if (!root) return

    // Find all headers
    const nodes = root.querySelectorAll('h1, h2, h3, h4')
    const list = []
    
    nodes.forEach((node, index) => {
        // Generate ID if missing
        if (!node.id) {
            const slug = node.innerText
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '')
            node.id = slug || `toc-heading-${index}`
        }
        
        list.push({
            id: node.id,
            text: node.innerText,
            level: parseInt(node.tagName.substring(1))
        })
    })
    
    headers.value = list
}

// Watch for content changes (simplified)
// We'll set up a MutationObserver on the markdown body if possible
let observer = null

onMounted(() => {
    // Initial scan with retry logic (content might load async)
    const tryScan = () => {
        const root = document.querySelector(props.contentSelector)
        if (root && root.innerText.trim().length > 0) {
            scanHeaders()
            
            // Setup observer for future changes
            if (observer) observer.disconnect()
            observer = new MutationObserver(scanHeaders)
            observer.observe(root, { childList: true, subtree: true, characterData: true })
        } else {
            setTimeout(tryScan, 500)
        }
    }
    
    tryScan()
})

onUnmounted(() => {
    if (observer) observer.disconnect()
})

</script>

<style scoped>
.toc-wrapper {
    position: absolute; /* Relative to page-container or root */
    top: 0;
    left: 0;
    z-index: 900; /* High enough, but below things like modal if any */
    pointer-events: none; /* Let clicks pass through wrapper */
}

.toc-sidebar {
    position: fixed;
    left: 0;
    height: 100vh;
    width: 60px; /* Initial width (button size + margin) */
    background: transparent;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    /* Allow shadow to overflow, button is pointer-events: auto */
    overflow: visible; 
    pointer-events: none; /* Let clicks pass through empty areas */
    display: flex;
    flex-direction: column;
    z-index: 900;
}

/* Expanded State */
.toc-sidebar.expanded {
    width: 280px; /* Fixed width sidebar */
    /* Enable interaction */
    pointer-events: auto;
    background-color: #f9f9f9;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
}

.toc-btn {
    position: absolute;
    top: 70px;
    left: 40px; 
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 902;
    transition: all 0.3s ease;
    
    /* Ensure button is clickable even when sidebar is pointer-events: none */
    pointer-events: auto;

    /* BackTop Style */
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.4);
    
    display: grid;
    place-items: center;
}

.toc-btn:hover {
    background: rgba(200, 200, 200, 0.5); 
    transform: scale(1.05);
}

/* Icon Styling */
.icon-mask {
    width: 22px;
    height: 22px;
    background-color: #555555;
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    grid-area: 1 / 1;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-fade-enter-from {
    opacity: 0;
    transform: rotate(-30deg) scale(0.5);
}

.icon-fade-leave-to {
    opacity: 0;
    transform: rotate(30deg) scale(0.5);
}

.toc-content {
    margin-top: 145px; /* Space for button */
    padding: 0 20px 20px 20px;
    flex: 1;
    overflow-y: auto;
    opacity: 0;
    transform: translateX(-10px);
    transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;

    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.toc-content::-webkit-scrollbar {
    display: none;
}

.toc-sidebar.expanded .toc-content {
    opacity: 1;
    transform: translateX(0);
}

.toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.toc-item {
    margin-bottom: 8px;
    line-height: 1.4;
}

.toc-item a {
    display: block;
    color: #555;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s;
    padding: 4px 8px;
    border-radius: 8px;
}

.toc-item a:hover {
    color: #000;
    background: rgba(0,0,0,0.03);
}

.toc-item.active a {
    color: #000;
    font-weight: 600;
    background: rgba(0,0,0,0.05);
}

/* Indentation based on level */
.level-1 { padding-left: 0; font-weight: 600; }
.level-2 { padding-left: 12px; }
.level-3 { padding-left: 24px; font-size: 0.85rem; }
.level-4 { padding-left: 36px; font-size: 0.8rem; }

@media (max-width: 768px) {
    .toc-wrapper {
        display: none;
    }
}
</style>
