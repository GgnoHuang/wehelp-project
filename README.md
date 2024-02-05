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
<img width="1000" alt="圖" src="https://github.com/GgnoHuang/wehelp-project/assets/132812902/e296ab14-18b3-4375-9021-9089558ab127">
<img width="400" alt="圖" src="https://github.com/GgnoHuang/wehelp-project/assets/132812902/a8a32fbb-fd13-451b-9777-14acb18a6d17">

- The front-end is developed using **`Vanilla JavaScript`** for all page interactions and integrates with **`APIs`** to render attraction information and images in the views.
- Use **`Python's Flask`** framework to set up routes, and build a **`MySQL`** database for keeping all the member data.
- Implement the **`Connection Pool`** to enhance database efficiency and performance.
- The back-end routing uses **`RESTful API`** design for **`CRUD`**. This makes the front-end and back-end work better separately.
- Use **`JWT`** to authenticate or verify member tokens, aligning with the **`'Stateless'`** principle of RESTful APIs.
- Create an **`Ubuntu`**-based **`Amazon EC2`** instance and deploy the project to it, then associate an **`Elastic IP`** with the instance for stable external access.

---
## 🟠 Features and Technical Intro (Gif載入較慢，謝謝你的耐心等待😊)

### **🔸 滾動畫面 Scroll Feature**
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/fetch.gif?raw=true" width="600">

- 使用 **`IntersectionObserver`** 使頁面滾動時可以監聽元素，並在觸發觀測後利用 **`fetch`** 向後端取得景點資料，再使用 **`createElement`** 和 **`appendChild`** 動態生成element，最終渲染在畫面上。
- 我設置了一個Api請求的 **`Trigger`** ，為Boolean值，在呼叫api之後透過 **`Promise`** 的 **`.finally()`** 進行Boolean切換，目的是避免IntersectionObserver的觀測造成重複呼叫Api。

#
### **🔸 搜尋功能 Search Feature**
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/search.gif?raw=true" width="600">

- 搜尋功能使用 **`fetch`** 結合 url 的 **`querystring`** 實現，後端透過 **`request.args.get`** 取得前端的querystring，並用於操作 **`mySQL`** 指令以取得特定資料。
- 搜尋時，關鍵字若不完全吻合捷運站名，則使用 **`模糊搜尋`** 的SQL指令進行搜尋，並將景點渲染於畫面上。若完全吻合，則SQL中捷運名欄位吻合關鍵字者，將渲染於畫面上。

#
### **🔸 輪播圖 Carousel Feature**
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/輪播.gif?raw=true" width="600">

- 將所有景點圖放入同一個container中，此父元素使用 **`overflow: hidden`** 後，利用CSS的 **`translate`** 和每張景點圖設定的 **`唯一index`**，得以顯示指定的景點照片。
- 點擊左右箭頭可以觸發函式，控制 **`index`** 切換不同照片，而自動輪播使用 **`setInterval`** 自動觸發此函式。

#
### **🔸 金流服務 Transaction Feature**
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/訂購.gif?raw=true" width="600">
<img src="https://github.com/GgnoHuang/wehelp-project/blob/main/static/IMAGES/交易.gif?raw=true" width="600">

- 透過串接 **`第三方金流`** TapPay的 **`SDK`** ，實現交易功能。
- 金流串接的密鑰及其他機敏資料，儲存於 **`.env`** 中，搭配 **`python-dotenv`** 套件載入程式中使用。最後使用 **`.gitignore`** 忽略環境設定檔案，防止其被同步到GitHub上。

***
## 🟠 Database ER Diagram

<img width="700" alt="圖" src="https://github.com/GgnoHuang/wehelp-project/assets/132812902/9728a067-25f0-4809-8c14-d7c32573fe7a">

***
## Contact

Name: 黃駿宏 Jyun-Hung Huang

Email: Lshapeddesk@icloud.com

Resume: [Click](https://drive.google.com/file/d/1qgItr849JBsAR0q17AS6QkhiGbZ5KTVL/view)
