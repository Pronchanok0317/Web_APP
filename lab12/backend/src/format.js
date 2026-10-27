const details={
 'ส้มตำไทย':['Somtam.jpg','ส้มตำรสจัดจ้าน ครบรสเปรี้ยว หวาน เค็ม เผ็ด ตำสดใหม่ทุกจาน'],
 'ผัดไทยกุ้งสด':['PadThai.jpg','เส้นผัดไทยเหนียวนุ่ม ผัดกับซอสสูตรพิเศษ เสิร์ฟพร้อมกุ้งสด'],
 'ต้มยำกุ้งน้ำข้น':['Tomyum.jpg','ต้มยำกุ้งน้ำข้นรสเข้มข้น หอมสมุนไพรไทย เปรี้ยวเผ็ดกลมกล่อม'],
 'ไก่ทอดสมุนไพร':['ChickenFried.jpg','ไก่ทอดหมักเครื่องเทศและสมุนไพรไทย กรอบนอกนุ่มใน']
};
function menu(row){const [image,description]=details[row.name] || ['lotus.png','เมนูประจำร้านอาหารสัตตบุษย์'];const {ratings=[],...rest}=row;return {...rest,id:row.menuId,price:Number(row.price),code:`TH-${String(row.menuId).padStart(3,'0')}`,image:'/images/'+image,description,rating:{average:ratings.length?Math.round(ratings.reduce((s,r)=>s+r.score,0)/ratings.length*10)/10:0,count:ratings.length}};}
function order(row){return {...row,id:row.orderId,total:Number(row.total),deliveryDate:row.deliveryDate.toISOString().slice(0,10),deliveryTime:row.deliveryTime.toISOString().slice(11,16),items:row.items.map(item=>({...item,price:Number(item.price),subtotal:Number(item.subtotal)}))};}
module.exports={menu,order};
