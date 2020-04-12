 async fetchData () {
      
      await loadUserInfo();
      if (typeof addDate !== "undefined") {
        this.params.replyTime = addDate;
      }
      if (this.replyType == ReplyType.Teacher) { 
        this.params = {
          replierID: this.replierID,     // 教师互动需要传入,其他互动不需要传入 
          ...this.params
        };
      }

      $getCustomerReplyByType(this.params, {success:res => {
        let newList = res;
      
        this.messages = newList.concat(this.messages);
        

        this.messages.forEach((v,i)=>{
          if(v.replyContent.includes('[###img###]')){
            console.log(JSON.parse( v.replyContent.replace('[###img###]','') ).name)
          }
          if(v.replyContent.includes('[###img###]')){
            this.$nextTick( a=>{
              this.showImages(v) 
            } )
          }
        })
        this.$nextTick(() => {
          
          console.log(this.messages.length)
          let len = this.messages.length % 20;
          
          console.log('len',len)
          len==0 && (len=20);
          console.log('len2',len)

          this.mescroll.endSuccess(30)// 结束下拉刷新,无参
          // if(len<=this.messages.length){
          //   return
          // }
          if(flag){
            document.getElementsByClassName('list-group-item')[len-1].scrollIntoView();
            this.sendimg= true;//阻止上拉刷新的执行
            // setTimeout(r=>{
            //   document.getElementsByClassName('list-group-item')[len-1].scrollIntoView();
            //   this.sendimg = false;
            // },1000)
          }else{
            if(!this.hasMore){
              document.getElementsByClassName('list-group-item')[0].scrollIntoView();
            }else{
              if(len){
                document.getElementsByClassName('list-group-item')[len-1].scrollIntoView();
              }else{
                document.getElementsByClassName('list-group-item')[19].scrollIntoView();
              }
            }
          }

          
        })
        // debugger
        if (!res || !res.length || res.length < this.params.queryNumber) {
          this.hasMore = false;
        } else {
          this.hasMore = true;
          this.params.replyTime = res[0].createTime;
        }
        // 获取所有老师的头像参数
        let tids = [];
        newList.map(item => {
          if (item.poster === "1") {
            // 判断是否已经请求过该头像了
            if (this.tAvatarList.length) {
              this.tAvatarList.map(one => {
                if (item.replierID !== one.userID) {
                  tids.push({
                    type: "1",
                    userID: item.replierID
                  });
                }
              });
            } else {
              tids.push({
                type: "1",
                userID: item.replierID
              });
            }
          }
        });
        if (tids.length) {
          let sendIDS = Array.from(new Set([...tids]));
          console.log(sendIDS);
          getHeadIDsByUserIDs(sendIDS, res => {
            this.tAvatarList = res;
          });
        }

        // if (this.firstFetch) {
        //   this._scrollToBottom();
        //   this.firstFetch = false;
        // }

        // this.loading = false;  // 显示加载中动画
        this.$nextTick(() => {
          console.log(this.messages.length)
          let len = this.messages.length % 20;
          

          this.mescroll.endSuccess(30)// 结束下拉刷新,无参
          // if(len<=this.messages.length){
          //   return
          // }
          if(0){
            document.getElementsByClassName('list-group-item')[len-1].scrollIntoView();
            setTimeout(r=>{document.getElementsByClassName('list-group-item')[len-1].scrollIntoView()},1000)
          }else{
            if(!this.hasMore){
              document.getElementsByClassName('list-group-item')[0].scrollIntoView();
            }else{
              if(len){
                document.getElementsByClassName('list-group-item')[len-1].scrollIntoView();
              }else{
                document.getElementsByClassName('list-group-item')[19].scrollIntoView();
              }
            }
          }
          

          
        })
        // setTimeout(()=>{
        //   document.getElementsByClassName('list-group-item')[19].scrollIntoView();
        // },1000)
        this.sendingImage=false;// 发送图片的时候,使输入框不出现[###img###  xxxx]
      },error:()=>{
        this.mescroll.endErr()
      }});
    },