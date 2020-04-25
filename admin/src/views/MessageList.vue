<template>
  <div>
    <!-- <div>
      <el-button type="primary" class="add myBtn" @click="$router.push(`/admin_users/create/`)"><i class="el-icon-s-custom"></i> 添加管理员</el-button>
    </div>-->
    <div class="card">
      <h1 class="card-header">留言列表</h1>
      <el-radio-group style="margin:25px" @change="fetch" v-model="status">
            <el-radio :label="1">已通过</el-radio>
            <el-radio :label="2">未通过</el-radio>
            <el-radio :label="0">待审核</el-radio>
        </el-radio-group>
      <el-table :data="items" stripe border :header-cell-style="{background:'#eee'}">
        <el-table-column prop="id" label="ID" width="240"></el-table-column>
        <el-table-column prop="member_name" label="会员名"></el-table-column>
        <el-table-column prop="content" label="留言内容"></el-table-column>
        <el-table-column prop="create_at" label="时间"></el-table-column>
        <!-- <el-table-column prop="status" :formatter="parseStatus" label="状态"></el-table-column> -->
        <el-table-column label="状态" prop="status">
          <template slot-scope="scope">
            <span v-if="scope.row.status==0" style="color:grey">待审核</span>
            <span v-else-if="scope.row.status==1" style="color:green">通过</span>
            <span v-else style="color:red">未通过</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
            <el-button size="mini" @click="$router.push(`/message/edit/${scope.row.id}`)">审核</el-button>
            <el-button size="mini" type="danger" @click="remove(scope.row)">删除</el-button>
            <!-- <el-button
              type="text"
              size="small"
              @click="$router.push(`/admin_users/edit/${scope.row.id}`)"
            ><i class="el-icon-edit" title="编辑"></i></el-button>
            <el-button type="text" size="small" @click="remove(scope.row)"><i class="el-icon-delete" title="删除"></i></el-button>-->
          </template>
        </el-table-column>
      </el-table>

      <!-- <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[3, 6, 9, 12]"
          :page-size="3"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>-->

      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="pageSize"
        @next-click="nextClick"
        @prev-click="prevClick"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      status:0,
      items: [],
      pageSize: 8,
      total: 0,
      pageIndex: 1
    };
  },
  filters: {},
  methods: {
    parseStatus(r, c) {
      return ["未审核", "通过", "未通过"][r.status];
    },
    nextClick(val) {
      this.pageIndex += 1;
      this.fetch();
    },
    prevClick(val) {
      this.pageIndex -= 1;
      this.fetch();
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.fetch();
    },
    async fetch() {
      const res = await this.$http.get("message/page", {
        params: {
          page_index: this.pageIndex,
          page_size: this.pageSize,
          // status: this.status,
        }
      });
      console.log(res.data);
      if (res.code == 200) {
        this.items = res.data.result;
        this.total = res.data.total_count;
      }
    },
    remove(row) {
      this.$confirm(`确定要删除留言："${row.username}" 吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        const res = await this.$http.post(`admin/delete?ids=${row.id}`);
        if (res.code == 200) {
          this.$message({
            type: "success",
            message: "删除成功!"
          });
          this.fetch();
        } else {
          this.$message({
            type: "error",
            message: `错误：${res.msg}`
          });
        }
      });
    }
  },
  created() {
    this.fetch();
  }
};
</script>

