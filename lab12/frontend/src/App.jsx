import {Route,Routes,Link} from 'react-router-dom';
import {AuthProvider,Protected} from './auth';
import Home from './Home';
import Menu from './Menu';
import Order from './Order';
import Account from './Account';
import Users from './Users';
export default function App(){return <AuthProvider><Routes><Route path="/" element={<Home/>}/><Route path="/home" element={<Home/>}/><Route path="/menu" element={<Menu/>}/><Route path="/order" element={<Protected><Order/></Protected>}/><Route path="/login" element={<Account/>}/><Route path="/register" element={<Account register/>}/><Route path="/users" element={<Protected admin><Users/></Protected>}/><Route path="*" element={<main className="container"><h1>ไม่พบหน้านี้</h1><Link to="/home">กลับหน้าแรก</Link></main>}/></Routes></AuthProvider>;}
