
<!-- 历史审核记录 -->

<template>
  <div class="recordBox">
    <div class="comTableTitle">
      <span>【历史审核记录】</span>
    </div>
    <el-table :data="tab_list[listIndex].itemNodeAuditDetail" size="mini" border>
      <el-table-column label="甘特表类型" width="150">
        <template slot-scope="scope">
          {{audit_type_obj[scope.row.audit_type] || tabName}}
        </template>
      </el-table-column>
      <el-table-column label="项目/工厂信息">
        <template slot-scope="scope">
          {{scope.row.item_name}}
          <span v-if="scope.row.provider_name"> -> {{scope.row.provider_name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="处理人" width="150">
        <template slot-scope="scope">
          {{scope.row.audit_employeename}}
        </template>
      </el-table-column>
      <el-table-column label="处理时间" width="150">
        <template slot-scope="scope">
          {{scope.row.audit_time}}
        </template>
      </el-table-column>
      <el-table-column label="处理结果" width="150">
        <template slot-scope="scope">
          {{audit_result_obj[scope.row.audit_result]}}
        </template>
      </el-table-column>
      <el-table-column label="处理意见">
        <template slot-scope="scope">
          {{scope.row.audit_remark}}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: ['listIndex', 'tabName'],
  data() {
    return {
      audit_type_obj: {
        '1': '投产前节点',
        '2': '排产节点',
        '3': '一次样',
        '4': '二次样',
        '5': '销售样',
        '6': '面料甘特表'
      },
      audit_result_obj: {
        '0': '发起申请',
        '1': '通过',
        '2': '驳回',
        '3': '驳回后重新发起',
        '4': '撤销申请',
        '5': '撤销后重新发起'
      }
    }
  },
  computed: {
    ...mapGetters(['tab_list'])
  }
}
</script>

<style scoped>
.recordBox {
  flex: 1;
}
</style>
