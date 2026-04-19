<template>
  <div class="profile-card">
    <!-- 1. 头像 -->
    <div class="avatar-section">
      <img v-if="profile.avatar" :src="profile.avatar" alt="Avatar" class="avatar" />
      <div v-else class="avatar-placeholder"></div>
    </div>

    <!-- 2. 名字 -->
    <div class="name-section">
      {{ getLocalized(profile.name) }}
    </div>

    <!-- 3. Headline -->
    <div class="headline-section">
      <div v-for="(line, index) in getLocalizedArray(profile.headline)" :key="index" class="headline-item">
        {{ line }}
      </div>
    </div>

    <!-- 4. 底部操作行 (地区胶囊 + 社交图标) -->
    <div class="icon-row">
      
      <!-- 地区胶囊 -->
      <div class="location-capsule" v-if="profile.location && profile.location.value">
        <div class="capsule-icon-bg">
          <img :src="profile.location.icon" class="earth-icon-img" />
        </div>
        <span class="location-text">{{ getLocalized({ value: profile.location.value }) }}</span>
      </div>

      <!-- Email 图标 -->
      <a v-if="profile.email && profile.email.url" 
         :href="`mailto:${profile.email.url}`" 
         class="icon-link"
         title="Email">
         <img :src="profile.email.icon" class="email-img" />
      </a>

      <a v-if="profile.website && profile.website.url" 
         :href="profile.website.url" 
         class="icon-link"
         title="Website">
         <img :src="profile.website.icon" class="website-img" />
      </a>

      <!-- 社交图标循环 -->
      <template v-for="(item, platform) in profile.social" :key="platform">
        <a v-if="item && item.url" :href="item.url" target="_blank" class="icon-link social-link" :title="platform">
          <img :src="item.icon" :alt="platform" class="social-img" />
        </a>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import yaml from 'js-yaml'
import { getLocalized, currentLang } from '../utils/i18n'

const profile = ref({
  name: '',
  avatar: '',
  headline: [],
  location: { value: '', icon: '' },
  email: { url: '', icon: '' },
  social: {}
})

// Helper to reliably get the correct array from an i18n object or plain array
const getLocalizedArray = (headlineObj) => {
  if (!headlineObj) return []
  if (Array.isArray(headlineObj)) return headlineObj // fallback for old format
  
  // Try to get the exact language array
  const arr = headlineObj[currentLang.value]
  if (Array.isArray(arr)) return arr
  
  // Fallback for zh-TW if only zh-CN exists (translating each string)
  if (currentLang.value === 'zh-TW' && Array.isArray(headlineObj['zh-CN'])) {
      return headlineObj['zh-CN'].map(item => getLocalized(item))
  }
  
  // Fallback to English
  if (Array.isArray(headlineObj['en'])) return headlineObj['en']
  
  return []
}

onMounted(async () => {
  try {
    const response = await fetch('/api/static/site/profile.yaml')
    if (response.ok) {
      const text = await response.text()
      const data = yaml.load(text)
      if (data) profile.value = { ...profile.value, ...data }
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
})

const pillHeight = 24; // 稍微调高一点胶囊高度以匹配图标视觉
</script>

<style scoped>
/* --- 全局容器 --- */
.profile-card {
  display: flex;
  flex-direction: column;
  width: 320px; /* 固定宽度 */
  color: #333;
  z-index: 10;
}

/* --- 1. 头像 --- */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0px 20px rgba(0,0,0,0.2);
  border: solid 6px rgba(255,255,255,0.2);
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #eee;
}

/* --- 2. 名字 --- */
.name-section {
  font-weight: 800;
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 4px;
  padding-left: 4px;
}

/* --- 3. Headline --- */
.headline-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  padding-left: 4px;
}

.headline-item {
  text-align: center;
  font-size: 1rem;
  color: #505050;
  line-height: 1.5;
  margin-bottom: 4px;
}

/* --- 4. 底部操作行 --- */
.icon-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap; /* 防止宽度不足时溢出 */
}

/* --- 地区胶囊样式 --- */
.location-capsule {
  background-color: #333;
  border-radius: calc(v-bind(pillHeight) * 1px / 2);
  display: flex;
  align-items: center;
  padding-left: 1px;
  height: calc(v-bind(pillHeight) * 1px);
  box-sizing: border-box;
  flex-shrink: 0; /* 防止被挤压 */
  margin-right: 0px;
}

.capsule-icon-bg {
  width: calc(v-bind(pillHeight) * 1px - 2px);
  height: calc(v-bind(pillHeight) * 1px - 2px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  position: relative;
}

.capsule-icon-bg::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(v-bind(pillHeight) * 1px - 3px);
  height: calc(v-bind(pillHeight) * 1px - 3px);
  background-color: #f9f9f9;
  border-radius: 50%;
  z-index: 9;
}

.earth-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 10;
}

.location-text {
  color: #f9f9f9;
  font-size: 0.75rem;
  white-space: nowrap;
  transform: translateY(-1px);
  margin-right: 8px;
}

/* --- 图标通用样式 --- */
.icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: transform 0.2s ease-in-out, filter 0.2s ease-in-out;
  cursor: pointer;
}

.icon-link:hover {
  transform: scale(1.05);
}

.email-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  display: block;
}

.website-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}

.social-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}
</style>