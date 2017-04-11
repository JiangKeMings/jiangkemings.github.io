// Array.prototype.params = function () {
//    var paramString = "?";
//    for (var index = 0; index < this.length; index++) {
//      if (index == this.length - 1) {
//         paramString += index + '=' + this[index];
//      }else {
//        paramString += index + '=' + this[index] + "&";
//      }
//    }
//    return paramString;
// };
var AllArticles;

function Article(tags,title,url,date,excerpt)
{
  this.tags = tags.split(",");
  this.title = title;
  this.url = url;
  this.date = date;
  this.excerpt = excerpt;
}
Article.prototype.constructor = Article;

function Articles(data) {
  var articles = new Array();
   for (var key in data) {
     var dict = data[key];
      articles.push( new Article(dict.tags,dict.title,dict.url,dict.date) );
   }
   return articles;
}


String.prototype.getParamms = function () {
  try {
    var array = this.split("?");
    var paramString = array[1];
    var keyValues = new Array().concat(paramString.split('&'));
    var params = new Array();
    for (var index in keyValues) {
        var sepeatArr =   keyValues[index].split("=");
        params[sepeatArr[0]] = sepeatArr[1];
    }
    return params;
  } catch (e) {
    throw e;
  }
};


// JSON结构 {title : {tags : text, url: text},.... }
function getTagsWithdata(data){
  var tagsPool = new Array();
  for(var key in data){
    var tagsArr = data[key].tags.split(",");
    tagsPool = tagsPool.concat(tagsArr);
  }
  return tagsPool;
}

/**  通过传入JSON字符串获取到JSON中的tags,将其所有tag转入一个数组中
 *   @param dataStr     : JSON字符串
 *   @param containerId : 承载tags链接的容器Id,如果为空,不执行加入操作
 *   @param siteUrl     : 网站url地址
 *   @param isGloba     : 是否是查询了全局的tag,并设置了AllArticles变量
 *   @return tagsArr    : 解析出的标签数组
**/
function handleJSON(dataStr,containerId,siteUrl,isGloba){
  try{
    var jsondata = JSON.parse(dataStr);
    var tagsArr =  getTagsWithdata(jsondata);
    var htmlstr = new String()
    var tagsDict = new Array();
    for(var index in tagsArr){
      var tag =  tagsArr[index];
      tagsDict[tag] = siteUrl + '/tags?tag=' + tag;
      htmlstr += ' ' + '<a href = ' + tagsDict[tag] + '>' + tag + ' ' + '</a>';
    }
    if (isGloba && AllArticles == null) {
        AllArticles = Articles(jsondata);
    }

    //如果为空直接返回tags URL数组
    if (containerId == null) {
      return tagsDict;
    }
    document.getElementById(containerId).innerHTML += htmlstr;
    return tagsDict;
    // var tagbox = document.createElement("div");
    // tagbox.className = "tags";
    // tagbox.innerHTML = htmlstr;
    // document.getElementById(id).appendChild(tagbox);

  }
  catch(ex)
  {
    alert(ex);
    return new Array();
  }
}

function searchArticlesWithTag(tag){
  var aimArticle = new Array();
  for(var key in AllArticles){
    var article = AllArticles[key];
    var tagArr = article.tags;

      for (var key in tagArr) {
          if (tagArr[key] == tag) {
             aimArticle.push(article);
             break;
          }
      }
  }
  return aimArticle;
}
