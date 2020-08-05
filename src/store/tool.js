
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
Tool.returnDatalist = function (itemGanttSummaryDatd) {
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
            nodeObj[x][y][z] = node
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
    dataObj[tab.gantt_type].tableData.sort(function (val1, val2) { // 表格数据排序：主线第一条，不审核的在需审核上面
      if (val1.count === 1) {
        if (val2.count > 1) {
          return -1
        }
        if (val2.count === 1) {
          if (Object.keys(val1.nextAuditData).length < Object.keys(val2.nextAuditData).length) {
            return -1
          } else {
            return 1
          }
        }
        return -1
      } else {
        return 0
      }
    })
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
    arr.push(dataObj[x])
  }
  return { arr, nodeObj: nodeObj_f }
}

/**
 * [计算时间]
 * @param {[Array]}   page_list      数据
 * @param {[Boolean]} is_computed    保存后，是否根据当前节点时间，计算其他节点
 * @param {[String]}  is_computed_id 重新计算时，作为基础值的节点（此节点自身不变，重新计算最大最小值）
 * @param {[Int]}     computed_index 重新计算的行索引
 * @param {[String]}  computed_tab   重新计算的tab
 * @param {[Object]}  state
 */
Tool.forEachTime = function (page_list, is_computed, is_computed_id, computed_index, computed_tab, state) {
  const that = this
  if (is_computed) {
    console.log('page_list ----- ', page_list)
    /* ----- 重新计算各节点日期 ----- */
    page_list.map(function (tab) {
      if (tab.gantt_type === computed_tab) { // 当前 tab
        const { tableData = [] } = tab
        /* 提取当前行的全部节点 { ${变量}: 自身时间 } */
        const tableNodeObj = {}
        const tabData = tableData[computed_index]
        for (const x in tabData) {
          if (x !== 'nextAuditData' && x !== 'rowType' && x !== 'count' && x !== 'short_name' && x !== 'is_thread') {
            const { node_code, time } = tabData[x]
            tableNodeObj['${' + node_code + '}'] = time
          }
        }
        const nodeCodeObj = Object.assign({}, tab.clacNodeMap, tableNodeObj)
        /* 重新计算：最大值、最小值、当前值 */
        let errorNum = 0 // 异常节点数
        // console.log('tableData ----- ', tableData)
        tableData.forEach(function (item, itemIndex) {
          if (item.count === 3) {
            for (const x in item) {
              if (x !== 'nextAuditData' && x !== 'rowType' && x !== 'count' && x !== 'short_name' && x !== 'is_thread') {
                const node = item[x]
                let max = node.max_plant_enddate
                let min = node.min_plant_enddate
                /* 重新计算时间：指定行 */
                if (itemIndex === computed_index) {
                  const { max_section_value, min_section_value, sys_clac_formula } = node
                  if (x !== is_computed_id) {
                    const self = that._returnTime(sys_clac_formula, nodeCodeObj)
                    if (self !== node.time) {
                      node.time = self
                      node.audit_process_record = '其他节点变更后，重新计算'
                    }
                  }
                  max = that._returnTime(max_section_value, nodeCodeObj)
                  min = that._returnTime(min_section_value, nodeCodeObj)
                  node.max_plant_enddate = max
                  node.min_plant_enddate = min
                  node.maxMinText = `最早：${min}，最晚：${max}`
                }
                /** 验证：计划时间是否在区间内 **/
                const errorStatus = that._isError(max, min, node.time)
                node.error = errorStatus
                if (errorStatus) {
                  errorNum++
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
      tableData.forEach(function (item, itemIndex) {
        if (item.count === 3) {
          for (const x in item) {
            if (x !== 'nextAuditData' && x !== 'rowType' && x !== 'count' && x !== 'short_name' && x !== 'is_thread') {
              const node = item[x]
              const { max_plant_enddate, min_plant_enddate, time } = node
              /** 验证：计划时间是否在区间内 **/
              const errorStatus = that._isError(max_plant_enddate, min_plant_enddate, time)
              node.error = errorStatus
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
      errorArr.push(error)
      // console.log('工厂 ----- ', arr, error)
    } else {
      /** 返回：整理后的数据 -- 大货 **/
      const { arr, error } = that._returnData_1(tab)
      dataList = dataList.concat(arr)
      errorArr.push(error)
      // console.log('大货 ----- ', arr, error)
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
        if (x !== 'nextAuditData' && x !== 'rowType' && x !== 'count' && x !== 'short_name' && x !== 'is_thread') {
          if (table[x].item_gantt_id) {
            p_item_ganttt_id = table[x].item_gantt_id
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
      const { now_audit_stage, type, people, remark, auditNodeMap: { node_id } } = table.nextAuditData
      const data_2 = { gantt_audit_id: gantt_audit_id[short_name], short_name, now_audit_stage, audit_result: type, next_audit_stage: type === 1 ? node_id : '', audit_employeeid: type === 1 ? people : '', audit_remark: type === 1 ? '' : remark, p_item_ganttt_id: '' }
      const obj = Object.assign({}, data, data_2, { p_item_ganttt_id, nodeData: [] })
      /* 循环数据 */
      for (const x in table) {
        if (x !== 'nextAuditData' && x !== 'rowType' && x !== 'count' && x !== 'short_name' && x !== 'is_thread') {
          /* 添加数据 */
          const { item_gantt_id, item_gantt_detail_id, item_node_id, final_audit_plan_enddate, audit_process_record, plan_enddate, node_code } = table[x]
          const nodeData = { item_node_id, final_audit_plan_enddate, audit_process_record: audit_process_record.split('原因：')[1], plan_enddate, node_code }
          obj.item_gantt_id = item_gantt_id
          obj.item_gantt_detail_id = item_gantt_detail_id
          obj.nodeData.push(nodeData)
          /* 报错 */
          if (type === 2 && !remark) {
            error = '大货工厂甘特表：驳回状态下，驳回意见必填'
          } else if (type === '' || (type === 1 && people === '')) {
            error = '大货工厂甘特表：请完善审核信息后再提交'
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
  tab.tableData.forEach(function (table) {
    if (table.count === 3) { // 需要调整的行
      const { nodeAuditids } = tab
      /* data 赋值 */
      const { short_name } = table
      const { now_audit_stage, type, people, remark, auditNodeMap: { node_id } } = table.nextAuditData
      const data_2 = { short_name, now_audit_stage, audit_result: type, next_audit_stage: type === 1 ? node_id : '', audit_employeeid: type === 1 ? people : '', audit_remark: type === 1 ? '' : remark, p_item_ganttt_id: '' }
      /* 循环数据 */
      for (const x in table) {
        if (x !== 'nextAuditData' && x !== 'rowType' && x !== 'count' && x !== 'short_name' && x !== 'is_thread') {
          /* 添加数据 */
          const { item_gantt_id, item_gantt_detail_id, item_node_id, final_audit_plan_enddate, audit_process_record, plan_enddate, node_code } = table[x]
          const nodeData = { item_node_id, final_audit_plan_enddate, audit_process_record: audit_process_record.split('原因：')[1], plan_enddate, node_code }
          if (!obj[item_gantt_detail_id]) {
            obj[item_gantt_detail_id] = Object.assign({}, data, data_2, { item_gantt_id, item_gantt_detail_id, gantt_audit_id: nodeAuditids[item_gantt_detail_id], nodeData: [] })
          }
          obj[item_gantt_detail_id].nodeData.push(nodeData)
          /* 报错 */
          if (type === 2 && !remark) {
            error = '大货甘特表汇总：驳回状态下，驳回意见必填'
          } else if (type === '' || (type === 1 && people === '')) {
            error = '大货甘特表汇总：请完善审核信息后再提交'
          }
        }
      }
    }
  })
  const arr = []
  for (const x in obj) {
    arr.push(obj[x])
  }
  return { arr, error }
}

/** --------------------------- 工具方法 --------------------------- **/

/**
 * [提取数据]
 * @param {[Object]} 接口原始数据
 */
Tool._getData = function (tabData) {
  const that = this
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
    /** 验证：是否被引用 **/
    const { node_code } = item
    item.isUsed = that._isUsed(itemAuditNode, node_code).status
    /* 添加属性：本次调整 */
    item.time = item.change_plan_time ? item.change_plan_time : item.plan_enddate // 展示的时间 （变更时间 || 原始时间，后期会变为审批调整时间）
    item.timeType = 1 //                  未审批调整
    item.abnormal_reason = '' //          异常原因：异常原因
    item.change_plan_time = '' //         异常原因：调整后日期
    item.change_remaark = '' //           异常原因：调整/异常说明
    item.frist_plan_time = '' //          异常原因：首次提报日期
    item.is_change = 0 //                 异常原因：是否调整1是0否
    item.final_audit_plan_enddate = '' // 审批调整：审核调整最终计划完成时间
    item.audit_process_record = '' //     审批调整：审核过程记录
    /* 赋值：表格数据 */
    obj[item.item_node_id] = item
    /* 节点分类 */
    const { item_node_id, node_name, is_audit_follow } = item
    if (is_audit_follow === 1) {
      nodeObj_1[item_node_id] = { item_node_id, node_name, is_audit_follow }
    } else if (is_audit_follow === 0) {
      nodeObj_2[item_node_id] = { item_node_id, node_name, is_audit_follow }
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
    obj[item.item_node_id].abnormal_reason = item.abnormal_reason //   异常原因
    obj[item.item_node_id].change_plan_time = item.change_plan_time // 调整后日期
    obj[item.item_node_id].change_remaark = item.change_remaark //     调整/异常说明
    obj[item.item_node_id].frist_plan_time = item.frist_plan_time //   首次提报日期
    obj[item.item_node_id].is_change = item.is_change //               是否调整1是0否
    if (item.change_plan_time) {
      obj[item.item_node_id].time = item.change_plan_time
    }
  })
  /* ----- 合并：审批调整 ----- */
  const { nodeAuditDetail = [] } = tabData
  nodeAuditDetail.forEach(function (item) {
    if (!obj[item.item_node_id]) {
      obj[item.item_node_id] = {}
    }
    obj[item.item_node_id].final_audit_plan_enddate = item.final_audit_plan_enddate // 审核调整最终计划完成时间
    obj[item.item_node_id].audit_process_record = item.audit_process_record //         审核过程记录
  })
  /* ----- 合并：大货获取gantt_audit_id ----- */
  const { nodeAuditids = {} } = tabData
  /* ----- 合并：工厂获取gantt_audit_id ----- */
  const { gantt_audit_id } = tabData
  /* ----- 合并：工厂信息 ----- */
  const { short_name = '' } = tabData
  /* ----- 添加数据：表格 ----- */
  const { is_thread, is_audit } = tabData // 是否主线, 是否需要审核
  const tableData = [] // 表格数组
  if (is_thread === '1' || is_audit === 0) {
    /* 主线 || 不需要审核 */
    tableData.unshift(Object.assign({}, obj, { short_name, rowType: 1, count: 1, is_thread }))
  } else {
    tableData.push(Object.assign({}, obj, { short_name, rowType: 1, count: 3 }))
    tableData.push(Object.assign({}, obj, { short_name, rowType: 2 }))
    tableData.push(Object.assign({}, obj, { short_name, rowType: 3 }))
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
Tool._returnTime = function (str, nodeCodeObj) {
  /* 替换：变量、常量 */
  const numStr = str.replace(/[0-9]+/g, function (num) {
    return parseInt(num) * 60 * 60 * 24 * 1000
  }).replace(/\$\{[\w-_:/]+\}/g, function (name) {
    return nodeCodeObj[name] ? new Date(nodeCodeObj[name]).getTime() : 0
  })
  /* 毫秒数 转 时间 */
  // eslint-disable-next-line
  const d = new Date(eval(numStr))
  const year = d.getFullYear()
  const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
  return `${year}-${month}-${day}`
}
/**
 * [验证：计划事件是否在区间内]
 * @param {[String]} maxVal   最大值
 * @param {[String]} minVal   最小值
 * @param {[String]} plantVal 计划事件
 */
Tool._isError = function (maxVal = '', minVal = '', plantVal = '') {
  const max = new Date(maxVal).getTime()
  const min = new Date(minVal).getTime()
  const plant = new Date(plantVal).getTime()
  if (min <= plant && plant <= max) {
    return false
  } else {
    return true
  }
}
/**
 * [验证：是否用到此节点]
 * @param  {[Array]}  nodeList_0 单条原始节点数据
 * @param  {[String]} node_code  节点 code
 * @return {[Object]} { 是否被引用, 此节点的原始时间, 引用此节点的节点 }
 */
Tool._isUsed = function (nodeList_0 = [], node_code) {
  let status = false
  let time = ''
  const nameArr = []
  nodeList_0.forEach(function (item) {
    /* 是否引用 */
    const { max_section_value, min_section_value, sys_clac_formula } = item // 计算公式：最大值，最小值，自身
    if (item.node_code !== node_code && (max_section_value.indexOf(node_code) > -1 || min_section_value.indexOf(node_code) > -1 || sys_clac_formula.indexOf(node_code) > -1)) {
      status = true
      nameArr.push(item.node_name)
    }
    /* 原始时间 */
    if (item.node_code === node_code) {
      time = item.first_plant_enddate
    }
  })
  return { status, time, name: nameArr.join('、') }
}

export default Tool
