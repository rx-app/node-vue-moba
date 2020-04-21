<template>
  <div class="about card">
    <h1 class="card-header">{{id ? '审核' : '新建'}}留言</h1>
    <el-form style="max-width:600px" label-width="120px" @submit.native.prevent="save">
      
      <el-form-item label="会员名">
        <el-input readonly="true" v-model="model.member_name"></el-input>
      </el-form-item>
      <!-- <el-form-item label="图标">
        <el-input type="text" v-model="model.icon"></el-input>
      </el-form-item> -->

      <el-form-item label="内容">
        <el-input type="text" readonly="true" v-model="model.content"></el-input>
      </el-form-item>
      <el-form-item label="内容">
          <el-radio-group v-model="model.status">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">未通过</el-radio>
            <!-- <el-radio :label="0">待审核</el-radio> -->
        </el-radio-group>
      </el-form-item>
      <!-- <el-form-item label="邮箱">
        <el-input type="text" v-model="model.email"></el-input>
      </el-form-item> -->
      <el-form-item style="text-align:right">
        <el-button type="primary" native-type="submit" class="myBtn" style="width: 100%;">确 定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from 'js-md5';
export default {
  props: {
    id: {}
  },
  data(){
    return {
      model: {},
      
    }
  },
  methods: {
    afterUpload(res){
      this.$set(this.model, 'icon', res.data.url)
    },
    async save(){
      let res
      if (this.id) {
        // debugger
        // let {stauts} = this.model;
        // this.$set(this.model,'user_id',parseInt( this.id ) )// this.model.id=this.id
        console.log(this.model)
        res = await this.$http.post(`message/approve/${this.id}/${this.model.status}`, {id:this.id,status:this.model.status})
      } else {
        res = await this.$http.post('message/create', this.model)  //这个页面应该没有
      }
      if(res.code==200){
        this.$router.push('/message/list')
        this.$message({
          type: 'success',
          message: '提交成功'
        })
      }else{
        this.$message({
          type: 'error',
          message: `错误：${res.msg}`
        })
      }
    },
    async fetch(){
      const res = await this.$http.get(`message/${this.id}`)
      !res.data.role_ids && (res.data.role_ids=[1,
		2,
		3])//不设置权限的话，编辑提交不成功
      console.log(res)
      this.model = res.data
      this.model.status==0 && (this.model.status=1) // 提交时，status值只能是1或2
    },
    
    
  },
  created(){
    this.id && this.fetch()
  }
}
</script>
