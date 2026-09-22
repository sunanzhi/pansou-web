import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { useSettingsStore } from './stores/settings'

// 初始化主题
const { applyTheme } = useSettingsStore()
applyTheme()

createApp(App).mount('#app')
