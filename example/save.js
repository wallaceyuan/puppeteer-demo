var mysql = require('mysql');
var debug = require('debug')('crawl:save');
var conf = require('./../config/config')
var async = require('async');

exports.content = function(list,callback){
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
        connection.query('select * from sina_content where mid = ?',[item.mid],function (err,res) {
            if(err){
                console.log(err)
            }
            if(res && res.length){
                //console.log('has news')
                cb();
            }else{
                connection.query('insert into sina_content(tbinfo,mid,isforward,minfo,omid,text,sendAt,cid,clink,fname,fid,ftext,fsendAt) values(?,?,?,?,?,?,?,?,?,?,?,?,?)',data,function(err,result){
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
exports.comment = function(list,callback){
    console.log('save comment')
    var connection = list.connection
    async.forEach(list.res,function(item,cb){
        debug('save comment',JSON.stringify(item));
        var data = [item.mid,item.content]
        connection.query('select * from sina_comment where mid = ?',[item.mid],function (err,res) {
            if(res &&res.length){
                cb();
            }else{
                connection.query('insert into sina_comment(mid,content) values(?,?)',data,function(err,result){
                    if(err){
                        console.log(item.mid,item.content,item)
                        console.log('comment',err)
                    }
                    cb();
                });
            }
        })
    },callback);
}