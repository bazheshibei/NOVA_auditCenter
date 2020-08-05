// 组装模块并导出 store

import Vue from 'vue'
import Vuex from 'vuex'
import Api from '@/config/api'
import Tool from './tool.js'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {},

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

  state: {
    /* 页面交互 */
    showArr: ['-1'],
    is_computed: false, //       保存后，是否根据当前节点时间，计算其他节点
    is_computed_id: '', //       重新计算时，作为基础值的节点（此节点自身不变，重新计算最大最小值）
    computed_index: 0, //        重新计算的行索引
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

  getters: {
    /**
     * [第二页数据]
     */
    tab_list(state) {
      const { page_list, is_computed, is_computed_id, computed_index, computed_tab, isComputed } = state
      if (isComputed) {
        const arr = Tool.forEachTime(page_list, is_computed, is_computed_id, computed_index, computed_tab, state)
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
     */
    A_getItemGanttData({ state }) {
      const res = JSON.parse(localStorage.getItem('审核中心：审核列表'))
      // console.log(res)
      /* ----- 处理数据 ----- */
      const { itemSummaryItemData, itemGanttSummaryDatd, employeename, item_name, item_id } = res
      /* 顶部数据 */
      state.itemSummaryItemData = Tool.returnTopData(itemSummaryItemData)
      state.itemGanttSummaryDatd = itemGanttSummaryDatd
      state.employeename = employeename
      state.item_name = item_name
      state.item_id = item_id
      /* 表格 */
      const { arr, nodeObj } = Tool.returnDatalist(itemGanttSummaryDatd)
      state.page_list = arr
      state.nodeObj = nodeObj

      // const name = '甘特表提报审核页面'
      // const obj = { gantt_audit_id: '8a8a8062735528fc0173557f8bb000a2' }
      // const suc = function (res) {
      //   localStorage.setItem('审核中心：审核列表', JSON.stringify(res))
      //   console.log('审核列表 ----- ', res)
      // }
      // Api({ name, obj, suc })
    },
    /**
     * [请求：审核提交]
     */
    A_auditItemSummary({ state }) {
      const { page_list, item_id } = state
      const { dataList, errorArr } = Tool.submitData(page_list)
      console.log('提交报错 ----- ', errorArr, item_id, dataList)
      /* 发起请求 */
      const name = '提交'
      const obj = { item_id, dataList: JSON.stringify(dataList) }
      const suc = function (res) {
        console.log('提交审核返回值 ----- ', res)
      }
      Api({ name, obj, suc })
    }
  }
})

export default store
