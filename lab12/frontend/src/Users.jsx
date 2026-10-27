import {useEffect,useState} from 'react';
import Nav from './Nav';
import {useAuth} from './auth';
import {api} from './api';
export default function Users(){
 const {user}=useAuth(),[users,setUsers]=useState([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(null);
 useEffect(()=>{let active=true;async function load(){try{const rows=await api('/users');if(active)setUsers(rows);}catch(e){if(active)setMessage(e.message);}}load();const timer=setInterval(load,5000);return()=>{active=false;clearInterval(timer);};},[]);
 async function change(id,role){setBusy(id);try{await api('/users/'+id+'/role',{method:'PATCH',body:JSON.stringify({role})});setUsers(await api('/users'));setMessage('เปลี่ยนสิทธิ์เรียบร้อย');}catch(e){setMessage(e.message);}finally{setBusy(null);}}
 return <main className="container"><Nav/><h1>จัดการผู้ใช้</h1><p>เปลี่ยนสิทธิ์ User / Admin</p>{message&&<div className="message" role="status">{message}</div>}<section id="users">{users.map(u=><div className="card" key={u.userId}><label>{u.userName} · {u.email}<select aria-label={'สิทธิ์ของ '+u.userName} value={u.role} disabled={u.userId===user.userId || busy===u.userId} onChange={e=>change(u.userId,e.target.value)}><option value="user">user</option><option value="admin">admin</option></select></label></div>)}</section></main>;
}
