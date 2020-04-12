<template>
  <div class="xdapp-msg-wrapper">
    <loading v-show="loading"></loading>
    <scroll
      @tap.native="fnTap"
      :data="messages"
      :listen-scroll="listenScroll"
      :probe-type="probeType"
      :pulldown="pulldown"
      :pullup="true"
      @scrollToEnd="searchMore"
      @scrollToStart="refreshMore"
      class="scroll-container"
      ref="listview"
    >
      <div class="msg-list">
        <ul class="list-group">
          <li class="list-group-item" v-for="(item,index) in messages" ref="groupItem">
            <span class="msg-time mui-badge">{{item.speakTime | normalize}}</span>
            <div
              :class="{'msg-item':item.userID!=curUserId,'msg-item-right':item.userID==curUserId,sysmsg:item.userType==5 ,'voice-no-arrow':!item.content.includes('[###voice###]'),'img-no-arrow':item.content.includes('[###img###]')}"
            >
              <div v-if="item.userID!=curUserId && item.userType!=5 ">
                <span v-if="item.icons2">
                  <img
                    class="avatar-img"
                    v-if="item.icons2.iconID && getIconImg(item.icons2.userID)"
                    :src="getIconImg(item.icons2.userID)"
                  />
                  <img
                    class="avatar-img"
                    v-else-if="item.icons2.gender==1"
                    src="~@/public/asset/img/user/teacher-man.png"
                    alt
                  />
                  <img
                    class="avatar-img"
                    v-else-if="item.icons2.gender==2"
                    src="~@/public/asset/img/user/teacher-woman.png"
                    alt
                  />
                  <img class="avatar-img" v-else src="~@/public/asset/img/user/teacher-man.png" alt />
                </span>
                <img v-else class="avatar-img" src="~@/public/asset/img/user/teacher-man.png" alt />
              </div>
              <div
                v-if="item.userID!=curUserId && item.userType!=5"
                class="reply-name"
              >【{{getJobName(item.userType)}}{{item.userName}}】</div>
              <dd
                v-if="item.content.includes('[###voice###]')"
                @click="playVoice(item,0,index)"
                class="reply audio-ico"
              >
                <div
                  v-if="item.poster!=1"
                  :style="{'marginLeft':JSON.parse( item.content.replace('[###voice###]','') ).time+'px'}"
                  class="dur"
                >{{JSON.parse( item.content.replace('[###voice###]','') ).time}}"</div>
                <div
                  v-else
                  :style="{'marginRight':JSON.parse( item.content.replace('[###voice###]','') ).time+'px'}"
                  class="dur"
                >{{JSON.parse( item.content.replace('[###voice###]','') ).time}}"</div>
                <div class="voice-img" :class="{speaking:cur==index&&isSpeaking}"></div>
              </dd>
              <div v-else-if="item.content.includes('[###img###]')">
                <!-- <div><img :id="JSON.parse( item.content.replace('[###img###]','') ).id" data-preview-src="" data-preview-group="1" class="chat-img" src="http://pic41.nipic.com/20140524/9643307_104442624152_2.jpg" alt=""></div> -->
                <div>
                  <img
                    @load="_scrollToBottomAfterLoadImage"
                    data-preview-src
                    data-preview-group="1"
                    class="chat-img"
                    src
                    :id="JSON.parse( item.content.replace('[###img###]','') ).name.replace('.','-')"
                    alt
                  />
                </div>
              </div>
              <dd v-else class="reply" v-html="item.content"></dd>
              <div v-if="item.userID==curUserId">
                <img class="mui-media-object mui-pull-left avatar-img" :src="currentAvatar" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </scroll>

    <!-- 中间黑框 录音状态 -->
    <div v-show="showSpeakIcon" class="blackBoxSpeak">
      <p v-show="!showCountdown" class="blackBoxSpeakConent">手指上划，取消发送</p>
      <p v-show="showCountdown" class="blackBoxSpeakConent">
        <span style="font-weight:bold">{{countdown}}</span>秒后，自动发送
      </p>
    </div>

    <div v-show="showSpeakAbort" class="blackBoxTimeless">
      <div>!</div>
      <p class="blackBoxTimelessConent">录音时间太短</p>
    </div>

    <!-- 中间黑框 暂停状态 -->
    <div v-show="showSpeakStop" class="blackBoxPause">
      <p class="blackBoxPauseContent" style="background: red">松开手指， 取消发送</p>
    </div>

    <div class="msg-input" v-if="isMessage">
      <div
        class="audioButton"
        :class="{'btn-audio':toggle,'btn-text':!toggle}"
        @click="toggleAudioButton"
        style="margin-left: -10px;"
      ></div>
      <div class="msg-left" v-show="showRecordButton" style="margin-left:0px;">
        <button
          class="recordButton"
          @touchstart.prevent="speakBegin"
          @touchend.prevent="speakEnd"
          @touchmove.prevent="speaking"
          id="bt_recoding"
        >{{audioBarText}}</button>
      </div>

      <div class="msg-left" v-show="!showRecordButton" style="margin-left:0px;">
        <textarea
          type="text"
          v-show="!sendingImage"
          class="input-text"
          v-model="content"
          @focus="setPosition()"
          @blur="setPosition2()"
        ></textarea>
        <textarea type="text" v-show="sendingImage" class="input-text"></textarea>
      </div>
      <div class="msg-right">
        <button @click="uploadHandler" class="btn-send btn-pic"></button>
        <button
          :disabled="content ? false : true"
          class="btn-send"
          :class="content ? 'btn-on' : 'btn-off'"
          @click="sendReply()"
        >发送</button>
      </div>
    </div>
    <div class="mask" v-if="maskShow">
      <div class="mask-box">
        <div class="close">
          <i class="iconfont icon-error" @click="maskDis()"></i>
        </div>
        <div class="msg-box">
          <textarea
            placeholder="请输入留言"
            autofocus="autofocus"
            v-model="content"
            class="msg-text"
            cols="30"
            rows="10"
          ></textarea>
          <button :disabled="content !== '' ? false : true" @click="sendReply()" class="send">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ReplyType,
  PreOrLast,
  Poster,
  ACTION_TYPES,
  CACHE_KEYS
} from "@/constants";
import { defaultPageSize } from "@/public/constant";
import {
  $getCustomerReplyByType,
  $sendCustomerReply,
  loadDiscussion,
  speakInDiscussion,
  upLoadFile,
  downLoadFile
} from "@/api/customer-reply/customer-reply-api";
import { loadUserInfo } from "@/api/common/common-api";
import Scroll from "@/components/scroll/index";
import Loading from "@/components/loading/index";
import { getHead, getHeadIDsByUserIDs } from "@/api/user/user-api";
import store from "@/store";
import * as types from "@/store/mutation-types";
import Tip from "@/components/tip";

window.previewImage = null;
function resize() {
  if (mui.os.ios) {
    plus.webview.currentWebview().setStyle({ bottom: "-1px" });
  }
}
export default {
  data() {
    return {
      isSpeakTimeout:false,
      task: null,
      sendControl: true,
      cur: null,
      time1: 0,
      time2: 0,
      showCountdown: false,
      countInterval: null,
      isSpeaking: false,
      showSpeakIcon: false,
      showSpeakAbort: false,
      showSpeakStop: false,
      sendingImage: false,
      showSpeakIconLater: null,
      audioBarText: "按住 说话",
      recordText: "语音",
      toggle: true,
      showRecordButton: false,
      r: null,
      p: null,
      posStart: 0,
      posMove: 0,
      posEnd: 0,
      countdown: 10,
      st1: null,
      st2: null,
      path: "_doc/audio/1.amr",
      tAvatarList: [],
      index: [9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      num: 0,
      timer: null, //用于清除计时器
      probeType: 3,
      listenScroll: true,
      pulldown: true,
      loading: false,
      uidToHid: {},
      switch: true,
      chatList: [],
      icons2: [],
      count: 0,
      // teachers: [],
      params: {
        discussionGroupID: this.$route.query.did,
        speakTime: null, //m2.date.addDays(m2.date.now() ,1),
        sort: PreOrLast.Pre,
        count: defaultPageSize
      },
      imgSrcOption: "",
      messages: [],
      firstFetch: true,
      maskShow: false,
      content: "",
      iosType: "normal",
      avatar: "",
      isMessage: true,
      currentAvatar: "",
      tAvatarList: []
    };
  },
  beforeRouteEnter(to, from, next) {
    document.body.style.background = "#fff";
    next();
  },
  beforeRouteLeave(to, from, next) {
    document.body.style.background = "#efeff4";
    next();
  },
  destroyed() {
    window.removeEventListener("resize", resize);
  },
  created() {
    this.checkInit();
    mui.plusReady(function() {
      //plus.webview.currentWebview().setStyle({ softinputMode: "adjustResize" });
    });

    var curRelation =
      m2.cache.get("rx-current-child").relation ||
      $vue.$store.state.currentChild.relation;
    if (curRelation !== 1) {
      //this.isMessage = false;
      this.$route.meta.actionText = "";
    } else {
      //this.isMessage = true;
      this.$route.meta.actionText = ""; // '留言'
    }
    this.setPageTitle();
    this.getCustomerReply();
    this.enableEvent();
    this.init();
    this.getTAvatar();
    if (window.innerHeight < 500) {
      this.iosType = "4s";
    }
    window.addEventListener("resize", resize);
  },
  methods: {
    uploadHandler() {
      plus.nativeUI.actionSheet(
        {
          cancel: "取消",
          buttons: [
            {
              title: "拍照"
            },
            {
              title: "从相册中选择"
            }
          ]
        },
        e => {
          //1 是拍照  2 从相册中选择
          switch (e.index) {
            case 1:
              this.appendByCamera();
              break;
            case 2:
              this.appendByGallery();
              break;
          }
        }
      );
    },
    appendByCamera() {
      var that = this;
      plus.camera.getCamera().captureImage(
        src => {
          that._compressImage(src);
        },
        e => {
          console.log("点击了取消拍照!");
        },
        {
          optimize: false
        }
      );
    },
    appendByGallery() {
      var that = this;
      plus.gallery.pick(src => {
        that._compressImage(src);
      });
    },
    _compressImage(src) {
      var that = this;
      var _this = this;

      plus.nativeUI.showWaiting("加载中...");
      plus.zip.compressImage(
        {
          src: src,
          format: "jpg",
          dst: "_doc/img/" + new Date().getTime() + ".jpg",
          quality: 30
        },
        event => {
          plus.nativeUI.closeWaiting();
          plus.io.resolveLocalFileSystemURL(
            event.target,
            entry => {
              entry.file(
                async function(file) {
                  // mui.alert('file'+JSON.stringify(file))

                  var reader = new plus.io.FileReader();
                  reader.onloadend = function(e) {
                    // mui.alert('result'+e.target.result)

                    // let md5 =  SparkMD5.hashBinary(e.target.result);

                    var stream = _this.dataURLtoBlob(e.target.result);

                    var data = new FormData();
                    data.append("file", stream, file.name);
                    upLoadFile(data, res => {
                      if (res[0]) {
                        // mui.alert(_this.time2)
                        _this.sendingImage = true;
                        _this.content = `[###img###]{"id":"${res[0].id}","time":"${_this.time2}","name":"${res[0].originalName}"}`;
                        _this.sendReply();
                      }

                      // mui.alert('上传成功:'+res[0].id)
                      // mui.alert('上传成功:'+ JSON.stringify(res))
                    });

                    // var stream = this._dataURLtoBlob(path);
                    // var data = new FormData();
                    // data.append("headupload", stream, Date.parse(new Date()) + ".jpg");

                    // mui.alert('md5'+md5)
                  };
                  reader.readAsDataURL(file);
                },
                function(e) {
                  mui.toast("读写出现异常: " + e.message);
                }
              );
            },
            e => {
              mui.toast("读取拍照文件错误");
            }
          );
        }
      );
    },
    showImages(item, flag, i) {
      if (typeof item.content == "string") {
        item = JSON.parse(item.content.replace("[###img###]", ""));
      }
      let r;
      // alert(item.id)

      plus.io.resolveLocalFileSystemURL(
        "_doc/img/" + item.name,
        entry => {
          entry.file(async function(file) {
            // alert('file'+JSON.stringify(file))

            const fileReader = new plus.io.FileReader();
            fileReader.readAsDataURL(file, "utf-8");
            fileReader.onloadend = function(evt) {
              var imgIcon = document.getElementById(
                item.name.replace(".", "-")
              );

              imgIcon.src = evt.target.result;
              // plus.nativeUI.closeWaiting();
            };
          });
        },
        e => {
          if (!flag) {
            this.getImage(item);
            this._scrollToBottom();
          }
        }
      );
    },
    getImage(item) {
      this.task = null;
      this.task = plus.downloader.createDownload(
        `${downLoadFile}?MaterialID=${item.id}&OriginalName=${item.name}`,
        { method: "GET", filename: "_doc/img/" },
        (d, status) => {
          // alert(d.filename)
          if (status == 200) {
            // alert(d.filename)
            // window.myfile=d.filename;
            // plus.gallery.save(d.filename, function(){
            //   alert('img保存成功');
            // }, function(e){
            //   alert('img保存失败: '+JSON.stringify(e));
            // });
            // mui.alert( "filename2222222: " + d.filename );
            this.showImages(item, 1);
          } else {
            // plus.nativeUI.closeWaiting();
            mui.alert("Download wgtu failed: " + status);
          }
        }
      );
      this.task.start();
    },

    toggleAudioButton() {
      this.showRecordButton = !this.showRecordButton;
      // this.recordText = this.recordText=='语音'?'文字':'语音'
      this.toggle = !this.toggle;
    },
    speakBegin(event) {
      this.isSpeakTimeout=false;
      this.posStart = 0;
      this.posStart = event.touches[0].pageY;
      this.showCountdown = false;
      clearInterval(this.countInterval);
      clearTimeout(this.st1);
      clearTimeout(this.st2);
      this.Countdown = 10;
      this.startRecord();
      // _this.showSpeakIconLater = setTimeout(() => {
        //ios 上用定时器有bug
        this.showBlackBoxSpeak();
      // }, 300);
    },
    speaking(event) {
      this.posMove = event.targetTouches[0].pageY;
      if(this.isSpeakTimeout){
        
      }else if ((this.posStart - this.posMove < 80)) {
          this.showBlackBoxSpeak();
      } else {
          this.showBlackBoxPause();
      }
    },
    speakEnd(event) {
      this.posEnd = 0;
      this.posEnd = event.changedTouches[0].pageY;
      this.showCountdown = false;
      clearInterval(this.countInterval);
      clearTimeout(this.st1);
      clearTimeout(this.st2);
      this.Countdown = 10;

      //初始化状态
      // initStatus();

      if (this.posStart - this.posEnd < 80) {
        this.sendControl = true;
        // mui.toast("发送成功");
        this.showBlackBoxNone();
      } else {
        // mui.toast("取消发送");
        this.sendControl = false;
        this.showBlackBoxNone();
      }
      this.stopRecord();
      this.audioBarText = "按住 说话";
    },
    //显示录音 隐藏暂停
    showBlackBoxSpeak() {
      this.audioBarText = "松开 结束";
      this.showSpeakIcon = true;
      this.showSpeakStop = false;
    },

    //隐藏录音 显示暂停
    showBlackBoxPause() {
      this.audioBarText = "松开手指，取消发送";
      this.showSpeakIcon = false;
      this.showSpeakStop = true;
    },

    //隐藏录音
    showBlackBoxNone() {
      this.showSpeakIcon = false;
      this.showSpeakStop = false;
      this.showSpeakAbort = false;
      this.audioBarText = "按住 说话";
    },

    initSpeakIcon() {
      //轮播相关

      var blackBoxSpeak = document.querySelector(".blackBoxSpeak");
      this.timer = setInterval(() => {
        setTimeout(() => {
          this.num++;

          blackBoxSpeak.style.background = `url(${require("@/public/asset/img/message/ic_record@2x.png")}) no-repeat 28px 16px/64px 104px,url(${require("@/public/asset/img/message/ic_record_ripple@2x-" +
            this.index[this.num] +
            ".png")}) no-repeat 111.2px 32px/28.8px 88px`;
          blackBoxSpeak.style.backgroundColor = " rgba(0,0,0,.7)";
        }, 70);
        if (this.num >= this.index.length - 1) {
          this.num = 0;
        }
      }, 70);
    },
    md5File(file) {
      var chunk, chunkSize, currentChunk;
      var spark;
      var fileReader;
      // mui.alert('进入md5')
      return new Promise((resolve, reject) => {
        // mui.alert('进入promise')
        var blobSlice =
            File.prototype.slice ||
            File.prototype.mozSlice ||
            File.prototype.webkitSlice,
          //chunkSize = 2097152, // Read in chunks of 2MB
          chunkSize = file.size / 100,
          //chunks = Math.ceil(file.size / chunkSize),
          chunks = 100,
          currentChunk = 0,
          spark = new SparkMD5.ArrayBuffer(),
          // fileReader = new FileReader();
          fileReader = new plus.io.FileReader();
        fileReader.onloadend = function(e) {
          // mui.alert('onload')
          var res = dataURLtoFile(e.target.result);
          spark.append(res); // Append array buffer
          currentChunk++;

          if (currentChunk < chunks) {
            loadNext();
          } else {
            let cur = +new Date();
            console.log("finished loading");
            // alert(spark.end() + '---' + (cur - pre)); // Compute hash
            let result = spark.end();
            resolve(result);
          }
        };

        fileReader.onerror = function() {
          mui.alert("onError");
        };

        function loadNext() {
          var start = currentChunk * chunkSize,
            end =
              start + chunkSize >= file.size ? file.size : start + chunkSize;

          var filePart = file.slice(start, end);
          // mui.alert('filePart'+filePart)

          fileReader.readAsDataURL(filePart, "utf-8");

          // fileReader.readAsArrayBuffer(filePart);
        }
        function dataURLtoFile(dataurl, filename) {
          //将base64转换为文件
          var arr = dataurl.split(","),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], "fname", { type: mime });
          // return new File([u8arr], filename, {type:mime});
        }
        function _dataURLtoBlob(dataurl) {
          var arr = dataurl.split(","),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new Blob([u8arr], {
            type: mime
          });
        }

        loadNext();
      });
    },

    saveFile(path) {
      plus.io.requestFileSystem(plus.io.PRIVATE_WWW, function(fs) {
        // fs.root是根目录操作对象DirectoryEntry
        fs.root.getFile("config.xml", { create: true }, function(fileEntry) {
          fileEntry.file(function(file) {
            var fileReader = new plus.io.FileReader();
            alert("getFile:" + JSON.stringify(file));
            fileReader.readAsText(file, "utf-8");
            fileReader.onloadend = function(evt) {
              alert("11" + evt);
              alert("evt.target" + evt.target);
              alert(evt.target.result);
            };
            alert(file.size + "--" + file.name);
          });
        });
      });
    },
    dataURLtoFile(dataurl, filename) {
      //将base64转换为文件
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], "fname", { type: mime });
      // return new File([u8arr], filename, {type:mime});
    },
    dataURLtoBlob(dataurl) {
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {
        type: mime
      });
    },
    startRecord(){
      // window.showSettingDialog=true;
      // mui.toast('开始录音：');
      this.r = plus.audio.getRecorder();
      if ( this.r == null ) {
        mui.toast('录音对象未获取');
        return;
      }
      this.st1 = setTimeout(()=>{
        this.st1 && clearTimeout(this.st1)
        this.sendControl=1;
        this.showBlackBoxNone();
        this.showCountdown = false;
        clearInterval(this.countInterval);
        this.Countdown = 10;
        this.stopRecord();
        this.audioBarText='按住 说话';
        this.showSpeakIcon=false;
        this.isSpeakTimeout=true;
      },60000)

      this.st2 = setTimeout(()=>{
        this.st2 && clearTimeout(this.st2)
        this.showCountdown = true;
        clearInterval(this.countInterval);
        this.countdown=10;
        this.countInterval = setInterval(() => {
          this.countdown--
        }, 1000);
      },50000)
      var _this = this;
      this.time1 = new Date().getTime();
      let ext=mui.os.ios?'.wav':''
      this.r.record({filename:'_doc/audio/'+Math.random().toString().substr(-16)+ext}, (p)=>{
      // mui.alert('plus.io.PRIVATE_DOC:'+plus.io.PRIVATE_DOC)
      // this.r.record({filename:plus.io.PRIVATE_DOC}, (p)=>{
        // mui.alert('录音完成：'+p);
        // alert(_this.sendControl)
        
        // if(_this.sendControl  && !window.showSettingDialog){
        if(_this.sendControl  ){
          // this.startPlay(p)
          // var player = plus.audio.createPlayer(p);
          // var d = player.getDuration();
          // setTimeout(function(){
          //   mui.alert(d+'s1')
          // },22500)
          plus.io.resolveLocalFileSystemURL(p, function(entry){
            // mui.alert('p'+p)
            let time3 = new Date().getTime()
            if(time3-_this.time1<600){
              _this.showBlackBoxNone();
              _this.audioBarText='按住 说话';
              _this.showSpeakIcon=false;
              setTimeout(() => {
                _this.showSpeakAbort=true;
                clearTimeout(_this.showSpeakIconLater)
              }, 300);// 这里给300正好消除ios的bug
              
              setTimeout(() => {
                _this.showBlackBoxNone();
              }, 700);
              return
            }
            _this.time2= Math.ceil( ( time3 - _this.time1)/1000 );
            _this.time2>60?_this.time2--:1;


            
            entry.file(async function(file){

              // mui.alert('file'+JSON.stringify(file))
              
              var reader = new plus.io.FileReader();
              reader.onloadend = function (e) {
                  // mui.alert('result'+e.target.result)

                  // let md5 =  SparkMD5.hashBinary(e.target.result);

                  var stream = _this.dataURLtoBlob(e.target.result)

                  var data = new FormData()
                  data.append('file', stream, file.name)
                  _this.showCountdown = false;
                  clearInterval(_this.countInterval);
                  clearTimeout(_this.st1)
                  clearTimeout(_this.st2)
                  _this.Countdown = 10;
                  upLoadFile(data, res => {
                    if(res[0]){
                      // mui.alert(_this.time2)
                      _this.content=`[###voice###]{"id":"${res[0].id}","time":"${_this.time2}","name":"${res[0].originalName}"}`; 
                      _this.sendReply();
                    }
                    
                    // mui.alert('上传成功:'+res[0].id)
                    // mui.alert('上传成功:'+ JSON.stringify(res))
                  });

                  // var stream = this._dataURLtoBlob(path);
                  // var data = new FormData();
                  // data.append("headupload", stream, Date.parse(new Date()) + ".jpg");

                  // mui.alert('md5'+md5)
              };
              reader.readAsDataURL(file);
            },function(e){
                mui.toast("读写出现异常: " + e.message );
            })
          }, function(e){
            mui.toast('读取录音文件错误：'+e.message);
          });
        }
      }, function(e){
        mui.toast('录音失败：'+e.message);
      } );
    },
    stopRecord() {
      this.showCountdown = false;
      clearInterval(this.countInterval);
      clearTimeout(this.st1);
      clearTimeout(this.st2);
      this.Countdown = 10;
      this.r.stop();
    },
    playVoice(item, flag, i) {
      if(this.isSpeaking && this.cur==i){
        this.p && this.p.stop();
        this.isSpeaking=false;
        this.cur='';
        return
      }
      (i||i==0) && (this.cur = i);
      this.isSpeaking = true;
      // this.$set(item,)
      // this.$nextTick( ()=>{
      //   this.$set(this.message,)
      //   item.isSpeaking=true;
      //   // this
      // } )

      console.log(item);
      console.log(this.messages);
      if (typeof item.content == "string") {
        item = JSON.parse(item.content.replace("[###voice###]", ""));
      }

      plus.io.resolveLocalFileSystemURL(
        "_doc/audio/" + item.name,
        entry => {
          // mui.alert('entry'+entry)
          this.startPlay("_doc/audio/" + item.name);
        },
        e => {
          if (!flag) {
            this.getVoice(item);
            // mui.alert('not found')
          }
        }
      );

      // this.startPlay(item.content)
    },
    getVoice(item) {
      // downLoadFile({MaterialID:item.id,OriginalName:item.name},(r)=>{
      //   mui.alert(r)
      // })
      this.isSpeaking = true;
      this.task = null;
      this.task = plus.downloader.createDownload(
        `${downLoadFile}?MaterialID=${item.id}&OriginalName=${item.name}`,
        { method: "GET", filename: "_doc/audio/" },
        (d, status) => {
          if (status == 200) {
            // mui.alert( "filename2222222: " + d.filename );
            this.playVoice(item, 1);
          } else {
            // plus.nativeUI.closeWaiting();
            mui.alert("Download wgtu failed: " + status);
          }
        }
      );

      // this.task.addEventListener( "statechanged", (task,status)=>{
      //   if(!dtask){return;}
      //   mui.alert('task'+JSON.stringify(task))
      //   switch(task.state) {
      //     case 1: // 开始
      //       mui.alert( "开始下载..." );
      //     break;
      //     case 2: // 已连接到服务器
      //       mui.alert( "链接到服务器..." );
      //     break;
      //     case 3:	// 已接收到数据
      //       mui.alert( "下载数据更新:" );

      //     break;
      //     case 4:	// 下载完成
      //       mui.alert( "下载完成！" );
      //       this.playVoice(item,1)
      //     break;
      //   }
      // } );
      this.task.start();
    },
    startPlay(f) {
      if (plus.audio == undefined) {
      }
      this.p && this.p.stop();
      this.p = plus.audio.createPlayer(f);
      window.myPlayer=this.p;
      this.isSpeaking = true;
      this.p.play(
        () => {
          this.isSpeaking = false;
        },
        function(e) {}
      );
    },
    stopPlay() {
      this.p.stop();
    },
    getJobName(type) {
      if (type == 2) {
        return "学管师-";
      } else if (type == 3) {
        return "教师-";
      } else if (type == 1) {
        return "咨询师-";
      } else {
        return "";
      }
    },
    searchMore() {
      
      console.log(2);
      // this.firstFetch = true

      // this.getCustomerReply(null);
      // this.firstFetch = true;
      this.getData(m2.date.now());
      // let groupItems = this.$refs.groupItem || 0;
      // let el = groupItems[groupItems.length - 1];
      // this.$refs.listview.scrollToElement(el, 200)

      // this.getData(m2.date.now())
    },
    getHeadById(user) {
      let iconID = this.uidToHid[user.userID];
      // debugger;
      if (iconID) {
        getHead({ iconID }, res => {
          // this.currentAvatar = res;
          // item.imgData = res;
          // m2.cache.set(CACHE_KEYS.CURRENT_MODI_HEAD, userIcons);
          console.log(res);
          return "~@/public/asset/img/user/teacher-man.png";
        });
      } else {
        return '"~@/public/asset/img/user/teacher-man.png"';
      }
    },
    fnTap(e) {
      if (!mui.os.ios) {
        if (e.target.tagName == "TEXTAREA" || e.target.tagName == "INPUT") {
          return;
        }
        if (
          document.activeElement.tagName == "TEXTAREA" ||
          document.activeElement.tagName == "INPUT"
        ) {
          document.activeElement.blur();
        }
      }
    },
    setPosition() {
      var ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        // // 动态改变webview的侧滑返回功能：
        var wv = plus.webview.currentWebview();
        let bottom = this.iosType == "4s" ? "315px" : "415px";
        wv.setStyle({
          top: "0px"
        });
      }
    },
    setPosition2() {
      var ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        var header = document.getElementsByTagName("header")[0];
        header.setAttribute("style", "position:fixed;top:" + 0 + "px;left:0");
        var wv = plus.webview.currentWebview();

        wv.setStyle({
          top: "0px"
        });
        wv.setStyle({
          bottom: "0px"
        });
      }
    },
    getTAvatar() {
      var userIcons = m2.cache.get(CACHE_KEYS.CURRENT_MODI_HEAD);
      var currentLogon = m2.cache.get(CACHE_KEYS.CURRENT_USER).userId;
      userIcons.forEach(item => {
        if (item.userID == currentLogon) {
          if (item.iconID && item.imgData) {
            this.currentAvatar = item.imgData;
          } else if (item.iconID) {
            getHead(
              {
                iconID: item.iconID
              },
              res => {
                this.currentAvatar = res;
                item.imgData = res;
                m2.cache.set(CACHE_KEYS.CURRENT_MODI_HEAD, userIcons);
              }
            );
          } else if (item.gender) {
            let img = item.gender == 2 ? "mother.png" : "father.png";
            this.currentAvatar = require(`@/public/asset/img/user/${img}`);
          } else {
            this.currentAvatar = require("@/public/asset/img/user/father.png");
          }
        }
      });
    },
    init() {
      var userIcons = this.$store.state.headList.slice() || [];
      var curIcon = userIcons.find(i => i.userID === this.replierID);
      var _this = this;
      if (curIcon) {
        this.imgSrcOption = curIcon.imgData;
      } else if (this.icons && this.icons.iconID) {
        getHead(
          {
            iconID: _this.icons.iconID
          },
          res => {
            let obj = {
              userID: this.replierID,
              imgData: res
            };
            this.imgSrcOption = res;
            userIcons.push(obj);
            store.commit(types.HEADLIST_ARR, userIcons);
          }
        );
      }
    },
    getCustomerReply() {
      this.getData();
    },
    setPageTitle() {
      this.$route.meta.title = this.pageTitle;
    },
    checkInit() {
      if (
        this.replyType == ReplyType.Consultant ||
        this.replyType == ReplyType.Educator
      ) {
        if (this.pageTitle.indexOf("-") < 0) {
          if (this.replyType == ReplyType.Consultant) {
            mui.confirm(
              "该学员目前没有咨询师，请联系校区在系统中分配咨询师。",
              "提示",
              ["确定"],
              e => {
                this.$router.push({ path: "/message/customer-interact" });
                // this.$router.back()
              }
            );
          }
          if (this.replyType == ReplyType.Educator) {
            mui.confirm(
              "该学员目前没有学管师，请联系校区在系统中分配学管师。",
              "提示",
              ["确定"],
              e => {
                // this.$router.back()
                this.$router.push({ path: "/message/customer-interact" });
              }
            );
          }
        }
      }
    },
    async getData(addDate, ifTObtm) {
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
        if (res && res.length && userID == '000000' ) {
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
        this.loading = false;
        this.sendingImage = false;
      });
    },
    refreshMore() {
      this.loading = this.hasMore ? true : false;
      if (!this.hasMore) {
        // alert(1)
        return
      }else{
          // alert(2)
      }
      
      this.getData();
    },
    enableEvent() {
      xdapp.util.vue.commitActionStatus(true);
      xdapp.util.vue.on(ACTION_TYPES.GOTO_FEEDBACK, this._gotoReply);
    },
    _gotoReply() {
      this.maskShow = true;
    },
    maskDis() {
      this.maskShow = false;
    },
    sendReply() {
      // let content = this.content;
      let params = {
        replyObject: this.replyType,
        content: this.content
      };
      if (this.replyType == ReplyType.Teacher) {
        params = {
          teacherID: this.replierID,
          ...params
        };
      }
      speakInDiscussion(
        {
          DiscussionGroupID: this.$route.query.did,
          content: this.content
        },
        res => {
          this.content = "";
          this.$nextTick(function() {
            // this.getCustomerReply(null);
            this.firstFetch = true;
            this.getData(m2.date.now());
          });
        }
      );
      // $sendCustomerReply(params, res => {
      //   this.firstFetch = true;
      //   this.maskShow = false;
      //   this.getData(null);
      // });
    },
    // _gotoReply(){
    //   this.$router.push({
    //     name: "leaveMsg",
    //     query: {replyType: this.replyType, title: this.pageTitle, staffId: this.replierID}
    //   });
    // },
    inpFocus() {
      var _this = this;
      setTimeout(() => {
        var rectObject = _this.msgText.getBoundingClientRect();
        var moveH = _this.initObj.top - rectObject.top;

        var screenH = document.body.scrollHeight;

        if (window.isMessageTopAdd && screenH !== 480) {
          moveH += 45;
          window.isMessageTopAdd = false;
        }
        var ua = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
          this.header = document.getElementsByTagName("header")[0];
          this.msgList = document.getElementsByClassName("msg-list")[0];

          this.header
            ? this.header.setAttribute(
                "style",
                "position:absolute;top:" + moveH + "px;left:0"
              )
            : "";
          this.msgList
            ? this.msgList.setAttribute(
                "style",
                "position:relative;top:" + moveH + "px;left:0"
              )
            : "";
        }
      }, 0);
      this.bfscrolltop = document.body.scrollTop;
      this.interval = setInterval(function() {
        document.body.scrollTop = document.body.scrollHeight;
      }, 100);
      this._scrollToBottom();
    },
    inpBlur() {
      clearInterval(this.interval); //清除计时器
      var ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        //苹果手机
        this.header
          ? this.header.setAttribute("style", "position:fixed;top:0;left:0")
          : "";
        this.msgList
          ? this.msgList.setAttribute("style", "position:relative;top:0;left:0")
          : "";
      }
      document.body.scrollTop = this.bfscrolltop;
    },
    _scrollToBottom() {
      this.$nextTick(() => {
        setTimeout(() => {
          let groupItems = this.$refs.groupItem || 0;
          let el = groupItems[groupItems.length - 1];
          this.$refs.listview.scrollToElement(el, 200, true, 6000);
        }, 300);
      });
    },
    _scrollToBottomAfterLoadImage() {
      this.$refs.listview.refresh();
      // this.$nextTick(() => {
      //   setTimeout(() => {
      //     let groupItems = this.$refs.groupItem || 0;
      //     let el = groupItems[groupItems.length - 1];
      //     this.$refs.listview.scrollToElement(el, 200, true, 8000);
      //   }, 800);
      // });
    },
    getIconImg(userID) {
      // console.log(this.icons2)
      let icon = this.icons2.find(item => item.userID === userID);
      return icon ? icon.imgData : "";
    },
    getUserIcons() {
      this.messages.forEach(item => {
        if (!item.icons2 || !item.icons2.iconID) return;

        var userIcons = this.$store.state.headList.slice() || [];
        let curIcon = null;
        if (userIcons && userIcons.length) {
          curIcon = userIcons.find(i => i.userID === item.icons2.userID);
        }
        if (curIcon) {
          this.icons2.push({
            userID: curIcon.userID,
            imgData: curIcon.imgData
          });
        } else {
          getHead(
            {
              iconID: item.icons2.iconID
            },
            res => {
              let obj = {
                userID: item.icons2.userID,
                imgData: res
              };

              // console.log(this.icons2)
              this.icons2.push(obj);
              userIcons.push(obj);
              store.commit(types.HEADLIST_ARR, userIcons);
            }
          );
        }
      });
    }
  },
  mounted() {
    // this.initSpeakIcon();
    previewImage = mui.previewImage();
    this._scrollToBottom();
    // setInterval(this._scrollToBottom2,300)
    // alert(JSON.parse(previewImage))
  },
  destroyed(){
    window.myPlayer &&  window.myPlayer.stop()
  },
  /*mounted() {
			var msgInp = document.getElementsByClassName('msg-input')[0];
			if(msgInp) {
				this.msgText = msgInp;
				this.initObj = this.msgText.getBoundingClientRect();
			}

    },*/
  watch: {
    messages(val) {
      this.getUserIcons();
      this.chatList = [];
      if (val.length) {
        val.forEach((item, index) => {
          if (item.userID && item.userType !== 5) {
            if (item.userType == 4) {
              this.chatList.push({
                type: "3",
                userID: item.userID
              });
            } else if (item.userType !== 4) {
              this.chatList.push({
                type: "1",
                userID: item.userID
              });
            }
          }
        });
      }
    },
    chatList() {
      if (this.chatList.length) {
        // debugger
        getHeadIDsByUserIDs(this.chatList, res => {
          this.messages.forEach(item => {
            // debugger
            // console.log(this.messages)
            // console.log(res)
            // console.log(this.count++)
            res.forEach(sel => {
              if (item.userID == sel.userID) {
                this.$set(item, "icons2", sel);
                // this.$nextTick(() => {
                //   this.getUserIcons();
                // });
              }
            });
          });
          console.log("--msg-");
          console.log(this.messages);
        });
      }
    }
  },
  computed: {
    replyType() {
      return this.$route.query.replyType;
    },
    pageTitle() {
      return this.$route.query.title;
    },
    replierID() {
      return this.$route.query.staffId;
    },
    icons() {
      return this.$route.query.icons;
    },
    curUserId() {
      return m2.cache.get("rx-current-user").userId;
    }
  },
  components: {
    Scroll,
    Loading,
    Tip
  }
};
</script>

<style lang="scss" scoped>
.blackBoxSpeak {
  width: 176px;
  height: 176px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  background: url(~@/public/asset/img/message/ic_record@2x.png) no-repeat 28px
      16px/65px 104px,
    url(~@/public/asset/img/message/speaking.gif) no-repeat 111.2px
      32px/28.8px 88px;

  background-color: rgba(0, 0, 0, 0.7);
  // display: none;
  border-radius: 12px;
  z-index: 10000;
}

.blackBoxSpeakConent {
  font: 14.4px "微软雅黑 Light";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  display: block;
  text-align: center;
  width: 90%;
  padding: 8px 0;
  margin: auto;
  color: #ffffff;
  font-weight: 200;
  border-radius: 4px;
  z-index: 10000;
}

.blackBoxTimeless {
  div {
    text-align: center;
    font-size: 3.2rem;
    line-height: 3.2rem;
    color: #fff;
  }

  width: 176px;
  height: 176px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  // background: url(~@/public/asset/img/message/ic_release_to_cancel@2x.png) no-repeat center 8px/67.2px 104px;

  background-color: rgba(0, 0, 0, 0.7);
  // display: none;
  border-radius: 12px;
}

.blackBoxTimelessConent {
  font: 14.4px "微软雅黑 Light";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  display: block;
  text-align: center;
  width: 90%;
  padding: 8px 0;
  margin: auto;
  color: #ffffff;
  font-weight: 200;
  border-radius: 4px;
}

.blackBoxPause {
  width: 176px;
  height: 176px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  background: url(~@/public/asset/img/message/ic_release_to_cancel@2x.png)
    no-repeat center 8px/67.2px 104px;

  background-color: rgba(0, 0, 0, 0.7);
  // display: none;
  border-radius: 12px;
}
.btn-audio {
  background: url(~@/public/asset/img/message/voice.png) no-repeat 9px;
}
.btn-text {
  background: url(~@/public/asset/img/message/word.png) no-repeat 9px;
}

.blackBoxPauseContent {
  font: 14.4px "微软雅黑 Light";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  display: block;
  text-align: center;
  width: 90%;
  padding: 8px 0;
  margin: auto;
  color: #ffffff;
  font-weight: 200;
  border-radius: 4px;
}
.reply-name {
  position: absolute;
  transform: translate(45px);
  color: #aaa;
}
.mask {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 99999;
  .mask-box {
    width: torem(300);
    margin: torem(200) auto torem(40) auto;
    .close {
      text-align: right;
      margin-bottom: -3px;
    }
    .iconfont {
      display: inline-block;
      color: #fff;
      font-size: torem(26);
      margin-right: -18px;
    }
  }
  // text-align: center;
  .msg-box {
    position: relative;
    width: 100%;
    // height: torem(200);
    background-color: #fff;
    border-radius: torem(15);
    padding: torem(15) torem(15) torem(10);
    position: relative;
    text-align: center;
    .msg-text {
      padding: torem(10);
      width: 100%;
      height: torem(200);
      border: none;
      border-radius: torem(15);
      border: 1px solid #ccc;
      border-radius: 5px;
      margin-bottom: 5px;
    }
  }
  textarea::-webkit-input-placeholder {
    @include letterStyle(13, #cacfd9, 0, 16);
  }
  .send {
    width: 60%;
    margin: 0 auto;
    background: rgb(255, 130, 1);
    color: #fff;
    display: block;
    border-radius: 30px;
    border: none;
  }
}

.xdapp-msg-wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  background: #fff;
  .scroll-container {
    height: 100%;
    overflow: hidden;
    .msg-list {
      background: #fff;
      padding-top: 20px;
      ul.list-group {
        li {
          padding-bottom: torem(15);
          &:last-child {
            padding-bottom: torem(100);
          }
        }
        .msg-time {
          text-align: center;
          display: block;
          margin-top: 14px;
          font-size: 12px;
          margin-left: 40%;
          width: 70px;
          color: #fff;
        }
        .msg-item {
          z-index: 1;
          position: relative;
          padding: 14px 18px 0;
          display: flex;
          .avatar-img {
            width: 40px;
            height: 40px;
            margin-right: 11px;
            border-radius: 50%;
            transform: translate(0, 17px);
          }
          .chat-img {
            margin-top: 24px;
            max-width: 60vw;
            height: auto;
            // border-radius: 0%;
            // transform: translateX(-15vw);
          }
          .audio-ico.reply {
            height: 40px;
          }
          .reply {
            .voice-img {
              background: url(~@/public/asset/img/message/voices004.png)
                no-repeat;
              transform: translateY(10px);
              width: 27px;
              height: 100%;
              display: inline-block;
              transform: scale(0.7);
            }
            .dur {
              display: inline-block;
              line-height: 100%;
              vertical-align: 9px;
              float: right;
              margin-top: 4px;
            }
            .voice-img.speaking {
              animation: voice 1s infinite;
            }
            margin-left: 0;
            padding: 10px 15px;
            max-width: torem(222);
            font-size: 16px;
            color: #333;
            word-break: break-all;
            // border: 1px solid #eee;
            border-radius: 5px;
            background-color: #eee;
            transform: translate(0, 20px);
            .tit {
              font-size: 20px;
              color: #000;
              line-height: 28px;
            }
          }
          &:after {
            content: "";
            width: 0;
            height: 0;
            border: 7px solid transparent;
            border-right: 7px solid #eee;
            position: absolute;
            left: 56px;
            top: 40px;
            z-index: 10;
          }
          &:before {
            content: "";
            width: 0;
            height: 0;
            border: 7px solid transparent;
            border-right: 7px solid #eee;
            position: absolute;
            left: 58px;
            top: 40px;
            z-index: 20;
          }
          &.img-no-arrow:after {
            content: "";
            width: 0;
            height: 0;
            border: 0px solid transparent;
            border-left: 0px solid #ffe3b6;
            position: absolute;
            right: 56px;
            top: 27px;
            z-index: 10;
          }
          &.img-no-arrow:before {
            content: "";
            width: 0;
            height: 0;
            border: 0px solid transparent;
            border-left: 0px solid #ffe3b6;
            position: absolute;
            right: 58px;
            top: 27px;
            z-index: 20;
          }
        }
        .sysmsg {
          align-items: center;
          justify-content: center;
          transform: translate(0, -15px);
          .reply {
            max-width: 90vw !important;
          }
          &::before {
            border: none !important;
          }
          &::after {
            border: none !important;
          }
        }
        .msg-item-right {
          z-index: 1;
          position: relative;
          padding: 14px 18px 0;
          display: flex;
          justify-content: flex-end;
          .avatar-img {
            width: 40px;
            height: 40px;
            margin-left: 11px;
            border-radius: 50%;
          }
          .chat-img {
            max-width: 60vw;
            height: auto;
            // border-radius: 0%;
            // transform: translateX(-15vw);
          }
          .reply {
            .voice-img {
              background: url(~@/public/asset/img/message/voices004.png)
                no-repeat;
              width: 27px;
              height: 100%;
              display: inline-block;
              transform: scale(0.7) rotate(180deg);

              // background-position:20px 20px;
            }
            .dur {
              display: inline-block;
              line-height: 100%;
              vertical-align: 6px;
            }
            .voice-img.speaking {
              animation: voice 1s infinite;
            }
            font-size: 15px;
            color: #333;
            padding: 10px 15px;
            margin-left: torem(57);
            background-color: #ffe3b6;
            border-radius: 5px;
            max-width: torem(222);
            word-break: break-all;
            .tit {
              font-size: 20px;
              color: #000;
              line-height: 28px;
            }
          }
          &:after {
            content: "";
            width: 0;
            height: 0;
            border: 7px solid transparent;
            border-left: 7px solid #ffe3b6;
            position: absolute;
            right: 56px;
            top: 27px;
            z-index: 10;
          }
          &:before {
            content: "";
            width: 0;
            height: 0;
            border: 7px solid transparent;
            border-left: 7px solid #ffe3b6;
            position: absolute;
            right: 58px;
            top: 27px;
            z-index: 20;
          }
          &.img-no-arrow:after {
            content: "";
            width: 0;
            height: 0;
            border: 0px solid transparent;
            border-left: 0px solid #ffe3b6;
            position: absolute;
            right: 56px;
            top: 27px;
            z-index: 10;
          }
          &.img-no-arrow:before {
            content: "";
            width: 0;
            height: 0;
            border: 0px solid transparent;
            border-left: 0px solid #ffe3b6;
            position: absolute;
            right: 58px;
            top: 27px;
            z-index: 20;
          }
        }
        @media only screen and (max-width: 320px) {
          .msg-item-right {
            display: box;
            /* OLD - Android 4.4- */
            display: -webkit-box;
            /* OLD - iOS 6-, Safari 3.1-6 */
            display: -moz-box;
            /* OLD - Firefox 19- (buggy but mostly works) */
            display: -ms-flexbox;
            /* TWEENER - IE 10 */
            display: -webkit-flex;
            /* NEW - Chrome */
            display: flex;
          }
        }
      }
    }
  }
}
@keyframes voice {
  0% {
    background: url(~@/public/asset/img/message/voices001.png) no-repeat;
  }
  25% {
    background: url(~@/public/asset/img/message/voices002.png) no-repeat;
  }
  50% {
    background: url(~@/public/asset/img/message/voices003.png) no-repeat;
  }
  75% {
    background: url(~@/public/asset/img/message/voices004.png) no-repeat;
  }
  100% {
    background: url(~@/public/asset/img/message/voices004.png) no-repeat;
  }
}
.msg-input {
  position: absolute;
  width: 100%;
  height: 50px;
  min-height: 50px;
  border-top: solid 1px #bbb;
  left: 0px;
  bottom: 0px;
  overflow: hidden;
  padding: 0px 10px 0px 10px;
  background-color: #fafafa;
  display: flex;
  .msg-left {
    flex: 1;
    height: 100%;
    padding: 5px 0px;
    [class*="input"] {
      width: 100%;
      height: 100%;
      border-radius: 5px;
    }
    .input-text {
      background: #fff;
      border: solid 1px #ddd;
      padding: 10px !important;
      font-size: 16px !important;
      line-height: 18px !important;
      font-family: verdana !important;
      border-radius: 5px 0 0 5px;
      &::-webkit-scrollbar {
        display: none;
      }
      // overflow: hidden;
    }
  }
  .audioButton {
    display:none;
    position: absolute;
    height: 50px;
    line-height: 50px;
    padding: 0 30px;
  }
  .recordButton {
    width: calc(100vw - 58px);
    height: 40px;
    position: absolute;
    z-index: 99;
  }
  .msg-right {
    // position: absolute;
    // width: 100px;
    height: 50px;
    right: 0px;
    bottom: 0px;
    text-align: center;
    vertical-align: middle;
    line-height: 100%;
    padding: 5px 0px;
    display: inline-block;
    .btn-send {
      // width: 70px;
      height: 98%;
      // margin-top: 1px;
      padding: 0 9px;
      border: none;
      text-align: center;
      line-height: torem(-0.04);
      font-size: torem(14);
      border-radius: 0 5px 5px 0;
    }
    .btn-pic {
      display: none;
      width: 40px;
      background: url(~@/public/asset/img/message/pic.png) no-repeat 9px;
    }
    .btn-on {
      background: skyblue;
      color: #fff;
    }
    .btn-off {
      background: #ccc;
    }
  }
}
</style>