import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import router from './router'

import './style.css'

Vue.config.productionTip = false

import http from './http'
Vue.prototype.$http = http

Vue.mixin({
  computed: {
    uploadUrl(){
      return this.$http.defaults.baseURL + '/storage/upload'
    }
  },
  methods: {
    getAuthHeaders(){
      return {
        'token':localStorage.getItem('token')
        // Authorization: `Bearer ${localStorage.token || ''}`
      }
    }
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
