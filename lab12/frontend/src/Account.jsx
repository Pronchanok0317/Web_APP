import {useEffect,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import Nav from './Nav';
import {api} from './api';
import {useAuth} from './auth';
export default function Account({register=false}){
 const [form,setForm]=useState({userName:'',email:'',password:'',cpassword:''}),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),{login}=useAuth(),navigate=useNavigate();
 useEffect(()=>{setForm({userName:'',email:'',password:'',cpassword:''});setMessage(register?'':sessionStorage.getItem('registered') || '');sessionStorage.removeItem('registered');},[register]);
 function field(name){return {id:name,name,value:form[name],onChange:e=>setForm({...form,[name]:e.target.value})};}
 async function submit(event){
  event.preventDefault();setMessage('');
  if(register&&form.password!==form.cpassword){setMessage('รหัสผ่านยืนยันไม่ตรงกัน');return;}
  setBusy(true);
  try{const data=await api('/authen/'+(register?'register':'login'),{method:'POST',body:JSON.stringify(form)});if(register){sessionStorage.setItem('registered','สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ');navigate('/login');}else{login(data);navigate('/home');}}
  catch(e){setMessage(e.message);}finally{setBusy(false);}
 }
 return <main className="container"><Nav/><form id="accountForm" className="card menu-form" onSubmit={submit}><h1>{register?'Register':'Login'}</h1><label htmlFor="userName">Username</label><input {...field('userName')} autoComplete="username" required minLength={register?3:undefined} maxLength={60}/>{register&&<><label htmlFor="email">Email</label><input {...field('email')} type="email" autoComplete="email" required maxLength={190}/></>}<label htmlFor="password">Password</label><input {...field('password')} type="password" autoComplete={register?'new-password':'current-password'} required minLength={register?8:undefined}/>{register&&<><label htmlFor="cpassword">Confirm Password</label><input {...field('cpassword')} type="password" autoComplete="new-password" required minLength={8}/></>}<div className="form-actions"><button className="button" type="submit" disabled={busy}>{busy?'กำลังดำเนินการ…':register?'Sign Up':'Login'}</button></div><p>{register?'มีบัญชีแล้ว?':'ยังไม่มีบัญชี?'} <Link to={register?'/login':'/register'}>{register?'Login Here':'Register Here'}</Link></p>{message&&<div className="message" role="status">{message}</div>}</form></main>;
}
