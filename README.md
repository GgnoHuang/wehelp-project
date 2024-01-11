## 🟠 [Taipei-day-trip](http://54.65.60.124:3000/)

> Taipei-day-trip is a travel e-commerce platform, this website features comprehensive introductions to tourist attractions along with shopping cart and transaction payment functionalities.

---
## 🟠 Try it!

Link: [Click](http://54.65.60.124:3000/)

👇🏻 Test account and password

| Account          | Password |
| ---------------- | -------- |
| `test@test.com` | `test`|

| 💳 Test Credit Card | 
| ------------------ | 
| `4242-4242-4242-4242` | 

---
## 🟠 Architecture
<img width="1000" alt="截圖 2024-01-11 下午1 04 51" src="https://github.com/GgnoHuang/wehelp-project/assets/132812902/e296ab14-18b3-4375-9021-9089558ab127">
<img width="400" alt="截圖 2024-01-11 下午6 03 40" src="https://github.com/GgnoHuang/wehelp-project/assets/132812902/5b7232f1-4709-456d-abef-d4ae5bbbdeb3">

- The front-end is developed using **`Vanilla JavaScript`** for all page interactions and integrates with **`APIs`** to render attraction information and images in the views.
- Use **`Python's Flask`** framework to set up routes, and build a **`MySQL`** database for keeping all the member data.
- Implement the **`Connection Pool`** to enhance database efficiency and performance.
- The back-end routing uses **`RESTful API`** design for **`CRUD`**. This makes the front-end and back-end work better separately.
- Use **`JWT`** to authenticate or verify member tokens, aligning with the **`'Stateless'`** principle of RESTful APIs.
- Create an **`Ubuntu`**-based **`Amazon EC2`** instance and deploy the project to it, then associate an **`Elastic IP`** with the instance for stable external access.

---
## 🟠 Features and Technical Intro (Gif圖較多，謝謝你的耐心等待😊)

### **🔸 Scroll Feature**
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/fetch.gif?raw=true" width="600">

- 使用 **`IntersectionObserver`** 使頁面滾動時可以監聽元素，並在觸發觀測後利用 **`fetch`** 向後端取得景點資料，再使用 **`createElement`** 和 **`appendChild`** 動態生成element，最終渲染在畫面上。
- 我設置了一個Api請求的 **`Trigger`** ，為Boolean值，在呼叫api之後透過 **`Promise`** 的 **`.finally()`** 進行Boolean切換，目的是避免IntersectionObserver的觀測造成重複呼叫Api。

#
### **🔸 Search Feature**
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/search.gif?raw=true" width="600">

#
### **🔸 Carousel Feature**
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/輪播.gif?raw=true" width="600">

#
### **🔸 Feature**
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/alert.gif?raw=true" width="600">

#
### **🔸 Transaction Feature**
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/訂購.gif?raw=true" width="600">
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/交易.gif?raw=true" width="600">

#
### **🔸 Feature**

***
## Contact

Name: 黃駿宏 Jyun-Hung Huang

Email: Lshapeddesk@icloud.com

Resume: [Click](https://drive.google.com/file/d/1TOtMhhBgRccJ2dvz7alIzB939q3zRSIe/view?usp=sharing)

