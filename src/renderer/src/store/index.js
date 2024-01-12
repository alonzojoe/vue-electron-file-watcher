import { createStore } from 'vuex'
import Watcher from './modules/watcher'
const store = createStore({
  modules: {
    Watcher
  }
})

export default store
