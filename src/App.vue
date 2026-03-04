<template>
  <div id="app-wrapper">
    <NavBar />
    <main class="page-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import '@fontsource-variable/noto-sans-sc'
import yaml from 'js-yaml'


const fetchSiteInfo = async () => {
  try {
    const response = await fetch('/api/static/site/info.yaml')
    const text = await response.text()
    const data = yaml.load(text)
    
    if (data.site_name) {
      document.title = data.site_name
    }

    if (data.site_desc) {
      updateMetaDescription(data.site_desc)
    }
    
  } catch (error) {
    console.error('Error fetching site info:', error)
  }
}

const updateMetaDescription = (desc) => {
  let meta = document.querySelector('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'description'
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', desc)
}

onMounted(() => {
  fetchSiteInfo()
})

const viewportMeta = document.querySelector('meta[name="viewport"]')
const viewportContent = 'width=720, user-scalable=yes'

if (viewportMeta) {
  viewportMeta.setAttribute('content', viewportContent)
} else {
  const meta = document.createElement('meta')
  meta.name = 'viewport'
  meta.content = viewportContent
  document.head.appendChild(meta)
}

</script>

<style>
* { 
  margin: 0;
  padding: 0;
  box-sizing: border-box; 
}

body, html, #app {
  font-family: 'Noto Sans SC Variable', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333333;
  background-color: #f9f9f9;
  z-index: -2;
}

.page-main {
  width: 100%;
  min-height: 100%;
  padding: 42px 0 0 0;
}
</style>