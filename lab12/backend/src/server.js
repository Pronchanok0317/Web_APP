require('dotenv').config();
const app=require('./app'),prisma=require('./db');
const port=Number(process.env.PORT || 5012);
const server=app.listen(port,'127.0.0.1',()=>console.log('ร้านอาหารสัตตบุษย์: http://127.0.0.1:'+port));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(async()=>{await prisma.$disconnect();process.exit(0);}));
