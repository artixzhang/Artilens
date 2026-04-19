import { ref } from 'vue'
import yaml from 'js-yaml'
import * as OpenCC from 'opencc-js'

export const currentLang = ref('en')
export const uiDict = ref({})

const convertS2T = OpenCC.Converter({ from: 'cn', to: 'tw' })

// Initialize language
const initLanguage = () => {
    const saved = localStorage.getItem('language')
    if (saved && ['en', 'zh-CN', 'zh-TW'].includes(saved)) {
        currentLang.value = saved
    } else {
        const browserLang = navigator.language || navigator.userLanguage
        if (browserLang.toLowerCase().includes('tw') || browserLang.toLowerCase().includes('hk')) {
            currentLang.value = 'zh-TW'
        } else if (browserLang.toLowerCase().includes('zh')) {
            currentLang.value = 'zh-CN'
        } else {
            currentLang.value = 'en'
        }
        localStorage.setItem('language', currentLang.value)
    }
    document.documentElement.lang = currentLang.value
}

export const setLanguage = (lang) => {
    if (['en', 'zh-CN', 'zh-TW'].includes(lang)) {
        currentLang.value = lang
        localStorage.setItem('language', lang)
        document.documentElement.lang = lang
    }
}

export const loadUIDict = async () => {
    try {
        const response = await fetch('/api/static/site/ui.yaml')
        const text = await response.text()
        uiDict.value = yaml.load(text) || {}
    } catch (e) {
        console.error("Failed to load ui.yaml", e)
    }
}

// Translate hardcoded UI text
// e.g. t('nav.explore')
export const t = (key) => {
    const keys = key.split('.')
    let val = uiDict.value
    for (const k of keys) {
        if (val && val[k]) {
            val = val[k]
        } else {
            return key
        }
    }
    
    if (val && typeof val === 'object') {
        const exact = val[currentLang.value]
        if (exact) return exact
        if (currentLang.value === 'zh-TW' && val['zh-CN']) {
            return convertS2T(val['zh-CN'])
        }
        return val['en'] || key
    }
    return key
}

// Get localized string from an object like { en: "...", "zh-CN": "..." }
// Note: If object has a `value` property, it is treated as a raw string bypass (preventing translation)
export const getLocalized = (obj) => {
    if (!obj) return ''
    if (typeof obj === 'string') {
        if (currentLang.value === 'zh-TW') return convertS2T(obj)
        return obj
    }
    if (typeof obj === 'object') {
        if (obj.value !== undefined) return obj.value // Bypass for specific raw values
        const exact = obj[currentLang.value]
        if (exact) return exact
        if (currentLang.value === 'zh-TW' && obj['zh-CN']) {
            return convertS2T(obj['zh-CN'])
        }
        return obj['en'] || ''
    }
    return String(obj)
}

initLanguage()
loadUIDict()
