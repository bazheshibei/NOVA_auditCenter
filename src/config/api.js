// 接口

import Axios from '@/config/axios'

/**
 * [服务器地址]
 */
const host = '/api/'
// const host = window.location.origin + '/nova/'

/**
 * [接口地址]
 */
const url = {
  '甘特表提报审核页面': 'itemGanttAuditShowAction.ndo?action=getItemGanttData',
  '提交': 'itemGanttAuditSaveAction.ndo?action=auditItemSummary'
}

/**
 * [请求接口时，如果需要 loading 效果时，显示的文字]
 */
// const Loading = {
//   '下单接口': '下单中...'
// }

const request = function (param) {
  param.path = host + url[param.name]
  Axios(param)
}

export default request
