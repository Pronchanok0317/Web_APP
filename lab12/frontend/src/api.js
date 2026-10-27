export async function api(path,options={}){
 const token=localStorage.getItem('token');
 const response=await fetch('/api'+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers}});
 const data=await response.json();
 if(!response.ok){
  if(response.status===401&&token&&path!=='/authen/login'){localStorage.removeItem('token');window.dispatchEvent(new Event('session-expired'));}
  const error=new Error(data.message || data.error || 'เกิดข้อผิดพลาด');error.status=response.status;throw error;
 }
 return data;
}
