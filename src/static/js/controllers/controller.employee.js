/**
 *
 *
 *员工管理 > 员工列表
 */
sysController.controller("EmployeeListController", ["$scope", "$http", "$window", "$grid","$cookieStore",
    function ($scope, $http, $window, $grid,$cookieStore) {

        var id=get_param($window.location.href, "id");
        $grid.initial($scope, [$window.API.EMPLOYEE.EMPLOYEE_GET_LIST].join(""),{orderBy:"createTime"});

        /*查询*/
        $scope.submitSearch=function(dt){
            if(dt){
                var postData={};
                postData.status=dt.status;
                dt.queryKey?postData.queryKey=encodeURI(dt.queryKey):"";
                postData.userDetailType=dt.userDetailType;
                postData.orderBy = "createTime";
                $scope.filtering(postData);
            }
        };

        /*获取下拉常用参数*/
        $http.get([$window.API.EMPLOYEE.EMPLOYEE_GET_TYPES].join("")).success(function(res){
            if(!res.stateCode){
                $scope.detailTypes =res.data.detailTypes;//列表角色
                $scope.employeeStatus =res.data.employeeStatus;//列表状态
            }
        });

        /*启用||禁用*/
        $scope.isAvailable=function(dt){
            if(confirm(dt[0]?"确定要启用员工 “ "+dt[2]+" ” 的账户吗？":"确定要禁用员工 “ "+dt[2]+" ” 的账户吗？")){
                $http.put([$window.API.EMPLOYEE.IS_START,"/",dt[1],"/status/",dt[0]].join(""),{}).success(function(res){
                    if(!res.stateCode){
                        successMsg.make();
                        $scope.refresh();
                    }
                })
            }
        };

		/*v1.10.0-离职*/
		$scope.dimission=function(userId){
			$scope.userId=userId;
			angular.element('.createDialog-dimission').modal({backdrop: 'static', keyboard: false});
			$http.get([$window.API.EMPLOYEE.EMPLOYEE_PUB,"/",userId,"/quitjob"].join("")).success(function(res){
				if(res.stateCode===0&&res.data){
					$scope.caseInfoDtos=res.data.caseInfoDtos;

				}else {
                    errorMsg.make({msg:res.message});
                }
			})
		}
		/*v1.10.0-离职-提交并解除员工dialog*/
		$scope.sack=function(userId,dt){
			var data = {
				"caseInfoDtos":dt
			}
			if(confirm("确定解除该员工？")){
				 	$http({ url:[$window.API.EMPLOYEE.EMPLOYEE_PUB,"/",userId,"/quitjob"].join(""), method:'post',data:data}).success(function(res){
	                if(res.stateCode===0){
	                    successMsg.make({msg:'提交成功!'});
	                    angular.element('.createDialog-dimission').modal('hide');
	                    $scope.refresh();
	                }else{
	                    errorMsg.make({msg:res.message});
	                }
	            });
			}

		}



        /*完善||修改*/
        $scope.edit=function(dt){
            $window.location.href=["#/main/employee-add","?id=",dt[1]].join("")
        };

        /*查看作品*/
        $scope.showCase=function(dt){
            $window.location.href=["#/main/employee-caseinc-list","?id=",dt[0]].join("");
            $cookieStore.put("employeeCaseName",dt[1])
        };

        /*v1.10.0-角色变更*/
       $scope.caseInfo=null;
       	$scope.roleChange=function(dt){
       		$scope.employeeType=null;
       		$scope.userInfo={
       			"userId":dt[0],
       			"name":dt[1],
       			"showHead":dt[2] //头像
       		}

			angular.element('.createDialog-roleChange').modal({backdrop: 'static', keyboard: false});
			$http.get([$window.API.EMPLOYEE.EMPLOYEE_PUB,"/",$scope.userInfo.userId,"/changejob"].join("")).success(function(res){
				//console.log(res)
				if(res.stateCode===0&&res.data){
					$scope.caseInfoDtos=res.data.caseInfoDtos;//作品
					$scope.employeeInfoDtos=res.data.employeeInfoDtos;//接管员工
					$scope.employeeTypes=res.data.employeeTypes;//用户角色

					$scope.sigleSelectUser=[];//作品列表后面的每一个下拉框选中的值(userId)的集合。
					/*监控每个下拉框选择的userId*/
					$scope.$watch("sigleSelectUser",function(userIdArr){
						if(userIdArr.length===$scope.caseInfoDtos.length){
							for(var i in userIdArr){
								if(userIdArr[i]===null){
									$scope.caseInfo=null;
									break;
								}else {
									$scope.caseInfoDtos[i].userId=userIdArr[i];
									$scope.caseInfo=$scope.caseInfoDtos;
								}
							}
						}else {
							$scope.caseInfo=null;
						}
					},true)	//false时，其实watch函数监视的是数组的地址，而数组的内容的变化不会影响数组地址的变化

				}else {
                    errorMsg.make({msg:res.message});
                }
			})
			/*监控统一接管*/
			$scope.unifyTakeOver=false;
			$scope.$watch("unifyTakeOver",function(newV,oldV){
				if(newV){
					$scope.forbidSelect=true;
				}else {
					$scope.forbidSelect=false;
				}
			})



       	}
        /*v1.10.0-角色变更-提交变更dialog*/
        $scope.submitRoleChange=function(userId,caseInfo,unifySelectUser,employeeType){
			/*有作品*/
			if(caseInfo){
				/*统一接管*/
				if($scope.unifyTakeOver){
					//请选择统一接管员工
					if(!unifySelectUser) {
						$scope.userInfo.errorMsg="请选择统一接管员工";
			        	return false;
					}
					//请选择用户角色
					if(!employeeType){
		        		$scope.userInfo.errorMsg="请选择用户角色";
		        		return false;
		        	}
					$scope.userInfo.errorMsg=null;
					//将userId换成选择的那个人的id
		        	angular.forEach(caseInfo,function(data,index,array){
		        		data.userId=unifySelectUser;
		        	})
		        	var data = {
						"caseInfoDtos":caseInfo,
						"employeeType":employeeType
					}
		        /*单个接管*/
				}else {
					if(!$scope.caseInfo){
						$scope.userInfo.errorMsg="请选择所有作品对应的接管员工";
		        		return false;
					}
					//没有选当前员工角色变更为谁
					if(!employeeType){
		        		$scope.userInfo.errorMsg="请选择用户角色";
		        		return false;
		        	}
					$scope.userInfo.errorMsg=null;
					var data = {
						"caseInfoDtos":$scope.caseInfo,
						"employeeType":employeeType
					}
				}
			/*无作品*/
			}else {
				//没有选当前员工角色变更为谁
				if(!employeeType){
	        		$scope.userInfo.errorMsg="请选择用户角色";
	        		return false;
	        	}
				$scope.userInfo.errorMsg=null;
				var data = {
					"caseInfoDtos":[],
					"employeeType":employeeType
				}
			}
        	$http({ url:[$window.API.EMPLOYEE.EMPLOYEE_PUB,"/",userId,"/changejob"].join(""), method:'post',data:data}).success(function(res){
        		//console.log(res)
                if(res.stateCode===0){
                    successMsg.make({msg:'提交变更成功!'});
                    angular.element('.createDialog-roleChange').modal('hide');
                    $scope.refresh();
                }else{
                    errorMsg.make({msg:res.message});
                }

            });
        }
        $scope.closeDialogRoleChange=function(){
        	$scope.unifyTakeOver=false;//将统一接管设置为不选中
        	$scope.employeeType=null;//将员工角色变更下拉框设置为默认不选中。
        	//console.log($scope.employeeType);
        }

    }]);



/**
*员工管理  > 员工列表 > 员工作品
*/

sysController.controller("EmployeeCaseIncListController", ["$scope", "$http", "$window", "$grid","$cookieStore",
    function ($scope, $http, $window, $grid,$cookieStore) {
        var id=get_param($window.location.href, "id");
        $scope.employeeCaseName= $cookieStore.get("employeeCaseName");
        $grid.initial($scope, [$window.API.EMPLOYEE.EMPLOYEE_INC_CASE,"/",id].join("") );
    }]);



/**
 *员工管理  > 新增/修改员工管理
 */

sysController.controller("EmployeeAddController", ["$scope", "$http", "$window", "$cookieStore","$timeout","$province","$city","$area","$validate","GET_TOKEN","QINIU","$dateTool","$filter",
    function ($scope, $http,$window,$cookieStore,$timeout,$province,$city,$area,$validate,GET_TOKEN,QINIU,$dateTool,$filter) {

        /*初始化-获得奖项日期*/
        var date = new Date();
        $dateTool.ele('.form_datetime_start',{
            startDate:"1950-01-01",
            endDate:date.toLocaleDateString().replace(/\//g,"-"),
            format: "yyyy",
            minView:4,
            startView:4
        });

        /*调用七牛上传*/
        var maxLen=10,minLen=1;
        GET_TOKEN();
        QINIU.OPTION.uptoken=$cookieStore.get("UPTOKEN");
        QINIU.FUN(maxLen,minLen,$scope);
        QINIU.FileUploaded({types:1,maxLen:maxLen,minLen:minLen});//多图
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"lifePhotos",multi_selection: true}));
        QINIU.FileUploaded({scope:$scope});//图片模块上传
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"upPhotosBtn",multi_selection: false}));

        QINIU.FileUploaded();//获得奖项 1张
        Qiniu.uploader($.extend(QINIU.OPTION,{browse_button:"prizeBtn",multi_selection: true}));

        /*数据验证规则*/
        $scope.pubRegex=$validate.pubRegex.rule;

        // 价格验证,填写则必验证 整数
        $scope.validateFun = $validate.validatePriceInt;

        var infoData={},
            errLen,
            upErrLen,
            id=get_param($window.location.href, "id"),
            type=get_param($window.location.href, "type"),
            nodes=angular.element(".form-control");
        $scope.isAdd=id?true:false;
            if(id){
                $scope.t = 2;//修改
            }else {
                $scope.t = 1;//新增
            }

        //获取数据
        $scope.employeeInfo={};
        $scope.award={};
        $scope.employeeInfo.mediaInfoDtos=[];//媒体报道-数组
        $scope.employeeInfo.prizeTextDtos=[];//获得奖项-数组
        $scope.employeeInfo.isCall=0; //是否电话预约
        $scope.articleList=[];
        var headImage=angular.element("#headImage").nextAll(".img-show-box"),
            lifePhotos=angular.element("#lifePhotos").nextAll(".img-show-box"),
            prizeImgs = angular.element("#prizeBtn").nextAll(".img-show-box");



        if(id||type){
            function api(){
                if(id){
                    return   $http.get([window.API.EMPLOYEE.EMPLOYEE_GET_INFO,"/",id,"/detail"].join(""))
                }else if(type=='open'){
                    return  $http.get([window.API.EMPLOYEE.EMPLOYEE_GET_B_INFO].join(""))
                }
            }
            api().success(function(res){
				console.log(res)
                if(!res.stateCode){
                    $scope.employeeInfo=res.data.employeeDto||{};
                    if(type){
                        $scope.employeeInfo.name=res.data.name;
                        $scope.employeeInfo.userPhone=res.data.phone;
                        $scope.employeeInfo.canContactByPhone=true;//设置账户管理-公司信息-开通业者跳转后设置电话联系为"是"
                        $scope.isAddPhone=true;
                    }

                    $scope.employeeInfo.serviceContent=res.data.serviceContent;
                    if(res.data.employeeDto){
                    	res.data.employeeDto.userDetailType?$scope.isAddType=true:"";
                    	res.data.employeeDto.userPhone?$scope.isAddPhone=true:"";
                    	$scope.articleList=res.data.employeeDto.articleList?res.data.employeeDto.articleList:[];
                    	//转字符串 0很特殊
                    	$scope.employeeInfo.canContactByPhone=res.data.employeeDto.publicPhone;
                    }
                    /*模拟数据-start*/
                    /*$scope.employeeInfo.prizeImgs = [
                        "http://o8nljewkg.bkt.clouddn.com/o_1c3rqv5uljljqugisvrs1rt0n.jpg?width=1024&height=768",
                        "http://o8nljewkg.bkt.clouddn.com/o_1c3rqv5ul1ghn856v1jt6b4mdo.jpg?width=1024&height=768",
                        "http://o8nljewkg.bkt.clouddn.com/o_1c3rqv5ul9ml1l742rj10q52knp.jpg?width=1024&height=768"
                    ]
                    $scope.employeeInfo.prizeTextDtos=[
                        {
                            "prizeTime": "2018",
                            "prizeInfo": "红点奖"
                        },
                        {
                            "prizeTime": "2017",
                            "prizeInfo": "金牌奖"
                        },
                        {
                            "prizeTime": "2016",
                            "prizeInfo": "大大的奖"
                        }

                    ];
                    $scope.employeeInfo.mediaInfoDtos=[
                        {
                            "mediaTitle": "title1",
                            "mediaUrl": "htttp://www.baidu.com"
                        },
                        {
                            "mediaTitle": "title2",
                            "mediaUrl": "htttp://www.baidu.com"
                        }
                    ]
                    prizeImgs.attr("data-url",($scope.employeeInfo.prizeImgs).join()).html(QINIU.creatDom(($scope.employeeInfo.prizeImgs).join()));
                    /*模拟数据-end*/

                    headImage.attr("data-url",$scope.employeeInfo.headImage).html(QINIU.creatDom($scope.employeeInfo.headImage));
                    lifePhotos.attr("data-url",$scope.employeeInfo.lifePhotos).html(QINIU.creatDom($scope.employeeInfo.lifePhotos));
                    if(res.data.prizeImgs){
                        prizeImgs.attr("data-url",(res.data.prizeImgs).join()).html(QINIU.creatDom((res.data.prizeImgs).join()));
                    }
                    /*服务端返回的获得奖项日期是时间戳，这里转换为年*/
                    if(res.data.prizeTextDtos){
                        $scope.employeeInfo.prizeTextDtos= res.data.prizeTextDtos.filter(function(v,i){
                            v.prizeTime=fmtDate(v.prizeTime);
                            return v;
                        });
                    }else {
                        $scope.employeeInfo.prizeTextDtos=[];//不能少，少了就不显示添加获得奖项按钮了
                    }
                    $scope.employeeInfo.mediaInfoDtos=res.data.mediaInfoDtos?res.data.mediaInfoDtos:[];

                    function fmtDate(timestamp){
                        var newTime = new Date(timestamp);
                        return result=newTime.getFullYear();
                    }

                }
            });

        }
        /**
         * [添加获得奖项]
         * @param  {[type]} dt [description]
         * @return {[type]}    [description]
         */
        $scope.addMore = function(dt) {
            var dt=angular.copy(dt)||{};
            if(!dt.prizeTime){
                $scope.addMoreErr = "请选择日期！"
                return false;
            }
            if(!dt.prizeInfo){
                $scope.addMoreErr = "请填写相关奖项！"
                return false;
            }


            $scope.employeeInfo.prizeTextDtos.push(dt);
            $scope.award={};
            $scope.addMoreErr="";
        }
        /**
         * [删除获得奖项]
         * @param  {[type]} dt [description]
         * @param  {[type]} i  [description]
         * @return {[type]}    [description]
         */
        $scope.delMore = function(dt,i) {
            if(dt){
                $scope.employeeInfo.prizeTextDtos.splice(i,1)
            }
        }




        /**
         * [添加媒体报道]
         * @param  {[type]} dt [description]
         * @return {[type]}    [description]
         */
        $scope.addMoreMedia = function(dt) {
            var dt=angular.copy(dt)||{};
            if(!dt.mediaTitle){
                $scope.addMoreMediaErr = "请填写题目！"
                return false;
            }
            if(!dt.mediaUrl){
                $scope.addMoreMediaErr = "请填写相关报道链接！"
                return false;
            }
            $scope.employeeInfo.mediaInfoDtos.push(dt);
            $scope.m={};
            $scope.addMoreMediaErr="";
        }
        /**
         * [删除媒体报道]
         * @param  {[type]} dt [description]
         * @param  {[type]} i  [description]
         * @return {[type]}    [description]
         */
        $scope.delMoreMedia = function(dt,i) {
            if(dt){
                $scope.employeeInfo.mediaInfoDtos.splice(i,1)
            }
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
                    sizeObj={width:320,height:320},
                    dataURL = $image.cropper("getCroppedCanvas", sizeObj ),
                    imgCode64 = dataURL.toDataURL("image/jpeg",1),
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
                    headImage.attr("data-url",resSrc).html(QINIU.creatDom(resSrc));
                })
            }
        }



        /*获取下拉常用参数*/
        $http.get([$window.API.EMPLOYEE.EMPLOYEE_GET_TYPES].join("")).success(function(res){
            if(!res.stateCode){
                $scope.detailTypes =res.data.detailTypes;//列表角色
            }
        });
        //是否设置收费标准,仅设计
        $scope.$watch("employeeInfo.userDetailType",function(data){
            if(data===3||data===2){
                $scope.isService=false;
            }else{
                $scope.isService=true;
            }
        });

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
                    selector.attr("data-url",dt['addData'].thumb).html(QINIU.creatDom(dt['addData'].thumb));
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
                    $scope.createPhotoInfo.thumb=attr;

                    if(!data.title){
                        $scope.createPhotoInfo.errorMsg="名称30字符内，不能为纯数字!";
                        return false
                    }
                    if(!data.thumb){
                        $scope.createPhotoInfo.errorMsg="请上传图片！";
                        return false
                    }
                    if(!data.url){
                        $scope.createPhotoInfo.errorMsg="请输入微信文章链接!";
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





        //修改信息
        var API=function(info){
            //console.log(info)
            var url_add=$window.API.EMPLOYEE.EMPLOYEE_ADD,
                url_edit=$window.API.EMPLOYEE.EMPLOYEE_EDIT,
                url_open_e=$window.API.EMPLOYEE.EMPLOYEE_OPEN_E;
            return type? $http({ url:[url_open_e].join(""), method:'post',data:info }):id ? $http({ url:[url_edit,"/",id,"/update"].join(""), method:'post',data:info }):$http({ url:url_add, method:'POST',data:info});
        };

        $scope.submit=function(dt){
            console.log(dt)
            $scope.employeeInfo.headImage=headImage.attr("data-url");
            $scope.employeeInfo.lifePhotos=lifePhotos.attr("data-url");
            $scope.employeeInfo.prizeImgs=prizeImgs.attr("data-url")?prizeImgs.attr("data-url").split(","):[];

            var info=angular.copy(dt[0]);
            console.log(info)
            infoData.userPhone=info.userPhone;
            infoData.name=info.name;
            infoData.userDetailType=info.userDetailType;
            infoData.headImage=info.headImage;
            infoData.lifePhotos=info.lifePhotos;
            infoData.canContactByPhone=info.canContactByPhone;
            infoData.resume=info.resume;
            infoData.articleList= $scope.articleList;
            infoData.serviceContent=info.serviceContent;
            infoData.prizeImgs = info.prizeImgs;
            infoData.prizeTextDtos = info.prizeTextDtos;
            infoData.mediaInfoDtos = info.mediaInfoDtos;


            /*验证*/
            dt[1]?nodes.blur().removeClass("rmcolor"):nodes.addClass("rmcolor").blur();
            /*图片验证*/
            $validate.UpImgValidate({"selector":".img-show-box:not('.create-dialog ,.awardShow')","bl":dt[1]});


            /*请求*/
            $timeout(function(){
               var nodeErr=angular.element(".err"),
                   nodeUpErr=angular.element(".upErr"),
                   required=angular.element(".required.err");


                dt[1]?nodeErr.first().focus():required.first().focus();
                errLen=nodeErr.length;
                upErrLen=nodeUpErr.length;

                //console.log("errLen:"+errLen+"|"+upErrLen);
                if(errLen<1&&upErrLen<1){

                    if(infoData.prizeImgs.length!=0&&infoData.prizeTextDtos.length===0){
                        alert("请添加获得奖项!");
                        return false;
                    }



                    $scope.ispostIng=true;
                    /*del data*/
                    delete infoData.showHead;
                    delete infoData.showName;
                    delete infoData.userDetailTypeDesc;
                    delete infoData.idCard;

                    console.log(infoData);
                    // return false;
                    API(infoData).success(function(res){
                    	console.log(res)
                        $scope.ispostIng=false;
                        if(res.stateCode===361){
                        	angular.element('.errorToast').modal({backdrop: 'static', keyboard: false});
                        	$scope.errorMsgToastDesc = res.message;
                        	$scope.iKnow=function(){
                        		angular.element('.errorToast').modal('hide');
                        	}
                        }
                        if(!res.stateCode){
                            type?successMsg.make({msg:"开通成功，业者信息请在员工列表进行修改或查看，密码与管理员密码相同。",second:5}):successMsg.make({msg:"提交成功！"});
                            $timeout(function(){
                                $window.location.href="#/main/employee";
                            });
                        }else if(res.stateCode !==361){
                            errorMsg.make({msg:res.message});
                        }

                    })
                }

            });
        };
    }]);

/**
*员工管理  > 推客列表
*/
sysController.controller("TwitterListController", ["$scope", "$http", "$window", "$cookieStore", "$timeout", "$grid",
    function($scope, $http, $window, $cookieStore, $timeout, $grid) {
        $grid.initial($scope, [$window.API.TWITTER.TWITTER_LIST].join(""),{orderBy:"createTime"});

        // 进入推客详情
        $scope.show = function(id) {
            $window.location.href = ["#/main/twitter-list-info?id=", id].join("");
        }

        var postData={};
        postData.orderBy="createTime";
        $scope.submitSearch=function(dt){
            var dt=angular.copy(dt)||{};
            dt.queryKey?postData.queryKey=dt.queryKey:postData.queryKey="";
            $scope.filtering(postData);
        };

        /*推客类型选择*/
        $scope.$watch('list.twitterType',function(dt){
            if(dt){
                postData.twitterType=dt==-1?"":dt;
                $scope.filtering(postData);
            }
        });

        /*推客状态选择*/
        $scope.$watch('list.twitterStatus',function(dt){
            if(dt){
                postData.twitterStatus=dt==-1?"":dt;
                $scope.filtering(postData);
            }
        });

    }]);

/**
*员工管理  > 推客列表 > 推客详情
*/
sysController.controller("TwitterInfoController", ["$scope", "$http", "$window", "$cookieStore", "$timeout", "$filter",
    function($scope, $http, $window, $cookieStore, $timeout, $filter) {
        var id=get_param($window.location.href, "id");
        $scope.dataInfo = {};

        // 获取推客详情
        $http.get([$window.API.TWITTER.TWITTER_INFO,id].join("")).success(function (res){
            if (res.succ) {
                $scope.dataInfo = res.data;

                $scope.twitterActive = function(arg) {
                    if (arg == 0) {
                        return 'twitter-active';
                    }
                }

                $scope.twitterInvalid = function(arg) {
                    if (arg == 0) {
                        return 'twitter-invalid';
                    }
                }

            }
            else {
                errorMsg.make({msg:res.message});
            }
        });

        // 删除商品
        $scope.deleteCase = function(caesId) {
            var index = this.$index;
            var infoData = {};
            infoData.caseList = [];
            infoData.caseList.push(caesId);

            $http({ url:[window.API.TWITTER.TWITTER_CASE_DELETE,id,"/case/delete"].join(""), method:'post',data:infoData}).success(function (res){
                if(res.succ){
                    successMsg.make({msg:"删除成功！"});
                    $(".content-box-model").find(".twitter-case").eq(index).hide();
                }else{
                    errorMsg.make({msg:res.message});
                }
            })
        }

        //弹出框
        $scope.bootDialog = function(s) {
            $scope.dialog = {"data":{}, "title":s.title};

            $http.get([window.API.TWITTER.TWITTER_CASE,id,"/case"].join("")).success(function (res) {
                if (res.succ) {
                    $scope.twitterCaseList=res.data;
                    if ($scope.twitterCaseList) {
                        $scope.dialog = {"data":{}, "title":s.title, "confirm": true};
                    }
                    else {
                        $scope.dialog = {"data":{}, "title":s.title, "confirm": false};
                    }
                } else {
                    errorMsg.make({msg:res.message});
                };
            });
        }

        $scope.submit = function(dt) {
            var checkedList = angular.element("input:checked");

            if (checkedList.length === 0) {
                angular.element(".twitter-tips").show();
                return false;
            }

            console.log(checkedList);
            var arr = [];
            var infoData = {"caseList":[]};
            angular.forEach(checkedList, function(data) {
                var self = data;
                var item = {};
                item.id = self.dataset.caseid*1;
                item.caseCover = self.dataset.casecover;
                item.caseName = self.dataset.casename;

                infoData.caseList.push(item.id);
                arr.push(item);
            });

            $http({ url:[window.API.TWITTER.TWITTER_CASE_ADD,id,"/case"].join(""), method:'post',data:infoData}).success(function (res){
                if (res.succ) {
                    successMsg.make({msg:"添加成功！"});
                    angular.element('.caseModal').modal('hide');
                    if ($scope.dataInfo.caseBasicVos) {
                        $scope.dataInfo.caseBasicVos = $scope.dataInfo.caseBasicVos.concat(arr);
                    }
                    else {
                        $scope.dataInfo.caseBasicVos = arr;
                    }
                } else {
                    errorMsg.make({msg:res.message});
                };
            });



        }

    }]);
