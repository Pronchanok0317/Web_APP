import {Link} from 'react-router-dom';
import Nav from './Nav';
import useMenus from './useMenus';
export default function Home(){
 const {menus,error,loading}=useMenus(),bestSellers=menus.filter(menu=>menu.isBestSeller);
 return <main><section className="hero"><div className="hero-content"><h1>ร้านอาหารสัตตบุษย์</h1><p>ร้านอาหารไทยที่คัดสรรวัตถุดิบสดใหม่ ปรุงอาหารด้วยความพิถีพิถัน พร้อมเสิร์ฟเมนูยอดนิยมให้ทุกมื้อของคุณ</p><Link className="button" to="/menu">ดูเมนูอาหาร</Link></div></section><section className="container"><Nav/><h2>เมนูแนะนำ</h2>{error&&<div className="message error" role="alert">{error}</div>}{loading&&<p>กำลังโหลดเมนู…</p>}<section id="bestSellerList" className="feature-grid">{bestSellers.map(menu=><article key={menu.menuId}><img src={menu.image} alt={menu.name}/><h3>{menu.name}</h3><p>{menu.description}</p><p className="price">{menu.price} บาท</p><p className="rating">★ {menu.rating.count?menu.rating.average.toFixed(1):'ยังไม่มีคะแนน'} ({menu.rating.count} คน)</p><p><Link to="/menu">ดูเมนูและให้คะแนน</Link></p></article>)}</section>{!loading&&!error&&!bestSellers.length&&<p className="muted">ยังไม่มีเมนูแนะนำ</p>}</section></main>;
}
