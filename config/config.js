/**
 * Created by yuan on 2016/9/7.
 */

var mysql = require('mysql');
var wrapper = require('co-mysql')

var ip = 'http://127.0.0.1:3000';
var host = 'localhost';
var pool = mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'123456',
    database:'yuan_place',
    connectTimeout:30000
});

p = wrapper(pool);

module.exports = {
    ip    : ip,
    pool  : pool,
    p     : p,
    host  : host,
    photo : 5,
}