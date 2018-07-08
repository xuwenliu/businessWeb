/**
 * order
 *
 *订单管理 > 订单列表
 */

sysController.controller("OrderListController", ["$scope", "$http", "$window","$grid","$dateTool","$filter","$getSelectTypes",
    function($scope, $http, $window,$grid,$dateTool,$filter,$getSelectTypes) {

        /*列表*/
        $grid.initial($scope, [$window.API.ORDER.ORDER_LIST].join(""),{orderBy:"createTime"});

        /*初始化日历*/
        $dateTool.ele('.form_datetime_start,.form_datetime_end');

        /*初始化状态下拉*/
        $getSelectTypes.select($scope,[$window.API.ORDER.ORDER_TYPES_STATUS].join(""),{"code":-1,desc:"全部"});

        /*查询*/
        var postData={};
        postData.orderBy="createTime";
        $scope.submitSearch=function(dt){
            var dt=angular.copy(dt)||{};
            $scope.dateThan=$dateTool.compare({startTime:'.form_datetime_start input',endTime:'.form_datetime_end input',required:false});// 时间判断
            if(( $scope.dateThan)){
                return false;
            }
            console.log(dt)
            dt.searchKey?postData.searchKey=encodeURI(dt.searchKey):postData.searchKey="";
            postData.beginTime=$filter('date')($.trim(angular.element("#beginTime").val()), 'yyyyMMdd');
            postData.endTime=$filter('date')($.trim(angular.element("#endTime").val()), 'yyyyMMdd');
            console.log(postData)
            $scope.filtering(postData);
        };

        /*订单内容选择*/
        $scope.$watch('list.contentType',function(dt){
            if(dt){
                postData.contentType=dt==-1?"":dt;
                $scope.filtering(postData);
            }

        });

        /*订单状态选择*/
        $scope.$watch('list.orderStatus',function(dt){
            if(dt){
                postData.orderStatus=dt==-1?"":dt;
                $scope.filtering(postData);
            }
        });



        /*详细*/
        $scope.show=function(id,type){
            $window.location.href = ["#/main/order-list-info/order-base-step-info?id=", id,"&type=",type].join("");
        };

    }]);


/**
 *
 *订单管理 > 退款列表
 */

sysController.controller("RefundListController", ["$scope", "$http", "$window","$grid","$dateTool","$filter","$getSelectTypes",
    function($scope, $http, $window,$grid,$dateTool,$filter,$getSelectTypes) {

        $grid.initial($scope, [$window.API.ORDER.REFUND_LIST].join(""),{orderBy:"createTime"});
        /*初始化日历*/
        $dateTool.ele('.form_datetime_start,.form_datetime_end');

        /*初始化状态下拉*/
        $getSelectTypes.select($scope,[$window.API.ORDER.ORDER_TYPES_STATUS].join(""),{"code":-1,desc:"全部"});

        /*查询*/
        var postData={};
        postData.orderBy="createTime";
        $scope.submitSearch=function(dt){
            var dt=angular.copy(dt)||{};
            $scope.dateThan=$dateTool.compare({startTime:'.form_datetime_start input',endTime:'.form_datetime_end input',required:false});// 时间判断
            if(( $scope.dateThan)){
                return false;
            }
            console.log(dt)
            dt.searchKey?postData.searchKey=encodeURI(dt.searchKey):postData.searchKey="";
            postData.beginTime=$filter('date')($.trim(angular.element("#beginTime").val()), 'yyyyMMdd');
            postData.endTime=$filter('date')($.trim(angular.element("#endTime").val()), 'yyyyMMdd');
            $scope.filtering(postData);
        };


        /*退款状态选择*/
        $scope.$watch('list.refundStatus',function(dt){
            if(dt){
                postData.status=dt==-1?"":dt;
                $scope.filtering(postData);
            }
        });



        /*详细*/
        $scope.show=function(id,type){
            $window.location.href = ["#/main/refund-list-info?id=", id,"&type=",type].join("");
        };

    }]);

/**
 *
 * 订单管理 > 退款详情
 */
sysController.controller("RefundInfoController", ["$scope", "$http" , "$window", "$grid", "$filter", "$cookieStore","GET_TOKEN","QINIU","QNV","$timeout", "$validate",
    function($scope, $http, $window, $grid, $filter, $cookieStore, GET_TOKEN, QINIU, QNV, $timeout, $validate) {
        var id=get_param($window.location.href, "id");


        /*数据验证规则*/
        $scope.pubRegex=$validate.pubRegex.rule;

        /*订单中的退款信息详情*/
        $http.get([$window.API.ORDER.REFUND_INFO,"/",id].join("")).success(function(res){
            if(!res.stateCode){
                $scope.refundInfo =res.data;

                $scope.showStatus = function(status) {
                    var result = null;
                    switch (status) {
                        case 1 :
                            result = "审核中";
                            break;
                        case 2 :
                            result = "已退款";
                            break;
                        case 3 :
                            result = "已驳回";
                            break;
                    }
                    return result;
                };

                $scope.showTime = function(time) {
                    return $filter('date')(time, 'yyyy-MM-dd HH:mm:ss');
                };

                // 拒绝、申诉等文本信息
                angular.forEach($scope.refundInfo.progress, function(data, index, array) {
                    data.operateDetail = data.operateContent.split("：")[1];
                    data.operateContent = data.operateContent.split("；")[0];
                });

                // 可退金额
                $scope.refundInfo.basicInfoVo.remainAccount = $scope.refundInfo.basicInfoVo.phasePayedAmount - $scope.refundInfo.basicInfoVo.phaseRefundedAmount;

                $scope.refundInfo.lengthOfLogs = $scope.refundInfo.progress.length;
            }
        });

        /*调用七牛上传*/
        var maxLen=3,minLen=1;
        GET_TOKEN();
        QINIU.OPTION.uptoken=$cookieStore.get("UPTOKEN");
        QINIU.FUN(maxLen,minLen,$scope);
        QINIU.FileUploaded({types:1,maxLen:maxLen,minLen:minLen});//多图
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"refundCredences"}));

        //弹出框
        $scope.bootDialog = function(s) {
            $scope.dialog = {"confirm":true, "data":{}, "title":s.title, "status":s.status};
            
            // 显示拒绝、申诉等理由
            if (typeof s.detail === "string") {
                $scope.dialog.confirm = false;
                $scope.dialog.detail = s.detail;
            }
        }

        /*查看大图*/
        var eo=$(".refundInfo-box");
        eo.on("click",".preview-img",function(){
            var url=$(this).find("img").attr("data-img");
            $timeout(function(){
                $scope.preview=url;
            })
        });

        var submitPass=true;
        $scope.dialogSubmit = function(dt) {

            if (dt.status === 0) {
                var refundCredences = $("#refundCredences").next(".img-show-box").attr("data-url");
                if (typeof refundCredences === "string") {
                    refundCredences = refundCredences.split(",");
                }
                dt.data.refundCredences = refundCredences;
                /*图片验证*/
                $validate.UpImgValidate({"selector":".js-pass .img-show-box","bl":true});

                dt.data.refundAmount = parseFloat(dt.data.refundAmount);

                var infoData = angular.copy(dt);
                var nodes=angular.element(".js-pass .form-control");

                nodes.blur();
                /* 同意退款请求 */
                $timeout(function(){
                    var nodeErr=angular.element(".js-pass .err"),
                        nodeErrRes=angular.element(".js-pass .err:not(.rmcolor)"),
                        nodeUpErr=angular.element(".js-pass .upErr"),
                        required=angular.element(".js-pass .required.err");
                    
                    nodeErr.first().focus();
                    errLen=nodeErrRes.length;
                    upErrLen=nodeUpErr.length;

                    console.log("errLen:"+errLen+"|"+upErrLen);
                    if(errLen<1&&upErrLen<1&&submitPass){
                        submitPass=false;
                        $http({ url:[$window.API.ORDER.ORDER_REFUND_PASS,"/",id,"/pass"].join(""), method:'POST',data:infoData.data}).success(function(res){
                            if (res.succ) {
                                successMsg.make({"msg":"已同意用户的退款申请"});

                                angular.element('.refundModal').modal('hide');
                                
                                $window.location.reload(); 
                            }
                            else {
                                errorMsg.make({msg:res.message});
                            }
                            submitPass=true;
                        });
                    }
                }); 
            }
            
            if (dt.status === 1) {
                var infoData = angular.copy(dt);
                var nodes=angular.element(".js-reject .form-control"); 
                nodes.blur();
                /* 拒绝退款请求 */
                $timeout(function(){
                    var nodeErr=angular.element(".js-reject .err"),
                        nodeErrRes=angular.element(".js-reject .err:not(.rmcolor)");
                    
                    nodeErr.first().focus();
                    errLen=nodeErrRes.length;

                    if(errLen<1&&submitPass){
                        submitPass=false;
                        $http({ url:[$window.API.ORDER.ORDER_REFUND_REJECT,"/",id,"/reject"].join(""), method:'POST',data:{"rejectReason":infoData.refundReason}}).success(function(res){
                            if (res.succ) {
                                successMsg.make({"msg":"已拒绝用户的退款申请"});

                                angular.element('.refundModal').modal('hide');
                                
                                $window.location.reload(); 
                            }
                            else {
                                errorMsg.make({msg:res.message});
                            }
                            submitPass=true;
                        });
                    }
                }); 
            }
        }

    }]);


/**
 *
 *订单管理 > 订单详情
 */
sysController.controller("OrderInfoController", ["$scope", "$http", "$window","$grid","$rootScope",
    function($scope, $http, $window,$grid,$rootScope) {

        var id=get_param($window.location.href, "id"),
            type=get_param($window.location.href, "type");
        $rootScope.getId=id;
        //$rootScope.type=type;
        $scope.type=type;
        //参数过滤输入
        if(parseInt(type)>2||parseInt(type)<1){
            $window.location.href="#/main/order-list";
            return false
        }
        /*选项卡*/
        angular.element(".tab-btn a").click(function(){
            var t=$(this),
                i= t.index(),
                o=angular.element(".tab-btn-content>ul>li");
            t.addClass("hover").siblings().removeClass("hover");
            //o.eq(i).show().siblings().hide();
            console.log(i)
            if(type==1){
                if(i==0||i==2){
                    o.eq(0).show().siblings().hide();
                }else{
                    o.not(":eq(0)").hide();
                    o.eq(i).show();
                }
            };
            if(type==2){
                if(i==0||i==1||i==4){
                    o.eq(0).show().siblings().hide();
                }else{
                    o.not(":eq(0)").hide();
                    o.eq(i-1).show();
                }
            }
        });




        /*刷新跳转*/
        var h=($window.location.hash).split("/");
        if(type==2&&h[h.length-1].indexOf("order-step-info")==0){
            angular.element(".tab-btn a").eq(1).addClass("hover").siblings().removeClass("hover");
        }

        type==1?$window.location.href="#/main/order-list-info/order-base-info?id="+id+"&type="+type:"";
        if(type==2&&h[h.length-1].indexOf("order-step-info")<0){
            $window.location.href="#/main/order-list-info/order-base-step-info?id="+id+"&type="+type;
        }




        /*资金流动无分页*/
        $http.get([$window.API.ORDER.ORDER_JOURNAL,"/",id,"/journal"].join("")).success(function(res){
            if(!res.stateCode){
                $scope.result =res.data;
            }
        });


        /*操作详情*/
        $http.get([$window.API.ORDER.ORDER_INFO_LOG,"/",id,"/operateLog"].join("")).success(function(res){
            if(!res.stateCode){
                $scope.dolog =res.data;
            }
        });
    }]);







/**
 *
 *订单管理 > 合同订单详情-tab1（合同订单信息）
 */
sysController.controller("OrderBaseStepInfoController", ["$scope", "$http", "$window","$dateTool","$filter","$timeout","GET_TOKEN","QINIU","$cookieStore","$state",
    function($scope, $http, $window,$dateTool,$filter,$timeout,GET_TOKEN,QINIU,$cookieStore,$state) {
        //初始数据
        var id=get_param($window.location.href, "id");
        $scope.dataInfo={};

        /*调用七牛上传*/
        var maxLen=50,minLen=1;
        GET_TOKEN();
        QINIU.OPTION.uptoken=$cookieStore.get("UPTOKEN");
        QINIU.FUN(maxLen,minLen,$scope);
        QINIU.FileUploaded({types:1,maxLen:maxLen,minLen:minLen});//多图
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"contractPhotos"}));

        var contractPhotos=angular.element("#contractPhotos").next(".img-show-box");

        /*获取下拉常用参数*/
        $http.get([$window.API.CASE.CASE_GET_MEMBERS].join("")).success(function(res){
            if(!res.stateCode){
                $scope.designTeam =res.data.designTeam;//设计团队
                $scope.pmTeam =res.data.pmTeam;//项目经理团队
                $scope.advisorTeam =res.data.advisorTeam;//商务代表团队
            }
        });

        //获取数据
        getDataInfo();
        function getDataInfo(){
            if(id){
                $http.get([$window.API.ORDER.ORDER_GET_TAB_INFO,"/",id].join("")).success(function(res){
                    if(res.stateCode==0&&res.data){
                        $scope.dataI=res.data;
                        $scope.dataInfo=res.data.employeeIdVo;
                        $scope.dataInfo.contractPhotos=(res.data.orderBasicVo.contractPhotos||[]).join(",")||null;
                        contractPhotos.attr("data-url",$scope.dataInfo.contractPhotos).html(QINIU.creatDom($scope.dataInfo.contractPhotos));
                    }
                })
            }
        }


        //提交
        var submitPass=true;//防阻塞
        $scope.submit=function(dt){

            var  infoData=angular.copy(dt[0]);
            infoData.orderId=id*1;
            infoData.contractPhotos=contractPhotos.attr("data-url")?(contractPhotos.attr("data-url")).split(","):[];

            /*保存/校验*/
            var  nodes=angular.element(".form-control");
            nodes.blur();

            /*请求*/
            $timeout(function(){
                console.log(infoData)
                var nodeErr=angular.element(".err");
                dt[1]?nodeErr.first().focus():required.focus();
                errLen=nodeErr.length;
                console.log("errLen:"+errLen);
                if(errLen<1&&submitPass){
                    submitPass=false;
                    $http({url:[$window.API.ORDER.ORDER_CREATE_BASE_SAVE].join(""), method:'PUT', data:infoData}).success(function(res){
                        if(!res.stateCode){
                            if(dt[1]){
                                successMsg.make({msg:"提交成功！"});
                                getDataInfo();
                            }
                        }else{
                            errorMsg.make({msg:res.message});
                        }
                        submitPass=true;
                    })
                }
            });
        };


    }]);



/**
 *
 *订单管理 > 订单中的退款信息列表
 */

sysController.controller("OrderRefundListController", ["$scope", "$http", "$window","$grid","$dateTool","$filter",
    function($scope, $http, $window,$grid,$dateTool,$filter) {
        var id=get_param($window.location.href, "id");


        /*订单中的退款信息列表*/
        $http.get([$window.API.ORDER.ORDER_INFO_REFUND_LIST,"/",id,"/refundApply"].join("")).success(function(res){
            if(!res.stateCode){
                $scope.refundResult =res.data;
            }
        });

        /*详细*/
        $scope.show=function(id){
            $window.location.href = ["#/main/refund-list-info?id=", id].join("");
        };
    }]);

/**
 *
 *订单管理 > 订单列表 >创建合同订单-基础信息
 */
sysController.controller("OrderCreateController", ["$scope", "$http", "$window","$dateTool","$filter","$timeout","GET_TOKEN","QINIU","$cookieStore","getSelectName",
    function($scope, $http, $window,$dateTool,$filter,$timeout,GET_TOKEN,QINIU,$cookieStore,getSelectName) {
        //初始数据
        var id=get_param($window.location.href, "id");
        $scope.dataInfo={};


        /*调用七牛上传*/
        var maxLen=50,minLen=1;
        GET_TOKEN();
        QINIU.OPTION.uptoken=$cookieStore.get("UPTOKEN");
        QINIU.FUN(maxLen,minLen,$scope);
        QINIU.FileUploaded({types:1,maxLen:maxLen,minLen:minLen});//多图
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"contractPhotos"}));

        /*获取下拉常用参数*/
        $http.get([$window.API.CASE.CASE_GET_MEMBERS].join("")).success(function(res){
            if(!res.stateCode){
                $scope.designTeam =res.data.designTeam;//设计团队
                $scope.pmTeam =res.data.pmTeam;//项目经理团队
                $scope.advisorTeam =res.data.advisorTeam;//商务代表团队
            }
        });


        /*获取预约数据*/
        if(id){
            $http.get([$window.API.ORDER.ORDER_INFO,"/",id].join("")).success(function(res){
                if(res.stateCode==0&&res.data){
                    $scope.dataInfo=res.data.customerBookingInfoVo;
                    $scope.isChangeCheck=true;
                    /*调用已有用户*/
                    getHouseInfo(res.data.phoneNumber);
                }
            })
        }

        /*获取房屋信息及校验用户存在方法*/
        function getHouseInfo(dt){
            $http.get([$window.API.ORDER.ORDER_CREATE_GET_HOUSE_LIST,"?phone=",dt].join("")).success(function(res){
                if(!res.stateCode){
                    successMsg.make({msg:"校验通过！"});
                    $scope.isChangeCheck=true;
                    $scope.getHouseTypeList=res.data.houseInfoVos;
                    $scope.dataInfo.userId=res.data.userId;
                }else{
                    errorMsg.make({msg:res.message});
                }
            })
        }

        /*选择房屋*/
        $scope.$watch('dataInfo.houseId',function(dt){
            if(dt){
                var arr=$scope.getHouseTypeList||[];
                $scope.isShowHouseInfo=false;
                for( var j in arr){
                    if(arr[j]['houseId']==dt){
                        $scope.dataI=arr[j];
                        $scope.isShowHouseInfo=true;
                    }
                }
            }
        });

        /*校验业主*/
        $scope.checkPass=function(dt){
            dt?getHouseInfo(dt):"";
        };

        //提交
        var submitPass=true;//防阻塞
        $scope.submit=function(dt){
            var  infoData=angular.copy(dt[0]);
            var contractPhotos=angular.element("#contractPhotos").next(".img-show-box");
            contractPhotos.attr("data-url")?infoData.contractPhotos=contractPhotos.attr("data-url").split(","):"";
            delete infoData.phoneNumber;
            /*保存/校验*/
            var  nodes=angular.element(".form-control");
            nodes.blur();
            /*请求*/
            $timeout(function(){
                console.log(infoData)
                var nodeErr=angular.element(".err");
                dt[1]?nodeErr.first().focus():required.focus();
                errLen=nodeErr.length;
                console.log("errLen:"+errLen);
                if(errLen<1&&submitPass){
                    submitPass=false;
                    $http({url:[$window.API.ORDER.ORDER_CREATE_BASE_SAVE].join(""), method:'POST', data:infoData}).success(function(res){
                        if(!res.stateCode){
                            if( dt[1]){
                                successMsg.make({msg:"提交成功！"});

                                /*友盟统计*/
                                if(!id){
                                    try {
                                        _czc.push(["_trackEvent", "B端创建订单", "创建次数",  getSelectName($scope.orderTypeContent,infoData['contentType'],'value','id'), 1])
                                    } catch (e) {
                                       console.log(e)
                                    }
                                }

                               $window.location.href="#/main/order-list-create-step?id="+res.data+"&otype="+infoData.contentType;//已经创建的基础信息ID
                            }
                        }else{
                            errorMsg.make({msg:res.message});
                        }
                        submitPass=true;
                    })
                }
            });
        };


    }]);


/**
 *
 *订单管理 > 订单列表 >创建/修改合同订单-阶段添加
 */
sysController.controller("OrderCreateStepController", ["$scope", "$http", "$window","$dateTool","$filter","$timeout","getSelectName","$validate",
    function($scope, $http, $window,$dateTool,$filter,$timeout,getSelectName,$validate) {

        //初始数据
        var id=get_param($window.location.href, "id");
        var otp=get_param($window.location.href, "otype");
        var otype=otp==2?3:otp==3?4:1;

        $scope.dataInfo={};
        $scope.dataInfoSer={};
        $scope.grids=[{phase:2},{phase:100}];//初始阶段
        $scope.getPhaseLast=2;//初始添加阶段
        $scope.orderId=id;

        /*数据验证规则*/
        $scope.pubRegex=$validate.pubRegex.rule;

        /*初始化日历*/
        $dateTool.ele('.form_datetime_start,.form_datetime_end',{format: " yyyy-mm-dd",minView :2});
        /*阶段验收提交*/
        $scope.orderSubmitCheck=function(dt){
            $http.post([$window.API.ORDER.ORDER_SUBMIT_PHASE,"/",dt[0],"/",dt[1],"/submitCheck"].join("")).success(function(res){
                if(!res.stateCode){
                    successMsg.make({msg:"提交成功！"});
                    $timeout(function(){
                        $window.location.reload();
                    },1500)
                }else{
                    errorMsg.make({msg:res.message});
                }
            });
        };


        /*获取数据*/
        if(id){
            $http.get([$window.API.ORDER.ORDER_CREATE_STEP_INFO,"/",id,"/phase"].join("")).success(function(res){
                if(res.stateCode==0&&res.data){
                    var arr=res.data||[];

                    if( arr.filter(function(x){return x['phase']==2 }).length==0){
                        arr.reverse();
                        arr.push({phase:2});
                        arr.reverse();
                    }
                    if(arr.filter(function(x){return x['phase']==100 }).length==0){
                        arr.push({phase:100});
                    }
                    $scope.grids=angular.copy(arr);
                    var len=(res.data).length;
                    $scope.getPhaseLast=len;


                }
            })
        }

        /*删除阶段*/
        $scope.delPhase=function(dt){
            if(confirm("确定删除当前阶段吗？")){
                var delData={
                    orderId:dt[0],
                    phase:dt[1]
                };
                $http({"url":[$window.API.ORDER.ORDER_DELETE_PHASE].join(""),method:"POST", data:delData}).success(function(res){
                    if(!res.stateCode){
                        successMsg.make({msg:"删除成功！"});
                        $timeout(function(){
                            $window.location.reload();
                        },1500)
                    }
                });
            }
        };


        /*获取服务数据下拉*/
        $http.get([$window.API.ORDER.ORDER_GET_SERVICE_LIST,"?type=",otype].join("")).success(function(res){
            if(!res.stateCode){
                $scope.serviceType=res.data;
            }
        });

        /*监听获取默认说明*/
        $scope.serChange=function(dt){
            if(dt){
                $scope.dataInfoSer.description = getSelectName($scope.serviceType,dt,'description','id')
                $scope.dataInfoSer.name = getSelectName($scope.serviceType,dt,'name','id')
            }
        };



        /*创建添加模态*/
        $scope.createDialogEdit=function(dt){//orderId,phaseId,phase,g
            //获取当前阶段数据
            var curData=angular.copy(dt);
            $scope.dataInfo=curData;
            $scope.dataInfo.contentDtos=curData.contentDtos||[];
            $scope.dataInfo.startTime=$filter('date')(curData['startTime'], 'yyyy-MM-dd');
            $scope.dataInfo.finishTime=$filter('date')(curData['finishTime'], 'yyyy-MM-dd');
            $scope.dataInfo.amount=[curData.amount].join("");//转数据类型string

            /*获取下拉name*/
            $scope.selectName=function(dt){
                return getSelectName($scope.serviceType,dt,'name','id')
            };
            angular.element('.createOrderDialog').modal({backdrop: 'static', keyboard: false});
        };

        /**
         *createDialogText
         *
         * */

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

        //提交
        var submitPass=true;//防阻塞
        $scope.submit=function(dt){
            $scope.dateThan=$dateTool.compare({startTime:'.form_datetime_start input',endTime:'.form_datetime_end input',required:true});// 时间判断
            var  infoData=angular.copy(dt[0]);
            id?infoData.orderId=id*1:"";
            infoData.amount=(infoData.amount)*1;
            /*保存/校验*/
            var  nodes=angular.element(".form-control");
            nodes.blur();
            /*请求*/
            $timeout(function(){
                console.log(infoData)
                var nodeErr=angular.element(".err");
                dt[1]?nodeErr.first().focus():required.focus();
                errLen=nodeErr.length;
                console.log("errLen:"+errLen);
                if(errLen<1&&submitPass){
                    submitPass=false;
                    $http({url:[$window.API.ORDER.ORDER_CREATE_STEP_SAVE].join(""), method:infoData['phaseId']?'PUT':"POST", data:infoData}).success(function(res){
                        if(!res.stateCode){
                            if( dt[1]){
                                successMsg.make({msg:"提交成功！"});
                                $timeout(function(){
                                    $window.location.reload();
                                },1500)
                            }
                        }else{
                            errorMsg.make({msg:res.message});
                        }
                        submitPass=true;
                    })
                }
            });
        };


    }]);

