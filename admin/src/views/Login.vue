<template>
  <div class="login-container">
    <el-card header="请先登录" class="login-card">
      <el-form @submit.native.prevent="login">
        <el-form-item label="用户名">
          <el-input v-model="username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">登录</el-button>
        </el-form-item>
        
      </el-form>
    </el-card>
  </div>
</template>
<script>
import md5 from 'js-md5';
export default {
  data(){
    return {
      username: 'admin',
      password:'111111',
    }
  },
  created(){
    // console.log(md5('111111'))
  },
  methods: {
    async login(){
      let pwd = md5( this.password )
      const res = await this.$http.post('auth/login', {username:this.username,password:pwd})
      // sessionStorage.token = res.data.token
      
      if(res.code==200){
        this.$message({
          type: 'success',
          message: '登录成功'
        })
        localStorage.setItem('token',res.data.token)
        this.$router.push('/')
      }else{
        this.$message({
          type: 'error',
          message: res.data.msg
        })
      }
      // this.$router.push('/auth/login')
      
    }
  }
}
</script>

<style>
.login-card{
  width: 25rem;
  margin: 5rem auto;
}
</style>
