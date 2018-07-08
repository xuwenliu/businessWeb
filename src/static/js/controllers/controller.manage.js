/**
 *
 *
 *帐号管理  > 公司修改
 */



sysController.controller("ManageInfoController", ["$scope", "$http", "$window", "$cookieStore","$timeout","$province","$city","$area","$validate","GET_TOKEN","QINIU","QNV","$sce","$getSelectTypes",
    function ($scope, $http,$window,$cookieStore,$timeout,$province,$city,$area,$validate,GET_TOKEN,QINIU,QNV,$sce,$getSelectTypes) {
         /*初始化状态下拉*/
        $getSelectTypes.select($scope,[$window.API.COMPANY.COMPANY_OPERATE_TYPES].join(""));


        /*开通业者E端权限*/
        $scope.editEroot=function(dt){
        	console.log($window.location.href);
            $window.location.href="#/main/employee-add?type="+dt
        };


        /*修改密码*/
        $scope.clearDialog=function(){
            $scope.setpow={ "password": "","password2": "","oldPassword": ""};
            $scope.setpowBtntext="取消";
            $scope.setpowbox=false;
            $scope.errorMsg="";
        };

        $scope.dialogSubmitUser=function(dt){
            var dt = angular.copy(dt);
            $scope.errorMsg="";
            if (!dt.oldPassword) {
                $scope.errorMsg = "原密码格式不正确";
                return false
            }
            if (!dt.password) {
                $scope.errorMsg = "新密码格式不正确";
                return false
            }
            if (dt.password==dt.oldPassword) {
                $scope.errorMsg = "原密码和新密码不能相同";
                return false
            }
            if (!(dt.password==dt.password2)){
                $scope.errorMsg = "两次输入密码不相同";
                return false
            }else{
                var data={};
                data.password=Rsa(dt.password);
                data.oldPassword=Rsa(dt.oldPassword);
                data.userName=$cookieStore.get("userName");
                $http.put(window.API.SYS.RESET_POW, data ).success(function (res) {
                    if (!res.stateCode) {
                        $scope.errorMsg="恭喜您，密码重置成功！";
                        $scope.setpowbox=true;
                        $scope.setpowBtntext="关闭";
                    } else {
                        $scope.errorMsg = res.message;
                    };
                });
            }
        };



        /*调用七牛上传*/
        var Qiniu= new QiniuJsSDK();
        var maxLen=10,minLen=3;
        GET_TOKEN();
        QINIU.OPTION.uptoken=$cookieStore.get("UPTOKEN");
        QINIU.FUN(maxLen,minLen,$scope);
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"logoImage",multi_selection: false}));

        QINIU.FileUploaded({scope:$scope});//图片模块上传
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"upPhotosBtn",multi_selection: false}));


        /*七牛视频上传*/
        var qiniuVideo = new QiniuJsSDK();
        GET_TOKEN({v:true});
        new QNV.FUN().defFun();
        QNV.OPTION.uptoken=$cookieStore.get("UPTOKENV");
        QNV.FileUploaded({types:1,uri:'/',scope:$scope});//uri临时
        qiniuVideo.uploader($.extend(QNV.OPTION,{browse_button: "upVideoBtn" }));



        //加载省
        (function () {
            $province.get()
                .success(function (data) {
                    $scope.provinces=data["data"];
                })
        })();

        //监视省变化改变市
        $scope.$watch("businessInfo.provinceId",function(data){
            if(data){
                $city.get({id: data})
                    .success(function (data) {
                        $scope.cities = data["data"];
                    });
            }
        });


        //监视市变化改变区
        $scope.$watch("businessInfo.cityId",function(data){
            if(data){
                $area.get({id: data})
                    .success(function (data) {
                        //console.log($scope.businessInfo.areaId)
                        $scope.areas = data["data"];
                        if(!data.succ){
                            $scope.isAreaShow=false;
                            $scope.businessInfo.areaId=null;
                        }else{
                            $scope.isAreaShow=true;
                        }
                        $scope.areas = data["data"];
                    });
            }

        });

        /*数据验证规则*/
        $scope.pubRegex=$validate.pubRegex.rule;

        var infoData={},
            errLen,
            upErrLen,
            id=get_param($window.location.href, "id"),
            nodes=angular.element(".form-control");

        $scope.isAdd=!!id;

        //获取数据
        $scope.businessInfo={};
        $scope.getUserInfo={};
        $scope.getCompanyPhotos=[];
        $scope.getCompanyVideos=[];
        $scope.get720datas=[];
        var logoImage=angular.element("#logoImage").next(".img-show-box");
        $http.get([window.API.COMPANY.COMPANY_CONTENT].join("")).success(function(res){
          if(!res.stateCode){
              $scope.businessInfo=res.data;
              $scope.getUserInfo=res.data;
              $scope.businessInfo.decorateTypes=res.data.decorateTypes;
              /*list to dict*/
              var arr=res.data.decorateTypes||[];
              var o={};
              for (var k in arr){
                  o[arr[k]]=true;
              }

              $scope.businessInfo.decorateTypes=o;



              /*720  数据格式转换*/
              function formartPathOf720(dt){
                  var dt=dt||[];
                  var arr=[];
                  for (var j in dt){
                      var obj={};
                      obj['pathOf720']=dt[j];
                      arr.push(obj)
                  }
                  return arr;
              }

              //数据转换
              function forMartData (dt,ar){
                  var arr=[];
                  for(var k in dt){
                      var obj={};
                      obj.name= dt[k]['title'];
                      obj.description= dt[k]['explain'];
                      obj.url= dt[k]['pics'][0];
                      obj.desurl= dt[k]['pics'][1];
                      obj.floorsId= dt[k]['titleId'];
                      arr.push(obj)
                  }
                  return arr;
              }
              $scope.getCompanyVideos=res.data.companyVideoInfo?[res.data.companyVideoInfo]:[]; //视频
              $scope.getCompanyPhotos=forMartData(res.data.presentImages); //图片
              $scope.get720datas=formartPathOf720(res.data.pathOf720); //720

              !res.data.cityId?$scope.businessInfo.cityId=res.data.areaId:"";
              logoImage.attr("data-url",$scope.businessInfo.logoImage).html(QINIU.creatDom($scope.businessInfo.logoImage));
          }
        });


        /**
         *create720
         *
         * */

        /*720上传*/
        $("form[action]").attr("action",$window.API.CASE.FORM_720);

        //iframe路径
        var iframeUrl= "https://" + window.location.host + "/templates/child.html";
        $scope.childURL = iframeUrl;
        $("#upfiles").change(function(){
            var t=$(this);
            var localStr= t.val().toLowerCase();
            if(!(/\.(rar|zip)$/i.test(localStr))){
                errorMsg.make({msg:'请上传.rar,.zip扩展名的720文件包！'});
                t.val("");
                return false
            }
            t.parents("form").submit();
            t.val("");
            $('.loading').text("上传中...请稍等！");
            $scope.create720Info.errorMsg="";
        });

        /*拼接720地址*/
        $scope.view720=function(dt){
            var dt = dt||"";
            var host = window.Host720;
            var thumb = window.thumb720;
            var sp=dt.split("/");
            return [host+"/images/common/index.html?directory="+sp[2]+"&subDirectory="+sp[3],host+dt+thumb];
        };

        function create720(){
            //创建上传720模态
            this.create720Dialog=function(selector720Val){
                var that=this;
                $scope.create720Dialog=function(dt){
                    var index=dt['index'];
                    $scope.maxlength=dt['maxLen'];
                    console.log(dt['lastData']);
                    /**/
                    $timeout(function(){
                        $scope.maxlengtherr=dt['lastData']&&(dt['lastData'].length)>=dt['maxLen'];
                        angular.element('.up720Dialog').modal({backdrop: 'static', keyboard: false});
                        $scope.create720TitleAdd=index>=0?false:true
                    });
                    $scope.create720Info=angular.copy(dt['addData']); //注意 = 与 copy()区别，后者仅仅是复制数据
                    that.upfileDone(dt['lastData'],index,selector720Val)
                };
            };
            //添加到前端列表
            this.upfileDone=function(ele,index,selector720Val){
                $scope.create720Sumbit=function(dt){
                    var data=dt;
                    console.log(index);
                    var dataArr=ele?ele:[];
                    var upafter=$(selector720Val).val()||"{}";

                    data.pathOf720=index!==undefined ? upafter : JSON.parse(upafter).path||"";

                    if(!data.pathOf720){
                        if(  !$('.loading').text()){
                            $scope.create720Info.errorMsg="请上传720!";
                        }
                        return false
                    }

                    $scope.create720Info.errorMsg=null;
                    delete data.errorMsg;

                    var bl=dataArr.some(function(x){ return x==data });

                    if(!bl&&!(index>=0)){
                        dataArr.push(data);//绑定自动 ng-model
                        successMsg.make({msg:"添加成功！"});
                    }else if(index>=0){
                        dataArr.splice(index,1,data);
                        successMsg.make({msg:"修改成功！"});
                    }

                    //console.log(dataArr);
                    angular.element('.up720Dialog').modal('hide');
                    angular.element('.create720DialogCheck').blur();
                };
            };
            /*删除列表图片*/
            this.create720Del=function(){
                $scope.create720Del=function(dt){
                    var arr=dt[0],
                        n=arr.length,
                        i=n>0?arr.indexOf(dt[1]):0;
                    arr.splice(i,1);
                    console.log(arr)
                }

            };
            //预览图片
            this.create720Show=function(){
                $scope.create720Show=function(dt){
                    // $(".myModal720 iframe").attr("src",dt);
                    console.log(dt)
                    $scope.show720Url = $sce.trustAsResourceUrl(dt);
                };
            }
        }

        var c720= new create720();
        c720.create720Dialog(".krpano-hidden");
        c720.create720Del();
        c720.create720Show();


        /**
         *createPhotos
         *
         * */
        function createPicsModel(){
            var selector=angular.element("#upPhotosBtn").nextAll(".img-show-box");
            //创建上传图片模态
            this.createPhotoDialog=function(){
                var that=this;
                $scope.createPhotoDialog=function(dt){
                    var index=dt['index'];
                    $scope.maxlength=dt['maxLen'];
                    console.log(dt['lastData'])
                    $timeout(function(){
                        $scope.maxlengtherr=dt['lastData']&&(dt['lastData'].length)>=dt['maxLen'];
                        angular.element('.upPhotoDialog').modal({backdrop: 'static', keyboard: false});
                        $scope.createPhotoTitleAdd=index>=0?false:true
                    });


                    $scope.createPhotoInfo=angular.copy(dt['addData']); //注意 = 与 copy()区别，后者仅仅是复制数据
                    selector.attr("data-url",dt['addData'].url).html(QINIU.creatDom(dt['addData'].url));
                    that.createImages(dt['lastData'],index)
                };
            };
            //添加到前端列表
            this.createImages=function(ele,index){
                $scope.createPhotoSumbit=function(dt){
                    var data=dt;
                    console.log(index)
                    var dataArr=ele?ele:[];
                    var attr=selector.attr("data-url");
                    $scope.createPhotoInfo.url=attr;

                    if(!data.name){
                        $scope.createPhotoInfo.errorMsg="名称30字符内，不能为纯数字!";
                        return false
                    }
                    if(!data.url){
                        $scope.createPhotoInfo.errorMsg="请上传图片！";
                        return false
                    }
                    if(!data.description){
                        $scope.createPhotoInfo.errorMsg="描述不能为空!";
                        return false
                    }
                    $scope.createPhotoInfo.errorMsg=null;
                    delete data.errorMsg;

                    var bl=dataArr.some(function(x){ return x==data });
                    if(!bl&&!(index>=0)){
                        dataArr.push(data);//绑定自动 ng-model
                        successMsg.make({msg:"添加成功！"});
                    }else if(index>=0){
                        dataArr.splice(index,1,data);
                        successMsg.make({msg:"修改成功！"});
                    };

                    attr=selector.attr("data-url","");
                    console.log(dataArr)
                    angular.element('.upPhotoDialog').modal('hide');
                };
            };
            /*删除列表图片*/
            this.createPhotoDel=function(){
                $scope.createPhotoDel=function(dt){
                    var arr=dt[0],
                        n=arr.length,
                        i=n>0?arr.indexOf(dt[1]):0;
                    arr.splice(i,1);
                    console.log(arr)
                }

            };
            //预览图片
            this.createPhotoShow=function(){
                $scope.createPhotoShow=function(dt){
                    $scope.preview=dt;
                };
            }

        }

        var creatpics= new createPicsModel();
        creatpics.createPhotoDialog();
        creatpics.createPhotoDel();
        creatpics.createPhotoShow();

        /**
         *createVideos
         *
         * */

        function createVideoModel(){
            var selector=angular.element(".video-list-content");
            //创建上传视频模态
            this.createVideoDialog=function(){
                var that=this;
                $scope.createVideoDialog=function(dt){
                    var index=dt['index'];
                    var data=dt['addData'];
                    $scope.maxlength=dt['maxLen'];
                    console.log(index)
                    $timeout(function(){

                        $scope.maxlengtherr=dt['lastData']&&dt['lastData'].length>=dt['maxLen'];
                        angular.element('.upVideoDialog').modal({backdrop: 'static', keyboard: false});
                        $scope.createVideoTitleAdd=index>=0?false:true;
                    });
                    $scope.createVideoInfo=angular.copy(dt['addData']); //注意 = 与 copy()区别，后者仅仅是复制数据
                    $scope.createVideoShowPics=null;
                    selector.attr("data-vurl",data.url).html( data.url?QNV.creatVideoNode(data.url):"");
                    that.createVideos(dt['lastData'],index)
                };
            };
            //添加到前端列表
            this.createVideos=function(ele,index){
                $scope.createVideoSumbit=function(dt){
                    var data=dt;
                    var dataArr=ele?ele:[];
                    var attr=selector.attr("data-vurl");
                    $scope.createVideoInfo.url=attr;


                    if(!data.name){
                        $scope.createVideoInfo.errorMsg="名称30字符内，不能为纯数字！";
                        return false
                    }
                    if(!data.url){
                        $scope.createVideoInfo.errorMsg="请上传视频！";
                        return false
                    }
                    if(!data.second){
                        $scope.createVideoInfo.errorMsg="请设置视频缩略图时间！";
                        return false
                    }
                    if(data.second*1>data.duration*1){
                        $scope.createVideoInfo.errorMsg="视频缩略图时间不能超过视频总长 "+data.duration+" 秒！";
                        return false
                    }

                    $scope.createVideoInfo.errorMsg=null;
                    delete data.errorMsg;

                    var bl=dataArr.some(function(x){ return x==data });

                    if(!bl&&!(index>=0)){
                        dataArr.push(data);//绑定自动 ng-model
                        successMsg.make({msg:"添加成功！"});
                    }else if(index>=0){
                        dataArr.splice(index,1,data);
                        successMsg.make({msg:"修改成功！"});
                    };

                    attr=selector.attr("data-vurl","");
                    console.log(dataArr)
                    angular.element('.upVideoDialog').modal('hide');
                };
            };
            /*删除列表视频*/
            this.createVideoDel=function(){
                $scope.createVideoDel=function(dt){
                    var arr=dt[0],
                        n=arr.length,
                        i=n>0?arr.indexOf(dt[1]):0;
                    arr.splice(i,1);
                }

            };
            //预览视频
            this.createVideoShow=function(){
                $scope.createVideoShow=function(dt){
                    $scope.videoShowUrl=$sce.trustAsResourceUrl(dt);
                };
            };

            //视频创建 查看缩略图
            this.createVideoShowVideoPics=function(wh) {
                $scope.createVideoShowVideoPics = function (dt) {
                    var data = dt;
                    var vframe = "?vframe/jpg/offset/" + data.second + wh;

                    $scope.createVideoShowPics = "";
                    if (!(data.second * 1 >= 0)) {
                        return false
                    }
                    if (data.second * 1 > data.duration * 1) {
                        $scope.createVideoInfo.errorMsg = "视频缩略图时间不能超过视频总长 " + data.duration + " 秒！";
                        return false
                    } else {
                        $scope.createVideoShowPics = data.url + vframe;
                    }
                    $scope.createVideoInfo.errorMsg = null;
                }
            }
        }

        var creatVideo= new createVideoModel();
        creatVideo.createVideoDialog();
        creatVideo.createVideoDel();
        creatVideo.createVideoShow();
        creatVideo.createVideoShowVideoPics("/w/240/h/140");

        //关闭视频 结束视频播放
        $timeout(function(){
            angular.element('.myModalVideo').on('hide.bs.modal', function () {
                var v=document.querySelector("#vPlayer");
                v.currentTime = 0;
                v.pause();
            })
        },2000);

        /**
         *formSubmit
         *
         * */


        //数据转换提交
        function forMartDataToService (dt){
            var arr=[];
            for(var k in dt){
                var obj={};
                obj.pics=[];
                obj.title= dt[k]['name'];
                obj.explain= dt[k]['description'];
                obj.pics[0]= dt[k]['url'];
                dt[k]['desurl']?obj.pics[1]= dt[k]['desurl']:"";
                dt[k]['floorsId']?obj.titleId= dt[k]['floorsId']:"";
                arr.push(obj)
            }
            return arr;
        }

        function forMart720ToService (dt){
            var arr=[];
            for(var x in dt){
               arr.push(dt[x]['pathOf720']);
            }
            return arr
        }

        //修改信息提交
        $scope.submit=function(dt){
            $scope.businessInfo.logoImage=logoImage.attr("data-url");
            var info=angular.copy(dt[0]);
            var id=info.id;
            /*dict to list*/
            function setArr(){
                var arr=[];
                var o=info.decorateTypes||{};
                for (var j in o){
                    if(info.decorateTypes[j]){
                        arr.push(j)
                    }
                }
                return arr
            }

            infoData.provinceId=info.provinceId;
            infoData.cityId=info.cityId;
            infoData.areaId=info.areaId;
            infoData.address=info.address;
            infoData.description=info.description;
            infoData.logoImage=info.logoImage;
            infoData.pathOf720=forMart720ToService($scope.get720datas);
            infoData.companyPresentImageList= forMartDataToService($scope.getCompanyPhotos);
            infoData.companyVideoInfo=($scope.getCompanyVideos)[0];
            infoData.decorateTypes=setArr();
            $scope.ischoose=setArr().length==0?true:false

            /*验证*/
            nodes.blur();
            angular.element(".areas").blur();

            /*图片验证*/
            $validate.UpImgValidate({"selector":".img-show-box:not('.create-dialog')","bl":dt[1]});

            //API地址
            var API=function(info){
                var url_edit=$window.API.COMPANY.COMPANY_UPDATE;
                return $http({ url:[url_edit,"/",id].join(""), method:'PUT',data:infoData });
            };


            /*请求*/
            $timeout(function(){
                var nodeErr=angular.element(".err"),
                    nodeErrRes=angular.element(".err:not(.rmcolor)"),
                    nodeUpErr=angular.element(".upErr"),
                    required=angular.element(".required.err");

                dt[1]?nodeErr.first().focus():required.focus();
                errLen=nodeErrRes.length;
                upErrLen=nodeUpErr.length;

                if(!$scope.isAreaShow){
                    infoData.areaId=infoData.cityId;
                }

                console.log("errLen:"+errLen+"|"+upErrLen);
                if(errLen<1&&upErrLen<1){
                    $scope.ispostIng=true;
                    API(infoData).success(function(res){
                        if(!res.stateCode){
                            dt[1]? successMsg.make({msg:"修改成功！"}):"";
                            $scope.ispostIng=false;
                        }else{
                            errorMsg.make({msg:res.message});
                            $scope.ispostIng=false;
                        }
                    })
                }

            });
        };
    }]);

/*
 *账户设置
 */
sysController.controller("ManageSettingController", ["$scope", "$http", "$window", "$grid", "$filter", "$timeout",
    function($scope, $http, $window, $grid, $filter, $timeout) {
        // 查询账户设置信息
        $http.get([$window.API.ACCOUNT.ACCOUNT_SETTING].join("")).success(function(res){
            if (res.data) {
                $scope.dataInfo = res.data;
            }
            else {
                errorMsg.make({msg: res.message});
            }
        });

        // 提交
        var submitPass=true//防阻塞
        $scope.submit = function(dt) {
            var infoData = angular.copy(dt);

            $http({ url:[$window.API.ACCOUNT.ACCOUNT_SETTING].join(""), method:'POST',data:infoData}).success(function(res){
                if (res.succ) {
                    successMsg.make({msg: "设置成功"});
                }
                else {
                    errorMsg.make({msg: res.message});
                }
            });
        }
    }]);

/*
 *账户总揽
 */
sysController.controller("AccountInfoController", ["$scope", "$http", "$window", "$grid", "$filter", "$dateTool",
    function($scope, $http, $window, $grid, $filter, $dateTool) {
        $dateTool.ele('.form_datetime_start,.form_datetime_end');

        // 查询账户简介
        $http.get([$window.API.ACCOUNT.ACCOUNT_BRIEF].join("")).success(function(res){
            if (res.data) {
                $scope.hasAccount = true;
                $scope.accountBrief = res.data;
            }
            else {
                $scope.hasAccount = false;
            }
        });

        // 查询收入支出统计
        $http.get([$window.API.ACCOUNT.ACCOUNT_STATISTICS].join("")).success(function(res){
            if (res.data) {
                $scope.statistics = res.data;
            }
            else {
                errorMsg.make({msg:res.message});
            }
        });

        // 查询公司账户流水
        $grid.initial($scope, [$window.API.ACCOUNT.ACCOUNT_JOURNAL].join(""),{orderBy:"createTime"});

        /*查询*/
        $scope.submitSearch=function(dt){
            $scope.dateThan=$dateTool.compare({startTime:'.form_datetime_start input',endTime:'.form_datetime_end input',required:false});// 时间判断
            if(( $scope.dateThan)){
                return false;
            }
            var postData={};
            postData.beginTime=$filter('date')($.trim(angular.element("#beginTime").val()), 'yyyyMMdd');
            postData.endTime=$filter('date')($.trim(angular.element("#endTime").val()), 'yyyyMMdd');
            if (!dt) {
                postData.type = null;
            }
            else {
                postData.type = (dt.type == -1) ?"":dt.type;
            }
            postData.orderBy = "createTime";

            // 查询收入支出统计
            $http.get([$window.API.ACCOUNT.ACCOUNT_STATISTICS,"?beginTime=",postData.beginTime,"&endTime=",postData.endTime].join("")).success(function(res){
                if (res.data) {
                    console.log(res.data);
                    $scope.statistics = res.data;
                }
                else {
                    errorMsg.make({msg:res.message});
                }
            });

            $scope.filtering(postData);

        };

    }]);

/*
 *账户管理
 */
sysController.controller("AccountManageController", ["$scope", "$http", "$window", "$cookieStore","$timeout","$province","$city","$area","$validate","GET_TOKEN","QINIU","QNV","$sce",

    function ($scope, $http,$window,$cookieStore,$timeout,$province,$city,$area,$validate,GET_TOKEN,QINIU,QNV,$sce) {
        // 查看公司账户详情
        $http.get([$window.API.ACCOUNT.ACCOUNT].join("")).success(function(res){
            if (res.data) {

                $scope.hasAccount = true;

                $scope.dataInfo = res.data;

                $scope.accountType = $scope.dataInfo.accountType == 1 ? "对私账户" : "对公账户";

            }
            else {
                $scope.hasAccount = false;
            }
        });

        /*查看大图*/
        var eo=$(".content-box");
        eo.on("click",".preview-img",function(){
            var url=$(this).find("img").attr("data-img");
            $timeout(function(){
                $scope.preview=url;
            })
        });

        $scope.pubRegex=$validate.pubRegex.rule;
        $scope.dataInfo = {"privateAccountVo":{"cert":{}},"publicAccountVo":{"mergedCert":{}, "noMergeCert":{}}};
        // 默认为对私账户
        $scope.dataInfo.accountType = "1";
        // 对公账户默认为普通三证
        $scope.dataInfo.publicAccountVo.certType = "1";

        // 银行名称模糊搜索
        $scope.$watch('dataInfo.privateAccountVo.bank.bankName', function(newValue, oldValue) {
            if (newValue) {
                // 查询账户简介
                $http.get([$window.API.ACCOUNT.ACCOUNT_BANKS, "?queryKey=", newValue].join("")).success(function(res){
                    if (res.succ) {
                        console.log(res.data);
                        if (res.data instanceof Array) {
                            var banksList = res.data.slice(0,10);
                            $scope.banksList = banksList;
                        }
                    }
                });
            }
        });

        // 银行名称模糊搜索
        $scope.$watch('dataInfo.publicAccountVo.bank.bankName', function(newValue, oldValue) {
            if (newValue) {
                // 查询账户简介
                $http.get([$window.API.ACCOUNT.ACCOUNT_BANKS, "?queryKey=", newValue].join("")).success(function(res){
                    if (res.succ) {
                        console.log(res.data);
                        if (res.data instanceof Array) {
                            var banksList = res.data.slice(0,10);
                            $scope.banksList = banksList;
                        }
                    }
                });
            }
        });

         /*调用七牛上传*/
        var maxLen=10,minLen=3;
        GET_TOKEN();
        QINIU.OPTION.uptoken=$cookieStore.get("UPTOKEN");
        QINIU.FUN(maxLen,minLen,$scope);
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"idCardFront"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"idCardBack"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"idCardHold"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"bankCardFront"}));

        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"mergedCertIdCardFront"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"mergedCertIdCardBack"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"mergedCertBankAccountPerm"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"mergedCertPhoto"}));

        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"noMergeCertIdCardFront"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"noMergeCertIdCardBack"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"noMergeCertBankAccountPerm"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"noMergeCertOrgCodeCert"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"noMergeCertTaxPayCert"}));
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"noMergeCertBizCert"}));

        // QINIU.FileUploaded({types:1,maxLen:maxLen,minLen:minLen});//多图
        // Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"companyPresentImages" }));

        //加载省
        (function () {
            $http.get([window.API.OTHER.ACCOUNTPROVINCE].join("")).success(function (data) {
                $scope.privateAccountProvinces=data.data;
            })
        })();

        (function () {
            $http.get([window.API.OTHER.ACCOUNTPROVINCE].join("")).success(function (data) {
                $scope.publicAccountProvinces=data.data;
            })
        })();

        //监视对私账户省变化改变市
        $scope.$watch("dataInfo.privateAccountVo.bank.province",function(data){
            if(data){
                $http.get([window.API.OTHER.ACCOUNTCITY, "?province=", data].join(""))
                    .success(function (data) {
                        $scope.privateAccountCities = data["data"];
                    });
            }
        });

        //监视对公账户省变化改变市
        $scope.$watch("dataInfo.publicAccountVo.bank.province",function(data){
            if(data){
                $http.get([window.API.OTHER.ACCOUNTCITY, "?province=", data].join(""))
                    .success(function (data) {
                        $scope.publicAccountCities = data["data"];
                    });
            }
        });

        //提交
        var submitPass=true//防阻塞
        $scope.submit=function(dt){

            if ($scope.dataInfo.accountType == "1") {
                // 对私账户
                $scope.dataInfo.privateAccountVo.cert.idCardFront = $("#idCardFront").next(".img-show-box").data("url");
                $scope.dataInfo.privateAccountVo.cert.idCardBack = $("#idCardBack").next(".img-show-box").data("url");
                $scope.dataInfo.privateAccountVo.cert.idCardHold = $("#idCardHold").next(".img-show-box").data("url");
                $scope.dataInfo.privateAccountVo.cert.bankCardFront = $("#bankCardFront").next(".img-show-box").data("url");

                var nodes=angular.element(".privateAccount").find(".form-control");

                /*图片验证*/
                $validate.UpImgValidate({"selector":".privateAccount .img-show-box","bl":true});
            }
            else {
                // 对公账户
                var nodes=angular.element(".publicAccount").find(".form-control");

                /*图片验证*/
                if ($scope.dataInfo.publicAccountVo.certType == "1") {
                    // 普通三证
                    $scope.dataInfo.publicAccountVo.noMergeCert.idCardFront = $("#noMergeCertIdCardFront").next(".img-show-box").data("url");
                    $scope.dataInfo.publicAccountVo.noMergeCert.idCardBack = $("#noMergeCertIdCardBack").next(".img-show-box").data("url");
                    $scope.dataInfo.publicAccountVo.noMergeCert.bankAccountPerm = $("#noMergeCertBankAccountPerm").next(".img-show-box").data("url");
                    $scope.dataInfo.publicAccountVo.noMergeCert.orgCodeCert = $("#noMergeCertOrgCodeCert").next(".img-show-box").data("url");
                    $scope.dataInfo.publicAccountVo.noMergeCert.taxPayCert = $("#noMergeCertTaxPayCert").next(".img-show-box").data("url");
                    $scope.dataInfo.publicAccountVo.noMergeCert.bizCert = $("#noMergeCertBizCert").next(".img-show-box").data("url");

                    $validate.UpImgValidate({"selector":".publicNoMergeCert .img-show-box","bl":true});
                }
                else {
                    // 三证合一
                    $scope.dataInfo.publicAccountVo.mergedCert.idCardFront = $("#mergedCertIdCardFront").next(".img-show-box").data("url");
                    $scope.dataInfo.publicAccountVo.mergedCert.idCardBack = $("#mergedCertIdCardBack").next(".img-show-box").data("url");
                    $scope.dataInfo.publicAccountVo.mergedCert.bankAccountPerm = $("#mergedCertBankAccountPerm").next(".img-show-box").data("url");
                    $scope.dataInfo.publicAccountVo.mergedCert.mergedCert = $("#mergedCertPhoto").next(".img-show-box").data("url");

                    $validate.UpImgValidate({"selector":".publicMergedCert .img-show-box","bl":true});
                }

            }

            var infoData=angular.copy(dt);

            nodes.blur().removeClass("rmcolor");

            /*请求*/
            $timeout(function(){

                if ($scope.dataInfo.accountType == "1") {
                    // 对私账户
                    var nodeErr=angular.element(".privateAccount .err"),
                        nodeErrRes=angular.element(".privateAccount .err:not(.rmcolor)"),
                        nodeUpErr=angular.element(".privateAccount .upErr"),
                        required=angular.element(".privateAccount .required.err");

                    errLen=nodeErrRes.length;
                    upErrLen=nodeUpErr.length;

                    console.log("errLen:"+errLen+"|"+upErrLen);
                    if(errLen<1&&upErrLen<1&&submitPass){
                        submitPass=false;
                        successMsg.make({msg:"信息已提交，审核可能需要几秒钟，请耐心等待！",second:3});
                        $http({ url:[$window.API.ACCOUNT.ACCOUNT_ADDPRIVATE].join(""), method:'POST',data:infoData}).success(function(res){
                            if(!res.stateCode){
                                successMsg.make({msg:"提交成功！"});
                                window.location.reload();
                            }
                            else {
                                errorMsg.make({msg:res.message});
                            }
                            submitPass=true;
                        })
                    }
                }
                else {
                    // 对公账户
                    // 判断三证是否合一
                    if ($scope.dataInfo.publicAccountVo.certType == "1") {
                        // 普通三证
                        infoData.mergedCert = null;

                        var nodeErr=angular.element(".publicAccount .err"),
                            nodeErrRes=angular.element(".publicAccount .err:not(.mergedCert)"),  // 排除三证合一输入框
                            nodeUpErr=angular.element(".publicNoMergeCert .upErr"),
                            required=angular.element(".privateAccount .required.err");
                    }
                    else {
                        // 三证合一
                        infoData.noMergeCert = null;

                        var nodeErr=angular.element(".publicAccount .err"),
                            nodeErrRes=angular.element(".publicAccount .err:not(.noMergeCert)"), // 排除普通三证输入框
                            nodeUpErr=angular.element(".publicMergedCert .upErr"),
                            required=angular.element(".privateAccount .required.err");
                    }

                    errLen=nodeErrRes.length;
                    upErrLen=nodeUpErr.length;

                    console.log("errLen:"+errLen+"|"+upErrLen);
                    if(errLen<1&&upErrLen<1&&submitPass){
                        submitPass=false;
                        successMsg.make({msg:"信息已提交，审核可能需要几秒钟，请耐心等待！",second:3});
                        $http({ url:[$window.API.ACCOUNT.ACCOUNT_ADDPUBLIC].join(""), method:'POST',data:infoData}).success(function(res){
                            if(!res.stateCode){
                                successMsg.make({msg:"提交成功！"});
                                window.location.reload();
                            }
                            else {
                                errorMsg.make({msg:res.message});
                            }
                            submitPass=true;
                        })
                    }
                }
            });
        };

    }]);


/**
 服务设置
 **/
sysController.controller("ManageServiceSetController", ["$scope", "$http", "$window", "$grid", "$filter", "$dateTool","$province","$city","getSelectName",
    function($scope, $http, $window, $grid, $filter, $dateTool,$province,$city,getSelectName) {

        /*初始化*/
        $scope.serviceAreas=[];
        $scope.areas={};


        /*查询业务设置*/
        $http.get([$window.API.COMPANY.COMPANY_GET_SERVICE_SET].join("")).success(function(res){
            if (res.stateCode===0) {
                $scope.serviceSet = res.data;
            }
            else {
                errorMsg.make({msg:res.message});
            }
        });

        /*submit 设置主营业务*/
        var submitPass=true;
        $scope.setCompanyService=function(dt){
            var dt=angular.copy(dt);
            var infoData={};
            infoData['hasDesign']=dt['hasDesign']||false;
            infoData['hasHard']=dt['hasHard']||false;
            infoData['hasSoft']=dt['hasSoft']||false;
            submitPass=false;
            $http({ url:[$window.API.COMPANY.COMPANY_SET_SERVICES_WORK].join(""), method:'POST',data:infoData}).success(function(res){
                if(res.stateCode===0){
                    successMsg.make({msg:"选择主营业务成功！"});
                }else{
                    errorMsg.make({msg:res.message})
                }
                submitPass=true
            })
        }



        /*查询服务区域*/
        $http.get([$window.API.COMPANY.COMPANY_SERVICEAREA_SET].join("")).success(function(res){
            if (res.stateCode===0) {
                res.data?$scope.serviceAreas = res.data.serviceAreas:"";
            }
            else {
                errorMsg.make({msg:res.message});
            }
        });



        /*选择城市Dialog*/
        $scope.chooseCityDialog=function(dt){
            angular.element('.upCityDialog').modal({backdrop: 'static', keyboard: false});
            console.log($scope.serviceAreas)

        };

        /*添加城市*/
        $scope.addCitySumbit=function(arr,dt){
            var dt=angular.copy(dt);
            $scope.errorMsg='';
            if(!dt){
                return false;
            }
            if(!dt.buildingLevelOne){
                $scope.errorMsg='请选择省份或直辖市';
                return false;

            }
            if(!dt.buildingLevelTwo){
                $scope.errorMsg='请选择城市';
                return false;

            }

            if(arr.map(function(x){ return JSON.stringify(x)}).indexOf(JSON.stringify(dt))<0){
                arr.push(dt);
            }else{
                $scope.errorMsg='该城市已存在，请重新选择！'
            }
        };

        /*删除城市*/
        $scope.delCitys=function(dt){
            var arr=dt[0],
                n=arr.length,
                i=n>0?arr.indexOf(dt[1]):0;
            arr.splice(i,1);
        };



        /*城市联动*/
        (function () {
            $province.get()
                .success(function (data) {
                    $scope.provinces=data["data"];
                })
        })();

        /*城市*/
        $scope.$watch("areas.buildingLevelOne",function(data){
            $scope.areas.buildingLevelTwo=null;
            if(data){
                $scope.isAreaShow=true;
                if(data==1||data==20||data==797||data==2252){
                    $scope.isAreaShow=false;
                    $scope.areas.buildingLevelTwo=data;
                    $scope.areas.levelTwoName= getSelectName($scope.provinces,data,'name','id')
                }else{
                    $city.get({id: data})
                    .success(function (data) {
                        $scope.cities = data["data"];
                    });
                }

            }
        });


        /*获取城市名称*/
        $scope.$watch("areas.buildingLevelTwo",function(data){
            if(data && $scope.areas.buildingLevelTwo != $scope.areas.buildingLevelOne){
                /*获取下拉name*/
                $scope.areas.levelTwoName= getSelectName($scope.cities,data,'name','id')
            }
        });



        /*submit 提交区域*/
        $scope.addCitySumbitToApi=function(dt){
            var data=angular.copy(dt);
            $http.post([$window.API.COMPANY.COMPANY_SERVICEAREA_SET].join(""),{serviceAreas:data}).success(function(res){
                if (res.stateCode===0&&res.data) {
                    successMsg.make({msg:res.message});
                    angular.element('.upCityDialog').modal('hide');
                }
                else {
                    errorMsg.make({msg:res.message});
                }
            });
        }



    }]);

/**
 服务设置详情
 **/

sysController.controller("ManageServiceSetInfoController", ["$scope", "$http", "$window", "$cookieStore","$timeout","$province","$city","$area","$validate","GET_TOKEN","QINIU","$sce","$filter","getSelectName",
    function ($scope, $http,$window,$cookieStore,$timeout,$province,$city,$area,$validate,GET_TOKEN,QINIU,$sce,$filter,getSelectName) {


        //初始数据
        var id=get_param($window.location.href, "id")*1;
        var s=get_param($window.location.href, "s")*1;
        var info=get_param($window.location.href, "info")*1===1;
        $scope.serviceTypeCode=s;
        $scope.isShowInfo=info;
        $scope.dataInfo={};
        $scope.dataInfo.items=[];
        $scope.serviceTypeTitle=function(dt){
            var t="";
            s==1?t="硬装设计服务流程":"";
            s==2?t="软装设计服务流程":"";
            s==3?t="硬装施工服务流程":"";
            s==4?t="软装施工服务流程":"";
            return t

        } ; //流程标题


        /*数据验证规则*/
        $scope.pubRegex=$validate.pubRegex.rule;

        // 价格验证,填写则必验证 整数
        $scope.validateFun = $validate.validatePriceInt;


        //获取数据
        getDatas();
        function getDatas(){
            if(s){
                $http.get([$window.API.COMPANY.COMPANY_SERVICES_SET,"/",s].join("")).success(function(res){
                    if(res.stateCode===0&&res.data){
                        $scope.dataInfo=res.data;
                        res.data.priceRangeStart===0?$scope.dataInfo.priceRangeStart=String(res.data.priceRangeStart):"";
                        res.data.priceRangeStart===0?$scope.dataInfo.priceRangeEnd=String(res.data.priceRangeEnd):"";
                    }
                })
            }
        }


        /*监听金额类型*/
        $scope.$watch("createPhotoInfo.costType",function(data){
            if(data==3||data==4){
                $scope.createPhotoInfo.costValue=null;
            }
        });



        /**
         *createPhotos
         *
         * */
        function createPicsModel(){
            //创建上传图片模态
            this.createPhotoDialog=function(){
                var that=this;
                $scope.createPhotoDialog=function(dt){
                    var index=dt['index'];
                    $scope.maxlength=dt['maxLen'];
                    console.log(dt['lastData']);
                    dt['addData'].serviceContents=dt['addData'].serviceContents||[];//初始内嵌数组
                    $timeout(function(){
                        $scope.maxlengtherr=dt['lastData']&&(dt['lastData'].length)>=dt['maxLen'];
                        angular.element('.upPhotoDialog').modal({backdrop: 'static', keyboard: false});
                        $scope.createPhotoTitleAdd=index>=0?false:true;
                    });

                    $scope.createPhotoInfo=angular.copy(dt['addData']); //注意 = 与 copy()区别，后者仅仅是复制数据
                    that.createImages(dt['lastData'],index)
                };
            };
            //添加到前端列表
            this.createImages=function(ele,index){
                $scope.createPhotoSumbit=function(dt){
                    var data=dt;
                    var dataArr=ele?ele:[];
                    if(!data.title){
                        $scope.createPhotoInfo.errorMsg="标题30字符内，不能为纯数字!";
                        return false
                    }

                    if(!data.costType){
                        $scope.createPhotoInfo.errorMsg="请选择金额类型!";
                        return false
                    }

                    if(data.costType==1 && !(data.costValue<=100)){
                        $scope.createPhotoInfo.errorMsg="百分比为小于等于100的整数!";
                        return false
                    }
                    if(!data.costValue && data.costType==2){
                        $scope.createPhotoInfo.errorMsg="请输入具体金额数字!";
                        return false
                    }
                    if(!data.description){
                        $scope.createPhotoInfo.errorMsg="服务描述不能为空!";
                        return false
                    }

                    //if(data.serviceContents.length<1){
                    //    $scope.createPhotoInfo.errorMsg="至少选择一个服务内容!";
                    //    return false
                    //}
                    var intStr=angular.copy(data.costValue);

                    if(intStr*1>0){
                       data.costValue = data.costValue*1;
                    }

                    $scope.createPhotoInfo.errorMsg=null;
                    delete data.errorMsg;

                    var bl=dataArr.some(function(x){ return x==data });
                    if(!bl&&!(index>=0)){
                        dataArr.push(data);//绑定自动 ng-model
                        successMsg.make({msg:"添加成功！"});
                    }else if(index>=0){
                        dataArr.splice(index,1,data);
                        successMsg.make({msg:"修改成功！"});
                    }

                    //console.log(dataArr);
                    angular.element('.upPhotoDialog').modal('hide');
                    angular.element('.createPhotoDialogCheck').blur();
                };
            };
            /*删除列表图片*/
            this.createPhotoDel=function(){
                $scope.createPhotoDel=function(dt){
                    var arr=dt[0],
                        n=arr.length,
                        i=n>0?arr.indexOf(dt[1]):0;
                    arr.splice(i,1);
                    console.log(arr)
                }

            };
            //预览图片
            this.createPhotoShow=function(){
                $scope.createPhotoShow=function(dt){
                    $scope.preview=dt;
                };
            }
        }

        var creatpics= new createPicsModel();
        creatpics.createPhotoDialog();
        creatpics.createPhotoDel();
        creatpics.createPhotoShow();




        /**
         *createDialogText
         *
         * */

        /*获取服务数据下拉*/
        $http.get([$window.API.COMPANY.COMPANY_GET_SERVICES_TYPES,"?type=",s].join("")).success(function(res){
            if(!res.stateCode){
                $scope.serviceType=res.data;
            }
        });

        /*监听获取默认说明*/
        $scope.serChange=function(dt){
            console.log(dt)
            if(dt){
                $scope.dataInfoSer.description = getSelectName($scope.serviceType,dt,'description','id')
                $scope.dataInfoSer.name = getSelectName($scope.serviceType,dt,'name','id')
            }
        };


        /*获取下拉name*/
        $scope.selectName=function(dt){
            return getSelectName($scope.serviceType,dt,'name','id')
        };


        /*选择服务*/
        $scope.createDialogText=function(dt){// [all,g,index]
            $scope.dataInfoSer=angular.copy(dt[1]);
            /*映射下拉插入数据*/
            var arrType=$scope.serviceType||[];
            var arryet=dt[0]||[];
            arrType.map(function(x){
                x.isdisabled=false;
                for(var k in arryet){
                    if((arryet[k]['id']==x['id'])&&!(x['id']==dt[1]['id'])){ //修改时当前选中
                        x.isdisabled=true;
                    }
                }
            });

            $scope.serviceType=arrType;

            console.log($scope.serviceType)
            angular.element('.createDialogTextDom').modal({backdrop: 'static', keyboard: false});
            createData(dt[0],dt[2]);



        };
        /*创建/修改提交*/
        function createData(all,i){
            $scope.submitText=function(dt){
                console.log(dt)
                $scope.errorMsg='';
                var data=dt;
                var dataArr=all||[];
                var index=i;
                if(!data.id){
                    $scope.errorMsg='服务内容不能为空！';
                    return false
                }
                var bl=dataArr.some(function(x){ return x==data });
                if(!bl&&!(index>=0)){
                    dataArr.push(data);//绑定自动 ng-model
                    successMsg.make({msg:"添加成功！"});
                }
                else if(index>=0){
                    dataArr.splice(index,1,data);
                    successMsg.make({msg:"修改成功！"});
                };
                angular.element('.createDialogTextDom').modal('hide');
            }
        }
        /*删除数据*/
        $scope.createDialogTextDel=function(dt){
            var arr=dt[0],
                n=arr.length,
                i=n>0?arr.indexOf(dt[1]):0;
            arr.splice(i,1);
        };



        /*进入排序*/
        function setdragSort(){
            $(".drag-lists-box").dragsort({
                dragSelector: "div",
                dragBetween: true,
                dragEnd: function(){
                    var data = $(".drag-lists-box > div.lists-box").map(function () {
                        return $(this).find("em.val").html();
                    }).get();
                    var attr=$(".drag-lists-box > div.lists-box").find("em.val").attr("data-str");
                    $("input[name=dragSortData]").val(data.join("|")).attr("data-str",attr);
                },
                placeHolderTemplate: "<div  class='placeHolder '></div>"
            });
        }


        /**
         *formSubmit
         *
         * */
        var submitPass=true;//防阻塞
        $scope.submit=function(dt){
            var  infoData=angular.copy(dt[0]);
            var  nodes=angular.element(".form-control");

            /*排序数据转换*/
            if(dt[2]==2){
                var query=angular.element("input[data-str]");
                if(query.val()){
                    var attr=query.attr("data-str");
                    var arrIndex=query.val().split("|");
                    var newArr=[];
                    for(var  j in arrIndex){
                        newArr.push( infoData[attr][arrIndex[j]*1]);
                    }
                    infoData[attr]=newArr;
                }
            }


            /*保存/校验*/
            dt[1]?nodes.blur().removeClass("rmcolor"):nodes.each(function(){
                var t=$(this);
                if(!!t.val()){
                    t.removeClass("rmcolor");
                    t.blur();
                }else{
                    t.addClass("rmcolor")
                }
            });


            /*请求*/
            $timeout(function(){
                var nodeErr=angular.element(".err"),
                    nodeErrRes=angular.element(".err:not(.rmcolor)"),
                    nodeUpErr=angular.element(".upErr"),
                    required=angular.element(".required.err");

                dt[1]?nodeErr.first().focus():required.focus();
                errLen=nodeErrRes.length;
                upErrLen=nodeUpErr.length;
                console.log("errLen:"+errLen+"|"+upErrLen);
                if(errLen<1&&upErrLen<1&&submitPass){
                    submitPass=false;
                    $http({ url:[$window.API.COMPANY.COMPANY_SERVICES_SET,"/",s].join(""), method:'POST',data:infoData}).success(function(res){
                        if(res.stateCode===0){
                            if( dt[1]){
                                successMsg.make({msg:"保存成功！"});
                                if(dt[2]==1){
                                    getDatas();
                                    setdragSort();
                                    $scope.isShowInfo=true;
                                    $scope.dragSubmit=true;
                                }else if(dt[2]==2){
                                    $timeout(function(){
                                        $window.location.reload();
                                    },2000)
                                }else{
                                    $timeout(function(){
                                        $window.location.href='#/main/service-setting';
                                    },2000)
                                }
                            }
                        }else{
                            errorMsg.make({msg:res.message})
                        }
                        submitPass=true
                    })
                }
            });
        };


    }]);