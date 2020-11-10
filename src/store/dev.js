
import Tool from './tool.js'
import { MessageBox } from 'element-ui'

/**
 * 本地开发代码
 * @ [调用本地数据]
 * @ [不请求接口]
 */
const Dev = {}

/**
 * [请求：审核列表]
 * @localStorage {[gantt_audit_id]} '2c9f10b674b9cd400174bf39a37402a8'
 */
Dev.A_getItemGanttData = function (state) {
  const data = JSON.parse(localStorage.getItem('审核中心：审核列表'))
  // console.log('审核中心：审核列表 ----- ', data)
  /* ----- 处理数据 ----- */
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

/**
 * [请求：审核提交]
 */
Dev.A_auditItemSummary = function (state) {
  const { page_list, item_id } = state
  const { dataList, errorArr } = Tool.submitData(page_list)
  if (errorArr.length) {
    MessageBox.alert(`${errorArr.join('')}`, '请完善后再提交', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    })
  } else {
    /* 发起请求 */
    console.log('提交 ----- item_id：', item_id)
    console.log('提交 ----- dataList：', dataList)
  }
}

export default Dev
