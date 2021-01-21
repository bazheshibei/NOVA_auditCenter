
import Api from '@/config/api'
import Tool from './tool.js'
import { Loading, MessageBox } from 'element-ui'

/**
 * 生产环境代码
 */
const Prod = {}

/**
 * [请求：审核列表]
 * @localStorage {[gantt_audit_id]} '2c9f10b674b9cd400174bf39a37402a8'
 */
Prod.A_getItemGanttData = function (state) {
  /* 记录页面信息 */
  const { gantt_audit_id = '2c9f10b67628364f01762d0bf8d407c3', gantt_type = '1' } = JSON.parse(localStorage.getItem('NOVA_itemGanttAuditBatch') || '{}')
  const ganttType = String(gantt_type)
  let pageTitle = ''
  if (ganttType === '4') {
    pageTitle = '开发'
  } else if (ganttType === '5' || ganttType === '6') {
    pageTitle = '面料'
  } else {
    pageTitle = '大货'
  }
  state.pageType = ganttType
  state.pageTitle = pageTitle
  /* 发起请求 */
  const name = '甘特表提报审核页面'
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
  Api({ name, obj, suc, loading: '数据加载中...' })
}

/**
 * [请求：审核提交]
 */
Prod.A_auditItemSummary = function (state) {
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
        Loading.service({ text: '提交成功', spinner: 'el-icon-circle-check' })
        setTimeout(() => {
          // eslint-disable-next-line
          dg.close()
        }, 2000)
      }
    }
    Api({ name, obj, suc, loading: '提交审核中...' })
  }
}

export default Prod
