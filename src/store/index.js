// 组装模块并导出 store

import Vue from 'vue'
import Vuex from 'vuex'
import Api from '@/config/api'
import Tool from './tool.js'
import { MessageBox } from 'element-ui'
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
     * @localStorage {[gantt_audit_id]} '4028883c74042f1e017404480344000f'
     */
    A_getItemGanttData({ state }) {
      // const data = JSON.parse(localStorage.getItem('审核中心：审核列表'))
      // // console.log(data)
      // /* ----- 处理数据 ----- */
      // const { itemSummaryItemData, itemGanttSummaryDatd, employeename, item_name, item_id } = data
      // /* 顶部数据 */
      // state.itemSummaryItemData = Tool.returnTopData(itemSummaryItemData)
      // state.itemGanttSummaryDatd = itemGanttSummaryDatd
      // state.employeename = employeename
      // state.item_name = item_name
      // state.item_id = item_id
      // /* 表格 */
      // const { arr, nodeObj } = Tool.returnDatalist(itemGanttSummaryDatd)
      // // console.log('arr ----- ', arr)
      // state.page_list = arr
      // state.nodeObj = nodeObj

      const { gantt_audit_id } = JSON.parse(localStorage.getItem('NOVA_itemGanttAuditBatch') || '{}')
      const name = '甘特表提报审核页面'
      // const obj = { gantt_audit_id: '8a8a806273ec6b4a0173ec76f3d50019' }
      const obj = { gantt_audit_id }
      const suc = function (res) {
        // localStorage.setItem('审核中心：审核列表', JSON.stringify(res.data))
        // console.log('审核列表 ----- ', res.data)
        //
        const { data, msg, status } = res
        if (String(status) === '0') {
          MessageBox({ title: '数据异常', message: msg, type: 'warning', closeOnClickModal: false, closeOnPressEscape: false })
        } else {
          const { itemSummaryItemData, itemGanttSummaryDatd, employeename, item_name, item_id } = data
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
        }
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：审核提交]
     */
    A_auditItemSummary({ state }) {
      const { page_list, item_id } = state
      const { dataList, errorArr } = Tool.submitData(page_list)
      if (errorArr.length) {
        MessageBox.alert(`${errorArr.join('')}`, '请完善后再提交', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        })
      } else {
        /* 发起请求 */
        const name = '提交'
        const obj = { item_id, dataList: JSON.stringify(dataList) }
        const suc = function (res) {
          const { msg, status } = res.data
          if (String(status) === '0') {
            MessageBox({ title: '数据异常', message: msg, type: 'warning', closeOnClickModal: false, closeOnPressEscape: false })
          } else {
            // eslint-disable-next-line
            dg.close()
          }
        }
        Api({ name, obj, suc })
        // console.log(name, obj, suc)
      }
    }
  }
})

export default store
