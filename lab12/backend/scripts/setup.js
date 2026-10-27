require('dotenv').config();
const mysql=require('mysql2/promise'),fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcrypt');
const {spawnSync}=require('child_process');
async function setup(){
 if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL in backend/.env first');
 const url=new URL(process.env.DATABASE_URL);
 const connection=await mysql.createConnection({host:url.hostname,port:Number(url.port || 3306),user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),database:decodeURIComponent(url.pathname.slice(1))});
 try{
  // Only add the two authentication tables; never recreate existing Lab11 tables.
  const sql=fs.readFileSync(path.join(__dirname,'../../restaurant_db_lab12_auth.sql'),'utf8');
  for(const statement of sql.split(';').filter(s=>s.trim()))await connection.query(statement);
 }finally{await connection.end();}
 const generated=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),'generate'],{stdio:'inherit',cwd:path.join(__dirname,'..')});
 if(generated.status!==0)throw new Error('Prisma client generation failed');
 const prisma=require('../src/db');
 try{
  if(!await prisma.user.findFirst({where:{role:'admin'}})){
   await prisma.user.create({data:{userName:'admin',email:'admin@lab12.local',password:await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin12345!',10),role:'admin'}});
   console.log('Created local lab admin. Default password: Admin12345! (or ADMIN_PASSWORD).');
  }
 }finally{await prisma.$disconnect();}
 if(!process.env.JWT_KEY)fs.appendFileSync(path.join(__dirname,'../.env'),'\nJWT_KEY='+crypto.randomBytes(48).toString('hex')+'\n');
 console.log('Lab12 setup complete. Existing Lab11 menus and orders preserved.');
}
setup().catch(error=>{console.error(error.message);process.exitCode=1;});
