import {createContext,useContext,useEffect,useState} from 'react';
import {Navigate} from 'react-router-dom';
import {api} from './api';
const AuthContext=createContext();
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[ready,setReady]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{
  let active=true;
  async function refresh(){
   try{
    if(localStorage.getItem('token')){const data=await api('/authen/home');if(active){setUser(data.user);setMessage('');}}
    else if(active)setUser(null);
   }catch(error){if(active){if(error.status===401)setUser(null);setMessage(error.message);}}
   finally{if(active)setReady(true);}
  }
  const expire=()=>{setUser(null);setMessage('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');};
  refresh();const timer=setInterval(refresh,5000);window.addEventListener('session-expired',expire);
  return()=>{active=false;clearInterval(timer);window.removeEventListener('session-expired',expire);};
 },[]);
 function login(data){localStorage.setItem('token',data.token);setUser(data.user);setMessage('');}
 function logout(){localStorage.removeItem('token');setUser(null);setMessage('');}
 return <AuthContext.Provider value={{user,ready,login,logout}}>{message&&<div className="container message" role="status">{message}</div>}{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
export function Protected({admin=false,children}){
 const {user,ready}=useAuth();
 if(!ready)return <main className="container">กำลังตรวจสอบสิทธิ์…</main>;
 if(!user)return <Navigate to="/login" replace/>;
 if(admin&&user.role!=='admin')return <Navigate to="/menu" replace/>;
 return children;
}
