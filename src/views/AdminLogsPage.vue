<template>
  <div class="admin-logs-page">
    <div class="logs-header">
      <h2>{{ t('admin.access_logs') }}</h2>
      <button @click="fetchLogs" class="refresh-btn">Refresh</button>
    </div>

    <!-- Filter Bar -->
    <div class="filters-bar">
      <div class="filter-group">
        <label>Time:</label>
        <select v-model="filters.timeRange" @change="fetchLogs">
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
          <option value="custom">Custom Date</option>
        </select>
      </div>

      <div class="filter-group" v-if="filters.timeRange === 'custom'">
        <input type="date" v-model="filters.startDate" @change="fetchLogs" />
        <span> - </span>
        <input type="date" v-model="filters.endDate" @change="fetchLogs" />
      </div>

      <div class="filter-group">
        <label>User:</label>
        <select v-model="filters.user" @change="fetchLogs">
          <option value="all">All Users</option>
          <option value="guest">Guest</option>
          <option v-for="u in users" :key="u.id" :value="u.username">{{ u.username }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Region:</label>
        <select v-model="filters.region" @change="fetchLogs">
          <option value="all">All Regions</option>
          <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
    </div>
    
    <div class="logs-container">
      <pre class="logs-content">{{ logsContent }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { t } from '../utils/i18n'

const logsContent = ref('Loading logs...')
const users = ref([])
const regions = ref([])

const filters = ref({
  timeRange: '1d',
  startDate: '',
  endDate: '',
  user: 'all',
  region: 'all'
})

const fetchOptions = async () => {
  const token = localStorage.getItem('authToken')
  
  // Fetch Users
  try {
    const userRes = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` }})
    if (userRes.ok) users.value = await userRes.json()
  } catch (e) {}

  // Fetch Regions
  try {
    const regionRes = await fetch('/api/admin/logs/regions', { headers: { 'Authorization': `Bearer ${token}` }})
    if (regionRes.ok) regions.value = await regionRes.json()
  } catch (e) {}
}

const fetchLogs = async () => {
  const token = localStorage.getItem('authToken')
  logsContent.value = 'Loading logs...'
  
  const queryParams = new URLSearchParams()
  queryParams.append('timeRange', filters.value.timeRange)
  if (filters.value.timeRange === 'custom') {
    if (filters.value.startDate) queryParams.append('startDate', filters.value.startDate)
    if (filters.value.endDate) queryParams.append('endDate', filters.value.endDate)
  }
  queryParams.append('user', filters.value.user)
  queryParams.append('region', filters.value.region)

  try {
    const res = await fetch(`/api/admin/logs?${queryParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      const rawText = await res.text()
      logsContent.value = rawText.replace(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/g, (match, isoStr) => {
        const date = new Date(isoStr)
        return `[${date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}]`
      })
    } else {
      logsContent.value = 'Failed to load logs. Permission denied or error.'
    }
  } catch (err) {
    logsContent.value = 'Error fetching logs: ' + err.message
  }
}

onMounted(async () => {
  await fetchOptions()
  fetchLogs()
})
</script>

<style scoped>
.admin-logs-page {
  padding: 20px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #eee;
}

@media (prefers-color-scheme: dark) {
  .filters-bar {
    background-color: #252525;
    border-color: #333;
  }
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: bold;
  font-size: 0.9rem;
}

.filter-group select, .filter-group input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
  font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  .filter-group select, .filter-group input {
    background-color: #333;
    color: #eee;
    border-color: #444;
  }
}

.refresh-btn {
  padding: 8px 12px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #555;
}

/* 包含日志的控制台风格框 */
.logs-container {
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 15px;
}

/* 等宽字体展示 */
.logs-content {
  color: #d4d4d4;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}
</style>
