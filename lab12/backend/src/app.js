require('dotenv').config();
const express=require('express'),path=require('path'),bcrypt=require('bcrypt'),jwt=require('jsonwebtoken');
const prisma=require('./db');
const {verifyToken,adminOnly,selectUser}=require('./auth');
const format=require('./format');
if(!process.env.JWT_KEY)throw new Error('Missing JWT_KEY: run npm run setup');
const app=express();app.use(express.json({limit:'32kb'}));
const menuInclude={type:true,ratings:{select:{score:true}}};
app.get(['/api','/api/health'],(req,res)=>res.json({message:'Lab12 React + Prisma API is running'}));
app.post('/api/authen/register',async(req,res)=>{
 const {userName,email,password,cpassword}=req.body;
 if(typeof userName!=='string'||!/^[\p{L}\p{N}_ .-]{3,60}$/u.test(userName.trim())||typeof email!=='string'||email.length>190||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=='string'||password.length<8||Buffer.byteLength(password)>72)return res.status(400).json({message:'ชื่อผู้ใช้ 3–60 ตัว อีเมลต้องถูกต้อง และรหัสผ่านอย่างน้อย 8 ตัว (ไม่เกิน 72 ไบต์)'});
 if(password!==cpassword)return res.status(400).json({message:'รหัสผ่านยืนยันไม่ตรงกัน'});
 await prisma.user.create({data:{userName:userName.trim(),email:email.trim().toLowerCase(),password:await bcrypt.hash(password,10),role:'user'}});
 res.status(201).json({message:'สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ'});
});
app.post('/api/authen/login',async(req,res)=>{
 const {userName,password}=req.body;
 if(typeof userName!=='string'||typeof password!=='string'||Buffer.byteLength(password)>72)return res.status(400).json({message:'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'});
 const found=await prisma.user.findUnique({where:{userName:userName.trim()}});
 if(!found||!await bcrypt.compare(password,found.password))return res.status(401).json({message:'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'});
 const {password:_,...user}=found;
 res.json({message:'เข้าสู่ระบบสำเร็จ',token:jwt.sign({userId:user.userId},process.env.JWT_KEY,{expiresIn:'1h',algorithm:'HS256'}),user});
});
app.get('/api/authen/home',verifyToken,(req,res)=>res.json({user:req.user}));
app.get('/api/users',verifyToken,adminOnly,async(req,res)=>res.json(await prisma.user.findMany({select:selectUser,orderBy:{userId:'asc'}})));
app.patch('/api/users/:id/role',verifyToken,adminOnly,async(req,res)=>{
 const userId=Number(req.params.id),{role}=req.body;
 if(!Number.isInteger(userId)||!['user','admin'].includes(role))return res.status(400).json({message:'สิทธิ์ผู้ใช้ไม่ถูกต้อง'});
 if(userId===req.user.userId)return res.status(409).json({message:'ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้'});
 await prisma.user.update({where:{userId},data:{role}});res.json({message:'เปลี่ยนสิทธิ์เรียบร้อย'});
});
app.get('/api/menus',async(req,res)=>{
 const search=typeof req.query.search==='string'?req.query.search.trim():'';
 const rows=await prisma.menu.findMany({where:search?{name:{contains:search}}:undefined,include:menuInclude,orderBy:{menuId:'asc'}});res.json(rows.map(format.menu));
});
app.get('/api/menus/:id',async(req,res)=>{
 const row=await prisma.menu.findUnique({where:{menuId:Number(req.params.id)},include:menuInclude});
 if(!row)return res.status(404).json({message:'ไม่พบเมนู'});res.json(format.menu(row));
});
function menuData(req,res,next){
 const {name,price,typeId,isBestSeller}=req.body;
 if(typeof name!=='string'||!name.trim()||name.length>180||!Number.isFinite(Number(price))||Number(price)<=0||Number(price)>99999999.99||!Number.isInteger(Number(typeId))||Number(typeId)<1||typeof isBestSeller!=='boolean')return res.status(400).json({message:'กรุณากรอกชื่อ ราคา ประเภท และ Best Seller ให้ถูกต้อง'});
 req.menuData={name:name.trim(),price:Number(price),typeId:Number(typeId),isBestSeller};next();
}
app.post('/api/menus',verifyToken,adminOnly,menuData,async(req,res)=>res.status(201).json(format.menu(await prisma.menu.create({data:req.menuData,include:menuInclude}))));
app.put('/api/menus/:id',verifyToken,adminOnly,menuData,async(req,res)=>res.json(format.menu(await prisma.menu.update({where:{menuId:Number(req.params.id)},data:req.menuData,include:menuInclude}))));
app.delete('/api/menus/:id',verifyToken,adminOnly,async(req,res)=>{await prisma.menu.delete({where:{menuId:Number(req.params.id)}});res.json({message:'ลบเมนูแล้ว'});});
app.get('/api/types',async(req,res)=>res.json(await prisma.type.findMany({orderBy:{typeId:'asc'}})));
app.get('/api/types/:id',async(req,res)=>{const row=await prisma.type.findUnique({where:{typeId:Number(req.params.id)}});if(!row)return res.status(404).json({message:'ไม่พบประเภท'});res.json(row);});
function typeData(req,res,next){if(typeof req.body.name!=='string'||!req.body.name.trim()||req.body.name.length>120)return res.status(400).json({message:'กรุณาระบุชื่อประเภท'});next();}
app.post('/api/types',verifyToken,adminOnly,typeData,async(req,res)=>res.status(201).json(await prisma.type.create({data:{name:req.body.name.trim()}})));
app.put('/api/types/:id',verifyToken,adminOnly,typeData,async(req,res)=>res.json(await prisma.type.update({where:{typeId:Number(req.params.id)},data:{name:req.body.name.trim()}})));
app.delete('/api/types/:id',verifyToken,adminOnly,async(req,res)=>{await prisma.type.delete({where:{typeId:Number(req.params.id)}});res.json({message:'ลบประเภทแล้ว'});});
app.get('/api/ratings',async(req,res)=>{
 const groups=await prisma.rating.groupBy({by:['menuId'],_avg:{score:true},_count:{score:true}});
 res.json(groups.map(g=>({menuId:g.menuId,average:Math.round(g._avg.score*10)/10,count:g._count.score})));
});
app.get('/api/ratings/mine',verifyToken,async(req,res)=>res.json(await prisma.rating.findMany({where:{userId:req.user.userId},select:{menuId:true,score:true}})));
app.put('/api/ratings/:menuId',verifyToken,async(req,res)=>{
 const menuId=Number(req.params.menuId),{score}=req.body;
 if(!Number.isInteger(menuId)||!Number.isInteger(score)||score<1||score>5)return res.status(400).json({message:'คะแนนต้องเป็นจำนวนเต็ม 1–5'});
 if(!await prisma.menu.findUnique({where:{menuId}}))return res.status(404).json({message:'ไม่พบเมนู'});
 await prisma.rating.upsert({where:{userId_menuId:{userId:req.user.userId,menuId}},create:{userId:req.user.userId,menuId,score},update:{score}});res.json({message:'บันทึกคะแนนแล้ว'});
});
const orderInclude={items:{include:{menu:{select:{menuId:true,name:true}}}}};
app.get('/api/orders',verifyToken,adminOnly,async(req,res)=>res.json((await prisma.order.findMany({include:orderInclude,orderBy:{orderId:'desc'}})).map(format.order)));
app.get('/api/orders/:id',verifyToken,adminOnly,async(req,res)=>{const order=await prisma.order.findUnique({where:{orderId:Number(req.params.id)},include:orderInclude});if(!order)return res.status(404).json({message:'ไม่พบคำสั่งซื้อ'});res.json(format.order(order));});
app.post('/api/orders',verifyToken,async(req,res)=>{
 const {customerName,phone,deliveryDate,deliveryTime,address,items}=req.body;
 if(typeof customerName!=='string'||!customerName.trim()||customerName.length>180||typeof phone!=='string'||!/^\d{10}$/.test(phone)||typeof address!=='string'||!address.trim()||address.length>255||!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(deliveryTime)||!Array.isArray(items)||!items.length)return res.status(400).json({message:'กรุณากรอกข้อมูลจัดส่งและเลือกอาหารให้ครบถ้วน'});
 const date=new Date(deliveryDate+'T00:00:00Z');
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==deliveryDate)return res.status(400).json({message:'วันที่จัดส่งไม่ถูกต้อง'});
 if(items.some(i=>!Number.isInteger(i.menuId)||!Number.isInteger(i.qty)||i.qty<1||i.qty>10||(i.note!=null&&(typeof i.note!=='string'||i.note.length>255)))||new Set(items.map(i=>i.menuId)).size!==items.length)return res.status(400).json({message:'จำนวนอาหารหรือหมายเหตุไม่ถูกต้อง'});
 const menus=await prisma.menu.findMany({where:{menuId:{in:items.map(i=>i.menuId)}}});
 if(menus.length!==items.length)return res.status(400).json({message:'ไม่พบเมนูที่เลือก'});
 const lines=items.map(i=>{const menu=menus.find(m=>m.menuId===i.menuId);return {menuId:i.menuId,qty:i.qty,note:i.note || '',price:menu.price,subtotal:menu.price.mul(i.qty)};});
 const total=lines.reduce((sum,i)=>sum.add(i.subtotal),lines[0].subtotal.mul(0));
 const order=await prisma.order.create({data:{customerName:customerName.trim(),phone,deliveryDate:date,deliveryTime:new Date('1970-01-01T'+deliveryTime+':00Z'),address:address.trim(),total,items:{create:lines}},include:orderInclude});res.status(201).json(format.order(order));
});
app.delete('/api/orders/:id',verifyToken,adminOnly,async(req,res)=>{await prisma.order.delete({where:{orderId:Number(req.params.id)}});res.json({message:'ลบคำสั่งซื้อแล้ว'});});
app.use('/api',(req,res)=>res.status(404).json({message:'Route not found'}));
const dist=path.join(__dirname,'../../frontend/dist');
app.use(express.static(dist));app.get('/{*splat}',(req,res)=>res.sendFile(path.join(dist,'index.html')));
app.use((error,req,res,next)=>{
 if(error.code==='P2002')return res.status(409).json({message:'ชื่อผู้ใช้ อีเมล หรือข้อมูลนี้มีอยู่แล้ว'});
 if(error.code==='P2025')return res.status(404).json({message:'ไม่พบข้อมูล'});
 if(error.code==='P2003')return res.status(409).json({message:'ข้อมูลอ้างอิงไม่ถูกต้อง หรือเมนูนี้มีประวัติการสั่งซื้ออยู่'});
 if(error.name==='PrismaClientValidationError'||error.status===400)return res.status(400).json({message:'ข้อมูลไม่ถูกต้อง'});
 console.error(error.message);
 res.status(500).json({message:'ไม่สามารถดำเนินการได้ กรุณาตรวจสอบฐานข้อมูล'});
});
module.exports=app;
