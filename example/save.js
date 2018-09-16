var mysql = require('mysql');
var debug = require('debug')('crawl:save');
var conf = require('./../config/config')
var pool = conf.pool

var async = require('async');



exports.test = function () {
    pool.getConnection(function(err, connection) {
        var data = [ 'ouid=2803301701','4283379698158558',null,null,null,'【环卫阿姨丢手机痛哭：里面有儿子生前照片，能不能把照片发给我】10日，山西侯马，环卫工刘阿姨十几天前不慎将手机丢失，里面存着3张儿子生前的照片。去年，她年仅28岁的儿子去世，照片是儿子给她留下的唯一念想。她说，现在唯一的希望是捡到手机的人能把里面的照片还给她。L新京报我们视频的秒拍视频 ​​​​',{},null,null]
        connection.query('insert into crawler(tbinfo,mid,isforward,minfo,omid,text,sendAt,cid,clink,fname,fid,ftext,fsendAt) values(?,?,?,?,?,?,?,?,?,?,?,?,?)',data,function(err,result){
            if(err){
                console.log('kNewscom',err)
            }
            cb();
        })
    })
}



//把分类列表存入数据库
exports.kNews = function(list,callback){
    async.forEach(list,function(item,cb){
        debug('save news',JSON.stringify(item));
        pool.query('replace into c_weibo(mid,text,cLink) values(?,?,?)',[item.mid,item.text,item.cLink],function(err,result){
            cb();
        });
    },callback);
}

exports.crawler = function (list,callback) {
    console.log('save news')
    var connection = list.connection
    async.forEach(list.res,function(item,cb){
        debug('save news',JSON.stringify(item));
        var data = [item.tbinfo,item.mid,item.isforward,item.minfo,item.omid,item.text,item.sendAt,item.cid,item.clink]
        if(item.forward){
            var fo = item.forward
            data = data.concat([fo.name,fo.id,fo.text,fo.sendAt])
        }else{
            data = data.concat(['','','',new Date()])
        }
        connection.query('select mid from crawler where mid = ?',[item.mid],function (err,res) {
            if(err){
                console.log(err)
            }
            if(res && res.length){
                //console.log('has news')
                cb();
            }else{
                connection.query('insert into crawler(tbinfo,mid,isforward,minfo,omid,text,sendAt,cid,clink,fname,fid,ftext,fsendAt) values(?,?,?,?,?,?,?,?,?,?,?,?,?)',data,function(err,result){
                    if(err){
                        console.log('kNewscom',err)
                    }
                    cb();
                })
            }
        })
    },callback);
}

exports.kNewscom = function(list,callback){
    console.log('save news')
    var connection = list.connection
    async.forEach(list.res,function(item,cb){
        debug('save news',JSON.stringify(item));
        var data = [item.tbinfo,item.mid,item.isforward,item.minfo,item.omid,item.text,new Date(parseInt(item.sendAt)),item.cid,item.clink]
        if(item.forward){
            var fo = item.forward
            data = data.concat([fo.name,fo.id,fo.text,new Date(parseInt(fo.sendAt))])
        }else{
            data = data.concat(['','','',new Date()])
        }
        connection.query('select * from weibo where mid = ?',[item.mid],function (err,res) {
            if(err){
                console.log(err)
            }
            if(res && res.length){
                //console.log('has news')
                cb();
            }else{
                connection.query('insert into kweibo(tbinfo,mid,isforward,minfo,omid,text,sendAt,cid,clink,fname,fid,ftext,fsendAt) values(?,?,?,?,?,?,?,?,?,?,?,?,?)',data,function(err,result){
                    if(err){
                        console.log('kNewscom',err)
                    }
                    cb();
                })
            }
        })
    },callback);
}
//把文章列表存入数据库
exports.kComment = function(list,callback){
    var connection = list.connection
    async.forEach(list.res,function(item,cb){
        debug('save article',JSON.stringify(item));
        connection.query('replace into p_weibo(cid,mid,userName,content) values(?,?,?,?)',[item.cid,item.mid,item.userName,item.content],function(err,result){
            cb();
        });
    },callback);
}


//把文章列表存入数据库
exports.kCommentCom = function(list,callback){
    console.log('save comment')
    var connection = list.connection
    async.forEach(list.res,function(item,cb){
        debug('save comment',JSON.stringify(item));
        var data = [item.news_id,item.comment_id,item.name,item.isReply,item.repName,escape(item.content),item.poster]
        connection.query('select * from kweibo_c where comment_id = ?',[item.comment_id],function (err,res) {
            if(res &&res.length){
                //console.log('has comment')
                cb();
            }else{
                connection.query('insert into kweibo_c(news_id,comment_id,name,isReply,repName,content,poster) values(?,?,?,?,?,?,?)',data,function(err,result){
                    if(err){
                        console.log(item.news_id,item.comment_id,item)
                        console.log('kCommentCom',err)
                    }
                    cb();
                });
            }
        })
    },callback);
}