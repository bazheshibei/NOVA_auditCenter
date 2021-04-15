
<!-- 顶部 -->

<template>
  <div class="topBox">
    <div class="formLine">
      <!-- 项目信息 -->
      <div class="formLabel">项目信息：</div>
      <div class="formTextBox">
        <div class="formText" style="white-space: pre-wrap;">
          <p>{{itemSummaryItemData.itemInformation}}</p>
        </div>
      </div>
    </div>
    <div class="formLine" v-if="pageTitle === '面料'">
      <!-- 其他信息：面料 -->
      <div class="formLabel">其他信息：</div>
      <div class="formTextBox">
        <div class="formText">面料下达时间：{{itemSummaryItemData.order_time}}</div>
        <div class="formText">创建人：{{itemSummaryItemData.creator}}({{itemSummaryItemData.create_time}})</div>
      </div>
    </div>
    <div class="formLine" v-else-if="pageTitle === '大货'">
      <!-- 其他信息 ：大货-->
      <div class="formLabel">其他信息：</div>
      <div class="formTextBox">
        <div class="formText">订单类型：{{itemSummaryItemData.order_type}}</div>
        <div class="formText">报客人服装工厂：{{itemSummaryItemData.short_name}}</div>
        <div class="formText">实际工厂：{{itemSummaryItemData.gongchang}}</div>
        <div class="formText">面料工厂：{{itemSummaryItemData.mianliao}}</div>
        <div class="formText">下单时间：{{itemSummaryItemData.order_time}}</div>
        <div class="formText">客人交期：{{itemSummaryItemData.deliver_date}}</div>
        <div class="formText">创建人：{{itemSummaryItemData.creator}}({{itemSummaryItemData.create_time}})</div>
      </div>
    </div>
    <div class="formLine">
      <!-- 岗位信息 -->
      <div class="formLabel">岗位信息：</div>
      <div class="formTextBox">
        <div class="formText" v-for="(item, index) in itemSummaryItemData.gangwei" :key="'gangwei_' + index">{{item}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {}
  },
  computed: {
    ...mapState(['itemSummaryItemData', 'pageTitle'])
  }
}
</script>

<style scoped>
/*** 顶部 ***/
.topBox {
  width: 100%;
}
</style>
