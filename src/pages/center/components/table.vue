
<!-- 模块：表格 -->

<template>
  <div class="comTableBox" v-if="tab_list[listIndex]">

    <p style="text-align: right; margin-top: -6px; margin-bottom: 4px;">
      <span>异常节点数：{{tab_list[listIndex] ? tab_list[listIndex].errorNum : 0}}</span>&nbsp;&nbsp;
      <el-tag class="hover" size="mini" @click="toggleIsShowAllNodes">
        {{isShowAllNodes ? '查看关注节点' : '查看全部节点'}}
      </el-tag>
    </p>

    <!-- *** 全部节点 *** -->
    <el-table v-if="isShowAllNodes" :data="tab_list[listIndex].tableData" size="mini" border :span-method="objectSpanMethod">
      <!-- 操作 -->
      <el-table-column label="审核" width="220" fixed="left">
        <template slot-scope="scope">
          <div class="tablePBox" v-if="scope.row.count > 1 && shenheObj[scope.$index]">
            <p class="tableP">
              审核结果：
              <el-radio v-model="shenheObj[scope.$index].type" :label="1" @change="changeEvent('type', $event, scope.$index, scope.row.nextAuditData.nextAuditNode)">通过</el-radio>
              <el-radio v-model="shenheObj[scope.$index].type" :label="2" @change="changeEvent('type', $event, scope.$index, scope.row.nextAuditData.nextAuditNode)">驳回</el-radio>
            </p>
            <p class="tableP" v-if="shenheObj[scope.$index].type === 2">
              <el-input class="tableInput" size="mini" v-model="shenheObj[scope.$index].remark" placeholder="请填写驳回意见" @change="changeEvent('remark', $event, scope.$index)"></el-input>
            </p>
            <p class="tableP" v-if="shenheObj[scope.$index].type === 1">
              <span>下一步审核：<span>{{scope.row.nextAuditData.nextAuditNode === 3 ? '审核结束' : scope.row.nextAuditData.auditNodeMap.node_name}}</span></span>
            </p>
            <p class="tableP" v-if="shenheObj[scope.$index].type === 1 && scope.row.nextAuditData.nextAuditNode !== 3">
              下一步审核人：
              <el-select class="tableSelect" size="mini" v-model="shenheObj[scope.$index].people" :multiple="shenheObj[scope.$index].is_multiple" @change="changeEvent('people', $event, scope.$index)">
                <el-option class="comSelectOptions" v-for="item in scope.row.nextAuditData.auditEmployeeMap" :key="item.employeeid" :label="item.employeename" :value="item.employeeid"></el-option>
              </el-select>
            </p>
          </div>
        </template>
      </el-table-column>
      <!-- 项目名称 -->
      <el-table-column label="项目名称" width="100" fixed="left">
        <template slot-scope="scope">
          <p>{{item_name}}</p>
          <p>{{scope.row.short_name}}</p>
        </template>
      </el-table-column>
      <!-- 分类列 -->
      <el-table-column width="100" fixed="left">
        <template slot-scope="scope">
          <span v-if="scope.row.rowType === 1">计划完成</span>
          <span v-else-if="scope.row.rowType === 2">本次调整</span>
          <span v-else-if="scope.row.rowType === 3">审批调整</span>
        </template>
      </el-table-column>
      <div v-if="nodeObj[listType]">
        <div v-for="item in nodeObj[listType]" :key="'node_' + item.node_id">
          <el-table-column :label="item.node_name" :column-key="item.node_id" width="150">
            <template slot-scope="scope">
              <div v-if="scope.row[item.node_id]">
                <!-- 计划完成 -->
                <div v-if="scope.row.rowType === 1">
                  <!-- <p>{{scope.row[item.node_id].node_code}}</p>
                  <br>
                  <p>{{scope.row[item.node_id].sys_clac_formula}}</p>
                  <br> -->
                  <!-- 计划完成：文本节点 -->
                  <div v-if="_isContentNode(scope.row, item.node_id)">
                    <span>{{scope.row[item.node_id].time}}</span>
                  </div>
                  <!-- 计划完成：异常 -->
                  <div v-else-if="scope.row[item.node_id].error">
                    <el-popover popper-class="comPopover" :visible-arrow="false" placement="top" trigger="hover" :content="'提报日期：' + scope.row[item.node_id].plan_enddate">
                      <span slot="reference">
                        <span class="red">{{scope.row[item.node_id].time}}</span>
                        <i class="el-icon-warning warningIcon"></i>
                      </span>
                    </el-popover>
                  </div>
                  <!-- 计划完成：正常 -->
                  <div v-else-if="!scope.row[item.node_id].error">
                    <el-popover popper-class="comPopover" :visible-arrow="false" placement="top" trigger="hover" :content="'提报日期：' + scope.row[item.node_id].plan_enddate">
                      <span slot="reference">
                        <span :style="scope.row[item.node_id].timeType === 2 ? 'color: #E6A23C' : ''">{{scope.row[item.node_id].time}}</span>
                      </span>
                    </el-popover>
                  </div>
                </div>
                <!-- 本次调整 -->
                <div v-else-if="scope.row.rowType === 2" style="text-align: left;">
                  <div v-if="_isContentNode(scope.row, item.node_id)">
                    <p v-if="scope.row[item.node_id].change_remaark">{{scope.row[item.node_id].change_remaark}}</p>
                  </div>
                  <div v-else-if="_isShowText(scope.row, item.node_id)">
                    <p>调整后：{{scope.row[item.node_id].change_plan_time || '未调整'}}</p>
                    <p>原因：{{scope.row[item.node_id].change_remaark}}</p>
                  </div>
                </div>
                <!-- 审批调整 -->
                <div v-else-if="scope.row.rowType === 3">
                  <div v-if="scope.row[item.node_id].audit_process_record" style="text-align: left;">
                    <p v-for="(val, key) in scope.row[item.node_id].audit_process_record" :key="'text_' + key">{{val}}</p>
                  </div>
                  <i class="el-icon-edit-outline editIcon hover"
                    v-if="String(scope.row[item.node_id].is_complete) !== '1'"
                    @click="edit(scope.$index, scope.row, item)"
                  ></i>
                </div>
              </div>
              <span v-else>--</span>
            </template>
          </el-table-column>
        </div>
      </div>
    </el-table>
    <!-- *** 全部节点 *** -->

    <!-- *** 关注节点 *** -->
    <el-table v-else :data="tab_list[listIndex].tableData" size="mini" border :span-method="objectSpanMethod">
      <!-- 操作 -->
      <el-table-column label="审核" width="220" fixed="left">
        <template slot-scope="scope">
          <div class="tablePBox" v-if="scope.row.count > 1 && shenheObj[scope.$index]">
            <p class="tableP">
              审核结果：
              <el-radio v-model="shenheObj[scope.$index].type" :label="1" @change="changeEvent('type', $event, scope.$index, scope.row.nextAuditData.nextAuditNode)">通过</el-radio>
              <el-radio v-model="shenheObj[scope.$index].type" :label="2" @change="changeEvent('type', $event, scope.$index, scope.row.nextAuditData.nextAuditNode)">驳回</el-radio>
            </p>
            <p class="tableP" v-if="shenheObj[scope.$index].type === 2">
              <el-input class="tableInput" size="mini" v-model="shenheObj[scope.$index].remark" placeholder="请填写驳回意见" @change="changeEvent('remark', $event, scope.$index)"></el-input>
            </p>
            <p class="tableP" v-if="shenheObj[scope.$index].type === 1">
              <span>下一步审核：<span>{{scope.row.nextAuditData.nextAuditNode === 3 ? '审核结束' : scope.row.nextAuditData.auditNodeMap.node_name}}</span></span>
            </p>
            <p class="tableP" v-if="shenheObj[scope.$index].type === 1 && scope.row.nextAuditData.nextAuditNode !== 3">
              下一步审核人：
              <el-select class="tableSelect" size="mini" v-model="shenheObj[scope.$index].people" :multiple="shenheObj[scope.$index].is_multiple" @change="changeEvent('people', $event, scope.$index)">
                <el-option class="comSelectOptions" v-for="item in scope.row.nextAuditData.auditEmployeeMap" :key="item.employeeid" :label="item.employeename" :value="item.employeeid"></el-option>
              </el-select>
            </p>
          </div>
        </template>
      </el-table-column>
      <!-- 项目名称 -->
      <el-table-column label="项目名称" width="100" fixed="left">
        <template slot-scope="scope">
          <!-- <p>{{scope.row.is_thread}}</p> -->
          <p>{{item_name}}</p>
          <p>{{scope.row.short_name}}</p>
        </template>
      </el-table-column>
      <!-- 分类列 -->
      <el-table-column width="100" fixed="left">
        <template slot-scope="scope">
          <span v-if="scope.row.rowType === 1">计划完成</span>
          <span v-else-if="scope.row.rowType === 2">本次调整</span>
          <span v-else-if="scope.row.rowType === 3">审批调整</span>
        </template>
      </el-table-column>
      <div v-if="nodeObj[listType]">
        <div v-for="item in nodeObj[listType]" :key="'node_' + item.node_id">
          <el-table-column :label="item.node_name" :column-key="item.node_id" width="150" v-if="item.is_audit_follow === 1">
            <template slot-scope="scope">
              <div v-if="scope.row[item.node_id]">
                <!-- 计划完成 -->
                <div v-if="scope.row.rowType === 1">
                  <!-- 计划完成：文本节点 -->
                  <div v-if="_isContentNode(scope.row, item.node_id)">
                    <span>{{scope.row[item.node_id].time}}</span>
                  </div>
                  <!-- 计划完成：异常 -->
                  <div v-else-if="scope.row[item.node_id].error">
                    <el-popover popper-class="comPopover" :visible-arrow="false" placement="top" trigger="hover" :content="'提报日期：' + scope.row[item.node_id].plan_enddate">
                      <span slot="reference">
                        <span class="red">{{scope.row[item.node_id].time}}</span>
                        <i class="el-icon-warning warningIcon"></i>
                      </span>
                    </el-popover>
                  </div>
                  <!-- 计划完成：正常 -->
                  <div v-else-if="!scope.row[item.node_id].error">
                    <el-popover popper-class="comPopover" :visible-arrow="false" placement="top" trigger="hover" :content="'提报日期：' + scope.row[item.node_id].plan_enddate">
                      <span slot="reference">
                        <span :style="scope.row[item.node_id].timeType === 2 ? 'color: #E6A23C' : ''">{{scope.row[item.node_id].time}}</span>
                      </span>
                    </el-popover>
                  </div>
                </div>
                <!-- 本次调整 -->
                <div v-else-if="scope.row.rowType === 2" style="text-align: left;">
                  <div v-if="_isContentNode(scope.row, item.node_id)">
                    <p v-if="scope.row[item.node_id].change_remaark">{{scope.row[item.node_id].change_remaark}}</p>
                  </div>
                  <div v-else-if="_isShowText(scope.row, item.node_id)">
                    <p>调整后：{{scope.row[item.node_id].change_plan_time || '未调整'}}</p>
                    <p>原因：{{scope.row[item.node_id].change_remaark}}</p>
                  </div>
                </div>
                <!-- 审批调整 -->
                <div v-else-if="scope.row.rowType === 3">
                  <div v-if="scope.row[item.node_id].audit_process_record" style="text-align: left;">
                    <p v-for="(val, key) in scope.row[item.node_id].audit_process_record" :key="'text_' + key">{{val}}</p>
                  </div>
                  <i class="el-icon-edit-outline editIcon hover"
                    v-if="String(scope.row[item.node_id].is_complete) !== '1'"
                    @click="edit(scope.$index, scope.row, item)"
                  ></i>
                </div>
              </div>
              <span v-else>--</span>
            </template>
          </el-table-column>
        </div>
      </div>
    </el-table>
    <!-- *** 关注节点 *** -->

    <!-- 弹出层 -->
    <el-dialog class="comDialog" :title="d_data.title" :visible.sync="dialogVisible" width="80%" :close-on-click-modal="false" :close-on-press-escape="false">
      <!-- 弹出层：表单 -->
      <div class="lineBox">
        <div class="lineLabel">当前节点：</div>
        <div class="lineText">{{d_data.node_name}}</div>
        <div class="lineLabel">异常原因：</div>
        <div class="lineText">{{d_data.verification_remark}}</div>
      </div>
      <div class="lineBox" v-if="d_data.node_content_type === 'time' || d_data.node_content_type !== 'content'">
        <div class="lineLabel">用户提报日期：</div>
        <div class="lineText">{{d_data.plan_enddate}}</div>
        <div class="lineLabel">计划完成日期：</div>
        <div class="lineText">{{d_data.pageTime}}</div>
      </div>
      <div class="lineBox" v-if="d_data.node_content_type === 'time' || d_data.node_content_type !== 'content'">
        <div class="lineLabel">是否调整日期：</div>
        <div class="lineText">
          <el-radio v-model="d_data.is_change" :label="1" @change="isChangeTime">是</el-radio>
          <el-radio v-model="d_data.is_change" :label="0" @change="isChangeTime">否</el-radio>
        </div>
        <div class="lineLabel">调整后日期：</div>
        <div class="lineText">
          <el-input class="comTimeInput" :class="d_data.error && d_data.is_change === 1 ? 'errorInput' : ''" slot="reference" size="mini" placeholder="请输入日期" maxlength="10"
            :disabled="d_data.is_change === 0 ? true : false"
            v-model="d_data.change_plan_time" @blur="blur_dialog('change_plan_time')"
          ></el-input>
        </div>
      </div>
      <div class="lineBox" v-if="d_data.node_content_type === 'time' || d_data.node_content_type !== 'content'">
        <div class="lineLabel">日期最小值：</div>
        <div class="lineText">
          {{d_data.min_plant_enddate}}
        </div>
        <div class="lineLabel">日期最大值：</div>
        <div class="lineText">
          {{d_data.max_plant_enddate}}
        </div>
      </div>
      <div class="lineBox" v-if="d_data.node_content_type === 'time' || d_data.node_content_type !== 'content'">
        <div class="lineLabel">
          <span class="red" v-if="d_data.error">*</span>
          调整/异常原因：
        </div>
        <div class="lineText">
          <el-input class="comInput2" v-model="d_data.change_remaark" size="mini" placeholder="请填写调整/异常原因" maxlength="200"></el-input>
        </div>
      </div>
      <div class="lineBox" v-if="d_data.is_change === 1 && (d_data.node_content_type === 'time' || d_data.node_content_type !== 'content')">
        <div class="lineLabel" style="width: auto;">&nbsp;&nbsp;&nbsp;是否根据当前节点的时间去计算其他节点：</div>
        <div class="lineText">
          <el-radio v-model="d_data.isComputedOther" :label="true">是</el-radio>
          <el-radio v-model="d_data.isComputedOther" :label="false">否</el-radio>
        </div>
      </div>
      <div class="lineBox" v-if="d_data.node_content_type === 'content'">
        <div class="lineLabel">节点信息：</div>
        <div class="lineText">{{d_data.plan_enddate}}</div>
      </div>
      <div class="lineBox" v-if="d_data.node_content_type === 'content'">
        <div class="lineLabel">调整后节点信息：</div>
        <div class="lineText">
          <el-input class="" size="mini" placeholder="请输入文字内容" maxlength="200" v-model="d_data.change_plan_time"></el-input>
        </div>
      </div>
      <div class="lineBox" v-if="d_data.node_content_type === 'content'">
        <div class="lineLabel">调整原因/意见：</div>
        <div class="lineText">
          <el-input class="comInput2" v-model="d_data.change_remaark" size="mini" placeholder="请填写调整原因/意见" maxlength="200"></el-input>
        </div>
      </div>
      <!-- 弹出层：按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="mini" @click="submit(d_data.title)">保 存</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import Tool from '../../../store/tool.js'
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['listIndex', 'listType', 'isShowAllNodes'], // 表格索引, 表格type, 是否显示：全部节点
  data() {
    return {
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
      const { people, remark, type, auditNodeMap = {} } = item.nextAuditData
      const { is_multiple = 0 } = auditNodeMap
      shenheObj[index] = { people, remark, type, is_multiple: Boolean(is_multiple) }
    })
    this.shenheObj = shenheObj
  },
  computed: {
    ...mapState(['nodeObj', 'page_list', 'item_name', 'employeename', 'itemSummaryItemData']),
    ...mapGetters(['tab_list'])
  },
  methods: {
    /**
     * [切换：是否显示全部节点]
     */
    toggleIsShowAllNodes() {
      const { listIndex } = this
      this.$emit('toggleIsShowAllNodes', { listIndex })
    },
    /**
     * [审核变更事件]
     * @param {[String]} name  属性名
     * @param {[String]} event 属性值
     * @param {[Int]}    index  行索引
     * @param {[Int]}    nextAuditNode 下一步审核
     */
    changeEvent(name, event, index, nextAuditNode) {
      let data = event
      /* 选中：审核人 */
      if (name === 'people') {
        if (typeof event === 'string') {
          data = event
        } else if (event.length) {
          data = event.join(',')
        }
      }
      /* 选中后：下一步审核 === 结束 */
      if (nextAuditNode === 3) {
        this.page_list[this.listIndex].tableData[index].nextAuditData.people = ''
      }
      /* 事件赋值 */
      this.page_list[this.listIndex].tableData[index].nextAuditData[name] = data
    },
    /**
     * [弹出层：显示]
     *  @param {[Int]}   index    行索引
     * @param {[Object]} row      当前行的数据
     * @param {[Object]} nodeData 节点信息
     */
    edit(index, row, nodeData) {
      // console.log(row, nodeData)
      const { itemSummaryItemData: { order_time, deliver_date }, item_name } = this // 下单时间，客人交期,项目名称
      const { short_name } = row // 工厂名称
      const { node_id: nodeId, node_name: nodeName } = nodeData // 节点ID，节点名称
      const { node_content_type, pageTime, timeType, error, time, text, audit_process_record, is_change = 0, isComputedOther = false, final_audit_plan_enddate: change_plan_time, verification_remark, max_plant_enddate, min_plant_enddate, plan_enddate } = row[nodeId]
      const node_name = short_name ? [item_name, short_name, nodeName].join(' > ') : [item_name, nodeName].join(' > ')
      const length = audit_process_record.length
      const change_remaark = timeType === 2 && audit_process_record.length ? audit_process_record[length - 1].split('原因：')[1] : ''
      /* 赋值 */
      const d_data = {
        index, //               行索引
        order_time, //          下单日期
        deliver_date, //        客人交期
        title: '审批调整', //    弹出层标题
        nodeId, //              节点ID
        error, //               是否报错
        node_name, //           当前异常节点
        nodeName, //            节点名称
        plan_enddate, //        系统计算时间
        time, //                当前日期
        pageTime,
        text,
        node_content_type,
        verification_remark, // 异常原因
        max_plant_enddate, //   日期最大值
        min_plant_enddate, //   日期最小值
        is_change, //           是否调整日期
        isComputedOther, //     是否根据当前节点的时间去计算其他节点
        change_plan_time, //    调整后日期
        change_remaark //       调整/异常原因
      }
      this.d_data = d_data
      this.dialogVisible = true
    },
    /**
     * [弹出层：是否调整日期]
     */
    isChangeTime(event) {
      if (event === 0) {
        this.d_data.isComputedOther = false
        this.blur_dialog('pageTime')
      }
    },
    /**
     * [弹出层：日期失焦]
     * @param {[String]} name 属性名 { change_plan_time: '调整，日期失焦', pageTime: '不调整，日期还原' }
     */
    blur_dialog(name) {
      const { d_data } = this
      const { max_plant_enddate, min_plant_enddate, order_time, deliver_date } = d_data
      const time = Tool._toggleTime(d_data[name])
      const { status } = Tool._isError(max_plant_enddate, min_plant_enddate, time, order_time, deliver_date)
      this.d_data.time = time
      this.d_data.error = status
      this.d_data.change_plan_time = name === 'change_plan_time' ? time : ''
    },
    /**
     * [弹出层：保存]
     */
    submit(title) {
      const { d_data, page_list, listIndex, listType } = this
      const { index, node_content_type, error, nodeId, time, change_plan_time, change_remaark, is_change, isComputedOther, nodeName, pageTime } = d_data
      /* 报错：报错 && 没写'调整/异常原因' */
      if (error && !change_remaark && (node_content_type === 'time' || node_content_type !== 'content')) {
        this.$message({ showClose: true, message: '请填写 调整/异常原因 后再保存', type: 'warning' })
        return false
      }
      /* 报错：变更 && （没写时间 || 计划完成日期 === 当前时间） */
      if (is_change === 1 && (!change_plan_time || pageTime === change_plan_time) && (node_content_type === 'time' || node_content_type !== 'content')) {
        this.$message({ showClose: true, message: '请修改 调整日期 后再保存', type: 'warning' })
        return false
      }
      /* ----- 保存 ----- */
      const _getTime = this._getTime()
      const { employeename } = this
      const node = page_list[listIndex].tableData[index - 2][nodeId]
      if (node_content_type === 'time' || node_content_type !== 'content') {
        node.time = change_plan_time || pageTime //         展示时间
        node.final_audit_plan_enddate = change_plan_time // 审核调整最终计划完成时间
        node.is_change = is_change //                       是否调整日期
        node.isComputedOther = isComputedOther //           是否根据当前节点的时间去计算其他节点
        node.error = error
        node.timeType = 2
        if (is_change === 0) {
          node.time = time
          node.final_audit_plan_enddate = ''
          node.audit_process_record.length = node.text.length
          node.timeType = 1
        } else if (is_change === 1) {
          //
        }
        if (node.auditSplitLength === node.audit_process_record.length) {
          node.audit_process_record.push(`【${_getTime} ${employeename}】${change_plan_time ? '变更日期为' + change_plan_time : '未变更日期'}；原因：${change_remaark}`) // 审核过程记录
        } else {
          node.audit_process_record[node.audit_process_record.length - 1] = `【${_getTime} ${employeename}】${change_plan_time ? '变更日期为' + change_plan_time : '未变更日期'}；原因：${change_remaark}`
        }
      } else {
        node.time = change_plan_time
        node.final_audit_plan_enddate = change_plan_time
        node.timeType = 2
        if (node.auditSplitLength === node.audit_process_record.length) {
          node.audit_process_record.push(`【${_getTime} ${employeename}】${change_plan_time ? '变更节点信息为' + change_plan_time : '未变更节点信息'}；原因：${change_remaark}`) // 审核过程记录
        } else {
          node.audit_process_record[node.audit_process_record.length - 1] = `【${_getTime} ${employeename}】${change_plan_time ? '变更节点信息为' + change_plan_time : '未变更节点信息'}；原因：${change_remaark}`
        }
      }
      this.$store.commit('saveData', { name: 'is_computed', obj: isComputedOther })
      this.$store.commit('saveData', { name: 'changeIndexId', obj: `${index - 2}_${nodeId}_${nodeName}` })
      this.$store.commit('saveData', { name: 'computed_tab', obj: listType })
      this.$store.commit('saveData', { name: 'isComputed', obj: new Date().getTime() })
      this.dialogVisible = false
    },
    /**
     * [是否：文本节点]
     * @param  {[Object]}  row   表格单行数据
     * @param  {[Object]}  index 节点信息
     * @return {[Boolean]}       是否显示
     */
    _isContentNode(row, index) {
      const node = row[index] || {}
      let status = false
      if (node.node_content_type === 'content') { // 文本节点
        status = true
      }
      return status
    },
    /**
     * [是否：本次调整 显示 文字]
     * @param  {[Object]}  row   表格单行数据
     * @param  {[Object]}  index 节点信息
     * @return {[Boolean]}       是否显示
     */
    _isShowText(row, index) {
      const node = row[index] || {}
      let status = false
      const { change_plan_time = '', change_remaark = '' } = node
      if (change_plan_time || change_remaark) { // 调整：时间 || 说明
        status = true
      }
      return status
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
  padding-top: 2px;
}
.tablePBox > .tableP:last-child {
  padding-bottom: 2px;
}
.tableInput {
  width: 100%;
}
.tableSelect {
  width: 100px;
}
</style>
