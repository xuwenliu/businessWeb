if(window.attachEvent){
  window.attachEvent('onload', function(){
    var el = document.createElement('div'),
        elStyle = el.style,
        docBody = document.getElementsByTagName('body')[0];
        el.innerHTML =	"<p>您当前的浏览器版本过低，" +
        "请<a href='https://support.microsoft.com/zh-cn/help/17621/internet-explorer-downloads' target='_blank'>升级当前浏览器</a>到IE10或以上，" +
        "或下载<a href='http://www.google.com/intl/zh-CN/chrome' target='_blank'>谷歌浏览器(Chrome)</a>、" +
        "<a href='http://www.firefox.com.cn/download/' target='_blank'>火狐(Firefox)</a>打开本页面。</p>";
    elStyle.width = '100%';
    elStyle.color = '#090';
    elStyle.fontSize = '12px';
    elStyle.textAlign='center';
    elStyle.backgroundColor = '#F2FFEA';
    elStyle.padding = '12px 11px';
    docBody.insertBefore(el,docBody.firstChild);
  });
}