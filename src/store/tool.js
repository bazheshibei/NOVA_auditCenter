
// import { Message } from 'element-ui'

const Tool = {}

/**
 * [description]
 * @param {Object} {[data]} 顶部数据
 */
Tool.returnTopData = function (data = {}) {
  /* 面料 */
  const { styleBom = [] } = data
  const styleBomArr = []
  styleBom.forEach(function (item) {
    const { short_name, type_name } = item
    styleBomArr.push(`${short_name} -- ${type_name}`)
  })
  data.mianliao = styleBomArr.join('，')
  /* 工厂 */
  const { plantOrder = [] } = data
  const plantOrderArr = []
  plantOrder.forEach(function (item) {
    const arr = []
    const { short_name, employeename } = item
    arr.push(short_name)
    if (employeename && employeename !== null) {
      arr.push(employeename)
    }
    plantOrderArr.push(arr.join(' -- '))
  })
  data.gongchang = plantOrderArr.join('，')
  /* 岗位信息 */
  const { itemTeam = [] } = data
  const gangwei = []
  itemTeam.forEach(function (item) {
    const { post_name, employeename } = item
    gangwei.push(`${post_name}：${employeename}`)
  })
  data.gangwei = gangwei
  /* 返回 */
  return data
}

/**
 * [处理原始数据]
 */
Tool.returnDatalist = function (itemGanttSummaryDatd = []) {
  const that = this
  const arr = [] //     tab 数组
  const dataObj = {} // 数据对象
  const nodeObj = {} // 节点对象
  itemGanttSummaryDatd.map(function (tabData) {
    /** 提取数据 **/
    const { tab, node_gantt_type_obj } = that._getData(tabData)
    /* 提取节点 */
    for (const x in node_gantt_type_obj) {
      if (!nodeObj[x]) {
        nodeObj[x] = { nodeObj_1: {}, nodeObj_2: {} }
      }
      for (const y in node_gantt_type_obj[x]) {
        for (const z in node_gantt_type_obj[x][y]) {
          const node = node_gantt_type_obj[x][y][z]
          if (nodeObj[x][y][z] && nodeObj[x][y][z].is_audit_follow === 1) {
            //
          } else {
            nodeObj[x][y][node.node_id] = node
          }
        }
      }
    }
    /* 提取数据 */
    if (!dataObj[tab.gantt_type]) {
      dataObj[tab.gantt_type] = { clacNodeMap: {}, itemNodeAuditDetail: [], tableData: [], gantt_audit_id: {} }
    }
    const { clacNodeMap, itemNodeAuditDetail, tableData } = dataObj[tab.gantt_type]
    dataObj[tab.gantt_type].clacNodeMap = Object.assign({}, clacNodeMap, tab.clacNodeMap)
    dataObj[tab.gantt_type].itemNodeAuditDetail = itemNodeAuditDetail.concat(tab.itemNodeAuditDetail)
    dataObj[tab.gantt_type].tableData = tableData.concat(tab.tableData)
    dataObj[tab.gantt_type].gantt_type = tab.gantt_type
    dataObj[tab.gantt_type].gantt_audit_id = Object.assign({}, dataObj[tab.gantt_type].gantt_audit_id, { [tab.short_name]: tab.gantt_audit_id })
    dataObj[tab.gantt_type].nodeAuditids = Object.assign({}, dataObj[tab.gantt_type].nodeAuditids, tab.nodeAuditids)
  })
  /* 合并节点 */
  const nodeObj_f = {}
  for (const x in nodeObj) {
    if (!nodeObj_f[x]) {
      nodeObj_f[x] = []
    }
    for (const y in nodeObj[x]) {
      for (const z in nodeObj[x][y]) {
        nodeObj_f[x].push(nodeObj[x][y][z])
      }
    }
  }
  /* 合并数据 */
  for (const x in dataObj) {
    /* 数据排序 */
    const arr_1 = []
    const arr_2 = []
    const arrObj = {}
    dataObj[x].tableData.forEach(function (item) {
      const { is_thread, count, short_name } = item
      if (is_thread) { //                        主线
        arr_1.push(item)
      } else if (!is_thread && count === 1) { // 审核完的
        arr_2.push(item)
      } else { //                                未审核
        if (!arrObj[short_name]) {
          arrObj[short_name] = []
        }
        if (count) {
          arrObj[short_name].unshift(item)
        } else {
          arrObj[short_name].push(item)
        }
      }
    })
    let newArr = [].concat(arr_1, arr_2)
    for (const x in arrObj) {
      newArr = newArr.concat(arrObj[x])
    }
    dataObj[x].tableData = newArr
    /* 添加 */
    arr.push(dataObj[x])
  }
  return { arr, nodeObj: nodeObj_f }
}

/**
 * [计算时间]
 * @param {[Array]}   page_list     数据
 * @param {[Boolean]} is_computed   保存后，是否根据当前节点时间，计算其他节点
 * @param {[String]}  changeIndexId 修改的数据索引及节点ID、节点名称 '2c9xadw244_节点名称'
 * @param {[String]}  computed_tab  重新计算的tab
 * @param {[String]}  order_time    下单时间
 * @param {[String]}  deliver_date  客人交期
 * @param {[Object]}  state
 */
Tool.forEachTime = function (page_list, is_computed, changeIndexId, computed_tab, order_time, deliver_date, state) {
  const that = this
  if (is_computed) {
    /* ----- 重新计算各节点日期 ----- */
    const [itemIndex, nodeId, nodeName] = changeIndexId.split('_')
    page_list.map(function (tab) {
      if (tab.gantt_type === computed_tab) { // 当前 tab
        const { tableData = [] } = tab
        /* 提取当前行的全部节点 { ${变量}: 自身时间 } */
        const tableNodeObj = {}
        const tabData = tableData[itemIndex]
        for (const x in tabData) {
          const node = tabData[x]
          if (node instanceof Object && (node.node_id || node.node_code)) {
            const { time, node_code } = node
            if (time && time !== '/') {
              tableNodeObj['${' + node_code + '}'] = time
            }
          }
        }
        const nodeCodeObj = Object.assign({}, tab.clacNodeMap, tableNodeObj)
        /* ----- 计算：根据当前节点计算其他节点 ----- */
        let errorNum = 0 // 异常节点数
        tableData.forEach(function (item, index) {
          if (item.count === 3) {
            for (const x in item) {
              const node = item[x]
              if (node instanceof Object && (node.node_id || node.node_code) && x === nodeId && (node.node_content_type === 'time' || node.node_content_type !== 'content')) { // 自身节点
                /* 自身：验证是否报错 */
                const { node_code, time, max_plant_enddate, min_plant_enddate } = node
                const { status, maxMinText } = that._isError(max_plant_enddate, min_plant_enddate, time, order_time, deliver_date)
                node.error = (node.node_content_type === 'content') ? false : status
                node.maxMinText = maxMinText
                nodeCodeObj['${' + node_code + '}'] = time
                if (status) {
                  errorNum++
                }
              }
            }
            for (const x in item) {
              const node = item[x]
              if (node instanceof Object && (node.node_id || node.node_code) && x !== nodeId && (node.node_content_type === 'time' || node.node_content_type !== 'content')) { // 其他节点
                /* 改变的：{ code } */
                const { node_code } = tabData[nodeId]
                /* 公式初始化：公式有可能为 null */
                node.sys_clac_formula = node.sys_clac_formula === null ? '' : node.sys_clac_formula
                node.max_section_value = node.max_section_value === null ? '' : node.max_section_value
                node.min_section_value = node.min_section_value === null ? '' : node.min_section_value
                /* 引用到此节点的其他节点：重新计算 */
                const { sys_clac_formula, max_section_value, min_section_value, time } = node
                const proving_1 = sys_clac_formula.indexOf('${' + node_code + '}') > -1 //  引用了此节点：自身公式
                const proving_2 = max_section_value.indexOf('${' + node_code + '}') > -1 // 引用了此节点：最大值公式
                const proving_3 = min_section_value.indexOf('${' + node_code + '}') > -1 // 引用了此节点：最小值公式
                if (proving_1 || proving_2 || proving_3) {
                  const now = that._returnTime(sys_clac_formula, nodeCodeObj)
                  const max = that._returnTime(max_section_value, nodeCodeObj)
                  const min = that._returnTime(min_section_value, nodeCodeObj)
                  const { status, maxMinText, show_1, show_2 } = that._isError(max, min, now, order_time, deliver_date)
                  node.min_plant_enddate = show_1
                  node.max_plant_enddate = show_2
                  node.maxMinText = maxMinText
                  if (proving_1 && time !== '/') { // 引用了此节点 && 当前节点不是'/'
                    node.time = now
                    node.final_audit_plan_enddate = now
                    node.error = (node.node_content_type === 'content') ? false : status
                    if (node.auditSplitLength === node.audit_process_record.length) {
                      node.audit_process_record.push(`原因：${nodeName} 节点变更后，重新计算`)
                    } else {
                      node.audit_process_record[node.audit_process_record.length - 1] = `原因：${nodeName} 节点变更后，重新计算`
                    }
                    if (status) {
                      errorNum++
                    }
                  }
                } else { // 没引用此节点
                  if (node.error) {
                    errorNum++
                  }
                }
              }
            }
          }
        })
        tab.errorNum = errorNum
      }
    })
    state.is_computed = false
    return page_list
  } else {
    /* ----- 不计算，直接返回 ----- */
    page_list.map(function (tab) { // tab 单个汇总表
      /* 重新计算：最大值、最小值、当前值 */
      const { tableData = [] } = tab
      let errorNum = 0
      tableData.forEach(function (item) {
        if (item.count === 3) {
          for (const x in item) {
            const node = item[x]
            if (node instanceof Object && (node.node_id || node.node_code) && (node.node_content_type === 'time' || node.node_content_type !== 'content')) {
              /* 公式初始化：公式有可能为 null */
              node.sys_clac_formula = node.sys_clac_formula === null ? '' : node.sys_clac_formula
              node.max_section_value = node.max_section_value === null ? '' : node.max_section_value
              node.min_section_value = node.min_section_value === null ? '' : node.min_section_value
              /** 验证：计划时间是否在区间内 **/
              const { max_plant_enddate, min_plant_enddate, time } = node
              const { status: errorStatus, show_1, show_2 } = that._isError(max_plant_enddate, min_plant_enddate, time, order_time, deliver_date)
              node.min_plant_enddate = show_1
              node.max_plant_enddate = show_2
              node.error = (node.node_content_type === 'content') ? false : errorStatus
              if (errorStatus) {
                errorNum++
              }
            }
          }
        }
      })
      tab.errorNum = errorNum
    })
    return page_list
  }
}

/**
 * [提交数据]
 */
Tool.submitData = function (page_list = []) {
  const that = this
  let dataList = []
  const errorArr = []
  page_list.forEach(function (tab) {
    if (String(tab.gantt_type) === '3') {
      /** 返回：整理后的数据 -- 工厂 **/
      const { arr, error } = that._returnData_3(tab)
      dataList = dataList.concat(arr)
      if (error) {
        errorArr.push(error)
      }
    } else {
      /** 返回：整理后的数据 -- 大货 **/
      const { arr, error } = that._returnData_1(tab)
      dataList = dataList.concat(arr)
      if (error) {
        errorArr.push(error)
      }
    }
  })
  return { dataList, errorArr }
}

/**
 * [返回：整理后的数据 -- 工厂]
 */
Tool._returnData_3 = function (tab = {}) {
  let error = ''
  let p_item_ganttt_id = ''
  const { gantt_type } = tab
  const data = { gantt_type }
  /* ----- 提取字段：p_item_ganttt_id ----- */
  tab.tableData.forEach(function (table) {
    if (table.is_thread === '1') {
      for (const x in table) {
        const node = table[x]
        if (node instanceof Object && (node.node_id || node.node_code)) {
          if (node.item_gantt_id) {
            p_item_ganttt_id = node.item_gantt_id
            break
          }
        }
      }
    }
  })
  /* ----- 提取数据 ----- */
  const arr = []
  tab.tableData.forEach(function (table) {
    if (table.count === 3) { // 需要调整的行
      const { gantt_audit_id } = tab
      /* data 赋值 */
      const { short_name } = table
      const { now_audit_stage, type, people, remark, auditNodeMap = {} } = table.nextAuditData
      const { node_id: auditNodeMap_node_id = '' } = auditNodeMap
      const data_2 = { gantt_audit_id: gantt_audit_id[short_name], short_name, now_audit_stage, audit_result: type, next_audit_stage: type === 1 ? auditNodeMap_node_id : '', audit_employeeid: type === 1 ? people : '', audit_remark: type === 1 ? '' : remark, p_item_ganttt_id: '' }
      const obj = Object.assign({}, data, data_2, { p_item_ganttt_id, nodeData: [] })
      /* 循环数据 */
      for (const x in table) {
        const node = table[x]
        if (node instanceof Object && (node.node_id || node.node_code)) {
          /* 添加数据 */
          const { item_gantt_id, item_gantt_detail_id, item_node_id, time: final_audit_plan_enddate, audit_process_record, plan_enddate, pageTime, node_code, text, node_content_type } = node
          const auditLength = audit_process_record.length
          obj.item_gantt_id = item_gantt_id
          obj.item_gantt_detail_id = item_gantt_detail_id
          /* 提交：改变过的节点 ((页面初始时间 !== 当前时间 && 有当前时间) || (现在异常原因 !== 原先异常原因 && 有现在异常原因)) */
          // if ((pageTime !== final_audit_plan_enddate && final_audit_plan_enddate) || (auditLength !== text.length && auditLength)) {
          if (pageTime !== final_audit_plan_enddate && final_audit_plan_enddate) {
            let auditText = ''
            if (auditLength !== text.length && auditLength) {
              const arr = audit_process_record[auditLength - 1].split('原因：')
              if (arr.length === 2) {
                auditText = arr[1]
              }
            }
            const nodeData = { item_node_id, final_audit_plan_enddate, audit_process_record: auditText, plan_enddate, node_code, is_adjustment: 1, node_content_type }
            obj.nodeData.push(nodeData)
          }
          /* 报错 */
          if (type === 2 && !remark) {
            error = '<p>大货工厂甘特表：驳回状态下，驳回意见必填</p>'
          } else if (type === '' || (type === 1 && people === '' && auditNodeMap_node_id)) {
            error = '<p>大货工厂甘特表：请完善审核信息后再提交</p>'
          }
        }
      }
      arr.push(obj)
    }
  })
  return { arr, error }
}

/**
 * [返回：整理后的数据 -- 大货]
 */
Tool._returnData_1 = function (tab = {}) {
  const obj = {}
  let error = ''
  const { gantt_type } = tab
  const data = { gantt_type }
  const tabName = { '1': '大货甘特表汇总', '2': '大货面料甘特表', '3': '大货工厂甘特表', '5': '面料甘特表' }
  tab.tableData.forEach(function (table, tableIndex) {
    if (table.count === 3) { // 需要调整的行
      const { nodeAuditids } = tab
      const { short_name } = table
      const { now_audit_stage, type, people, remark, auditNodeMap = {} } = table.nextAuditData
      const { node_id: auditNodeMap_node_id = '' } = auditNodeMap
      const data_2 = { short_name, now_audit_stage, audit_result: type, next_audit_stage: type === 1 ? auditNodeMap_node_id : '', audit_employeeid: type === 1 ? people : '', audit_remark: type === 1 ? '' : remark, p_item_ganttt_id: '' }
      /* 循环数据 */
      for (const x in table) {
        const node = table[x]
        if (node instanceof Object && (node.node_id || node.node_code)) {
          /* 添加数据 */
          const { item_gantt_id, item_gantt_detail_id, item_node_id, time: final_audit_plan_enddate, audit_process_record, plan_enddate, pageTime, node_code, text, node_content_type } = node
          const auditLength = audit_process_record.length
          if (!obj[item_gantt_detail_id]) {
            obj[item_gantt_detail_id] = {}
          }
          if (!obj[item_gantt_detail_id][tableIndex]) {
            obj[item_gantt_detail_id][tableIndex] = Object.assign({}, data, data_2, { nodeData: [] })
          }
          // gantt_audit_id： 大货用 item_gantt_detail_id 匹配， 面料用 item_gantt_id 匹配
          const gantt_audit_id = nodeAuditids[item_gantt_detail_id] && nodeAuditids[item_gantt_detail_id] !== null ? nodeAuditids[item_gantt_detail_id] : nodeAuditids[item_gantt_id]
          obj[item_gantt_detail_id][tableIndex] = Object.assign({}, obj[item_gantt_detail_id][tableIndex], { item_gantt_id, item_gantt_detail_id, gantt_audit_id })
          /* 提交：改变过的节点 ((页面初始时间 !== 当前时间 && 有当前时间) || (现在异常原因 !== 原先异常原因 && 有现在异常原因)) */
          // if ((pageTime !== final_audit_plan_enddate && final_audit_plan_enddate) || (auditLength !== text.length && auditLength)) {
          if (pageTime !== final_audit_plan_enddate && final_audit_plan_enddate) {
            let auditText = ''
            if (auditLength !== text.length && auditLength) {
              const arr = audit_process_record[auditLength - 1].split('原因：')
              if (arr.length === 2) {
                auditText = arr[1]
              }
            }
            const nodeData = { item_node_id, final_audit_plan_enddate, audit_process_record: auditText, plan_enddate, node_code, is_adjustment: 1, node_content_type }
            obj[item_gantt_detail_id][tableIndex].nodeData.push(nodeData)
          }
          /* 报错：审核信息 */
          if (type === 2 && !remark) {
            error = `<p>${tabName[gantt_type]}：驳回状态下，驳回意见必填</p>`
          } else if (type === '' || (type === 1 && people === '' && auditNodeMap_node_id)) {
            error = `<p>${tabName[gantt_type]}：请完善审核信息后再提交</p>`
          }
        }
      }
    }
  })
  const arr = []
  for (const x in obj) {
    for (const y in obj[x]) {
      arr.push(obj[x][y])
    }
  }
  return { arr, error }
}

/** --------------------------- 工具方法 --------------------------- **/

/**
 * [提取数据]
 * @param {[Object]} 接口原始数据
 */
Tool._getData = function (tabData) {
  /* ----- 返回：其他可能用到的节点对象 { ${变量}: 自身时间 } ----- */
  const { clacNodeMap = {} } = tabData
  /* ----- 返回：表格类型 ----- */
  const { gantt_type } = tabData
  /* ----- 返回：提取节点 ----- */
  const obj = {} // 表格数据
  const nodeObj_1 = {} // 返回：审核关注节点
  const nodeObj_2 = {} // 返回：其他节点
  const { itemAuditNode = [] } = tabData
  itemAuditNode.forEach(function (item) {
    /* 添加属性：本次调整 */
    item.timeType = 1 //                  未审批调整：1 时间颜色正常， 2 时间黄色
    item.change_plan_time = '' //         异常原因：调整后日期
    item.change_remaark = '' //           异常原因：调整/异常说明
    item.frist_plan_time = '' //          异常原因：首次提报日期
    item.is_change = 0 //                 异常原因：是否调整1是0否
    item.final_audit_plan_enddate = '' // 审批调整：审核调整最终计划完成时间
    item.audit_process_record = [] //     审批调整：审核过程记录
    item.auditSplitLength = 0 //          审批调整：审核过程记录条数
    item.time = item.plan_enddate //      展示的时间
    item.pageTime = item.plan_enddate //  展示的时间：初始值
    item.text = '' //                     审批调整：审核过程记录：初始值
    /* 赋值：表格数据 */
    obj[item.item_node_id] = item
    /* 节点分类 */
    const { item_node_id, node_id, node_name, is_audit_follow } = item
    if (is_audit_follow === 1) {
      nodeObj_1[item_node_id] = { item_node_id, node_id, node_name, is_audit_follow }
    } else if (is_audit_follow === 0) {
      nodeObj_2[item_node_id] = { item_node_id, node_id, node_name, is_audit_follow }
    }
  })
  /* ----- 返回：历史审核记录 ----- */
  const { itemNodeAuditDetail = [] } = tabData
  /* ----- 合并：下一步审核 ----- */
  const { nextAuditData = {} } = tabData
  nextAuditData.remark = '' // 驳回意见
  nextAuditData.type = '' //   通过 / 驳回
  nextAuditData.people = '' // 审核人
  obj.nextAuditData = nextAuditData
  /* ----- 合并：异常原因 ----- */
  const { nodeAbnormal = [] } = tabData
  nodeAbnormal.forEach(function (item) {
    if (!obj[item.item_node_id]) {
      obj[item.item_node_id] = {}
    }
    obj[item.item_node_id].verification_remark = item.verification_remark // 异常原因
    obj[item.item_node_id].change_plan_time = item.change_plan_time //       调整后日期
    obj[item.item_node_id].change_remaark = item.change_remaark //           调整/异常说明
    obj[item.item_node_id].frist_plan_time = item.frist_plan_time //         首次提报日期
    obj[item.item_node_id].is_change = item.is_change //                     是否调整1是0否
    if (item.change_plan_time) {
      obj[item.item_node_id].time = item.change_plan_time
      obj[item.item_node_id].pageTime = item.change_plan_time
    }
  })
  /* ----- 合并：审批调整 ----- */
  const { nodeAuditDetail = [] } = tabData
  nodeAuditDetail.forEach(function (item) {
    if (!obj[item.item_node_id]) {
      obj[item.item_node_id] = {}
    }
    obj[item.item_node_id].final_audit_plan_enddate = item.final_audit_plan_enddate //            审核调整最终计划完成时间
    obj[item.item_node_id].audit_process_record = item.audit_process_record.split('<br />') //    审核过程记录
    obj[item.item_node_id].auditSplitLength = item.audit_process_record.split('<br />').length // 库里的审核过程记录条数
    obj[item.item_node_id].text = item.audit_process_record.split('<br />') //                    审核过程记录：初始值
    if (item.final_audit_plan_enddate) {
      obj[item.item_node_id].time = item.final_audit_plan_enddate
      obj[item.item_node_id].pageTime = item.final_audit_plan_enddate
    }
  })
  /* ----- 合并：大货/面料 获取 gantt_audit_id ----- */
  const { nodeAuditids = {} } = tabData
  /* ----- 合并：工厂获取 gantt_audit_id ----- */
  const { gantt_audit_id } = tabData
  /* ----- 合并：工厂信息 ----- */
  const { short_name = '' } = tabData
  /* ----- 添加数据：表格 ----- */
  const { is_thread, is_audit } = tabData // 是否主线, 是否需要审核
  const tableData = [] // 表格数组
  const obj_nodeId = {} // 将节点对象改为：node_id 为索引的对象
  for (const x in obj) {
    const { node_id } = obj[x]
    if (node_id) {
      obj_nodeId[node_id] = obj[x]
    } else {
      obj_nodeId[x] = obj[x]
    }
  }
  if (is_thread === '1' || is_audit === 0) {
    /* 主线 || 不需要审核 */
    tableData.unshift(Object.assign({}, obj_nodeId, { short_name, rowType: 1, count: 1, is_thread }))
  } else {
    tableData.push(Object.assign({}, obj_nodeId, { short_name, rowType: 1, count: 3 }))
    tableData.push(Object.assign({}, obj_nodeId, { short_name, rowType: 2 }))
    tableData.push(Object.assign({}, obj_nodeId, { short_name, rowType: 3 }))
  }
  /* ----- return：tab数据 ----- */
  const tab = {
    gantt_audit_id,
    nodeAuditids,
    is_thread, //           是否主线
    is_audit, //            是否需要审核
    tableData, //           表格数据
    itemNodeAuditDetail, // 历史审核记录
    gantt_type, //          表格类型
    clacNodeMap, //         其他可能用到的节点对象 { ${变量}: 自身时间 }
    short_name //           工厂信息
  }
  /* ----- return：节点对象 ----- */
  const node_gantt_type_obj = { [gantt_type]: { nodeObj_1, nodeObj_2 } }
  return { tab, node_gantt_type_obj }
}

/**
 * [公式 转 时间]
 * @param {[String]} str         公式
 * @param {[Object]} nodeCodeObj 当前项目的节点值 { ${变量}: 自身时间 }
 */
Tool._returnTime = function (str = '', nodeCodeObj = {}) {
  const asd = str.replace(/\$\{[\w-_:/]+\}/g, function (name) {
    return nodeCodeObj[name] ? new Date(nodeCodeObj[name]).getTime() : 'xxx'
  })
  const numStr = asd.replace(/[0-9]+/g, function (num, index) {
    if (num.length < 13) {
      let isChange = true
      let beforeStr = ''
      let afterStr = ''
      let numStr = 0
      if (index !== 0) {
        beforeStr = asd[index - 1]
      }
      if (index + num.length !== asd.length) {
        afterStr = asd[index + num.length]
      }
      if (beforeStr === '*' || beforeStr === '/' || afterStr === '*' || afterStr === '/') {
        isChange = false
      }
      numStr = num
      if (isChange) {
        numStr = parseInt(numStr) * 60 * 60 * 24 * 1000
      }
      return `${numStr}`
    } else {
      return num
    }
  })
  /* 毫秒数 转 时间 */
  try {
    // eslint-disable-next-line
    const timeStr = eval(numStr)
    if (isNaN(timeStr)) {
      return ''
    } else if (new Date(timeStr).getTime() < new Date('2000-01-01').getTime()) {
      return ''
    } else {
      const d = new Date(timeStr)
      const year = d.getFullYear()
      const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
      const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
      return `${year}-${month}-${day}`
    }
  } catch (err) {
    return ''
  }
}
/**
 * [转换：处理时间格式]
 * @param {[String]} time 时间
 */
Tool._toggleTime = function (time) {
  if (time === '/') {
    return time
  } if (time) {
    const [three, two, one] = time.split(/[-//.]/g).reverse()
    /* 处理：年 */
    let year = parseInt(new Date().getFullYear()) // 年 {[Int]}
    if (!isNaN(parseInt(one))) {
      const str = String(one).trim()
      year = parseInt(String(year).slice(0, -1 * str.length) + str)
    }
    /* 处理：月 */
    let addYear = 0 // 增加的年份 {[Int]}
    let month = (isNaN(parseInt(two)) || two === '0') ? 1 : parseInt(two) // 月 {[Int]}
    for (let i = 0; ; i++) {
      if (month > 12) {
        addYear++
        month -= 12
      } else {
        break
      }
    }
    year = year + addYear
    /* 处理：日 */
    let year_2 = month < 12 ? year : year + 1
    let month_2 = month < 12 ? month + 1 : month + 1 - 12
    let day = (isNaN(parseInt(three)) || Number(three) === 0) ? 1 : parseInt(three) // 日 {[Int]}
    for (let i = 0; ; i++) {
      const maxDay = new Date(new Date(`${year_2}-${month_2}`).getTime() - 1000 * 60 * 60 * 24).getDate()
      if (day > maxDay) {
        day -= maxDay
        month++
        month_2++
        if (month > 12) {
          month -= 12
          year += 1
          year_2 += 1
        }
        if (month_2 > 12) {
          month_2 -= 12
        }
      } else {
        break
      }
    }
    /* 整合 */
    return `${year}-${'00'.slice(0, -1 * String(month).length) + month}-${'00'.slice(0, -1 * String(day).length) + day}`
  } else {
    return ''
  }
}
/**
 * [验证：计划事件是否在区间内]
 * @param {[String]} maxVal       最大值
 * @param {[String]} minVal       最小值
 * @param {[String]} plantVal     计划时间
 * @param {[String]} order_time   下单日期
 * @param {[String]} deliver_date 客人交期
 */
Tool._isError = function (maxVal = '', minVal = '', plantVal = '', order_time = '', deliver_date = '') {
  const max = isNaN(new Date(maxVal).getTime()) ? 0 : new Date(maxVal).getTime() //                 最大值
  const min = isNaN(new Date(minVal).getTime()) ? 0 : new Date(minVal).getTime() //                 最小值
  const plant = isNaN(new Date(plantVal).getTime()) ? 0 : new Date(plantVal).getTime() //           计划时间
  const order = isNaN(new Date(order_time).getTime()) ? 0 : new Date(order_time).getTime() //       下单日期
  const deliver = isNaN(new Date(deliver_date).getTime()) ? 0 : new Date(deliver_date).getTime() // 客人交期
  const countMax = deliver && deliver <= max ? deliver : max
  const countMin = order && min <= order ? order : min
  const time_1 = this._returnYearMonthDay(countMin)
  const time_2 = this._returnYearMonthDay(countMax)
  const alert_1 = time_1 === '1970-01-01' ? '未知' : time_1 // 提示文字：最小值
  const alert_2 = time_2 === '1970-01-01' ? '未知' : time_2 // 提示文字：最大值
  const show_1 = time_1 === '1970-01-01' ? '' : time_1 //     展示时间：最小值
  const show_2 = time_2 === '1970-01-01' ? '' : time_2 //     展示时间：最大值
  const maxMinText = `最早：${alert_1}，最晚：${alert_2}`
  /* 返回 */
  if (countMin && countMax && (countMin <= plant && plant <= countMax)) { // 在区间内
    return { status: false, maxMinText, show_1, show_2 }
  } else if (countMin && !countMax && countMin <= plant) { //                只有最小值 && 大于最小值
    return { status: false, maxMinText, show_1, show_2 }
  } else if (!countMin && countMax && plant <= countMax) { //                只有最大值 && 小于最大值
    return { status: false, maxMinText, show_1, show_2 }
  } else {
    return { status: true, maxMinText, show_1, show_2 }
  }
}
/**
 * [提取：年月日]
 */
Tool._returnYearMonthDay = function (strOrNum) {
  const d = new Date(strOrNum)
  const year = d.getFullYear()
  const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
  return `${year}-${month}-${day}`
}

export default Tool
