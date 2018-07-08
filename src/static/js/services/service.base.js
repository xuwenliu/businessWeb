/**
 * base service
 */
var sysService = angular.module("sysService", ["ngCookies"]);

sysService.service("$grid", ["$rootScope", "$http", "$cookieStore",
    function ($rootScope, $http, $cookieStore) {
        var defaultParams = function (data) {
            return {
                // key: $cookieStore.get("key"),
                orderBy: "updateTime",
                isAsc:false,
                pageNum: 1,
                pageSize: data
            };
        };

        this.initial = function (scope, url, options) {
            options = options || {};
            scope.pageSizes = [10, 20, 40];
            if(scope.pageSize){
            }else{
                scope.pageSize = 20;
            }

            var self = angular.copy({});
            self.pageSize = scope.pageSize;
            self.url = url;

            self.defaultParams = defaultParams(scope.pageSize);
            if (!_.isEmpty(options)) {
                angular.forEach(_.keys(options), function (value, key) {
                    //if (_.has(self.defaultParams, value)) {
                    self.defaultParams[value] = options[value];
                    //}
                })
            }

            self.urlWithDefaultParams = function () {
                var key = "a";

                if (key) {
                    return [self.url, "?", $.param(self.defaultParams)].join("")
                } else {
                    return self.url;
                }
            };

            self.urlWithParams = function (params) {
                params = params || {};
                return [self.restPage.currentUri, "&", $.param(params)].join("");
            };

            self.replacePageNumber = function (newPage) {
                return replaceString(self.restPage.currentUri, "pageNum=", "&", ["pageNum=", newPage].join(""));
            };

            self.replacePageSize = function (newSize) {
                return replaceString(self.restPage.currentUri, "pageSize=", "&", ["pageSize=", newSize].join(""));
            };

            self.restPage = {};

            self.restGet = function (url) {
                console.log(url)
                $http.get(url).success(function (data) {
                    if(data.stateCode===0 && data.data){
                        var getdata=data.data;
                        getdata.currentUri=url;
                        getdata.currentPageNum<getdata.totalPageNum?getdata.nextUri=replaceString( getdata.currentUri, "pageNum=", "&", ["pageNum=", (getdata.currentPageNum)+1].join("")):"";
                        getdata.currentPageNum>1?getdata.previousUri=replaceString( getdata.currentUri, "pageNum=", "&", ["pageNum=", (getdata.currentPageNum)-1].join("")):"";
                        self.restPage = scope.grid = scope.pagination = getdata;
                        console.log(getdata);
                    }
                })
            };

            self.restPost = function (url, params) {
                $http.post(url, params).success(function (data) {
                    if(data.stateCode===0 && data.data){
                        var getdata=data.data;
                        getdata.currentUri=url;
                        getdata.currentPageNum<getdata.totalPageNum?getdata.nextUri=replaceString( getdata.currentUri, "pageNum=", "&", ["pageNum=", (getdata.currentPageNum)+1].join("")):"";
                        getdata.currentPageNum>1?getdata.previousUri=replaceString( getdata.currentUri, "pageNum=", "&", ["pageNum=", (getdata.currentPageNum)-1].join("")):"";
                        self.restPage = scope.grid = scope.pagination = getdata;
                    }

                })
            };

            self.load = function () {
                self.restGet(self.urlWithDefaultParams());
            };
            self.currentSort = {};

            self.resetSort = function (key) {
                return _.mapObject(self.currentSort, function (v, k) {
                    if (k != key) {
                        return "";
                    } else {
                        return v
                    }
                })
            };

            scope.filtering = function (params,url) {


                // params.key = $cookieStore.get("key");
                !params.orderBy ? params.orderBy = "updateTime":"";
                params.isAsc=false;
                params.pageSize = self.pageSize;
                params.pageNum = 1;
                if(url){
                    var url_ = [url, "?", $.param(params)].join("");
                    self.restGet(url_);
                }
                else{
                    var url = [(self.url).split("?")[0], "?", $.param(params)].join("");
                    self.restGet(url);
                }

            };

            scope.postFiltering = function (params) {
                var pageParams = {};
                // pageParams.key = $cookieStore.get("key");
                pageParams.orderBy = "updateTime ";
                pageParams.isAsc=false;
                pageParams.pageSize = self.pageSize;
                pageParams.pageNum = 1;
                url = [self.url, "?", $.param(pageParams)].join("");
                self.restPost(url, params)
            };

            scope.pageLoadingCompleted = function () {
                // console.log("翻页完成");
            };


            scope.sort = function (colName) {
                if (colName) {
                    if (_.isEmpty(self.currentSort)) {
                        self.currentSort[colName] = true;
                    } else {
                        self.currentSort = self.resetSort(colName);
                        self.currentSort[colName] = !self.currentSort[colName]
                    }

                    var orderBy = "";
                    var isAsc = true;
                    if (self.currentSort[colName]) {
                        orderBy = colName;
                        isAsc=true;
                    } else {
                        orderBy = colName;
                        isAsc=false;
                        //orderBy = ["-", colName].join("");
                    }

                    var urlTemp = replaceString(self.restPage.currentUri, "orderBy=", "&", ["orderBy=", orderBy].join("")),

                        url=replaceString(urlTemp, "isAsc=", "&", ["isAsc=", isAsc].join(""));

                    scope.currentSort = self.currentSort;

                    self.restGet(url);
                }
            };

            scope.filter = function () {

            };

            scope.pageNumberChanged = function (newPage) {

                var page = newPage;
                if (scope.pagination) {
                    if (parseInt(newPage) < 1) {
                        scope.pagination.currentPageNum = 1;
                        page = 1
                    }
                    if (parseInt(newPage) > scope.pagination.totalPageNum) {
                        scope.pagination.currentPageNum = scope.pagination.totalPageNum;
                        page = scope.pagination.totalPageNum
                    }

                    self.restGet(self.replacePageNumber(page))
                }
            };

            scope.pageSizeChanged = function (newSize) {
                scope.pageSize = newSize;
                self.pageSize = newSize;
                var url = self.replacePageSize(newSize);
                url = replaceString(url, "pageNum=", "&", "pageNum=1");
                self.restGet(url);
            };

            scope.pre = function () {
                if (self.restPage && self.restPage.previousUri) {
                    self.restGet(self.restPage.previousUri);
                } else {
                    return false;
                }
            };
            scope.next = function () {
                //console.log(self.restPage+" "+self.restPage.next)
                if (self.restPage && self.restPage.nextUri) {
                    self.restGet(self.restPage.nextUri);
                } else {
                    return false;
                }
            };
            scope.first = function () {
                if (self.restPage.currentPageNum != 1) {
                    self.restGet(self.replacePageNumber(1))
                }
            };
            scope.last = function () {
                if (self.restPage.currentPageNum != self.restPage.totalPageNum) {
                    self.restGet(self.replacePageNumber(self.restPage.totalPageNum))
                }
            };
            scope.refresh = function () {
                self.restGet(self.restPage.currentUri)
            };

            self.load();

            return self
        };

    }]);

sysService.service("$checkBox", ["$rootScope",
    function ($rootScope) {
        this.enableCheck = function (scope, tableId) {
            scope.checkAll = function () {
                var selector = ["#", tableId, " :checkbox"].join("");
                var checkBoxes = angular.element(selector);
                angular.forEach(checkBoxes, function (v, k) {
                    angular.element(v).prop("checked", true)
                });

                scope.checkAllCompleted();
            };
            scope.checkInverse = function () {
                var selector = ["#", tableId, " :checkbox"].join("");
                var checkBoxes = angular.element(selector);
                angular.forEach(checkBoxes, function (v, k) {
                    angular.element(v).prop("checked", !angular.element(v).prop("checked"));
                });

                scope.checkInverseCompleted();
            };

            scope.checkAllCompleted = function () {
                console.log("全选完成");
            };

            scope.checkInverseCompleted = function () {
                console.log("反选完成");
            }
        }
    }]);

sysService.service("$category", ['$http', '$cookieStore', function ($http, $cookieStore) {
    this.get = function () {
        return $http.get([window.API.SYSTEM.GET_CATEGORIES, "?key=", $cookieStore.get("key")].join(""));
    }
}]);


/*城市联动*/

sysService.service("$province", ['$http', function ($http) {
    this.get = function () {
        return $http.get([window.API.OTHER.PROVINCE].join(""));
    }
}]);
sysService.service("$city", ['$http', function ($http) {
    this.get = function (data) {
        return $http.get([window.API.OTHER.CITY, "?provinceId=", data.id].join(""));
    }
}]);
sysService.service("$area", ['$http', function ($http) {
    this.get = function (data) {
        return $http.get([window.API.OTHER.COUNTY, "?cityId=",  data.id].join(""));
    }
}]);




sysService.service("$trades", ["$http", "$cookieStore", "$window", function ($http, $cookieStore, $window) {
    this.get = function (data) {
        return $http.get([$window.API.SYSTEM.GET_TRADES, "?area=", data].join(""));
    }
}]);

sysService.service("$districts", ["$http", "$cookieStore", "$window",
    function ($http, $cookieStore, $window) {
        this.get = function (data) {
            return $http.get([$window.API.SYSTEM.GET_DISTRICTS, "?key=", $cookieStore.get("key"), "&", $.param(data)].join(""));
        }
    }]);


sysService.factory("getSelectName",["$http",function(){
    return function(data,id,key,keyid){ // 数据 id值 自定义需要的key名,自定义的ID key名
        for( var k in data){
            if(keyid?data[k][keyid]==id:data[k].id==id){
                if(key){
                    return data[k][key];
                }else{
                    return data[k]["name"];
                }
            }
        }
    }

}]);

/**
 *
 * get uptoken
 */

sysController.factory("GET_TOKEN",["$timeout","$http","$cookieStore",function($timeout,$http,$cookieStore){
    return function(dt){
        if(dt&&dt.v){
            $http.get(window.API.OTHER.QNV_UPTOKEN).success(function (res) {
                $cookieStore.put("UPTOKENV",res.data);
            });
        }else{
            $http.get(window.API.OTHER.QINIU_UPTOKEN).success(function (res) {
                $cookieStore.put("UPTOKEN",res.data);
            });

        }

    }
}]);



/**
 *
 * QINIU
 */
sysService.factory("QINIU",["$timeout","$http","$cookieStore",function($timeout,$http,$cookieStore){
    var QINIU={};
    QINIU.imgWordHtml=function(opt){
        var option=opt||{};
            option.picsV= [opt.pics+"&imageView2/1/w/80/h/80"];

        var strs="<div class='img-show img-words-box pr  ' style='display:block; background: #f4f4f4; padding: 8px 30px 8px 8px'>" +
            "<i class='pa f12 c-999 cursor pre ' style='width: 12px; right: 6px' >上移</i> " +
            "<i class='pa f12 c-999 cursor next' style='width: 12px; margin-top: 50px;right: 6px'>下移</i>"+
            "<a  data-target='.myModal'   data-toggle='modal' class='preview-img cursor' >" +
            "<img src=" + option.picsV[0] + "  data-img="+ option.pics[0]+" style='border: none;' /></a><i class='remove-img'>x</i>" +
            "<span class='f12 lh220' style='width: auto; text-align: left; padding-top: 4px'>" +
            "<input type='hidden' class='img-words-url' value='"+option.pics[0]+"' />"+
            "名称：<input  class='form-control inline-block input-sm img-words-name'  value='"+(option.title||'')+"' style='width: 600px; ' type='text'  maxlength='30'  placeholder='名称30字符内，不能为纯数字'  autocomplete='off'>" +
            "<br class='lh220'>描述：<textarea class='form-control inline-block input-sm img-words-desc'   style='width: 600px;margin-top: 4px; '  rows='2'  maxlength='500' placeholder='500字以内'>"+(option.explain||'')+"</textarea>" +
            "</span>"+
            "</div>"
        return strs

    }

    QINIU.creatDom=function(d,isImgWord){

        var dt="";
        var isImgWord=(isImgWord===undefined?false:isImgWord);

        if(d){
            if(d.indexOf(",")>-1){
                var str="",arr=d.split(",");
                for(var i=0; i<arr.length;i++){
                    str+="<p class='img-show'><a  data-target='.myModal'   data-toggle='modal' class='preview-img cursor' ><img src=" + arr[i] + IMG60x60 + "  data-img="+arr[i]+" /></a><i class='remove-img'>x</i></p>"
                }
                dt=str;
            }else {
                dt=isImgWord?QINIU.imgWordHtml({pics:[d]}):"<p class='img-show'><a  data-target='.myModal'   data-toggle='modal' class='preview-img cursor' ><img src=" + d + IMG60x60 + "  data-img="+d+" /></a><i class='remove-img'>x</i></p>"
            }
        }
        return dt
    };



    QINIU.OPTION={
        runtimes: 'html5,flash,html4',    //上传模式,依次退化
        //uptoken_url: window.API.OTHER.QINIU_UPTOKEN,            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
        //uptoken:QINIU.GET_TOKEN(), //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
        //uptoken_func:"",
        unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
        // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
        domain:'http://o8nljewkg.bkt.clouddn.com/',//'http://7xpjmx.com2.z0.glb.qiniucdn.com/',//'http://o8nljewkg.bkt.clouddn.com/',//'/',   //bucket 域名，下载资源时用到，**必需**
        get_new_uptoken: false,  //设置上传文件的时候是否每次都重新获取新的token
        //container: 'upImagesBox',           //上传区域DOM ID，默认是browser_button的父元素，
        max_file_size: '20mb',           //最大文件体积限制
        flash_swf_url: '/static/libs/plupload/js/Moxie.swf',  //引入flash,相对路径
        max_retries: 3,                   //上传失败最大重试次数
        dragdrop: false,                   //开启可拖曳上传
        chunk_size: '4mb',                //分块上传时，每片的体积
        auto_start: true,              //选择文件后自动上传，若关闭需要自己绑定事件触发上传
        multi_selection: false,//时候支持同时选择多个文件
        filters: {
            mime_types : [
                {title : "Image files", extensions: "jpg,jpeg,png"}
            ]
        },
        init: {
            'FilesAdded': function (up, files) {

                plupload.each(files, function (file) {

                });
            },
            'BeforeUpload': function (up, file) {

            },
            'UploadProgress': function (up, file) {
                btn=up.getOption('browse_button')[0].id;
                $("#"+btn+" i").text(file.percent+"%");
            },
            'Error': function (up, err, errTip) {
                btn=up.getOption('browse_button')[0].id;
                $("#"+btn+" i").text("(上传失败!)");
            },
            'UploadComplete': function () {},
            'Key': function (up, file) {
                var key = "";
                return key
            }
        }

    };

    QINIU.FUN=function(maxLength,minLen,scope,cb){

        /*查看大图*/
        var eo=angular.element(".img-show-box");
        eo.on("click",".preview-img",function(){
            var url=$(this).find("img").attr("data-img");
            $timeout(function(){
                scope.preview=url;
            })
        });

        /*删除图片*/
        eo.on("click",".remove-img",function(){
            var t=$(this).parents(".img-show-box"),
                arr=t.attr("data-url").split(","),
                n=arr.length;
                console.log(t)
            if(n>1){
                var url=$(this).prev("a").find("img").attr("data-img"),
                    newArr=arr.filter(function(j){
                        return j!=url;
                    });

                t.attr("data-url",newArr);
                if(n<=maxLength){
                    t.next("i.upErr").remove();
                    t.prevAll(".btn").attr("disabled",false)
                }
                console.log(minLen)
                if(n<=minLen){
                    t.next("i.upErr").remove();
                    t.after("<i class='upErr c-red f12 inline-block'>至少上传"+minLen+"张</i>");
                }
                $(this).parents(".img-show").remove();
            }
            else{
                t.attr("data-url","").html("");
                cb?cb(t.parents("tr").next('tr#isStartTime,tr#isEndTime')):"";// 回调
            }
        })
    };

    QINIU.FileUploaded=function(m){
        QINIU.OPTION.init.FileUploaded=function (up, file, info) {
            var domain = up.getOption('domain'),
                res = JSON.parse(info),
                btn=up.getOption('browse_button')[0].id,
                sourceLink = domain + res.key,
                o=$("#"+btn).nextAll(".img-show-box");




            var reader = new FileReader();
            reader.readAsDataURL(file.getNative());
            reader.onload = (function (e) {
                var image = new Image();
                image.src = e.target.result;
                image.onload = function () {

                    var sizes="?width="+this.width+"&height="+this.height;
                    sourceLink=sourceLink+sizes;
                    console.log(sourceLink)

                    if(!!m &&!m.scope){
                        var upImgArr=[];
                        if(o.attr("data-url")){
                            var arr_=o.attr("data-url").split(",");
                            upImgArr=arr_;
                            upImgArr.push(sourceLink);
                        }else{
                            upImgArr.push(sourceLink)
                        };

                        //console.log(upImgArr)
                        o.find("em").remove();
                        if(upImgArr.length<= m.maxLen){
                            o.attr("data-url",upImgArr).append(QINIU.creatDom (sourceLink,(m.isImgWord===undefined?false:m.isImgWord)));
                            if(upImgArr.length< m.minLen){
                                o.next("i.upErr").remove();
                                o.after("<i class='upErr c-red f12 inline-block'>至少上传"+m.minLen+"张</i>");
                            }else{
                                o.next("i.upErr").remove();
                            }

                        }else if(upImgArr.length> m.maxLen){
                            $("#"+btn).attr("disabled",true);
                            if(o.next("i").length<1){
                                o.after("<i class='upErr c-red f12 inline-block'>最多上传"+m.maxLen+"张</i>");
                                $timeout(function(){
                                    o.next("i").remove();
                                },1000)
                            }
                        }

                    }else{
                        o.attr("data-url",sourceLink).html( QINIU.creatDom (sourceLink));

                        up.getOption("cb")&& up.getOption("cb")();
                    }


                };
            });






            //$.get(sourceLink+"?imageInfo",function(res){
            //    if(!res){
            //        return false
            //    }
            //
            //    var sizes="?width="+res.width+"&height="+res.height;
            //
            //    if(!!m &&!m.scope){
            //        var upImgArr=[];
            //        if(o.attr("data-url")){
            //            var arr_=o.attr("data-url").split(",");
            //            upImgArr=arr_;
            //            upImgArr.push(sourceLink+sizes);
            //        }else{
            //            upImgArr.push(sourceLink+sizes)
            //        };
            //
            //        //console.log(upImgArr)
            //        o.find("em").remove();
            //        if(upImgArr.length<= m.maxLen){
            //            o.attr("data-url",upImgArr).append(QINIU.creatDom (sourceLink+sizes))
            //            if(upImgArr.length< m.minLen){
            //                o.next("i.upErr").remove();
            //                o.after("<i class='upErr c-red f12 inline-block'>至少上传"+m.minLen+"张</i>");
            //            }else{
            //                o.next("i.upErr").remove();
            //            }
            //
            //        }else if(upImgArr.length> m.maxLen){
            //            $("#"+btn).attr("disabled",true);
            //            if(o.next("i").length<1){
            //                o.after("<i class='upErr c-red f12 inline-block'>最多上传"+m.maxLen+"张</i>");
            //                $timeout(function(){
            //                    o.next("i").remove();
            //                },1000)
            //            }
            //        }
            //
            //    }else{
            //        o.attr("data-url",sourceLink+sizes).html( QINIU.creatDom (sourceLink+sizes));
            //        //$timeout(function(){
            //        //    m["scope"].createPhotoInfo.url=sourceLink;
            //        //})
            //    }
            //    $("#"+btn+" i").text("");
            //
            //})





            $("#"+btn+" i").text("");
        }
    };
    return QINIU
}]);

/**
 *
 * QNV
 */
sysController.factory("QNV",["$timeout","$http","$cookieStore",function($timeout,$http,$cookieStore){
    //  上传视频
    var QNV={};
    QNV.defSec=3;
    QNV.OPTION={
        runtimes: 'html5,flash,html4',    //上传模式,依次退化
        //uptoken_url: window.API.OTHER.QINIU_UPTOKEN,            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
        //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
        //uptoken_func:"",
        unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
        // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
        domain:'http://ob24y7hrk.bkt.clouddn.com/', //bucket 域名，下载资源时用到，**必需**
        get_new_uptoken: false,  //设置上传文件的时候是否每次都重新获取新的token
        max_file_size: '300mb',           //最大文件体积限制
        flash_swf_url: '/static/libs/plupload/js/Moxie.swf',  //引入flash,相对路径
        max_retries: 3,                   //上传失败最大重试次数
        dragdrop: false,                   //开启可拖曳上传
        chunk_size: '20mb',                //分块上传时，每片的体积
        auto_start: true,              //选择文件后自动上传，若关闭需要自己绑定事件触发上传
        multi_selection: false,//时候支持同时选择多个文件
        filters: {
            mime_types : [
                {title : "Image files", extensions: "mp4"}//avi,mov,mp4
            ]
        },
        init: {
            'FilesAdded': function (up, files) {
                plupload.each(files, function (file) {
                });
            },
            'BeforeUpload': function (up, file) {
                var btn=up.getOption('browse_button')[0].id;
                var selector= $("#"+btn);
                $("#"+btn+" i").text("");
                selector.nextAll("progress").remove();
                selector.nextAll("em").after("<progress min='0' max='100' value='0'  style='width:240px;' class='block mt10'></progress><i class='f12 c-green' ></i>");
                //QNV.Clear();

            },
            'UploadProgress': function (up, file) {

                var btn=up.getOption('browse_button')[0].id;
                var selector= $("#"+btn);
                $("#"+btn+" i").text("(上传中...)");

                selector.nextAll("progress").val(file.percent);
                selector.nextAll("i").text(file.percent+"%");
                if(file.percent>=100){
                    $timeout(function(){
                        selector.nextAll("progress").remove();
                        selector.nextAll("i").remove();
                    },1000);
                }


            },
            'Error': function (up, err, errTip) {
                var  btn=up.getOption('browse_button')[0].id;
                var errText="code:"+err.code+",msg:"+err.message;
                $("#"+btn+" i").text("（上传失败！"+errText+ "）");
                console.log(err)

            },
            'UploadComplete': function () {},
            'Key': function (up, file) {
                var key = "";
                return key
            }
        }

    };

    QNV.creatVideoNode=function(videoUrl){
        return "<video src='"+videoUrl+"' width='240' height='160' style='background: #000' controls ></video><em class='remove-av'>x</em>"
    };



    QNV.Clear=function(){
       // var picBtn=$("#getVideoPic");
        var t=$(".video-list-content");
        t.attr("data-vurl","").html("");
       // picBtn.prev().val(QNV.defSec).attr("data-duration","");
       // picBtn.attr("disabled",true);
        //picBtn.nextAll("p").text("");
    };

    QNV.FUN=function(opt){
        this.defFun=function(){
            var e=angular.element(".video-list-content"),
                defSec=$(".defSec"),
                that=QNV.defSec;
            defSec.text(that);
            /*删除当前上传的视频*/
            e.on("click",".remove-av",function(){
                QNV.Clear();
            })
        }

    };

    QNV.FileUploaded=function(m){
        QNV.OPTION.init.FileUploaded=function (up, file, info) {
            var domain = up.getOption('domain'),
                res = JSON.parse(info),
                btn=up.getOption('browse_button')[0].id,
                sourceLink = domain + res.key,
                hash=res.hash,
                key=res.key;
            var o=$("#"+btn).nextAll(".video-list-content");

            console.log(JSON.parse(info))

            //持久化格式转换
            $http.get(m.uri).success(function (res) {//"?fileKey="+key
                res.stateCode=0;//临时
                if(!res.stateCode){
                    var formatLink=sourceLink;// 临时
                    var videoUrl=formatLink+"";//视频转码
                    var videoPic=formatLink+"?vframe/jpg/offset/2/w/140/h/80";//获取视频缩略图
                    var videoInfo=formatLink+"?avinfo";//获取视频元信息请求连接

                    $.get(videoInfo,function(res){// 获取视频元信息
                        m['scope'].createVideoInfo.duration=parseInt(res.format.duration);//已取整
                    });
                    o.attr("data-vurl",videoUrl).html(QNV.creatVideoNode(videoUrl));
                    m['scope'].createVideoInfo.url=videoUrl;
                    m['scope'].createVideoInfo.second=QNV.defSec;
                    //重置
                    m['scope'].createVideoShowPics="";
                    m['scope'].createVideoInfo.errorMsg=null;
                }

            });

            $("#"+btn+" i").text("");
        }
    };
    return QNV
}]);




/**
 *
 * $validate
 */
sysService.service("$validate", ["$http", "$cookieStore", "$window", function ($http, $cookieStore, $window) {
    this.pubRegex= {
        rule: {
            price: /^\d{1,12}(\.\d{1,2})?$/,
            short_number: /^[0-9]{1,50}$/,//数字
            number: /^[0-9]{15}$/,//数字
            phonecode: /^[0-9]{6}$/,//验证码
            reNumber: /^.*[^\d].*$/,//非数字
            username:/^[a-zA-Z0-9]{8,20}$/, ///^(?=.*?[a-zA-Z])(?=.*?[0-9])[a-zA-Z0-9]{8,20}$/,//数字字母组合用户名
            password:/^[a-zA-Z0-9]{8,20}$/, // //密码
            phone: /0?(13|14|15|18|17)[0-9]{9}$/,//手机号
            identity: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)|(^\d{14}(\d|X|x)$)/,//身份证
            realname: /^[\u4e00-\u9fa5]{2,10}$/,// 真实姓名
            backname: /^[\u4e00-\u9fa5]{2,50}$/,// 银行、公司姓名
            mergeCert: /(\w{2})(\d{6})(\w{10})/, //三证合一

        }
    };
    /*验证价格*/
    var that=this.pubRegex.rule.price;
    this.validatePrice=function(dt){
        if(dt){
            var v = dt,
                r = that;
            return  !r.test(v)
        }else{
            return false
        }

    };

    var NumInt=this.pubRegex.rule.short_number;
    this.validatePriceInt=function(dt){
        if(dt){
            var v = dt,
                r = NumInt;
            return  !r.test(v)
        }else{
            return false
        }

    };
    /*异步唯一性*/
    this.ajaxValidate=function(scope,url,val,nodeName,errText,bl,oldVal){
        var keyCss=nodeName+"Css",
            keyText=nodeName+"ErrText";
        if(!val){
            scope[keyCss]=true;
            scope[keyText]="";

        }else if(val!=oldVal){
            if(bl){
                bl=false;
                $http.get(url).success(function(res){
                    if(!res.stateCode){
                        if(!res.data){
                            scope[keyCss]=true;
                            scope[keyText]=errText;
                        }else{
                            scope[keyCss]=false;
                            scope[keyText]="";
                        }
                    }
                    bl=true;
                });
            }
        }else{
            scope[keyCss]=false;
        }
    };

    /*图片验证*/
    this.UpImgValidate=function(opt){
        angular.element(opt.selector).each(function(){
            var t=$(this),
                attr=t.attr("data-url"),
                sum=t.attr("data-sum"),
                sumArr=sum?sum.split(","):0;
            if(!attr&&opt["bl"]){
                t.html("<em class='upErr c-red f12' >请上传图片!</em>")
            }else if(attr){
                ////t.next("em.upErr").remove();
                //if(sumArr&&attr.split(",").length<sumArr[1]){
                //    t.next("i").remove();
                //    t.after("<i class='upErr c-red f12'>至少上传"+sumArr[1]+"张图片</i>")
                //}else{
                //    t.next("i").remove();
                //}
            }else{
                t.find("em.upErr").remove();
                t.next("i").remove();
            }
        });
    }
}]);

/*日历*/
sysService.service("$dateTool",['$http',function($http){
    this.ele=function(e,opt){
        var opt=opt||{},
            def={
                format: "yyyy-mm-dd",
                language:  'zh-CN',
                startDate:'2016-01-01',
                endDate:'2030-01-01',
                autoclose: true,
                minView :2
            };
        //{format: " yyyy-mm-dd hh:00",minView :1} 小时
        angular.element(e).datetimepicker($.extend(def,opt));
    };
    this.compare=function(e){
        var dates=angular.element(e.startTime).val(),
            datee=angular.element(e.endTime).val(),
            required=e.required==undefined?true:e.required,
            isEqual=e.isEqual==undefined?true:e.isEqual,
            textl=e.text&&(e.text)[0],//自定义文本
            textr=e.text&&(e.text)[1],//自定义文本
            right=e.right===undefined?true:e.right,//结束时间是否必填
            left=e.left===undefined?true:e.left;//开始时间是否必填

        if(required&&!right&&left&&!dates){
            return (textl||"开始时间")+"不能为空"
        }
        if(required&&!left&&right&&!dates){
            return   (textr||"结束时间")+"不能为空"
        }
        if((!dates||!datee)&&required&&right!==false&&left!==false){
            return   (textl&&textr?(textl+"或"+textr):undefined||"开始时间或结束时间")+"不能为空！"
        }
        function SetDate(d){
            // d=d==undefined?"":$.trim(d);
            // var arr=d.split(" "),
            //     stime=arr[1]?arr[1]:"00:00:00",
            //     dater=arr[0].split("-"),
            //     timer=stime.split(":");
            // return new Date(dater[0],dater[1],dater[2],timer[0],timer[1]==undefined?"00":timer[1],timer[2]==undefined?"00":timer[2]);
            var newDay = new Date(d);
            return Date.parse(newDay);
        }



        this.dateSubtract=(!datee?SetDate("2029-12-31"):SetDate(datee))-SetDate(dates);//计算时间差

        if((SetDate(dates)>=SetDate(datee)) && isEqual){
            return (textl||"开始时间")+"不能大于或等于"+(textr||"结束时间");
        }else if((SetDate(dates)>SetDate(datee)) && !isEqual){
            return (textl||"开始时间")+"不能大于"+(textr||"结束时间");
        }else{
            return ""
        }
    };
}]);

/*常用下拉*/
sysService.service("$getSelectTypes",["$http",function($http){
    this.select=function(){
        var args=arguments; //[]->域 ,apiUrl,添加属性key-value,自定义字段
        var keys=args[3]||'allStatusTypes';
        $http.get(args[1]).success(function(res){
            if(!res.stateCode){
                args[0][keys]=res.data;
                for(var j in res.data){
                    var arr=res.data[j];
                    if(args[2]){arr.unshift(args[2]);}
                }
            }
        });
    }
}]);

/**
 *
 * public fun
 */

/*get param */
function get_param (href, paraName) {
    var index = href.indexOf("?"),
        search = href.substring(index + 1),
        result = "";
    angular.forEach(search.split("&"), function (value) {
        var t = value.split("=");
        if (t.length > 0) {
            if (t[0] == paraName) {
                result = t[1]
            }
        }
    });
    return result;
};

/*replace uri*/
function replaceString (str, start, end, rep) {
    var replaceStartIndex = str.indexOf(start),
        replaceEndIndex = str.substring(replaceStartIndex).indexOf(end);
    if (replaceEndIndex >= 0) {
        return str.replace(str.substr(replaceStartIndex, replaceEndIndex), rep)
    } else {
        return str.replace(str.substring(replaceStartIndex), rep)
    }

};

// 720预览
function show720(data) {
    var url = window.Host720+data;
    $(".krpano-result").show().attr("href",url);
}

/*check ie*/
function isLtie10(){
    var browser=navigator.appName ,
        ie_version=navigator.appVersion ,
        s_version=ie_version.split(";"),
        Version=s_version[1]!=undefined?s_version[1].replace(/[ ]/g,""):"";
    return browser=="Microsoft Internet Explorer" && (Version=="MSIE6.0"||Version=="MSIE7.0"||Version=="MSIE8.0"||Version=="MSIE9.0")?true:false;
};

/*result message*/
;(function(){
    function resultMessage (msg,second,url,cls) {
        this.option={
            msg:msg,//提示信息
            second:second,//停留时间s
            url:url,//跳转地址
            class:cls//样式
        };
        this.make=function(opt){
            var option= $.extend(this.option,opt);
            $(".result-message-box").remove();
            $("body").prepend("<div class='result-message-box "+option.class+"'><span>"+option.msg+"</span></div>");
            setTimeout(function(){
                $(".result-message-box").remove();
                if(option.url!=null){
                    window.location.href=option.url;
                }
            },(option.second)*1000);

        };
    };
    successMsg=new resultMessage("操作成功！",2,null,"success");
    errorMsg=new resultMessage("操作失败！",2,null,"error");
    waringMsg=new resultMessage("操作错误！",2,null,"waring");
})();

/*datetimepicker language*/
$.fn.datetimepicker.dates['zh-CN'] = {
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
    daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    today: "今天",
    suffix: [],
    meridiem: ["上午", "下午"]
};

/*encrypt rsa*/
function Rsa(key){ //encrypt
    var encrypt = new JSEncrypt(),
        publicKey=window.pubkey;
    encrypt.setPublicKey(publicKey);
    return  encrypt.encrypt(key);
}
