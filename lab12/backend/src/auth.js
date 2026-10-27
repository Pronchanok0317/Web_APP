const jwt=require('jsonwebtoken');
const prisma=require('./db');
const selectUser={userId:true,userName:true,email:true,role:true};
async function verifyToken(req,res,next){
 const match=/^Bearer (\S+)$/.exec(req.headers.authorization || '');
 if(!match)return res.status(401).json({message:'กรุณาเข้าสู่ระบบ'});
 let decoded;
 try{decoded=jwt.verify(match[1],process.env.JWT_KEY,{algorithms:['HS256']});}
 catch{return res.status(401).json({message:'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'});}
 try{
  const user=await prisma.user.findUnique({where:{userId:decoded.userId},select:selectUser});
  if(!user)return res.status(401).json({message:'ไม่พบบัญชีผู้ใช้'});
  req.user=user;next();
 }catch(error){next(error);}
}
function adminOnly(req,res,next){if(req.user.role!=='admin')return res.status(403).json({message:'เฉพาะผู้ดูแลระบบเท่านั้น'});next();}
module.exports={verifyToken,adminOnly,selectUser};
