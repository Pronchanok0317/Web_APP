import {useState} from 'react';
import Nav from './Nav';
import useMenus from './useMenus';
import {api} from './api';
export default function Order(){
 const {menus,error,loading}=useMenus(),[selected,setSelected]=useState({}),[form,setForm]=useState({customerName:'',phone:'',deliveryDate:'',deliveryTime:'',address:''}),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 function field(name){return {id:name,name,value:form[name],onChange:e=>setForm({...form,[name]:e.target.value})};}
 function item(menuId,change){setSelected(s=>({...s,[menuId]:{qty:1,note:'',checked:false,...s[menuId],...change}}));}
 function reset(){setSelected({});setForm({customerName:'',phone:'',deliveryDate:'',deliveryTime:'',address:''});}
 async function submit(event){
  event.preventDefault();const items=Object.entries(selected).filter(([,i])=>i.checked).map(([id,i])=>({menuId:Number(id),qty:Number(i.qty),note:i.note}));
  if(!items.length){setMessage('กรุณาเลือกรายการอาหารอย่างน้อย 1 รายการ');return;}
  setBusy(true);setMessage('');
  try{const result=await api('/orders',{method:'POST',body:JSON.stringify({...form,items})});reset();setMessage(`บันทึกคำสั่งซื้อ #${result.id} สำเร็จ ยอดรวม ${result.total} บาท`);}
  catch(e){setMessage(e.message);}finally{setBusy(false);}
 }
 return <main className="container"><h1>สั่งอาหาร</h1><p className="muted">กรอกข้อมูลจัดส่งและเลือกรายการอาหารที่ต้องการ</p><Nav/>{error&&<div className="message error" role="alert">{error}</div>}<form id="orderForm" onSubmit={submit} onReset={reset}><h2>เลือกรายการอาหาร</h2>{loading&&<p>กำลังโหลดเมนู…</p>}<section id="menuChoices" className="order-grid">{menus.map(menu=><article className="card" key={menu.menuId}><label><input type="checkbox" name="menuId" value={menu.menuId} checked={selected[menu.menuId]?.checked || false} onChange={e=>item(menu.menuId,{checked:e.target.checked})}/>{menu.name}</label><p className="price">{menu.price} บาท</p><label htmlFor={'qty-'+menu.menuId}>จำนวน</label><input id={'qty-'+menu.menuId} type="number" min="1" max="10" value={selected[menu.menuId]?.qty ?? 1} onChange={e=>item(menu.menuId,{qty:e.target.value})}/><label htmlFor={'note-'+menu.menuId}>คำสั่งพิเศษ</label><input id={'note-'+menu.menuId} type="text" maxLength={255} placeholder="เช่น เผ็ดน้อย" value={selected[menu.menuId]?.note || ''} onChange={e=>item(menu.menuId,{note:e.target.value})}/></article>)}</section><h2>ข้อมูลจัดส่ง</h2><div className="row"><div><label htmlFor="customerName">ชื่อผู้รับ</label><input {...field('customerName')} required maxLength={180}/></div><div><label htmlFor="phone">เบอร์โทรศัพท์</label><input {...field('phone')} type="tel" required pattern="[0-9]{10}" placeholder="08xxxxxxxx"/></div></div><div className="row"><div><label htmlFor="deliveryDate">วันที่จัดส่ง</label><input {...field('deliveryDate')} type="date" required/></div><div><label htmlFor="deliveryTime">เวลาจัดส่ง</label><input {...field('deliveryTime')} type="time" required/></div></div><label htmlFor="address">ที่อยู่จัดส่ง</label><textarea {...field('address')} required maxLength={255}/><div className="form-actions"><button className="button" type="submit" disabled={busy}>{busy?'กำลังบันทึก…':'ยืนยันการสั่งซื้อ'}</button><button className="button secondary" type="reset">ล้างข้อมูล</button></div></form>{message&&<div id="message" className="message" role="status">{message}</div>}</main>;
}
