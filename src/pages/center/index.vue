
<!-- 审核列表 -->

<template>
  <div class="pageBox">

    <div class="pageTopBox">
      <!-- 顶部 -->
      <com-top></com-top>

      <el-tabs class="comTabs" v-model="tabTitle" type="border-card" v-for="(val, key) in showArr" :key="'tabs_' + key" v-show="key === showArr.length - 1">
        <el-tab-pane v-for="(item, index) in tab_list" :key="'tab_' + index" :label="tabName[item.gantt_type]">
          <!-- 表格 -->
          <com-table :listIndex="index" :listType="item.gantt_type" :isShowAllNodes="isShowAllNodesObj[index] || false" @toggleIsShowAllNodes="toggleIsShowAllNodes"></com-table>
          <!-- 历史审核记录 -->
          <com-record :listIndex="index" :tabName="tabName[item.gantt_type]"></com-record>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 下一步 -->
    <div class="bottomBox">
      <div>
        <el-button type="primary" size="mini" plain @click="clickClose">取消</el-button>
        <el-button type="primary" size="mini" @click="submit">提交审核</el-button>
      </div>
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
      isShowAllNodesObj: {}, // 是否显示：全部节点
      tabTitle: '', //          默认打开的页签
      tabName: { '1': '大货甘特表汇总', '2': '大货面料甘特表', '3': '大货工厂甘特表', '4': '开发甘特表', '5': '面料甘特表' }
    }
  },
  created() {
    /** 请求：审核列表 **/
    this.$store.dispatch('A_getItemGanttData')

    try {
      /* 平台方法 */
      // eslint-disable-next-line
      dg.removeBtn('cancel')
      // eslint-disable-next-line
      dg.removeBtn('saveAndAdd')
      // eslint-disable-next-line
      dg.removeBtn('saveAndClose')
      // eslint-disable-next-line
      dg.removeBtn('saveNoClose')
    } catch (err) {
      //
    }
  },
  computed: {
    ...mapState(['showArr', 'page_list']),
    ...mapGetters(['tab_list'])
  },

  methods: {
    /**
     * [切换：是否显示全部节点]
     * @param {[Int]} listIndex 表格索引
     */
    toggleIsShowAllNodes({ listIndex }) {
      const { isShowAllNodesObj } = this
      isShowAllNodesObj[listIndex] = isShowAllNodesObj[listIndex] || false
      isShowAllNodesObj[listIndex] = !isShowAllNodesObj[listIndex]
      this.isShowAllNodesObj = Object.assign({}, isShowAllNodesObj)
    },
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
  overflow-y: hidden;
}

.pageTopBox {
  width: 100%;
  height: calc(100% - 40px);
  margin-bottom: 40px;
  overflow-y: auto;
}

/*** 底部 ***/
.bottomBox {
  width: calc(100% - 30px);
  padding: 6px 15px;
  border-top: 1px solid #EBEEF5;
  display: flex;
  flex: 1;
  justify-content: flex-end;
  position: fixed;
  bottom: 0;
  right: 0;
}
</style>

<style>
/*** tabs ***/
.el-tabs__content { /* tab 内容 */
  padding: 10px !important;
  position: static !important;
}
</style>
