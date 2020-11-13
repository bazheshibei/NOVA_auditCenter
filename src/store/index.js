// 组装模块并导出 store

import Vue from 'vue'
import Vuex from 'vuex'
import Tool from './tool.js' // 工具方法
import Dev from './dev.js' //   本地开发代码
import Prod from './prod.js' // 生产环境代码
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {},

  state: {
    nowCodeType: 'Prod', //     当前代码类型
    codeObj: { Dev, Prod }, // 代码类型 { Dev: '开发', Prod: '生产' }
    /* 页面交互 */
    showArr: ['-1'],
    is_computed: false, //       保存后，是否根据当前节点时间，计算其他节点
    changeIndexId: '', //        修改的数据节点ID及节点名称 '2c9xadw244_节点名称'
    computed_tab: 0, //          重新计算的tab
    isComputed: 1, //            保存后，触发重新计算
    /* 接口返回 */
    itemSummaryItemData: {}, //  顶部数据
    itemGanttSummaryDatd: [], // tab 数据
    employeename: '', //         当前用户姓名
    item_name: '', //            项目名称
    item_id: '', //              项目ID
    /* 页面用 */
    page_list: [], //            tab列表
    nodeObj: {} //               节点列表
  },

  mutations: {
    /**
     * [保存数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    saveData(state, params) {
      const { name, obj } = params
      state[name] = obj
    },
    /**
     * [添加数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    assignData(state, params) {
      const { name, obj } = params
      const data = state[name] || {}
      state[name] = Object.assign({}, data, obj)
    },
    /**
     * [添加数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    pushData(state, params) {
      const { name, obj } = params
      obj.forEach(function (item) {
        state[name].push(item)
      })
    }
  },

  getters: {
    tab_list(state) {
      const { page_list, is_computed, changeIndexId, computed_tab, isComputed, itemSummaryItemData: { order_time, deliver_date } } = state
      if (isComputed) {
        const arr = Tool.forEachTime(page_list, is_computed, changeIndexId, computed_tab, order_time, deliver_date, state)
        // console.log('tab_list ----- ', arr)
        /* 刷新表格 */
        state.showArr.push(isComputed)
        return arr
      } else {
        return []
      }
    }
  },

  actions: {
    /**
     * [请求：审核列表]
     * @localStorage {[gantt_audit_id]} '2c9f10b674b9cd400174bf39a37402a8'
     */
    A_getItemGanttData({ state }) {
      state.codeObj[state.nowCodeType].A_getItemGanttData(state)
    },
    /**
     * [请求：审核提交]
     */
    A_auditItemSummary({ state }) {
      state.codeObj[state.nowCodeType].A_auditItemSummary(state)
    }
  }
})

export default store
