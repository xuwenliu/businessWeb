/**
 * case
 *
 *作品管理 > 作品列表
 */
sysController.controller("CaseListController", ["$scope", "$http", "$window", "$grid",
    function ($scope, $http, $window, $grid) {

    $scope.list={};
    $grid.initial($scope, [$window.API.CASE.CASE_LIST].join(""));

    /*获取作品常用参数*/
    $http.get([$window.API.CASE.CASE_LIST_TYPE].join("")).success(function(res){
      if(!res.stateCode){
          $scope.statusAll=res.data.caseStatus;//列表状态
          $scope.decorateTypes =res.data.decorateTypes;//内容分类
      }
    });

    /*查询*/
    $scope.submitSearch=function(dt){
      if(dt){
          var postData={};
          postData.status=dt.status;
          postData.caseType=dt.caseType;
          postData.decorateType=dt.decorateType;
          dt.queryKey?postData.queryKey=encodeURI(dt.queryKey):"";
          $scope.filtering(postData);
      }
    };

    /*编辑*/
    $scope.edit=function(dt){
        console.log(dt[2])
        for(var k in dt[2]){
            console.log(dt[2][k])
            if(dt[2][k]){
                console.log(k*1+1)
                $window.location.href = ["#/main/case-add-p"+(k*1+1)+"?id=", dt[1]].join("");
                return
            }

        }

    };

    $scope.del=function(id){
        if(confirm("确定要删除该条数据吗？")){
            $http({ url:[$window.API.CASE.CASE_LIST_DEL,"/",id].join(""), method:'post'} ).success(function(res){
                if(!res.stateCode){
                    $scope.refresh();
                }else{
                    errorMsg.make({msg:res.message});
                    $scope.refresh();
                }

            });
        }
    };




        /*详细*/
    $scope.show=function(id){
      $window.location.href = ["#/main/case-info?id=", id].join("");
    };

    /*查看理由*/
    $scope.getDownReason=function(id,s){
        $scope.getDownReasonContent=null;
        var status=s;
       if(status===1){
           $scope.reasonTitle="查看下架理由";
           $http({ url:[$window.API.CASE.CASE_DOWN_REASON,"/",id,"/downReason"].join(""), method:'get'} ).success(function(res){
               if(!res.stateCode && res.data){
                   $scope.getDownReasonContent=res.data.reason;
               }else{
                   $scope.getDownReasonContent="已经通过审核，暂未上架！"
               }
           });
       } else if(status===2){
           $scope.reasonTitle="查看拒绝理由";
           $http({ url:[$window.API.CASE.GET_CASE_REJECT_REASON,"/",id,"/rejectReason"].join(""), method:'get'} ).success(function(res){
               if(!res.stateCode && res.data){
                   $scope.getDownReasonContent=res.data.reason;
               }else{
                   //$scope.getDownReasonContent="已经通过审核，暂未上架！"
               }
           });
       }





    }

    /* 申请上架 */
    $scope.applyUp = function(id) {
        $http({ url:[$window.API.CASE.CASE_APPLY_UP,"/",id].join(""), method:'post'} ).success(function(res){
            if(res.succ){
                $scope.refresh();
            }
            else {
                errorMsg.make({'msg':res.message});
            }
        });
    }

}]);


/**
 * 作品管理 > 作品详情
 */
sysController.controller("CaseInfoController", ["$scope", "$http", "$window", "$grid","$timeout","$sce",
    function($scope, $http, $window, $grid,$timeout,$sce) {
        var id=get_param($window.location.href, "id");

        /*查看大图*/
        var eo=$(".content-box");
        eo.on("click",".preview-img",function(){
            var url=$(this).find("img").attr("data-img");
            $timeout(function(){
                $scope.preview=url;
            })
        });



        /*获取作品详情*/
        $http.get([$window.API.CASE.CASE_GET_INFO,"/",id,"/detail"].join("")).success(function(res){
            if(!res.stateCode){
                $scope.dataInfo=res.data;

                if(res.data.pathOf720){
                    $scope.getPathOf720=function(){
                        var host=window.Host720;
                        var url=host+JSON.parse(res.data.pathOf720).path;
                        var thumb=url+window.thumb720;
                        return [ url,thumb]; // url img
                    };
                }


                /*获取团队名字*/
                function getTeams(type){
                    for(var k in res.data.employeeMap){
                        if(res.data.employeeMap[k]['employeeDetailTypeCode']==type){
                            return res.data.employeeMap[k]['userName']
                        }
                    }
                }
                $scope.getTeam=function(t){
                    return getTeams(t)
                };

                if(res.data.designMaterials){
                    $scope.desVideoShowUrl=res.data.designMaterials.designVideo?$sce.trustAsResourceUrl(res.data.designMaterials.designVideo.url):"";//设计视频地址
                }
            }
        });

        $scope.createVideoShow=function(dt){
            $scope.videoShowUrl=$sce.trustAsResourceUrl(dt);
        };





    }]);




/**
*作品管理 > 作品列表 > 新增/编辑 part1
*/
sysController.controller("CaseAddOneController", ["$scope", "$http", "$window", "$cookieStore","$timeout","$province","$city","$area","$validate","$sce","getSelectName","$rootScope","$province","$city","$area",
    function ($scope, $http,$window,$cookieStore,$timeout,$province,$city,$area,$validate,$sce,getSelectName,$rootScope,$province,$city,$area) {

        /*初始数据*/
        var id=get_param($window.location.href, "id")*1;
        var s=get_param($window.location.href, "s")*1;
        var e=get_param($window.location.href, "e");
        $scope.e=e;
        $scope.dataInfo={};
        $scope.dataInfo.caseType=1;//默认实景
        /*初始化列表*/
        if( s!==1){
            $scope.stepList=[{code:-1,name:'返回到列表'},{code:1,name:'第一步'},{code:2,name:'第二步'},{code:3,name:'第三步'},{code:4,name:'第四步'}];
        }else{
            $scope.stepList=[{code:-1,name:'返回到列表'},{code:1,name:'第一步'},{code:2,name:'第二步'},{code:3,name:'第三步'}];
        }



        /*数据验证规则*/
        $scope.pubRegex=$validate.pubRegex.rule;

        /*获取下拉常用参数*/
        $http.get([$window.API.CASE.CASE_GET_MEMBERS].join("")).success(function(res){
            if(!res.stateCode){
                $scope.designTeam =res.data.designTeam;//设计团队
                $scope.pmTeam =res.data.pmTeam;//项目经理团队
                $scope.advisorTeam =res.data.advisorTeam;//商务代表团队
            }
        });

        /*获取作品通用下拉*/
        $http.get([$window.API.CASE.CASE_GET_TYPES].join("")).success(function(res){
            if(!res.stateCode){
                $scope.caseStyles =res.data.caseStyles;//风格
                $scope.houseTypes =res.data.houseTypes;//房型

                $scope.$watch("dataInfo.caseType",function(dt){//内容分类
                    if(dt===2){
                        var arr=angular.copy(res.data.decorateTypes);
                        arr.shift();
                        $scope.decorateTypes=arr
                    }else{
                        $scope.decorateTypes=res.data.decorateTypes
                    }

                })


            }
        });



        //作品类型
        $scope.$watch("dataInfo.decorateType",function(data){
            if(data){
                $scope.decorateTypesCode=data;
            }
        });



        /*城市联动*/
        (function () {
            $province.get()
                .success(function (data) {
                    $scope.provinces=data["data"];
                })
        })();

        //城市
        $scope.$watch("dataInfo.levelDto.buildingLevelOne",function(data){
            if(data){
                $city.get({id: data})
                    .success(function (data) {
                        $scope.cities = data["data"];
                    });
            }
        });

        //区域
        $scope.$watch("dataInfo.levelDto.buildingLevelTwo",function(data){
            if(data){
                $area.get({id: data})
                    .success(function (data) {
                        if(!data.succ){
                            $scope.isAreaShow=false;
                            $scope.dataInfo.levelDto.buildingLevelThree=null;
                            //$scope.dataInfo.levelDto.buildingLevelThree= $scope.dataInfo.levelDto.buildingLevelTwo;
                        }else{

                            $scope.isAreaShow=true;
                        }
                        $scope.areas = data["data"];
                    });
            }

        });

        //获取模糊楼盘查询
        $scope.getBuildName=function(dt){
            var aid=!dt[0][2]?dt[0][0]:dt[0][1];
            if(!!aid && dt[1]){
                $http.get([$window.API.CASE.CASE_GET_AREA_BUILDING,"/",aid,"/",dt[1]].join("")).success(function(res){
                    if(!res.stateCode){
                        $scope.getBuild=res.data;
                    }
                })
            }
        };


        /*获取数据*/
        if(id){
            $http.get([$window.API.CASE.CASE_SET_INFO_P1,"/",id].join("")).success(function(res){
                if(res.stateCode==0&&res.data){
                    $scope.dataInfo=res.data;
                    $scope.caseNameOld=res.data.caseName;

                    /*是否已经选中则不能修改*/
                    res.data.pmId?$scope.pmIdDis=true:$scope.pmIdDis=false;
                    res.data.advisorId?$scope.advisorIdDis=true:$scope.advisorIdDis=false;
                    res.data.designerId?$scope.designerIdDis=true:$scope.designerIdDis=false;

                    ///*判断默认*/
                    //$scope.olddesignerHardId = res.data.designerHardId;
                    //$scope.olddesignerSoftId = res.data.designerSoftId;
                    //$scope.oldprojectManagerId = res.data.projectManagerId;
                    //$scope.oldhomeAdvisorId = res.data.homeAdvisorId;
                }
            })
        }


        /*验证作品名称*/
        $scope.ajaxcaseName=function(dt){
            $validate.ajaxValidate($scope,[window.API.CASE.CASE_CASENAME_REQUIRED,"?caseName=", encodeURI(dt[0])].join(""),dt[0],dt[1],dt[2],true,$scope.caseNameOld)
        };






        /*提交*/
        var submitPass=true;//防阻塞
        $scope.submit=function(dt){
            var infoData=angular.copy(dt[0]);
            var nodes=angular.element(".form-control");
            if(infoData.levelDto){
                delete infoData.levelDto.levelOneName;
                delete infoData.levelDto.levelTwoName;
                delete infoData.levelDto.levelThreeName;
                !infoData.levelDto.buildingLevelThree?infoData.levelDto.buildingLevelThree = infoData.levelDto.buildingLevelTwo:"";
            }
            console.log(infoData);

            console.log(dt[2])
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
                errLen = nodeErrRes.length;
                upErrLen = nodeUpErr.length;

                console.log("errLen:"+errLen+"|"+upErrLen);

                if(errLen<1&&upErrLen<1&&submitPass){
                    submitPass=false;
                    $http({ url:infoData.caseId?[$window.API.CASE.CASE_SET_INFO_P1,"/update"].join(""):[$window.API.CASE.CASE_SET_INFO_P1,"/add"].join(""), method:'POST',data:infoData}).success(function(res){
                        if(res.stateCode===0){
                            if( dt[1]){
                                successMsg.make({msg:"保存成功！"});
                                $timeout(function(){
                                    if(e){
                                        if(dt[2]){
                                            dt[2]==-1?$window.location.href='/#/main/case':"";
                                            dt[2]>0?$window.location.href='/#/main/case-add-p'+dt[2]+'?id='+id+"&s="+$scope.decorateTypesCode+"&e=1":"";
                                        }else{
                                            $window.location.href='/#/main/case-add-p2?id='+id+"&s="+$scope.decorateTypesCode+"&e=1"
                                        }

                                    }else if(id){
                                        $window.location.href='/#/main/case-add-p2?id='+ id +"&s="+$scope.decorateTypesCode;
                                    }else{
                                        $window.location.href='/#/main/case-add-p2?id='+ res.data +"&s="+$scope.decorateTypesCode;
                                    }

                                },1000);
                            }
                        }else{
                            errorMsg.make({msg:res.message})
                        }
                        submitPass=true;
                    })
                }else{
                    if(id&&dt[2]){
                        if(confirm('当前步骤未保存，是否继续到其他页面？')){
                            dt[2]==-1?$window.location.href='/#/main/case':"";
                            dt[2]>0?$window.location.href='/#/main/case-add-p'+dt[2]+'?id='+id+"&s="+$scope.decorateTypesCode+"&e=1":"";
                        }else{
                            $scope.jumpStep.decorateType=1
                        }
                    }
                }
            });
        };
    }]);


/**
 *作品管理 > 作品列表 > 新增/编辑 part2
 */
sysController.controller("CaseAddSecController", ["$scope", "$http", "$window", "$cookieStore","$timeout","$province","$city","$area","$validate","GET_TOKEN","QINIU","$sce","$filter","$dateTool",
    function ($scope, $http,$window,$cookieStore,$timeout,$province,$city,$area,$validate,GET_TOKEN,QINIU,$sce,$filter,$dateTool) {

        //初始数据
        var id=get_param($window.location.href, "id")*1;
        var s=get_param($window.location.href, "s")*1;
        var e=get_param($window.location.href, "e");
        $scope.e=e;
        $scope.decorateTypesCode=s;
        $scope.dataInfo={};
        $scope.getScenePhotos=[];
        $scope.get720datas=[];
        /*初始化列表*/
        if( s!==1){
            $scope.stepList=[{code:-1,name:'返回到列表'},{code:1,name:'第一步'},{code:2,name:'第二步'},{code:3,name:'第三步'},{code:4,name:'第四步'}];
        }else{
            $scope.stepList=[{code:-1,name:'返回到列表'},{code:1,name:'第一步'},{code:2,name:'第二步'},{code:3,name:'第三步'}];
        }

        /*初始化日历*/
        $dateTool.ele('.form_datetime_start,.form_datetime_end',{format: "yyyy-mm-dd",minView :2});

        /*调用七牛上传*/
        var Qiniu = new QiniuJsSDK();
        var maxLen=40,minLen=1;
        GET_TOKEN();
        QINIU.OPTION.uptoken=$cookieStore.get("UPTOKEN");

        QINIU.FUN(maxLen,minLen,$scope,function(s){
            angular.element(s).hide();
            angular.element(s).find("input").val("");
        });

        QINIU.FileUploaded({types:1,maxLen:40,minLen:1,isImgWord:true});//多图实景
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"scenePhotos",multi_selection: true}));

        /*开工*/
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"startCeremony",multi_selection: false,cb:function(){
            angular.element("#isStartTime").show();
        }}));

        /*竣工*/
        QINIU.FileUploaded();
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"endCeremony",multi_selection: false,cb:function(){
         angular.element("#isEndTime").show();
        }}));

        QINIU.FileUploaded({scope:$scope});//图片模块上传
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"upPhotosBtn",multi_selection: false}));




        /*数据验证规则*/
        $scope.pubRegex=$validate.pubRegex.rule;

        /*数据转换 api to code */
        function forMartData (dt,ar){
            var arr=[];
            for(var k in dt){
                var obj={};
                obj.name= dt[k]['title'];
                obj.description= dt[k]['explain'];
                obj.url= dt[k]['pics'][0];
                arr.push(obj)
            }
            return arr;
        }


        //获取数据
        var caseCover=angular.element("#caseCover").nextAll(".img-show-box");
        var startCeremony=angular.element("#startCeremony").nextAll(".img-show-box");
        var endCeremony=angular.element("#endCeremony").nextAll(".img-show-box");

        var scenePhotos=angular.element("#scenePhotos").nextAll(".img-show-box");



        /*图文上传upImgWord*/
        function creatImgWord(opt){
            this.config={
                config:{
                    title:"名称",
                    explain:"描述",
                    pics:"图片"
                }
            };

            this.options= $.extend(this.config,opt);

            this.getImgWord=function(){
                var defData=this.options.getData,
                    selector=this.options.selector,
                    urlStr="";
                /*默认加载循环*/
                $.each(defData,function(x,d){
                    urlStr+= d.pics[0]+",";
                    selector.attr("data-url",urlStr).append(QINIU.imgWordHtml(d));
                })
            };

            this.addImgWord=function(opt){
                var defrequired={
                    requiredTitle:true,
                    requiredExplain:false
                }
                var required= $.extend(defrequired,opt);
                var selector=this.options.selector,
                    dataArr=[];

                /*循环获取数据*/
                console.log(this.options)
                selector.find("div span").each(function(x,d){
                    var t=$(this),
                        titleObj=t.children("input").eq(1),
                        picsObj=t.children("input").eq(0),
                        explainObj=t.children("textarea").eq(0),

                        titleVal= $.trim(titleObj.val()),
                        picsVal=$.trim(picsObj.val()),
                        explainVal=$.trim(explainObj.val()),
                        dataObj={};

                    var r=/^.*[^\d].*$/ ;

                    if(!(r.test(titleVal)) && required.requiredTitle){
                        titleObj.addClass("err")
                    }else{
                        titleObj.removeClass("err")
                    }

                    if(!explainVal && required.requiredExplain){
                        explainObj.addClass("err")
                    }else{
                        explainObj.removeClass("err")
                    }

                    titleVal?dataObj.title=titleVal:"";
                    picsVal?dataObj.pics=[picsVal]:"";
                    explainVal?dataObj.explain=explainVal:"";

                    dataArr.push(dataObj)
                })
                return dataArr
            }
        }


        /*上移/下移*/
        $(".content-box").on("click",".img-words-box > i",function(){
            var t=$(this),
                obj= t.parent(".img-words-box");

            if(t.hasClass("pre")){
                obj.prev().before(obj);
            }

            if(t.hasClass("next")){
                obj.next().after(obj);
            }

        });


        /*获取数据*/
        if(id){
            $http.get([$window.API.CASE.CASE_SET_INFO_P2,"/",id].join("")).success(function(res){
                if(res.stateCode===0&&res.data){
                    $scope.dataInfo=res.data;
                    caseCover.attr("data-url",$scope.dataInfo.caseCover).html(QINIU.creatDom($scope.dataInfo.caseCover));
                    if(res.data.surroundingMaterialDto && res.data.surroundingMaterialDto.startCeremony){
                        startCeremony.attr("data-url",$scope.dataInfo.surroundingMaterialDto.startCeremony.pics[0]).html(QINIU.creatDom($scope.dataInfo.surroundingMaterialDto.startCeremony.pics[0]));
                        angular.element("#isStartTime").show();
                    }
                    if(res.data.surroundingMaterialDto && res.data.surroundingMaterialDto.endCeremony){
                        endCeremony.attr("data-url",$scope.dataInfo.surroundingMaterialDto.endCeremony.pics[0]).html(QINIU.creatDom($scope.dataInfo.surroundingMaterialDto.endCeremony.pics[0]));
                        angular.element("#isEndTime").show();
                    }



                    $scope.beginTime=res.data.surroundingMaterialDto?$filter('date')(res.data.surroundingMaterialDto['startDate'], 'yyyy-MM-dd'):"";
                    $scope.endTime= res.data.surroundingMaterialDto? $filter('date')(res.data.surroundingMaterialDto['endDate'], 'yyyy-MM-dd'):"";

                    res.data.pathOf720?$scope.get720datas=[{pathOf720:res.data.pathOf720}]||[]:"";

                    new creatImgWord({ selector:scenePhotos,getData:res.data.scenes}).getImgWord();




                }
            })
        }



        /*上传选择图片区域*/
        upImageScroper()
        function upImageScroper(){
            $("#filesBase64").change(function(){
                var t=this;
                var src=window.URL.createObjectURL(t.files[0]);
                $(".upPhotoContainer").html("<img src="+src+">")
                $('.upPhotoContainer > img').cropper({
                    movable:false, //不允许移动图片
                    aspectRatio: 1/1,
                    autoCropArea: 1,
                    cropBoxResizable:true,
                    viewMode:1//0,1,2,3

                });
                angular.element('.upPhotoBase64').modal({backdrop: 'static', keyboard: false});
            })

            $scope.finishCropper=function(){
                document.getElementById("filesBase64").value='';
                if(arguments.length>0){
                    angular.element('.upPhotoBase64').modal('hide');
                    return
                }

                $scope.uploadingbase64='(处理中...)';
                var $image = $('.upPhotoContainer > img'),
                    sizeObj={width:1400,height:1400},
                    dataURL = $image.cropper("getCroppedCanvas", sizeObj),
                    imgCode64 = dataURL.toDataURL("image/jpeg",0.95),
                    sizes="?width="+sizeObj.width+"&height="+sizeObj.height;

                $http({
                    withCredentials:false,
                    method: "post",
                    data:imgCode64.replace('data:image/jpeg;base64,',''),
                    url: "https://upload.qbox.me/putb64/-1", //注意https上传
                    headers: { "Content-Type": "application/octet-stream" , "Authorization":" UpToken "+$cookieStore.get('UPTOKEN') }
                }).success(function(res){
                    var resSrc="http://o8nljewkg.bkt.clouddn.com/"+res.key+sizes;
                    angular.element('.upPhotoBase64').modal('hide');
                    $scope.uploadingbase64='';
                    caseCover.attr("data-url",resSrc).html(QINIU.creatDom(resSrc));
                })
            }
        }





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
                    console.log(dt['lastData']);
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
                    //if(!data.description){
                    //    $scope.createPhotoInfo.errorMsg="描述不能为空!";
                    //    return false
                    //}
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

                    attr=selector.attr("data-url","");
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
            var o = JSON.parse(dt).path;
            var host = window.Host720;
            var thumb =window.thumb720;

            var sp=dt.split("/");
            return [host+"/images/common/index.html?directory="+sp[2]+"&subDirectory="+sp[3],host+o+thumb];

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
                    data.pathOf720=$(selector720Val).val();
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
            //预览720
            this.create720Show=function(){
                $scope.create720Show=function(dt){
                   // $(".myModal720 iframe").attr("src",dt);
                   $scope.show720Url = $sce.trustAsResourceUrl(dt);
                };
            }
        }

        var c720= new create720();
        c720.create720Dialog(".krpano-hidden");
        c720.create720Del();
        c720.create720Show();


        /**
         *formSubmit
         *
         * */

        /*数据转换提交 code to api*/
        function forMartDataToService (dt){
            var arr=[];
            for(var k in dt){
                var obj={};
                obj.pics=[];
                obj.title= dt[k]['name'];
                obj.explain= dt[k]['description'];
                obj.pics[0]= dt[k]['url'];
                arr.push(obj)
            }
            return arr;
        }

        var submitPass=true;//防阻塞
        $scope.submit=function(dt){
            if(endCeremony.attr("data-url")|| startCeremony.attr("data-url")){
                $scope.dataInfo.surroundingMaterialDto={};
            }

            var  infoData=angular.copy(dt[0]);
            id?infoData.caseId=id:"";
            infoData.pathOf720=$scope.get720datas[0]?$scope.get720datas[0].pathOf720:$scope.get720datas[0];
            infoData.caseCover=caseCover.attr("data-url");
            console.log(infoData)

            startCeremony.attr("data-url") ?  infoData.surroundingMaterialDto.startCeremony={pics:[startCeremony.attr("data-url")],title:"开工典礼"} : "";
            endCeremony.attr("data-url") ?  infoData.surroundingMaterialDto.endCeremony={pics:[endCeremony.attr("data-url")],title:"竣工典礼"} : "";
            !startCeremony.attr("data-url") && !endCeremony.attr("data-url")? delete infoData.surroundingMaterialDto : "";

            var timeText=['开工时间','竣工时间'];
            if(endCeremony.attr("data-url")&& startCeremony.attr("data-url")){
                $scope.dateThan=$dateTool.compare({startTime:'#beginTime',endTime:'#endTime',required:true,isEqual:true,text:timeText})
            }else if(startCeremony.attr("data-url")){
                $scope.dateThan=$dateTool.compare({startTime:'#beginTime',endTime:'#endTime',required:true,isEqual:true,right:false,text:timeText})
            }else if( endCeremony.attr("data-url")){
                $scope.dateThan=$dateTool.compare({startTime:'#beginTime',endTime:'#endTime',required:true,isEqual:true,left:false,right:false,
text:timeText})
            }else{
                $scope.dateThan=$dateTool.compare({startTime:'#beginTime',endTime:'#endTime',required:false,isEqual:true,text:timeText})
            }

            startCeremony.attr("data-url") ?   infoData.surroundingMaterialDto.startDate= $filter('date')($.trim(angular.element("#beginTime").val()), 'yyyy-MM-dd') : "";
            endCeremony.attr("data-url") ?   infoData.surroundingMaterialDto.endDate= $filter('date')($.trim(angular.element("#endTime").val()), 'yyyy-MM-dd'): "";


            var  nodes=angular.element(".form-control");

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

            infoData.scenes= new creatImgWord({ selector:scenePhotos}).addImgWord();


            /*图片验证*/
            $validate.UpImgValidate({"selector":".img-show-box:not('.create-dialog')","bl":dt[1]});

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
                    $http({ url:[$window.API.CASE.CASE_SET_INFO_P2,"/update"].join(""), method:'POST',data:infoData}).success(function(res){
                        if(res.stateCode===0){
                            if(dt[1]){
                                successMsg.make({msg:"保存成功！"});
                                $timeout(function(){
                                    if(e){
                                        if(dt[2]){
                                            dt[2]==-1?$window.location.href='/#/main/case':"";
                                            dt[2]>0?$window.location.href='/#/main/case-add-p'+dt[2]+'?id='+id+"&s="+s+"&e=1":"";
                                        }else{
                                            $window.location.href='/#/main/case-add-p3?id='+id+"&s="+s+"&e=1";
                                        }

                                    }else{
                                        $window.location.href='/#/main/case-add-p3?id='+id+"&s="+s;
                                    }
                                },1000);

                            }
                        }else{
                            errorMsg.make({msg:res.message})
                        }
                        submitPass=true
                    })
                }else{
                    if(e&&dt[2]){
                        if(confirm('当前步骤未保存，是否继续到其他页面？')){
                            dt[2]==-1?$window.location.href='/#/main/case':"";
                            dt[2]>0?$window.location.href='/#/main/case-add-p'+dt[2]+'?id='+id+"&s="+s+"&e=1":"";
                        }else{
                            $scope.jumpStep.decorateType=2
                        }
                    }
                }
            });
        };

    }]);


/**
 *作品管理 > 作品列表 > 新增/编辑 part3
 */

sysController.controller("CaseAddTrdController", ["$scope", "$http", "$window", "$cookieStore","$timeout","$province","$city","$area","$validate","GET_TOKEN","QINIU","QNV","$sce","getSelectName",
    function ($scope, $http,$window,$cookieStore,$timeout,$province,$city,$area,$validate,GET_TOKEN,QINIU,QNV,$sce,getSelectName) {



        //初始数据
        var id=get_param($window.location.href, "id");
        var s=get_param($window.location.href, "s")*1;
        var e=get_param($window.location.href, "e");
        $scope.e=e;
        $scope.decorateTypesCode=s;
        $scope.dataInfo={};
        $scope.getplanPhotos=[];
        $scope.getScenePhotos=[];
        $scope.getVideos=[];



        /*调用七牛上传*/
        var Qiniu = new QiniuJsSDK();
        var maxLen=10,minLen=3;
        GET_TOKEN();
        QINIU.OPTION.uptoken=$cookieStore.get("UPTOKEN");
        QINIU.FUN(maxLen,minLen,$scope);
        QINIU.FileUploaded({scope:$scope});//图片模块上传
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"upPhotosBtn",multi_selection: false}));
        QINIU.FileUploaded({scope:$scope});//图片模块上传
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"upPhotosBtn2",multi_selection: false}));


        /*七牛视频上传*/
        var qiniuVideo = new QiniuJsSDK();
        GET_TOKEN({v:true});
        new QNV.FUN().defFun();
        QNV.OPTION.uptoken=$cookieStore.get("UPTOKENV");
        QNV.FileUploaded({types:1,uri:"/",scope:$scope});//uri临时
        qiniuVideo.uploader($.extend(QNV.OPTION,{browse_button: "upVideoBtn" }));

        /*数据验证规则*/
        $scope.pubRegex=$validate.pubRegex.rule;

        // 价格验证,填写则必验证
        $scope.validateFun=$validate.validatePrice;



        /*获取作品通用下来*/
        $http.get([$window.API.CASE.CASE_GET_TYPES].join("")).success(function(res){
            if(!res.stateCode){
                $scope.caseStyles =res.data.caseStyles;//风格
                $scope.houseLayers =res.data.houseLayers;//楼层
                $scope.decorateTypes =res.data.decorateTypes;//内容分类
                $scope.houseTypes =res.data.houseTypes;//房型
            }
        });

        /*获取楼层名*/
        $scope.getTitle=function(dt){
            return getSelectName(dt[0],dt[1],dt[2],dt[3])
        };



        //获取数据
        if(id){
            $http.get([$window.API.CASE.CASE_SET_INFO_P3,"/",id].join("")).success(function(res){
                if(res.stateCode==0&&res.data){
                    $scope.dataInfo=res.data;
                    //数据转换
                    function forMartData (dt,getCutArr){
                        var arr=[];
                        for(var k in dt){
                            var obj={};
                            obj.name= dt[k]['title'];
                            obj.description= dt[k]['explain'];
                            obj.url= dt[k]['pics'][0];
                            obj.desurl= getCutArr?getCutArr[k]['pics'][0]:dt[k]['pics'][1];// 判断是否合并数据
                            obj.floorsId= dt[k]['titleId'];
                            arr.push(obj)
                        }
                        return arr;
                    }

                    //特殊数据处理
                    function dataFormatLocal(dt,str){
                        var arr=[];
                        for(var j in dt){
                            arr.push(dt[j][str])
                        }
                        return arr
                    }

                    var originHouseImage=dataFormatLocal(res.data.materialDto.houseImages,"originHouseImage");
                    var designHouseImage=dataFormatLocal(res.data.materialDto.houseImages,"designHouseImage");

                    $scope.getplanPhotos= forMartData(originHouseImage,designHouseImage); //改造户型
                    $scope.getScenePhotos=forMartData(res.data.materialDto.displayImages); //软装陈列
                    $scope.getVideos=res.data.materialDto.designVideo?[res.data.materialDto.designVideo]:[]; //视频

                    //转字符串 0很特殊
                    res.data.hardCost ? $scope.dataInfo.hardCost=String(res.data.hardCost):"";
                    res.data.softCost ? $scope.dataInfo.softCost=String(res.data.softCost):"";


                }else{
                    errorMsg.make({msg:res.message})
                }
            })
        }

        /**
         *createPhotos
         *
         * */
        function createPicsModel(){
            var selector=angular.element("#upPhotosBtn").nextAll(".img-show-box");
            var selector2=angular.element("#upPhotosBtn2").nextAll(".img-show-box");
            //创建上传图片模态
            this.createPhotoDialog=function(){
                var that=this;
                $scope.createPhotoDialog=function(dt){
                    var index=dt['index'];
                    var isScene=dt['isScene'];
                    $scope.maxlength=dt['maxLen'];
                    $timeout(function(){
                        $scope.maxlengtherr=dt['lastData']&&(dt['lastData'].length)>=dt['maxLen'];
                        angular.element('.upPhotoDialog').modal({backdrop: 'static', keyboard: false});
                        $scope.createPhotoTitleAdd=index>=0?false:true;
                        $scope.isScene=isScene;
                    });
                    $scope.createPhotoInfo=angular.copy(dt['addData']); //注意 = 与 copy()区别，后者仅仅是复制数据
                    selector.attr("data-url",dt['addData'].url).html(QINIU.creatDom(dt['addData'].url));
                    selector2.attr("data-url",dt['addData'].desurl).html(QINIU.creatDom(dt['addData'].desurl));
                    that.createImages(dt['lastData'],index,isScene)
                };
            };
            //添加到前端列表
            this.createImages=function(ele,index,isScene){
                $scope.createPhotoSumbit=function(dt){
                    var data=dt;
                    var dataArr=ele?ele:[];
                    var attr=selector.attr("data-url");
                    var attr2=selector2.attr("data-url");
                    $scope.createPhotoInfo.url=attr;
                    $scope.createPhotoInfo.desurl=attr2;


                    if(isScene){
                        if(!data.name){
                            $scope.createPhotoInfo.errorMsg="名称30字符内，不能为纯数字！";
                            return false
                        }
                        if(!data.url){
                            $scope.createPhotoInfo.errorMsg="请上传实景图！";
                            return false
                        }

                    }else{
                        data.name = getSelectName($scope.houseLayers,data.floorsId,'desc','code');
                        if(!data.floorsId){
                            $scope.createPhotoInfo.errorMsg="请选择楼层！";
                            return false
                        }
                        if(!data.url){
                            $scope.createPhotoInfo.errorMsg="请上传原始平面图！";
                            return false
                        }
                        if(!data.desurl){
                            $scope.createPhotoInfo.errorMsg="请上传设计平面图！";
                            return false
                        }
                        //if(!data.description){
                        //    $scope.createPhotoInfo.errorMsg="描述不能为空！";
                        //    return false
                        //}
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

                    selector.attr("data-url","");
                    selector2.attr("data-url","");
                    console.log(dataArr);
                    angular.element('.upPhotoDialog').modal('hide');
                    if(isScene){
                        angular.element('.creatPicslen').blur();
                    }else{
                        angular.element('.creatPicslenPlan').blur();


                    }

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

                    selector.attr("data-vurl","");
                    console.log(dataArr);
                    angular.element('.upVideoDialog').modal('hide');
                    angular.element('.creatVlen').blur();
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

        //数据转换提交, 拆分原始户型和设计户型
        function forMartDataToService (dt,arrCut){
            var arr=[];
            for(var k in dt){
                var obj={};
                obj.pics=[];
                obj.title= dt[k]['name'];
                obj.explain= dt[k]['description'];
                arrCut===0?obj.pics[0]= dt[k]['url']:"";
                dt[k]['desurl']&&arrCut===1?obj.pics[0]= dt[k]['desurl']:"";
                dt[k]['floorsId']?obj.titleId= dt[k]['floorsId']:"";
                arr.push(obj)
            }
            return arr;
        }




        //特殊数据处理
        function dataFormatApi(dt,dt1){
            var arr=[];
            for(var m in dt){
                var obj={};

                obj['remakeIllustration']=dt[m]['explain']
                obj['originHouseImage']=dt[m];
                obj['designHouseImage']=dt1[m];
                arr.push(obj)
            }
            return arr
        }

        /*提交*/
        var submitPass=true;//防阻塞
        $scope.submit=function(dt){

            var  infoData=angular.copy(dt[0]);
            id?infoData.caseId=id:"";
            !infoData.materialDto?infoData.materialDto={}:"";
            infoData.materialDto.displayImages = forMartDataToService($scope.getScenePhotos,0); //陈列

            var originHouseImages= forMartDataToService($scope.getplanPhotos,0);
            var designHouseImages= forMartDataToService($scope.getplanPhotos,1);

            infoData.materialDto.houseImages = dataFormatApi(originHouseImages,designHouseImages); //户型集合
            infoData.materialDto.designVideo = $scope.getVideos[0]; //视频

            infoData.hardCost===""? delete infoData.hardCost:"";
            infoData.softCost===""? delete infoData.softCost:"";

            console.log(infoData);
            var  nodes=angular.element(".form-control");

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

            /*图片验证*/
            $validate.UpImgValidate({"selector":".img-show-box:not('.create-dialog')","bl":dt[1]});


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
                    $http({ url:[$window.API.CASE.CASE_SET_INFO_P3,"/update"].join(""), method:'POST',data:infoData}).success(function(res){
                        if(res.stateCode===0){
                            if( dt[1]){
                                successMsg.make({msg:"保存成功！"});
                                $timeout(function(){

                                    if (s!==1){
                                        if(e){
                                            if(dt[2]){
                                                dt[2]==-1?$window.location.href='/#/main/case':"";
                                                dt[2]>0?$window.location.href='/#/main/case-add-p'+dt[2]+'?id='+id+"&s="+s+"&e=1":"";
                                            }else{
                                                $window.location.href='/#/main/case-add-p4?id='+id+"&s="+s+"&e=1";
                                            }

                                        }else{
                                            $window.location.href='/#/main/case-add-p4?id='+id+"&s="+s;
                                        }

                                    }else{
                                        if(e){
                                            if(dt[2]){
                                                dt[2]==-1?$window.location.href='/#/main/case':"";
                                                dt[2]>0?$window.location.href='/#/main/case-add-p'+dt[2]+'?id='+id+"&s="+s+"&e=1":"";
                                            }else{
                                                $window.location.href='/#/main/case';
                                            }
                                        }else{
                                            $window.location.href='/#/main/case';
                                        }
                                    }

                                },1000);
                            }
                        }else{
                            errorMsg.make({msg:res.message})
                        }
                        submitPass=true;
                    })
                }else{
                    if(e&&dt[2]){
                        if(confirm('当前步骤未保存，是否继续到其他页面？')){
                            dt[2]==-1?$window.location.href='/#/main/case':"";
                            dt[2]>0?$window.location.href='/#/main/case-add-p'+dt[2]+'?id='+id+"&s="+s+"&e=1":"";
                        }else{
                            s!==1?$scope.jumpStep.decorateType=3:scope.jumpStep.decorateType2=3;
                        }
                    }
                }
            });
        };




    }]);

/**
 *作品管理 > 作品列表 > 新增/编辑 part4
 */
sysController.controller("CaseAddFourController", ["$scope", "$http", "$window", "$cookieStore","$timeout","$province","$city","$area","$validate","GET_TOKEN","QNV","QINIU","QNV","$sce","$rootScope",
    function ($scope, $http,$window,$cookieStore,$timeout,$province,$city,$area,$validate,GET_TOKEN,QNV,QINIU,QNV,$sce,$rootScope) {

        /*初始数据*/
        var id=get_param($window.location.href, "id");
        var s=get_param($window.location.href, "s")*1;
        var e=get_param($window.location.href, "e");
        $scope.e=e;
        $scope.decorateTypesCode=s;
        $scope.dataInfo={};
        $scope.dataInfo.materialDto={};
        $scope.dataInfo.materialDto.hardChecks=[];
        $scope.dataInfo.materialDto.softChecks=[];
        window.brandsLastData=[];
        /*初始化列表*/
        if( s!==1){
            $scope.stepList=[{code:-1,name:'返回到列表'},{code:1,name:'第一步'},{code:2,name:'第二步'},{code:3,name:'第三步'},{code:4,name:'第四步'}];
        }else{
            $scope.stepList=[{code:-1,name:'返回到列表'},{code:1,name:'第一步'},{code:2,name:'第二步'},{code:3,name:'第三步'}];
        }


        /*调用七牛上传*/
        var Qiniu = new QiniuJsSDK();
        var maxLen=10,minLen=3;
        GET_TOKEN();
        QINIU.OPTION.uptoken=$cookieStore.get("UPTOKEN");
        QINIU.FUN(maxLen,minLen,$scope);
        QINIU.FileUploaded({scope:$scope});//图片模块上传
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"upPhotosBtn",multi_selection: false}));

        /*七牛视频上传*/
        var qiniuVideo = new QiniuJsSDK();
        GET_TOKEN({v:true});
        new QNV.FUN().defFun();
        QNV.OPTION.uptoken=$cookieStore.get("UPTOKENV");
        QNV.FileUploaded({types:1,uri:"/",scope:$scope});//uri临时
        qiniuVideo.uploader($.extend(QNV.OPTION,{browse_button: "upVideoBtn" }));

        // 价格验证,填写则必验证
        $scope.validateFun=$validate.validatePrice;
        /*数据验证规则*/
        $scope.pubRegex=$validate.pubRegex.rule;



        //获取数据
        if(id){
            $http.get([$window.API.CASE.CASE_SET_INFO_P4,"/",id].join("")).success(function(res){
                if(res.stateCode==0&&res.data){
                    $scope.dataInfo=res.data;
                    $scope.dataInfo.materialDto=!res.data.materialDto?{}:res.data.materialDto;

                    /*初始化一个[]*/
                    function setArr(dt){
                        var arr=[];
                        for (var  j in dt){
                            if(!dt[j]["images"]){
                                dt[j]['images']=[];
                            }
                            if(!dt[j]["videos"]){
                                dt[j]['videos']=[];
                            }
                            arr.push(dt[j])
                        }
                        return arr
                    }

                    s!=3 ? $scope.dataInfo.materialDto.hardChecks=!res.data.materialDto.hardChecks?[]:setArr(res.data.materialDto.hardChecks):"";
                    s!=2 ? $scope.dataInfo.materialDto.softChecks=!res.data.materialDto.softChecks?[]:setArr(res.data.materialDto.softChecks):"";
                    $scope.oldelectricalMaterials=res.data.materialDto.electricalMaterials;
                    $scope.oldequipMaterials=res.data.materialDto.equipMaterials;
                    $scope.oldfurniMaterials=res.data.materialDto.furniMaterials;
                    $scope.oldlightMaterials=res.data.materialDto.lightMaterials;
                    $scope.oldmainMaterials=res.data.materialDto.mainMaterials;
                    $scope.oldpaperMaterials=res.data.materialDto.paperMaterials;

                    if(s!=3){
                        res.data.hardBasic===0?$scope.dataInfo.hardBasic=String(res.data.hardBasic):"";
                        res.data.hardMaterial===0?$scope.dataInfo.hardMaterial=String(res.data.hardMaterial):"";
                        res.data.hardRemake===0?$scope.dataInfo.hardRemake=String(res.data.hardRemake):"";
                        res.data.hardEquip===0?$scope.dataInfo.hardEquip=String(res.data.hardEquip):"";
                    }

                }else{
                    errorMsg.make({msg:res.message})
                }
            })
        }





        /**
         *choose brands
         *
         * */

        /*选择品牌模块Dialog*/
        $scope.createDrandDialog=function(opt){
            var lastData=opt['lastData'];
            var oldData=opt['oldData'];
            $scope.dialogbrandsLastData=lastData;
            angular.element('.getBrandDialog').modal({backdrop: 'static', keyboard: false});

            /*基于大类查找品牌及子类*/

            function getSonBrands(dt){
                var key=dt||"";
                $http.get([$window.API.OTHER.GET_BRAND_BY_BIGCLASS,"?typeId=",opt.bigClassId,"&queryKey=",key].join("")).success(function(res){
                    $scope.bigClassId=opt.bigClassId;
                    if(res.stateCode===0){

                        /*品牌数据转化*/
                        function distTolist(kw){
                            var arr=[];
                            for( var  j in kw){
                                arr.push(kw[j]);
                            }
                            return arr

                        }

                        $scope.getBrandByBigClassIdDefault=res.data.subTypes; //获取结构数组
                        $scope.getBrandByBigClassId =distTolist(res.data.subTypes);//转为list
                    }
                });
            }
            getSonBrands();//default
            $scope.submitSearch=function(dt){
                getSonBrands(dt);
            };

            /*删除已选择品牌*/
            $scope.delDialogbrandsLastData=function(dt){
                var arr=dt[0],
                    n=arr.length,
                    i=n>0?arr.indexOf(dt[1]):0;
                arr.splice(i,1);
                var str=dt[2]+"|"+dt[3]+"|"+dt[4];
                $("[data-id='"+str+"']").removeClass("hover");
                $scope.dialogbrandsLastData=arr;
            };


            /*选择品牌确认*/
            $scope.createBrandsSumbit=function(selectData,bl){
                $scope.dataInfo.materialDto[opt['str']]=resDragSortData(oldData,getbrandsToService(selectData,angular.copy($scope.dialogbrandsLastData)));
                $scope.dialogbrandsLastData= $scope.dataInfo.materialDto[opt['str']];
                bl===1?angular.element('.getBrandDialog').modal('hide'):"";
            };

           /*选择*/
            angular.element("body").off().on("click",".brankDialogListBox p ",function(){
                //$scope.$apply();
                var t=angular.element(this);

                if(!t.hasClass("hover")){
                    t.addClass("hover");
                    $timeout(function(){
                        $scope.createBrandsSumbit($scope.getBrandByBigClassIdDefault);
                    },100)
                }
                else{
                    t.removeClass('hover');
                    $timeout(function(){
                        $scope.delDialogbrandsLastData([$scope.dialogbrandsLastData])
                    },100)
                }
            })


        };

        /*选择后数据*/
        function getbrandsToService(selectData,r){
            var arr=r||[];
            $(".brankDialogListBox p.hover").each(function(){
                var t=$(this);
                var attr= t.attr('data-id').split("|");
                for( var j in selectData[attr[1]].brands){
                    if(selectData[attr[1]]['brands'][j].id==attr[2]){
                        selectData[attr[1]]['brands'][j]['brandClasses']=[{"subType":attr[1],"type":attr[0],"subTypeName":selectData[attr[1]].name}];
                        delete selectData[attr[1]]['brands'][j]['subType'];
                        arr.push(selectData[attr[1]]['brands'][j])
                    }
                }
            });

            function removeDuplicatedItem(all) {
                var tmp = {},arr=[], resArr = [];
                for(var j in  all){
                    var id=all[j]["id"];
                    var ty=all[j]["brandClasses"][0]["subType"];
                    arr.push(id+"|"+ty)
                }

                for (var i = 0, j = arr.length; i < j; i++) {
                    if (!tmp[arr[i]]) {
                        tmp[arr[i]] = 1;
                        resArr.push(all[i]);
                    }
                }
                return resArr;
            }


            return removeDuplicatedItem(arr)

        }

        /*数据对比排序*/
        function resDragSortData(l,r){
            var _arr=[];
            var arr_=[];
            var indexArr=[];
            var index=0;
            var l=l||[];
            var r=r||[];
            /*交集*/
            l.forEach(function(x){
                for( var j in r ){
                    if(x['id']==r[j]['id'] && x['brandClasses'][0]['subType']==r[j]['brandClasses'][0]['subType']){
                        _arr.push(x)
                    }
                }

            });
            /*取下标*/
            r.forEach(function(x){
                for( var j in _arr ){
                    if(x['id']==_arr[j]['id'] && x['brandClasses'][0]['subType']==_arr[j]['brandClasses'][0]['subType']){
                        indexArr.push(index)
                    }
                }
                index++;
            });

            /*删重复*/
            for( var j in indexArr){
                delete r[indexArr[j]]

            }

            /*转数组*/
            for(var k in r){
                arr_.push(r[k])
            }
            /*合*/
         return _arr.concat(arr_)
        }


        $scope.$on("ngRepeatBrand",function(){
            /*设置状态*/
            setDefaultStatus( $scope.dialogbrandsLastData);
            function setDefaultStatus(defaultData){
                var sele=angular.element(".brankDialogListBox p");
                /*默认*/
                sele.each(function(){
                    var t=$(this);
                    var gb=defaultData;
                    var attr= t.attr('data-id').split("|");
                    for(  j in gb){
                        if(attr[2]==gb[j].id && attr[1]==gb[j].brandClasses[0].subType){
                            t.addClass("hover");
                        }
                    }
                });
            }
        });



        /**
         *createStep
         *
         * */
        function createCommonModel(){
            this.createCommonDialog=function(){
                var that=this;
                $scope.createCommonDialog=function(dt){
                    var index=dt['index'];
                    $scope.maxlength=dt['maxLen'];
                    console.log(dt['lastData']);
                    $timeout(function(){
                        $scope.maxlengtherr=dt['lastData']&&(dt['lastData'].length)>=dt['maxLen'];
                        angular.element('.upCommonDialog').modal({backdrop: 'static', keyboard: false});
                        $scope.createCommonTitleAdd=index>=0?false:true
                    });

                    $scope.createPhotoInfo=angular.copy(dt['addData']); //注意 = 与 copy()区别，后者仅仅是复制数据
                    that.createImages(dt['lastData'],index)
                };
            };
            //添加到前端列表
            this.createImages=function(ele,index){
                $scope.createCommonSumbit=function(dt){
                    var data=dt;
                    console.log(index)
                    var dataArr=ele?ele:[];

                    if(!data.phaseName){
                        $scope.createPhotoInfo.errorMsg="名称30字符内，不能为纯数字!";
                        return false
                    }
                    if(!data.phaseDescription){
                        $scope.createPhotoInfo.errorMsg="描述不能为空!";
                        return false
                    }
                    $scope.createPhotoInfo.errorMsg=null;
                    delete data.errorMsg;
                    data.images=data.images||[];
                    data.videos=data.videos||[];

                    var bl=dataArr.some(function(x){ return x==data });
                    if(!bl&&!(index>=0)){
                        dataArr.push(data);//绑定自动 ng-model
                        successMsg.make({msg:"添加成功！"});
                    }else if(index>=0){
                        dataArr.splice(index,1,data);
                        successMsg.make({msg:"修改成功！"});
                    }

                    //console.log(dataArr);
                    angular.element('.upCommonDialog').modal('hide');
                    angular.element('.createPhotoDialogCheck').blur();
                };
            };
            /*删除列表*/
            this.createCommonDel=function(){
                $scope.createCommonDel=function(dt){
                    var arr=dt[0],
                        n=arr.length,
                        i=n>0?arr.indexOf(dt[1]):0;
                    arr.splice(i,1);
                    console.log(arr)
                }

            };

        }

        var creatpics= new createCommonModel();
        creatpics.createCommonDialog();
        creatpics.createCommonDel();



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
                    dt['addData'].pics=dt['addData'].pics||[];
                    var index=dt['index'];
                    $scope.maxlength=dt['maxLen'];
                    console.log(dt['lastData']);
                    $timeout(function(){
                        $scope.maxlengtherr=dt['lastData']&&(dt['lastData'].length)>=dt['maxLen'];
                        angular.element('.upPhotoDialog').modal({backdrop: 'static', keyboard: false});
                        $scope.createPhotoTitleAdd=index>=0?false:true
                    });

                    $scope.createPhotoInfo=angular.copy(dt['addData']); //注意 = 与 copy()区别，后者仅仅是复制数据
                    selector.attr("data-url",dt['addData'].pics[0]).html(QINIU.creatDom(dt['addData'].pics[0]));
                    that.createImages(dt['lastData'],index)
                };
            };
            //添加到前端列表
            this.createImages=function(ele,index){
                $scope.createPhotoSumbit=function(dt){
                    var data=dt;
                    console.log(index);
                    var dataArr=ele?ele:[];
                    var attr=selector.attr("data-url");
                    $scope.createPhotoInfo.pics[0]=attr;

                    if(!data.title){
                        $scope.createPhotoInfo.errorMsg="名称30字符内，不能为纯数字!";
                        return false
                    }
                    if(!data.pics[0]){
                        $scope.createPhotoInfo.errorMsg="请上传图片！";
                        return false
                    }
                    //if(!data.explain){
                    //    $scope.createPhotoInfo.errorMsg="描述不能为空!";
                    //    return false
                    //}
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

                    attr=selector.attr("data-url","");
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

                    //if(!data.description){
                    //    $scope.createVideoInfo.errorMsg="请填写视频描述！";
                    //    return false
                    //}




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





        //提交
        var submitPass=true;//防阻塞
        $scope.submit=function(dt){
            var  infoData=angular.copy(dt[0]);
            id?infoData.caseId=id:"";
            var  nodes=angular.element(".form-control");
            console.log(infoData);

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
                    $http({ url:[$window.API.CASE.CASE_SET_INFO_P4,"/update"].join(""), method:'POST',data:infoData}).success(function(res){

                        if(res.stateCode===0){
                            if( dt[1]){
                                successMsg.make({msg:"提交成功！"});
                                $timeout(function(){
                                    if(e){
                                        if(dt[2]){
                                            dt[2]==-1?$window.location.href='/#/main/case':"";
                                            dt[2]>0?$window.location.href='/#/main/case-add-p'+dt[2]+'?id='+id+"&s="+s+"&e=1":"";
                                        }else{
                                            $window.location.href='/#/main/case';
                                        }

                                    }else{
                                        $window.location.href='/#/main/case';
                                    }


                                },1000);
                            }
                        }else{
                            errorMsg.make({msg:res.message})
                        }
                        submitPass=true
                    })
                }else{
                    if(e&&dt[2]){
                        if(confirm('当前步骤未保存，是否继续到其他页面？')){
                            dt[2]==-1?$window.location.href='/#/main/case':"";
                            dt[2]>0?$window.location.href='/#/main/case-add-p'+dt[2]+'?id='+id+"&s="+s+"&e=1":"";
                        }else{
                            $scope.jumpStep.decorateType=4
                        }
                    }
                }
            });
        };


    }])
