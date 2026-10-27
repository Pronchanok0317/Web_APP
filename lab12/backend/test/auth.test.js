const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const mysql=require('mysql2/promise'),bcrypt=require('bcrypt'),jwt=require('jsonwebtoken');
test('Lab11 pages and Lab12 authentication, roles, ratings and orders',async()=>{
 process.env.DB_HOST='127.0.0.1';process.env.DB_PORT=process.env.TEST_DB_PORT || '3313';
 process.env.DB_USER=process.env.TEST_DB_USER || 'root';process.env.DB_PASSWORD=process.env.TEST_DB_PASSWORD || '';
 process.env.DB_NAME='lab12_test_'+Date.now();process.env.JWT_KEY='integration-test-key-only';
 process.env.DATABASE_URL='mysql://'+encodeURIComponent(process.env.DB_USER)+':'+encodeURIComponent(process.env.DB_PASSWORD)+'@127.0.0.1:'+process.env.DB_PORT+'/'+process.env.DB_NAME;
 const db=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT),user:process.env.DB_USER,password:process.env.DB_PASSWORD,multipleStatements:true});
 let server,pool;
 try{
  await db.query('CREATE DATABASE `'+process.env.DB_NAME+'` CHARACTER SET utf8mb4; USE `'+process.env.DB_NAME+'`');
  for(const file of ['restaurant_db_lab11.sql','restaurant_db_extra_tables.sql','restaurant_db_lab12_auth.sql']){
   const sql=fs.readFileSync(path.join(__dirname,'../..',file),'utf8').replace(/^USE .*;\s*$/mg,'').replace(/^DROP TABLE .*;\s*$/mg,'');await db.query(sql);
  }
  await db.query('INSERT INTO users(userName,email,password,role) VALUES(?,?,?,?)',['admin','admin@test.local',await bcrypt.hash('Admin12345!',10),'admin']);
  const app=require('../src/app');pool=require('../src/db');server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
  const base='http://127.0.0.1:'+server.address().port;
  async function request(route,method='GET',body,token){const response=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});const text=await response.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {status:response.status,data};}
  for(const page of ['/','/home','/menu','/order','/login','/register','/users'])assert.equal((await request(page)).status,200);
  assert.match((await request('/menu')).data,/<div id="root"><\/div>/); // React SPA serves all original Lab11 routes.
  assert.equal((await request('/api/menus')).data.length,4);
  assert.equal((await request('/api/menus','POST',{name:'blocked'})).status,401);
  assert.equal((await request('/api/users')).status,401);
  const registration={userName:'student',email:'student@test.local',password:'Student12345!',cpassword:'Student12345!',role:'admin'};
  assert.equal((await request('/api/authen/register','POST',{...registration,cpassword:'wrong'})).status,400);
  assert.equal((await request('/api/authen/register','POST',registration)).status,201);
  assert.equal((await request('/api/authen/register','POST',registration)).status,409);
  assert.equal((await request('/api/authen/login','POST',{userName:'student',password:'wrong'})).status,401);
  const login=(await request('/api/authen/login','POST',registration)).data,token=login.token;
  assert.equal(login.user.role,'user');assert.equal(login.user.password,undefined);
  const [[stored]]=await db.query('SELECT password FROM users WHERE userName="student"');assert.notEqual(stored.password,registration.password);assert.ok(await bcrypt.compare(registration.password,stored.password));
  assert.equal((await request('/api/menus','POST',{},token)).status,403);
  assert.equal((await request('/api/types/1','DELETE',{},token)).status,403);
  assert.equal((await request('/api/users','GET',undefined,token)).status,403);
  assert.equal((await request('/api/ratings/1','PUT',{score:6},token)).status,400);
  assert.equal((await request('/api/ratings/1','PUT',{score:4},token)).status,200);
  assert.equal((await request('/api/ratings/1','PUT',{score:5},token)).status,200);
  assert.deepEqual((await request('/api/ratings')).data,[{menuId:1,average:5,count:1}]);
  assert.equal((await request('/api/ratings/mine','GET',undefined,token)).data[0].score,5);
  const admin=(await request('/api/authen/login','POST',{userName:'admin',password:'Admin12345!'})).data;
  const users=(await request('/api/users','GET',undefined,admin.token)).data;assert.ok(users.every(u=>!u.password));
  assert.equal((await request('/api/users/'+admin.user.userId+'/role','PATCH',{role:'user'},admin.token)).status,409);
  assert.equal((await request('/api/users/'+login.user.userId+'/role','PATCH',{role:'admin'},admin.token)).status,200);
  assert.equal((await request('/api/users','GET',undefined,token)).status,200); // Existing JWT uses current DB role.
  assert.equal((await request('/api/users/'+login.user.userId+'/role','PATCH',{role:'user'},admin.token)).status,200);
  assert.equal((await request('/api/users','GET',undefined,token)).status,403);
  const created=await request('/api/menus','POST',{name:'ทดสอบ',price:25,typeId:1,isBestSeller:false},admin.token);assert.equal(created.status,201);
  assert.equal((await request('/api/menus/'+created.data.menuId,'DELETE',undefined,admin.token)).status,200);
  const order=await request('/api/orders','POST',{customerName:'Test',phone:'0812345678',deliveryDate:'2026-11-01',deliveryTime:'12:00',address:'Test address',items:[{menuId:1,qty:2}]},token);assert.equal(order.status,201);assert.equal(order.data.total,120);
  assert.equal((await request('/api/orders','GET',undefined,token)).status,403);
  assert.equal((await request('/api/orders','GET',undefined,admin.token)).status,200);
  const expired=jwt.sign({userId:login.user.userId},process.env.JWT_KEY,{expiresIn:-1});
  assert.equal((await request('/api/authen/home','GET',undefined,expired)).status,401);
  assert.equal((await request('/api/authen/home','GET',undefined,'invalid')).status,401);
  fs.writeFileSync(path.join(__dirname,'../.last-test-database'),process.env.DB_NAME);
  console.log('Verified original pages, password hashing, duplicates, JWT expiry, role changes, ratings, menu writes and orders.');
 }finally{if(server)await new Promise(r=>server.close(r));if(pool)await pool.$disconnect();await db.end();}
});

