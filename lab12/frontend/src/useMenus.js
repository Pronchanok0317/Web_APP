import {useEffect,useState,useCallback} from 'react';
import {api} from './api';
export default function useMenus(){
 const [menus,setMenus]=useState([]),[types,setTypes]=useState([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{const [m,t]=await Promise.all([api('/menus'),api('/types')]);setMenus(m);setTypes(t);setError('');},[]);
 useEffect(()=>{
  let active=true;
  async function load(){try{const [m,t]=await Promise.all([api('/menus'),api('/types')]);if(active){setMenus(m);setTypes(t);setError('');}}catch(e){if(active)setError(e.message);}finally{if(active)setLoading(false);}}
  load();const timer=setInterval(load,5000);return()=>{active=false;clearInterval(timer);};
 },[]);
 return {menus,types,error,loading,refresh};
}
