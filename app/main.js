import Vue from 'nativescript-vue'
import DeviceList from './components/DeviceList'
import TestingPage from './components/TestingPage'
import VueDevtools from 'nativescript-vue-devtools'
import Vuex from 'vuex'
import { createStore } from './vuex/store.ts'
import { CameraPlus } from '@nstudio/nativescript-camera-plus';

if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools, { host: '192.168.1.114' })
}
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = false; // (TNS_ENV === 'production')
Vue.use(Vuex)
Vue.registerElement('CameraPlus', () => CameraPlus );

const store = createStore();

new Vue({
  store,
  render: h => h('frame', [h(DeviceList)])
}).$start()
