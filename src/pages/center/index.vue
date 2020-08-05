
<!-- 审核列表 -->

<template>
  <div class="pageBox">

    <!-- 顶部 -->
    <com-top></com-top>

    <el-tabs class="comTabs" v-model="tabTitle" type="border-card" v-for="(val, key) in showArr" :key="'tabs_' + key" v-show="key === showArr.length - 1">
      <el-tab-pane v-for="(item, index) in tab_list" :key="'tab_' + index" :label="tabName[item.gantt_type]">
        <!-- 表格 -->
        <com-table :listIndex="index" :listType="item.gantt_type"></com-table>
        <!-- 历史审核记录 -->
        <com-record :listIndex="index"></com-record>
      </el-tab-pane>
    </el-tabs>

    <!-- 下一步 -->
    <div class="bottomBox">
      <el-button type="primary" size="mini" plain @click="clickClose">取消</el-button>
      <el-button type="primary" size="mini" @click="submit">提交审核</el-button>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ComTop from './components/top.vue' //       顶部
import ComTable from './components/table.vue' //   表格
import ComRecord from './components/record.vue' // 历史审核记录
export default {
  components: { ComTop, ComTable, ComRecord },
  data() {
    return {
      tabTitle: '', // 默认打开的页签
      tabName: { '1': '大货甘特表汇总', '2': '大货面料甘特表', '3': '大货工厂甘特表' }
    }
  },
  created() {
    /** 请求：审核列表 **/
    this.$store.dispatch('A_getItemGanttData')

    // /* 平台方法 */
    // // eslint-disable-next-line
    // dg.removeBtn('cancel')
    // // eslint-disable-next-line
    // dg.removeBtn('saveAndAdd')
    // // eslint-disable-next-line
    // dg.removeBtn('saveAndClose')
    // // eslint-disable-next-line
    // dg.removeBtn('saveNoClose')
  },
  computed: {
    ...mapState(['showArr', 'page_list']),
    ...mapGetters(['tab_list'])
  },

  methods: {
    /**
     * [提交]
     */
    submit() {
      /** 请求：审核提交 **/
      this.$store.dispatch('A_auditItemSummary')
    },
    /**
     * [关闭]
     */
    clickClose() {
      // eslint-disable-next-line
      dg.close()
    }
  }
}
</script>

<style scoped>
.pageBox {
  width: 100%;
  height: 100%;
  font-size: 12px;
  background: #ffffff;
  overflow-y: auto;
}

/*** 底部 ***/
.bottomBox {
  padding: 6px 15px;
  display: flex;
  justify-content: flex-end;
  /* border-top: 1px solid #EBEEF5; */
}
</style>

<style>
/*** 模块刷新 ***/
.f5 {
  color: #909399;
  cursor: pointer;
  padding: 0 6px;
}

/*** 表格字体 ***/
.el-table {
  font-size: 12px !important;
}
/*** 重置表头单元格 ***/
.el-table > div th, .el-table > div th > .cell {
  padding: 0 !important;
}
.el-table > div th > .cell .thText {
  padding: 5px 10px;
}
th > .cell, th > .cell .thText {
  text-align: center;
}
/*** 表头输入内容 ***/
.thActive {
  color: #000000 !important;
  /* color: #ffffff;
  background: #409EFF; */
}
/*** 单元格 ***/
td {
  padding: 0 !important;
}
.cell p {
  line-height: 16px !important;
  margin: 4px 0 !important;
}
td > .cell {
  text-align: center;
}

/*** 搜索 ***/
.el-popover {
  padding: 6px;
}
.el-popover > div > input {
  height: 26px;
  font-size: 12px !important;
  display: flex;
  align-items: center;
}
.el-popover > div > .el-input__suffix { /* input 中删除按钮 */
  margin-top: -6px;
}

/*** 分页 ***/
.comPagination {
  padding: 0;
}
.comPagination > .el-pagination__sizes { /* 总条数 */
  margin: 0 0 0 30px;
}
.comPagination > .el-pagination__sizes > .el-select > .el-input--suffix { /* 总条数 */
  margin-right: 0;
}

/*** 悬浮框 ***/
.comPopover {
  color: #409EFF;
  background: #ecf5ff;
  border-color: #b3d8ff;
}

/*** 单选 ***/
.el-radio:first-child {
  margin-right: 20px !important;
}
.el-radio > .el-radio__label {
  font-size: 12px;
  margin-right: 0 !important;
}

/*** 下拉框 ***/
.comSelectOptions { /* 下拉框：单个选项 */
  height: 25px !important;
  font-size: 12px !important;
  line-height: 25px !important;
  padding: 0 10px !important;
}
.comSelectInput > .el-input__inner { /* input */
  height: 28px !important;
  text-align: center;
}
.comSelectInputLeft > .el-input__inner { /* input */
  height: 28px !important;
  text-align: left;
}

/*** tabs ***/
.comTabs {
  border: 0 !important;
}
.comTabs .el-tabs__item { /* tab 顶部 */
  height: 30px !important;
  line-height: 30px !important;
  font-size: 12px !important;
  padding: 0 20px !important;
}
.comTabs .el-tabs__content { /* tab 内容 */
  padding: 10px !important;
}
</style>
