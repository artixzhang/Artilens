<template>
    <footer class="page-footer">
      <p>{{ t('footer.copyright') }} © {{ new Date().getFullYear() }} {{ getLocalized(siteName) }}. {{ t('footer.all_rights_reserved') }}</p>
    </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import yaml from 'js-yaml'
import { t, getLocalized } from '../utils/i18n'

const siteName = ref('Artix Zhang')

const fetchSiteInfo = async () => {
    try {
        const response = await fetch('/api/static/site/info.yaml')
        const text = await response.text()
        const data = yaml.load(text)
        if (data.site_name) {
            siteName.value = data.site_name
        }
    } catch (error) {
        console.error('Error fetching site info:', error)
    }
}

onMounted(() => {
    fetchSiteInfo()
})
</script>

<style scoped>
.page-footer {
  text-align: center;
  padding: 40px 0;
  color: #888888;
  font-size: 11px;
  margin-top: auto;
  z-index: 1000;
}
</style>