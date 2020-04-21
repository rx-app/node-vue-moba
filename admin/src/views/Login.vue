<template>

    
    
  <div class="login-container">

      
      <div id="stars">
        <div class="star"></div>
      </div>

    <!-- <el-card header="请先登录" class="login-card">
      <el-form @submit.native.prevent="login">
        <el-form-item label="用户名">
          <el-input v-model="username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" class="myBtn" style="width: 100%;">登录</el-button>
        </el-form-item>
        
      </el-form>
    </el-card> -->
    <div class="login-box">
    <h2 class="login-title">星座后台<span style="color: #278ff0;">管理系统</span></h2>
    <p class="login-text">你现在的选择，就是未来的命运</p>
    <el-form @submit.native.prevent="login" class="myLogin">
      <el-form-item label="">
        <el-input v-model="username" placeholder="用户名" class="username"></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-input type="password" v-model="password"  placeholder="密码" class="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" style="width: 100%;">登录</el-button>
      </el-form-item>
      
    </el-form>
  </div>
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
    window.onload=function(){
            var stars = document.getElementById('stars');  //获取stars Box
            var star = document.getElementsByClassName('star');  //获取全部流星
            var mywidth = document.documentElement.clientWidth;  //获取当前可视宽度
              var myheight = document.documentElement.clientHeight;  //获取当前可视高度
      
              //初始化流星个数 和 left,top值
            for(let i = 0;i<45;i++){
              let newStar = document.createElement('div');
              newStar.className = "star"
              newStar.style.top = randomNumber(myheight*.3, -myheight*.2) + 'px'
                newStar.style.left = randomNumber(mywidth*1.3, 0) + 'px'
                stars.appendChild(newStar)
            }
      
            //封装随机数函数
            function randomNumber (max, min) {
               let randomnum = Math.floor(Math.random() * (max - min + 1) + min)
               return randomnum
            }
      
            // 给流星添加动画延时
           for (let i = 0, len = star.length; i < len; i++)
            {
              star[i].style.animationDelay = i % 6 == 0 ? '0s' : i * 0.8 + 's';
            }
          }
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
        localStorage.setItem('name',this.username)
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
/** 登录 **/
.login-box{
  position: fixed;
  left: 50%;
  margin-left: -15rem;
  z-index:  999;
}
.login-container{
  overflow: hidden;
  background-color: #37355d;
  background-image: url("../../src/assets/bg.png");
  height: 100vh;
}
.login-title{
  text-align: center;
  color: #fff;
  font-size: 30px;
  margin: 100px  0 0 0;
}
.login-text{
  text-align: center;
  color: #fff;
  font-size: 12px;
  margin: 10px;
}
.myLogin{
  width: 30rem;
  margin: 0 auto;
}
.myLogin .el-form-item{
  margin: 0;
}
.myLogin .username input{
  border-radius: 4px 4px 0 0;
}
.myLogin .password input{
  border-radius: 0 0 4px 4px;
}
.myLogin .el-button{
  margin: 20px 0;
}


html,body{
			margin:0;background: black;
		}
		/*创建box*/
		#stars{  
			z-index: 2;
			margin: 0 auto;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;	
		}
		/*画出流星的形状*/
		.star{
			display: block;
			opacity: 0;
			position: relative;
			left: 90%;
			width: 1px;
			background: transparent;
			/*流星动画*/
			animation: star-fall 3s linear infinite;
		}
		/*流星后面的尾巴*/
		.star:after{
			content: ' ';
			display: block;
			border: 1px solid #fff;
			border-width: 0px 100px 2px 150px;
			left:5px;
			transform: rotate(-45deg);
			border-color:transparent transparent transparent #eee;
		}
		/*创建动画，实现流星划过、渐入渐隐的效果*/
		@keyframes star-fall{
			0%{
				opacity: 0;
				transform: scale(0.5) translate3d(0,0);

			}
			50%{
				opacity: 1;
				transform: translate3d(-200px, 200px, 0);

			}
			100% {
		        opacity: 0;
		        transform: scale(1.2) translate3d(-300px, 300px, 0);
		      }
		}
  
</style>