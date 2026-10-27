import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from './auth';
export default function Nav(){
 const {user,logout}=useAuth(),navigate=useNavigate();
 return <nav><Link to="/home">Home</Link><Link to="/menu">Menu</Link><Link to="/order">Order</Link><span id="authBar">{user?<><span>{user.userName} ({user.role})</span>{user.role==='admin'&&<Link to="/users">จัดการผู้ใช้</Link>}<button className="button secondary" onClick={()=>{logout();navigate('/login');}}>Logout</button></>:<><Link to="/login">Login</Link><Link to="/register">Register</Link></>}</span></nav>;
}
