<template>
  <div>
    <div>
      <el-button type="primary" class="add myBtn" @click="$router.push(`/card/create/`)"><i class="el-icon-s-custom"></i> 添加卡牌</el-button>
    </div>
    <div class="card">
      <h1 class="card-header">卡牌列表</h1>
      <el-table
        :data="items"
        stripe
        border
        :header-cell-style="{background:'#eee'}">
        <el-table-column prop="id" label="ID" width="240"></el-table-column>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="icon" label="图标">
            <template slot-scope="scope">
                <img :src="scope.row.icon" style="height:3rem;">
            </template>
        </el-table-column>
        <!-- <el-table-column prop="email" label="邮箱"></el-table-column> -->
        <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
              <el-button
              size="mini"
              @click="$router.push(`/card/edit/${scope.row.id}`)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="remove(scope.row)">删除</el-button>
            <!-- <el-button
              type="text"
              size="small"
              @click="$router.push(`/admin_users/edit/${scope.row.id}`)"
            ><i class="el-icon-edit" title="编辑"></i></el-button>
            <el-button type="text" size="small" @click="remove(scope.row)"><i class="el-icon-delete" title="删除"></i></el-button> -->
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
        </el-pagination> -->

    


        <el-pagination
          background
          layout="prev, pager, next"
          :page-size="pageSize"
          @next-click="nextClick"
          @prev-click="prevClick"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :total="total">
        </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      pageSize:8,
      total:0,
      pageIndex:1,
    };
  },
  methods: {
    nextClick(val){
      this.pageIndex+=1;
      this.fetch();
    },
    prevClick(val){
      this.pageIndex-=1;
      this.fetch();
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.pageIndex=val;
      this.fetch();
    },
    async fetch() {
      const res = await this.$http.get("card/page",{params:{page_index:this.pageIndex,page_size:this.pageSize}});
      console.log(res.data)
      if(res.code==200){
        this.items = res.data.result;
        this.total = res.data.total_count;
      }
      
    },
    remove(row) {
      this.$confirm(`确定要删除卡牌："${row.username}" 吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        const res = await this.$http.post(`card/delete?ids=${row.id}`);
        if(res.code==200){
          this.$message({
            type: "success",
            message: "删除成功!"
          });
          this.fetch();
        }else{
          this.$message({
            type: 'error',
            message: `错误：${res.msg}`
          })
        }
      });
    }
  },
  created() {
    this.fetch();
  }
};
</script>

