// 接口

import Axios from '@/config/axios'

/**
 * [服务器地址]
 */
/* 开发环境 */
// const host = '/api/'
/* 生产环境 */
const host = window.location.origin + '/nova/'

/**
 * [接口地址]
 */
const url = {
  '甘特表提报审核页面': 'itemGanttAuditShowAction.ndo?action=getItemGanttData',
  '提交': 'itemGanttAuditSaveAction.ndo?action=auditItemSummary'
}

const request = function (param) {
  param.path = host + url[param.name]
  Axios(param)
}

export default request
