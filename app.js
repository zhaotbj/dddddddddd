const Koa = require('koa');
const app = new Koa();
const staticFiles = require('koa-static');
const path = require("path");
const http = require("http");
// const https = require("https");
const fs = require("fs");
// const socketIo = require('socket.io');
const log4js = require("log4js");
let logger = log4js.getLogger();
logger.level = "debug";
app.use(staticFiles(path.resolve(__dirname, "public")));



// const options = {
//     key: fs.readFileSync("./server.key", "utf8"),
//     cert: fs.readFileSync("./server.cert", "utf8")
// };
// let server = https.createServer(options, app.callback())
const server = http.createServer(app.callback());
server.listen(3000, () => {
    console.log(`开始了localhost:${3000}`)
});
const io = require('socket.io')(server);
io.on('connection', (socket) => {
    socket.on("join", (room) => {
        socket.join(room);
        var myRoom = io.sockets.adapter.rooms[room];
        var users = 0; // 用户数量
        if(myRoom) {
            users = Object.keys(myRoom.sockets).length;
        }
        logger.debug('--房间用户数量--',users);
        // 是一对一的直播
        if(users < 3) { // 小于三个人
            socket.emit("joined", room, socket.id);
            if(users>1) {
                socket.to(room).emit("otherjoin", room);
            }
        } else {
            // 大于三 剔除房间
            socket.leave(room);
            socket.emit("full", room, socket.id); // 房间已满
        }
        // 发给自己
        // socket.emit("joined", room, socket.id); 
        // 发给除自己之外的这个节点上的所有人 // 给这个站点所有人发 除了自己全部
        // socket.broadcast.emit("joined", room, socket.id);
        //    发给除了自己之外房间内的所有人
        //    socket.to(room).emit("joined",room, socket.id)
        //    发给给房间内所有人
        // io.in(room).emit('joined', room, socket.id);
        
    });
    socket.on("leave", (room) => {
        var myRoom = io.sockets.adapter.rooms[room];
        var users = 0;
        if(myRoom) {
            users = Object.keys(myRoom.sockets).length;
        }
        logger.debug('--房间用户数量离开房间--',users-1);
        //
        // socket.broadcast.emit("leaved", room, socket.id);
        socket.to(room).emit('bye', room, socket.id);
        socket.emit("leaved", room, socket.id);
        // socket.leave(room);
        // io.in(room).emit('joined', room, socket.id);
    })
    socket.on("message", (room,message)=>{
        console.log("message",room,message)
        // socket.broadcast.emit("message",room, message)
        socket.to(room).emit("message",room, message)
    })
});



// app.use(async ctx => {
//     ctx.body = 'Hello World';
//   });

//   app.listen(3000, () => {
//     console.log(`starting in http://localhost:3000`)
// })