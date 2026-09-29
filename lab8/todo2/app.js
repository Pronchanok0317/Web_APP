const express = require('express');
const app = express();

app.use(express.static('public'));

const menuList = {
  'TH-001': 'ส้มตำไทย',
  'TH-002': 'ผัดไทยกุ้งสด',
  'TH-003': 'ต้มยำกุ้งน้ำข้น',
  'TH-004': 'ไก่ทอดสมุนไพร'
};

const menuDescriptions = {
  'ส้มตำไทย': 'ส้มตำรสจัดจ้าน ครบรสเปรี้ยว หวาน เค็ม เผ็ด ตำสดใหม่ทุกจาน เหมาะสำหรับคนที่ชอบอาหารไทยรสแซ่บ',
  'ผัดไทยกุ้งสด': 'เส้นผัดไทยเหนียวนุ่ม ผัดกับซอสสูตรพิเศษ เสิร์ฟพร้อมกุ้งสด ถั่วงอก ใบกุยช่าย และถั่วลิสงบด',
  'ต้มยำกุ้งน้ำข้น': 'ต้มยำกุ้งน้ำข้นรสเข้มข้น หอมสมุนไพรไทย มีกุ้งสดและเห็ด ให้รสเปรี้ยวเผ็ดกลมกล่อม',
  'ไก่ทอดสมุนไพร': 'ไก่ทอดหมักเครื่องเทศและสมุนไพรไทย ทอดจนกรอบนอกนุ่มใน กินคู่กับข้าวสวยหรือเป็นกับแกล้มก็อร่อย'
};

app.get(['/', '/home'], (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/menu', (req, res) => {
  res.sendFile(__dirname + '/info/menu.html');
});

app.get('/order', (req, res) => {
  res.sendFile(__dirname + '/info/order.html');
});

app.get('/confirm', (req, res) => {
  const selectedMenus = Array.isArray(req.query.menu)
    ? req.query.menu
    : req.query.menu
      ? [req.query.menu]
      : [];

  if (selectedMenus.length === 0) {
    res.send(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>กรุณาเลือกอาหาร</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="container detail">
    <h1>กรุณาเลือกรายการอาหาร</h1>
    <p>ต้องเลือกอาหารอย่างน้อย 1 รายการก่อนยืนยันคำสั่งซื้อ</p>
    <a class="button link-button" href="/order">กลับไปสั่งอาหาร</a>
  </div>
</body>
</html>`);
    return;
  }

  const orderItems = selectedMenus.map((code) => `<li>${menuList[code] || code}</li>`).join('');

  res.send(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ยืนยันคำสั่งซื้อ</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="container confirm-box">
    <h1>ยืนยันคำสั่งซื้อเรียบร้อย</h1>
    <p>ขอบคุณที่สั่งอาหารกับร้านอาหารสัตตบุษย์</p>

    <h2>รายการอาหาร</h2>
    <ul>${orderItems}</ul>

    <h2>ข้อมูลจัดส่ง</h2>
    <p><b>ชื่อผู้รับ:</b> ${req.query.name || '-'}</p>
    <p><b>เบอร์โทร:</b> ${req.query.phone || '-'}</p>
    <p><b>วันที่จัดส่ง:</b> ${req.query['delivery-date'] || '-'}</p>
    <p><b>เวลาจัดส่ง:</b> ${req.query['delivery-time'] || '-'}</p>
    <p><b>ที่อยู่:</b> ${req.query.address || '-'}</p>

    <a class="button link-button" href="/home">กลับหน้าหลัก</a>
    <a class="button link-button" href="/order">สั่งอาหารเพิ่ม</a>
  </div>
</body>
</html>`);
});

app.get('/item/:name/price/:price', (req, res) => {
  const name = req.params.name;
  const price = req.params.price;
  const description = menuDescriptions[name] || 'เมนูแนะนำจากร้านอาหารสัตตบุษย์ ปรุงสดใหม่และพร้อมเสิร์ฟความอร่อยให้ลูกค้าทุกท่าน';

  res.send(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>รายละเอียดเมนู</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="container detail">
    <h1>${name}</h1>
    <h2>ราคา ${price} บาท</h2>
    <p class="food-description">${description}</p>
    <a href="/menu">กลับไปหน้าเมนู</a>
  </div>
</body>
</html>`);
});

app.get('/{*any}', (req, res) => {
  res.send('ใช้ path "/home", "/menu", "/order", "/confirm" or "/item/:name/price/:price" เท่านั้น');
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
