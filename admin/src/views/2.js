async getData(addDate, ifTObtm) {
    if(this.loadingData) return;
    this.loadingData=true;
    await loadUserInfo();
    if (typeof addDate !== "undefined") {
      this.params.speakTime = addDate;
    }
    loadDiscussion(this.params, res => {
      console.log("--");
      console.log(res);
      console.log("-----------");
      // res = res.map((v,i)=>{
      //   debugger
      //   if(v.userId!=this.curUserId){
      //     v.poster = 1
      //   }else{
      //     v.poster = 2
      //   }
      //   return v
      // })
      // console.log(res)

      let newList = res;

      if (typeof addDate !== "undefined") {
        // if (newList.length == this.messages.length) {
        //   return;
        // }
        if (
          this.messages.length &&
          res[res.length - 1].speakID ==
            this.messages[this.messages.length - 1].speakID
        ) {
          return;
        }
        if (newList.length > this.messages.length) {
          this._scrollToBottom();
        }
        this.messages = newList;
        this.content = "";
      } else {
        this.messages = newList.concat(this.messages);
      }
      this.messages.forEach((v, i) => {
        if (v.content.includes("[###img###]")) {
          console.log(JSON.parse(v.content.replace("[###img###]", "")).name);
        }
        if (v.content.includes("[###img###]")) {
          this.showImages(v);
        }
      });
      if (res && res.length && res[0].userID == '000000' ) {
        this.hasMore = false;
      } else {
        this.hasMore = true;
        this.params.speakTime = res[0].speakTime;
      }
      // 获取所有老师的头像参数
      let tids = [];
      newList.map(item => {
        // debugger
        if (item.userType != "5") {
          // 判断是否已经请求过该头像了
          if (this.tAvatarList.length) {
            this.tAvatarList.map(one => {
              if (item.replierID !== one.userID) {
                tids.push({
                  type: "1",
                  userID: item.userID
                });
              }
            });
          } else {
            tids.push({
              type: "1",
              userID: item.userID
            });
          }
        }
      });
      if (tids.length) {
        let sendIDS = Array.from(new Set([...tids]));
        console.log(sendIDS);
        getHeadIDsByUserIDs(sendIDS, res => {
          this.tAvatarList = res;
          res.forEach((v, i) => {
            this.uidToHid[v.userID] = v.iconID;
          });

          console.log(this.uidToHid);
        });
      }
      if (this.firstFetch) {
        this._scrollToBottom();
        this.firstFetch = false;
      }
      if (ifTObtm) {
        this._scrollToBottom();
      }
      this.loadingData=false;
      this.loading = false;
      this.sendingImage = false;
    });
  },