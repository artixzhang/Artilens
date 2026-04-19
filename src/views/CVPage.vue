<template>
    <DynamicWave/>
    <div class="cv-page">
        <TableOfContents />
        <PersonalProfile class="personal-profile"/>
        <main class="cv-content">
            <!-- 绑定 content 属性，由本组件动态获取文本后传入 -->
            <MarkdownRenderer
                :content="markdownContent"
                asset-base="/api/static/cv/"
            />
        </main>
        <PageFooter/>
        <div class="corner-stack"><BackTop/></div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import BackTop from '../components/BackTop.vue';
import DynamicWave from '../components/DynamicWave.vue';
import PageFooter from '../components/PageFooter.vue';
import PersonalProfile from '../components/PersonalProfile.vue';
import { NAV_HEIGHT } from '../config/constants';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';
import TableOfContents from '../components/TableOfContents.vue';
import { currentLang } from '../utils/i18n';

const markdownContent = ref('');

const fetchCV = async () => {
    // 按优先级尝试请求特定语言的 Markdown 文件
    const langFallback = currentLang.value === 'zh-TW' ? 'zh-CN' : null;
    const urls = [
        `/api/static/cv/cv.${currentLang.value}.md`,
        langFallback ? `/api/static/cv/cv.${langFallback}.md` : null,
        `/api/static/cv/cv.en.md`,
        `/api/static/cv/cv.md`
    ].filter(Boolean);
    
    for (const url of urls) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                markdownContent.value = await res.text();
                return; // 请求成功后直接退出
            }
        } catch (e) {
            console.error('Fetch error:', e);
        }
    }
};

// 页面加载和语言切换时触发获取
onMounted(fetchCV);
watch(currentLang, fetchCV);
</script>

<style scoped>
.cv-page { 
    min-height: calc(100vh - v-bind(NAV_HEIGHT));
    display: flex;
    flex-direction: column;
    background: transparent;
    padding-top: 20px;
    box-sizing: border-box;
}

.personal-profile {
    margin: 30px auto 60px auto; 
    z-index: 20;
    position: relative;
}

.cv-content {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    box-sizing: border-box;
    z-index: 10;

    background-color: #f9f9f9;
    border-radius: 24px;
    box-shadow: 0 0 120px 80px #f9f9f9; 
}

.corner-stack { position: fixed; bottom: 40px; right: 40px; z-index: 1000; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; pointer-events: none; }
.corner-stack > * { pointer-events: auto; }
</style>