
<!-- 模块：表格 -->

<template>
  <div class="comTableBox">

    <p style="text-align: right; margin-top: -6px; margin-bottom: 4px;">
      <span>异常节点数：{{tab_list[listIndex].errorNum}}</span>&nbsp;&nbsp;
      <el-tag class="hover" size="mini" @click="isShowAllNodes = !isShowAllNodes">
        {{isShowAllNodes ? '查看关注节点' : '查看全部节点'}}
      </el-tag>
    </p>

    <el-table :data="tab_list[listIndex].tableData" size="mini" border :span-method="objectSpanMethod">
      <!-- 操作 -->
      <el-table-column label="审核" width="220" fixed>
        <template slot-scope="scope">
          <div v-if="scope.row.count > 1 && shenheObj[scope.$index]">
            <p class="tableP">
              审核结果：
              <el-radio v-model="shenheObj[scope.$index].type" :label="1" @change="changeEvent('type', $event, scope.$index)">通过</el-radio>
              <el-radio v-model="shenheObj[scope.$index].type" :label="2" @change="changeEvent('type', $event, scope.$index)">驳回</el-radio>
            </p>
            <p class="tableP" v-if="shenheObj[scope.$index].type === 2">
              <el-input class="tableInput" size="mini" v-model="shenheObj[scope.$index].remark" placeholder="请填写驳回意见" @change="changeEvent('remark', $event, scope.$index)"></el-input>
            </p>
            <p class="tableP" v-if="shenheObj[scope.$index].type === 1">
              <span>下一步审核：<span>{{scope.row.nextAuditData.nextAuditNode === 3 ? '审核结束' : scope.row.nextAuditData.auditNodeMap.node_name}}</span></span>
            </p>
            <p class="tableP" v-if="shenheObj[scope.$index].type === 1">
              下一步审核人：
              <el-select class="tableSelect" size="mini" v-model="shenheObj[scope.$index].people" :multiple="true" @change="changeEvent('people', $event, scope.$index)">
                <el-option class="comSelectOptions" v-for="item in scope.row.nextAuditData.auditEmployeeMap" :key="item.employeeid" :label="item.employeename" :value="item.employeeid"></el-option>
              </el-select>
            </p>
          </div>
        </template>
      </el-table-column>
      <!-- 项目名称 -->
      <el-table-column label="项目名称" width="100" fixed>
        <template slot-scope="scope">
          <p>{{item_name}}</p>
          <p>{{scope.row.short_name}}</p>
        </template>
      </el-table-column>

      <!-- 工厂信息 -->

      <!-- 分类列 -->
      <el-table-column width="100" fixed>
        <template slot-scope="scope">
          <span v-if="scope.row.rowType === 1">计划完成</span>
          <span v-else-if="scope.row.rowType === 2">本次调整</span>
          <span v-else-if="scope.row.rowType === 3">审批调整</span>
        </template>
      </el-table-column>

      <div v-if="nodeObj[listType]">
        <div v-for="item in nodeObj[listType]" :key="'node_' + item.item_node_id">
          <el-table-column :label="item.node_name" :column-key="item.item_node_id" width="150" v-if="isShowAllNodes || (!isShowAllNodes && item.is_audit_follow === 1)">
            <template slot-scope="scope">
              <div v-if="scope.row[item.item_node_id]">
                <!-- 计划完成 -->
                <div v-if="scope.row.rowType === 1">
                  <!-- 计划完成：异常 -->
                  <div v-if="scope.row[item.item_node_id].error">
                    <el-popover popper-class="comPopover" :visible-arrow="false" placement="top" trigger="hover" :content="'提报日期：' + scope.row[item.item_node_id].plan_enddate">
                      <span slot="reference">
                        <span class="red">{{scope.row[item.item_node_id].time}}</span>
                        <i class="el-icon-warning warningIcon"></i>
                      </span>
                    </el-popover>
                  </div>
                  <!-- 计划完成：正常 -->
                  <div v-if="!scope.row[item.item_node_id].error">
                    <el-popover popper-class="comPopover" :visible-arrow="false" placement="top" trigger="hover" :content="'提报日期：' + scope.row[item.item_node_id].plan_enddate">
                      <span slot="reference">
                        <span :style="scope.row[item.item_node_id].timeType === 2 ? 'color: #E6A23C' : ''">{{scope.row[item.item_node_id].time}}</span>
                      </span>
                    </el-popover>
                  </div>
                </div>
                <!-- 本次调整 -->
                <div v-else-if="scope.row.rowType === 2" style="text-align: left;">
                  <p v-if="scope.row[item.item_node_id].change_remaark">调整后：{{scope.row[item.item_node_id].change_plan_time}}</p>
                  <p v-if="scope.row[item.item_node_id].change_remaark">原因：{{scope.row[item.item_node_id].change_remaark}}</p>
                </div>
                <!-- 审批调整 -->
                <div v-else-if="scope.row.rowType === 3">
                  <p v-if="scope.row[item.item_node_id].audit_process_record" style="text-align: left;">{{scope.row[item.item_node_id].audit_process_record}}</p>
                  <i class="el-icon-edit-outline editIcon hover" @click="edit(scope.row, item.item_node_id, '审批调整', scope.$index)"></i>
                </div>
              </div>
              <span v-else>--</span>
            </template>
          </el-table-column>
        </div>
      </div>

    </el-table>

    <!-- 弹出层 -->
    <el-dialog class="comDialog" :title="d_data.title" :visible.sync="dialogVisible" width="80%">
      <!-- 弹出层：表单 -->
      <div class="lineBox">
        <div class="lineLabel">当前节点：</div>
        <div class="lineText">{{d_data.node_name}}</div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">系统计算日期：</div>
        <div class="lineText">{{d_data.plan_enddate}}</div>
        <div class="lineLabel" v-if="d_data.title === '节点异常处理'">异常原因：</div>
        <div class="lineText" v-if="d_data.title === '节点异常处理'">{{d_data.abnormal_reason}}</div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">是否调整日期：</div>
        <div class="lineText">
          <el-radio v-model="d_data.is_change" :label="1">是</el-radio>
          <el-radio v-model="d_data.is_change" :label="0">否</el-radio>
        </div>
        <div class="lineLabel">调整后日期：</div>
        <div class="lineText">
          <el-input class="comInput" :disabled="d_data.is_change === 0 ? true : false" slot="reference" size="mini" placeholder="请输入日期"
            v-model="d_data.change_plan_time"
          ></el-input>
        </div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">日期最小值：</div>
        <div class="lineText">
          {{d_data.min_plant_enddate}}
        </div>
        <div class="lineLabel">日期最大值：</div>
        <div class="lineText">
          {{d_data.max_plant_enddate}}
        </div>
      </div>
      <div class="lineBox">
        <div class="lineLabel"><span class="red">*</span>调整/异常原因：</div>
        <div class="lineText">
          <el-input class="comInput2" v-model="d_data.change_remaark" size="mini" placeholder="请填写调整/异常原因"></el-input>
        </div>
      </div>
      <div class="lineBox">
        <div class="lineLabel" style="width: auto;">&nbsp;&nbsp;&nbsp;是否根据当前节点的时间去计算其他节点：</div>
        <div class="lineText">
          <el-radio v-model="d_data.is_computed" :label="true">是</el-radio>
          <el-radio v-model="d_data.is_computed" :label="false">否</el-radio>
        </div>
      </div>
      <!-- 弹出层：按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="submit(d_data.title)">保 存</el-button>
        <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['listIndex', 'listType'], // 表格索引, 表格type
  data() {
    return {
      isShowAllNodes: false, // 是否显示：全部节点
      /* 审核 */
      shenheObj: {},
      /* 弹出层 */
      dialogVisible: false, // 弹出层：是否显示
      d_data: {} //            弹出层：数据
    }
  },
  created() {
    const shenheObj = {}
    const { tableData } = this.page_list[this.listIndex]
    tableData.forEach(function (item, index) {
      const { people, remark, type } = item.nextAuditData
      shenheObj[index] = { people, remark, type }
    })
    this.shenheObj = shenheObj
  },
  computed: {
    ...mapState(['nodeObj', 'page_list', 'item_name', 'employeename']),
    ...mapGetters(['tab_list'])
  },
  methods: {
    /**
     * [审核变更事件]
     * @param {[String]} name  属性名
     * @param {[String]} event 属性值
     * @param {[Int]}    index  行索引
     */
    changeEvent(name, event, index) {
      let data = event
      if (name === 'people') {
        if (typeof event === 'string') {
          data = event
        } else if (event.length) {
          data = event.join(',')
        }
      }
      this.page_list[this.listIndex].tableData[index].nextAuditData[name] = data
    },
    /**
     * [弹出层：修改]
     * @param {[Object]} row    当前行的数据
     * @param {[String]} nodeId 当前列（节点）ID
     * @param {[String]} title  弹出层标题
     * @param {[Int]}    index  行索引
     */
    edit(row, nodeId, title, index) {
      // console.log(row, index)
      const { node_name, plan_enddate, change_remaark, is_change, is_quote, change_plan_time, abnormal_reason, max_plant_enddate, min_plant_enddate } = row[nodeId]
      /* 赋值 */
      const d_data = {
        index, //              行索引
        title, //              弹出层标题
        nodeId, //             节点ID
        node_name, //          当前异常节点
        plan_enddate, //       系统计算日期
        abnormal_reason, //    异常原因
        is_change, //          是否调整日期
        is_computed: false, // 是否根据当前节点的时间去计算其他节点
        is_quote, //           是否被其他节点引用
        change_plan_time, //   调整后日期
        change_remaark, //     调整/异常原因
        max_plant_enddate, //  日期最大值
        min_plant_enddate //   日期最小值
      }
      this.d_data = d_data
      this.dialogVisible = true
    },
    /**
     * [保存]
     */
    submit(title) {
      const { d_data, page_list, listIndex, listType } = this
      const { index, nodeId, change_remaark, is_quote, is_change, is_computed, change_plan_time, plan_enddate } = d_data
      if (!change_remaark) {
        /* 报错：没写'调整/异常原因 后再保存' */
        this.$message({ message: '请填写调整/异常原因', type: 'warning' })
      } else if (is_change === 1 && is_quote === 1 && (!change_plan_time || change_plan_time === '/' || isNaN(new Date(change_plan_time).getTime()))) {
        /* 报错：变更，被引用，没选调整后日期 */
        this.$message({ message: '此节点被其他节点引用，请填写正确的 调整后日期 后再保存', type: 'warning' })
      } else if (plan_enddate === change_plan_time) {
        /* 报错：系统计算日期 === 调整后日期 */
        this.$message({ message: '系统计算日期 不能等于 调整后日期', type: 'warning' })
      } else {
        const change_plan_time = is_change === 0 ? '' : this._toggleTime(d_data.change_plan_time) // 不调整：调整后日期为空
        const time = this._getTime()
        const { employeename } = this
        const text = `${time}，${employeename}调整为${change_plan_time},原因：${change_remaark}`
        page_list[listIndex].tableData[index - 2][nodeId].final_audit_plan_enddate = change_plan_time // 审核调整最终计划完成时间
        page_list[listIndex].tableData[index - 2][nodeId].audit_process_record = text //                 审核过程记录
        page_list[listIndex].tableData[index - 2][nodeId].is_change = is_change //                       是否调整日期
        page_list[listIndex].tableData[index - 2][nodeId].time = change_plan_time //                     展示时间
        page_list[listIndex].tableData[index - 2][nodeId].timeType = 2
        this.dialogVisible = false
        this.$store.commit('saveData', { name: 'is_computed', obj: is_computed })
        this.$store.commit('saveData', { name: 'is_computed_id', obj: nodeId })
        this.$store.commit('saveData', { name: 'computed_index', obj: index - 2 })
        this.$store.commit('saveData', { name: 'computed_tab', obj: listType })
        this.$store.commit('saveData', { name: 'isComputed', obj: new Date().getTime() })
      }
    },
    /**
     * [表格：合并行]
     */
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex < 2) {
        const { count } = row
        if (count > 1) {
          return { rowspan: count, colspan: 1 }
        } else if (count === 1) {
          return { rowspan: 1, colspan: 1 }
        } else {
          return { rowspan: 0, colspan: 0 }
        }
      }
    },
    _getTime() {
      const d = new Date()
      const year = d.getFullYear()
      const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
      const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
      return `${year}-${month}-${day}`
    },
    /**
     * [转换：年年年年-月月-日日]
     * @param {[String]} time 输入的日期格式字符串
     */
    _toggleTime(time) {
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
        let month = isNaN(parseInt(two)) ? 1 : parseInt(two) // 月 {[Int]}
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
        let day = isNaN(parseInt(three)) ? 1 : parseInt(three) // 日 {[Int]}
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
  }
}
</script>

<style scoped>
.comTableBox {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/*** 表格容器 ***/
.tableP {
  text-align: left;
}
.tableInput {
  width: 100%;
}
.tableSelect {
  width: 100px;
}
.comInput {
  width: 125px;
  margin: 2px 0;
}
.warningIcon { /* 报错 */
  color: #F56C6C;
  font-size: 16px;
}
.red {
  color: #F56C6C;
}
.hover {
  cursor: pointer;
}
.editIcon { /* 编辑图标 */
  color: #409EFF;
  font-size: 14px;
}

/*** 弹出层 ***/
.lineBox {
  font-size: 12px;
  border-bottom: 1px solid #E4E7ED;
  border-left: 1px solid #E4E7ED;
  display: flex;
  align-items: center;
  flex: 1;
}
.lineBox:first-child {
  border-top: 1px solid #E4E7ED;
}
.lineLabel {
  width: 110px;
  min-width: 110px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.lineText {
  min-height: 35px;
  padding: 0 6px;
  border-right: 1px solid #E4E7ED;
  display: flex;
  align-items: center;
  flex: 1;
}
.comInput2 {
  flex: 1;
}
</style>

<style>
/*** 弹出气泡 ***/
.el-popover {
  max-width: 400px !important;
}

/*** 弹出层 ***/
.comDialog > .el-dialog > .el-dialog__body {
  padding: 10px 20px !important;
}
</style>
