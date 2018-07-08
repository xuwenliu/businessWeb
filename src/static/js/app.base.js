/**
 * API URL
 */

window.pubkey="MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCBG3UFPAxh+a0NLv6Plvjo5YPDdnlbED8dI4GP21DdFKvXVFcPb0lSRrht5Xrg7ck4PJ/fovfSi7k8MYqPY52g9tnPzkAthVOs99Tw6DVe22vV2hcs7dXvtk+TxKy4IqMjZA77hiH8wMYcJur+o4R770mrVP4fP88x53EQ4PaayQIDAQAB";

window.Version="v1.13.0";

window.API = {
    "SYS": {

        "LOGIN":[HOST, "/user/login"].join(""), //登录

        "LOGOUT":[HOST, "/user/logout"].join(""),//退出

        "SEND_SMS_CODE":[HOST, "/user/sendSmsCode"].join(""),//获取短信验证码

        "FIRST_RESET_POW":[HOST, "/user/firstLoginReset"].join(""),//首次重置密码

        "RESET_POW":[HOST, "/user/resetPassword"].join(""),//重置密码

        "FIND_CHECK":[HOST, "/user/retrievePassword"].join(""),//找回密码

        "TESTlogin":[HOST, "/user/testLogin"].join(""),//TESTlogin

        "TESTtoken":[HOST, "/user/testToken"].join("") //TESTtoken

    },

    "DEFAULT":{

        "DEFAULT_COUNT":[HOST, "/company/generalInfo"].join("")//首页公司统计信息
    },

    "COMPANY":{

        "COMPANY_CONTENT":[HOST, "/company/detailInfo"].join(""),//公司详情 /company/detailInfo

        "COMPANY_UPDATE":[HOST, "/company"].join(""),//公司更新 PUT /company/{companyId}

        "COMPANY_OPERATE_TYPES":[HOST, "/company/types"].join(""),//公司主营业务枚举 GET /company/types

        "COMPANY_SERVICES_SET":[HOST, "/business/service/content"].join(""),//公司主营业务GET post /business/service/content/{contentType}

        "COMPANY_SERVICEAREA_SET":[HOST, "/company/serviceArea"].join(""),//服务区域 post get /company/serviceArea

        "COMPANY_GET_SERVICE_SET":[HOST, "/business/service/standards"].join(""),//服务业务设置 GET /business/service/standards

        "COMPANY_GET_SERVICES_TYPES":[HOST, "/business/service/serviceContents"].join(""),//获取碎片服务  GET /business/service/serviceContents

        "COMPANY_SET_SERVICES_WORK":[HOST, "/business/service/selection"].join("")// 设置主营业务  POST /business/service/selection



    },

    "CUSTOMER":{
        "CUSTOMER_LIST":[HOST, "/customer/search"].join(""),//客户列表

        "CUSTOMER_CASE_SESSION":[HOST, "/im/session"].join(""),//客户会话列表

        "CUSTOMER_INFO":[HOST, "/customer"].join(""),//客户详情 GET /customer/{userId}

        "CUSTOMER_HOUSE_INFO":[HOST, "/customer"].join(""),//房屋信息 GET /customer/{userId}/house

        "CUSTOMER_ORDER_LIST":[HOST, "/customer"].join(""),//客户订单信息 GET /customer/{userId}/order

        "CUSTOMER_REFUND_LIST":[HOST, "/customer"].join("")//客户订单信息GET /customer/{userId}/refundApply
    },

    "EMPLOYEE":{
    	"EMPLOYEE_PUB":[HOST,"/employee"].join(""), //1.9.0新增

        "EMPLOYEE_ADD":[HOST, "/employee/add"].join(""),//新增从业者  /employee/add

        "EMPLOYEE_EDIT":[HOST, "/employee"].join(""),//修改从业者 PUT /employee/{userId}/update

        "EMPLOYEE_GET_INFO":[HOST, "/employee"].join(""),//获取业者信息 GET /employee/{employeeId}/detail

        "EMPLOYEE_GET_LIST":[HOST, "/employee/search"].join(""),//员工(从业者)列表

        "EMPLOYEE_GET_TYPES":[HOST, "/employee/initialOptions"].join(""),//获取下拉类型

        "EMPLOYEE_INC_CASE":[HOST, "/employee/list"].join(""),//员工作品列表 GET /employee/list/{userId}

        "IS_START":[HOST, "/employee"].join(""),//用户启用禁用  /employee/{userId}/status/{enable}

        "EMPLOYEE_GET_B_INFO":[HOST, "/employee/manager/basicInfo"].join(""),//获取B端管理员信息  GET /employee/manager/basicInfo

        "EMPLOYEE_OPEN_E":[HOST, "/employee/manager/open"].join("")//开通B端E权限 POST /employee/manager/open



    },

    CASE:{
        "CASE_LIST":[HOST, "/case/business/list"].join(""),//作品列表;

        "CASE_LIST_TYPE":[HOST, "/case/business/types"].join(""),//列表状态下拉;

        "CASE_UP_DOWN":[HOST, "/case/business/operation"].join(""),//上下架;/case/business/operation/{caseId}

        "CASE_GET_INFO":[HOST, "/case/business"].join(""),//作品详情   GET /case/business/{caseId}/detail

        "CASE_DOWN_REASON":[HOST, "/case/business"].join(""),// 下架理由 /case/business/{caseId}/queryReason

        "CASE_GET_TEAM":[HOST, "/case/business"].join(""),//获取团队信息  /case/business/{caseId}/team

        "CASE_UPDATE_CONTACT":[HOST, "/case/business"].join(""),//更新指定联系人  /case/business/{caseId}/updateContact/{userId}

        "CASE_GET_BRAND_SCLASS":[HOST, "/case/business"].join(""),//获取指定品牌子类  /brand/types/{typeId}

        "CASE_GET_BRAND_ALLCLASS":[HOST, "/brand/types"].join(""),//获取所有类型  /brand/types?getAll=true

        "CASE_GET_BRAND":[HOST, "/brand/getByTypes"].join(""),//获取指定品牌  /brand/getByTypes?typeId=1&subTypeId=2&available=true

        "CASE_GET_BASE_INFO":[HOST, "/case/business/basic"].join(""),//获取作品基本信息 /case/business/basic/{caseId}

        "CASE_GET_MEMBERS":[HOST, "/case/business/members"].join(""),//获取公司团队成员 GET /case/business/members

        "FORM_720":[HOST, "/case/business/upload/720"].join(""), //720表单上传

        "CASE_720_PROGRESS":[HOST, "/case/console/upload/progress"].join(""), //720进度条

        "CASE_GET_TYPES":[HOST, "/case/business/types"].join(""),//获取作品相关信息 GET /case/business/types

        "CASE_CASENAME_REQUIRED":[HOST, "/case/business/duplication/caseName"].join(""),//查询作品名是否存在

        "CASE_GET_AREA_BUILDING":[HOST, "/case/business/query/building"].join(""),//模糊查询楼盘名称 /case/business/query/building/{areaId}/{key}

        "CASE_APPLY_UP":[HOST, "/case/business/apply/up"].join(""), // 上架申请  POST /case/business/apply/up/{caseId}

        "GET_CASE_REJECT_REASON":[HOST, "/case/business"].join(""),//查看拒绝理由 GET /case/business/{caseId}/rejectReason

        "CASE_LIST_DEL":[HOST, "/case/business/invalidation"].join(""),//删除待完善列表数据;POST /case/business/invalidation/{caseId}


        /*作品新增相关*/
        "CASE_SET_INFO_P1":[HOST, "/case/business/material/basic"].join(""),//  POST +/add|+/update GET +/id

        "CASE_SET_INFO_P2":[HOST, "/case/business/material/view"].join(""),//  POST +/update GET +/id

        "CASE_SET_INFO_P3":[HOST, "/case/business/material/design"].join(""),//  POST +/update GET +/id

        "CASE_SET_INFO_P4":[HOST, "/case/business/material/construct"].join("")//  POST +/update GET +/id




    },

    OTHER:{
        "QINIU_UPTOKEN":[HOST, "/upload/getToken"].join(""),//七牛上传token

        "QNV_UPTOKEN":[HOST, "/upload/getVideoToken"].join(""),//七牛上传视频

        "QNV_FORMAT":[HOST, "/upload/persistVideo"].join(""),//七牛视频持久化转码

        "PROVINCE":[HOST, "/area/province"].join(""),//省份

        "CITY":[HOST, "/area/city"].join(""),//城市

        "COUNTY":[HOST, "/area/county"].join(""),//区县

        "ACCOUNTPROVINCE":[HOST, "/account/provinces"].join(""),//账户省份

        "ACCOUNTCITY":[HOST, "/account/cities"].join(""),//账户城市

        "GET_AREA":[HOST, "/area"].join(""),//从最后一级反查

        "GET_BRAND_BY_BIGCLASS":[HOST, "/brand/collection"].join("") //GET /brand/collection?typeId=1获取指定大类的品牌及子类

    },

    ACTIVITY:{
        "COUPON_CHECK":[HOST, "/activity/checkCoupon"].join(""),//优惠券校验,  GET /activity/checkCoupon/{couponEmployCode}

        "COUPON_LIST":[HOST, "/activity/couponEmploy/search"].join(""),//优惠券列表,  GET /activity/couponEmploy/search

        "ACTIVITY_TYPE":[HOST, "/activity/simple"].join(""),//简单活动列表,  GET /activity/simple

        "COUPON_TEM_INFO":[HOST, "/activity/coupon"].join("")// 获取优惠券模板详情 GET /activity/coupon/{couponid}

    },

    "ORDER":{
        "ORDER_LIST":[HOST, "/order"].join(""),//订单列表 get /order

        "REFUND_LIST":[HOST, "/order/refundApply"].join(""),//退款列表 GET /order/refundApply

        "REFUND_INFO":[HOST, "/order/contract/refund"].join(""),//合同订单退款详情 GET /order/contract/refund/{refundApplyId}

        "ORDER_INFO_EDIT":[HOST, "/order/booking"].join(""),//详情表单  POST /order/booking/{orderId}

        "ORDER_INFO":[HOST, "/order/booking"].join(""),//详情表单   GET /order/booking/{orderId}

        "ORDER_GET_TAB_INFO":[HOST, "/order/contract"].join(""),//获取订单详情tab1   GET /order/contract/{orderId}

        "ORDER_JOURNAL":[HOST, "/order"].join(""),//订单流水     GET /order/{orderId}/journal

        "ORDER_INFO_LOG":[HOST, "/order"].join(""),//订单日志    GET /order/{orderId}/operateLog

        "ORDER_INFO_REFUND_LIST":[HOST, "/order"].join(""),//订单对应的退款详情     GET /order/{orderId}/refundApply

        "ORDER_CANCEL_REASON":[HOST, "/order/booking"].join(""),//取消预约订单      POST /order/booking/{orderId}/cancel

        "ORDER_CREATE_GET_HOUSE_LIST":[HOST, "/order/customerHouses"].join(""),//创建阶段获取业主房屋信息列表    GET /order/customerHouses?phone=4545

        "ORDER_CREATE_BASE_SAVE":[HOST, "/order/contract"].join(""), //创建/修改合同订单基础信息     POST|PUT /order/contract

        "ORDER_CREATE_STEP_SAVE":[HOST, "/order/contract/phase"].join(""), //创建/修改合同订单阶段     POST|PUT /order/contract/phase

        "ORDER_CREATE_STEP_INFO":[HOST, "/order"].join(""),//获取合同订单阶段信息     GET /order/{orderId}/phase

        "ORDER_GET_SERVICE_LIST":[HOST, "/business/service/serviceContents"].join(""),//获取服务内容下拉   GET /business/service/serviceContents

        "ORDER_SUBMIT_PHASE":[HOST, "/order/contract"].join(""), //合同阶段验收    POST /order/contract/{orderId}/{phase}/submitCheck

        "ORDER_DELETE_PHASE":[HOST, "/order/contract/phase/remove"].join(""), //删除订单阶段    POST /order/contract/phase/remove

        "ORDER_REFUND_PASS":[HOST, "/order/contract/refund"].join(""), // 商家同意退款  POST /order/contract/refund/{refundApplyId}/pass

        "ORDER_REFUND_REJECT":[HOST, "/order/contract/refund"].join(""), // 商家拒绝退款  POST /order/contract/refund/{refundApplyId}/reject

        "ORDER_TYPES_STATUS":[HOST, "/order/types"].join(""), // 订单状态枚举  GET /order/types

        "ORDER_REFUND_TRANSFER":[HOST, "/order/contract/refund/credence/transfer"].join("") // 上传转账凭证 POST /order/contract/refund/credence/transfer

    },

    MAIL: {
        "MAIL_LIST":[HOST, "/im/internalMessage"].join("") // 查询站内信列表
    },

    IM: {
        "IM_TOKEN":[HOST, "/im/getToken"].join("")//获取TOKEN
    },

    ACCOUNT: {
        "ACCOUNT":[HOST, "/account"].join(""), // 查询公司账户详情

        "ACCOUNT_BRIEF":[HOST, "/account/brief"].join(""), // 查询公司账户信息简介

        "ACCOUNT_JOURNAL":[HOST, "/account/journal"].join(""), // 查询公司账户信息简介

        "ACCOUNT_BANKS":[HOST, "/account/banks"].join(""), // 银行名称模糊查询

        "ACCOUNT_ADDPRIVATE":[HOST, "/account/private"].join(""), // 添加对私账户

        "ACCOUNT_ADDPUBLIC":[HOST, "/account/public"].join(""), // 添加对公账户

        "ACCOUNT_STATISTICS":[HOST, "/account/statistics"].join(""), // 查询总支出收入

        "ACCOUNT_SETTING":[HOST, "/setting/consult"].join("") // 账户设置 /setting/consult
    },

    "TWITTER":{
        "TWITTER_LIST":[HOST, "/twitter"].join(""), // 推客列表  GET /twitter

        "TWITTER_ENUMS":[HOST, "/twitter/enums"].join(""), // 获取推客相关的枚举定义 GET /twitter/enums

        "TWITTER_INFO":[HOST, "/twitter/"].join(""), // 查询推客详情 GET /twitter/twitterId

        "TWITTER_CASE":[HOST, "/twitter/"].join(""), // 查询可添加的作品  GET /twitter/{twitterId}/case

        "TWITTER_CASE_ADD":[HOST, "/twitter/"].join(""), // 添加的作品  POST /twitter/{twitterId}/case

        "TWITTER_CASE_DELETE":[HOST, "/twitter/"].join(""), // 删除商品  GET /twitter/{twitterId}/case
    },

    "JOINUS":{

        "JOINUS_POST":[HOST, "/company/join"].join(""), // POST /company/join

        "JOINUS_SMS":[HOST, "/company/join/sendSmsCode"].join("") //POST /company/join/sendSmsCode

    },

    "BILL": {
        "BILL_LIST":[HOST, "/bill/items/company"].join(""),  // 公司账单信息 GET /bill/items/company

        "CUSTOMER_BILL_LIST":[HOST, "/bill/items/customer/"].join(""),   // 客户账单信息 GET /bill/items/customer/{userId}

        "BILL_TYPES":[HOST, "/bill/types"].join("") // 查询账单枚举 GET /bill/types
    },
    "EVALUATE":{
        "EVALUATE_LIST":[HOST, "/evaluate/employeeEvaluateList"].join(""), // 客户点评列表 GET /evaluate/employeeEvaluateList
        "EVALUATE_EMPLOYEELIST":[HOST, "/evaluate/employeeList"].join(""),    //GET /evaluate/employeeList v1.13.0 * 业者信息
        "EVALUATE_EMPLOYEETYPE":[HOST, "/evaluate/employeeType"].join(""),    //GET /evaluate/employeeType v1.13.0 * 获取业者类型
        "EVALUATE_DELETE":[HOST, "/evaluate/delete"].join("")    //POST /evaluate/delete v1.13.0 * lf 删除评论操作
    }

};
