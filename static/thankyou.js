// const Ip ='http://127.0.0.1:3000/';
const Ip ='http://54.65.60.124:3000/';

if (!window.location.href.includes("/thankyou?number=")){
  window.location.href =Ip;
}

let userNameData;
let userData;
async function checkUserAuth(){
  document.querySelector('.open-form-btn').classList.remove("open-form-btn-hidden");//登入註冊選單按鈕出現
  document.querySelector('.logout-btn').classList.add("logout-btn-hidden");//登出按鈕消失
  const token = localStorage.getItem('token')
  if( token == null ) { 
    window.location.href = Ip;
    return } // 沒有token情況直接return就不fetch了
  try{
    const res = await fetch(`${Ip}api/user/auth`,{
      method:'GET',
      headers:{'Authorization': 'Bearer '+token}
    })
    if(!res.ok){ //有token但過期，api判斷token過期 得到500狀態碼所以!res.ok，進入except，
      console.error('用戶未登入');
      localStorage.removeItem("token");
      window.location.href = Ip;
      return;
    }
    const data = await res.json();
    if(data.data == null){
      console.log(data)
      return
    }else if(data.data!==null){
      userData = data.data

      document.querySelector(".hello-username").innerHTML= userData['name']

      document.querySelector('.open-form-btn').classList.add("open-form-btn-hidden");//登入註冊選單按鈕消失
      document.querySelector('.logout-btn').classList.remove("logout-btn-hidden");//登出按鈕出現
      // 取得完整的URL
      const currentUrl = window.location.href;
      // 使用正則表達式來提取後面的數字
      const pattern = /number=(\d+-\d+)/;
      let match = currentUrl.match(pattern);
      if (match) {
        let extractedNumber = match[1];
        console.log("訂單號碼:", extractedNumber);
        document.querySelector(".payment-order-num").innerHTML = extractedNumber;
      } else {
        console.log("訂單格式錯誤");
      }
    }
  }
  catch{
    console.error("catch");
  }
}
checkUserAuth();


function openFrom(){
  document.body.style.overflow = 'hidden';
  document.querySelector('.form-wrapper')
  .setAttribute('style','pointer-events: auto;transform:translateY(0%)')
  document.querySelector('.bg-modal').style.backgroundColor = "rgba(0, 0, 0, 0.25)";
}
const closeBtn = document.querySelector('.close-btn');
closeBtn.addEventListener('click',closeForm)
function closeForm(){
  document.querySelector('.form-wrapper')
  .setAttribute('style','pointer-events: none;transform:translateY(-200%)')
  document.body.style.overflow = 'visible';
  document.querySelector('.bg-modal').style.backgroundColor = "rgba(0, 0, 0, 0)";
  document.getElementById('username').value="";
  document.getElementById('useremail').value="";
  document.getElementById('password').value="";
  document.querySelector(".system-msg").innerHTML="";
}

function logout(){
  // document.body.style.overflow = 'hidden';
  // document.querySelector('.form-wrapper')
  // .setAttribute('style','pointer-events: auto;transform:translateY(0%)')
  // document.querySelector('.bg-modal').style.backgroundColor = "rgba(0, 0, 0, 0.25)";
  openFrom();
  
  document.getElementById("username").classList.add("username-field-hidden")
  document.getElementById("useremail").classList.add("username-field-hidden")
  document.getElementById("password").classList.add("username-field-hidden")
    
  const registerText= document.querySelector(".register-text"); 
  registerText.innerHTML='確定要登出嗎？'

  document.querySelector(".already").classList.add('already-or-donthave-hidden');
  document.querySelector(".dont-have").classList.add('already-or-donthave-hidden');

  document.querySelector('.login-btn').classList.add('member-btn-hidden');
  document.querySelector('.member-btn').classList.add('member-btn-hidden');

  document.querySelector('.confirm-logout').classList.remove('confirm-logout-hidden');
  document.querySelector('.confirm-logout').style.margin = "0";
  document.querySelector('.confirm-delete').classList.add('confirm-delete-hidden');
  document.querySelector('.confirm-transaction').classList.add('confirm-transaction-hidden');


  document.querySelector(".system-msg").innerHTML=''
}

function confirmLogout(){
  localStorage.removeItem("token");
  document.querySelector('.open-form-btn').classList.remove("open-form-btn-hidden");//登入註冊選單按鈕
  document.querySelector('.logout-btn').classList.add("logout-btn-hidden");//登出按鈕
  document.querySelector('.confirm-logout').classList.add('logout-btn-hidden');

  window.location.href = Ip;
}

// ================ modal =============================================
// ====================================================================
// ====================================================================
// ================ get auth ==========================================

async function mybooking(){ 
  const token = localStorage.getItem('token')
  if(token == null){
    window.location.href = Ip;
    return;
  } 
  try{
    const res = await fetch(`${Ip}api/user/auth`,{
      method:'GET',
      headers:{'Authorization': 'Bearer '+token}
    })
    if(!res.ok){ //有token但過期，api判斷token過期 得到500狀態碼所以!res.ok，進入except，
      console.error('用戶未登入');
      localStorage.removeItem("token");
      window.location.href = Ip;
    }
    const data = await res.json();
    console.log(data)
    if(data.data == null){
      console.log(data)
      window.location.href = Ip;
      return;
    }
    else if(data.data != null){
      window.location.href = `${Ip}booking`
    }
  }
  catch{
    console.error("catch");
  }
}

// -----------------------------------------------------------------------

let orderNumber;
async function getOrderStatus(){
  const token = localStorage.getItem('token')
  if( token == null ) { 
    window.location.href = Ip;
    return
  }
  if (window.location.href.match(/number=(\d+-\d+)/)) {
    orderNumber = window.location.href.match(/number=(\d+-\d+)/)[1];
    console.log('有抓到數字');
    const apiUrl =`${Ip}api/orders/${orderNumber}`
    try{
      const res = await fetch(apiUrl,{
        method:'GET',
        headers:{
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+token
        }
      })
      if(!res.ok){ 
        let errData = await res.json()
        console.log('無此訂單')
        document.querySelector(".is-paid").innerHTML=""
        document.querySelector(".payment-order-num").innerHTML = "無此訂單。"
        throw new Error(errData.message);
      }
      const data = await res.json();

      console.log(`付款狀態: ${data.data.status}`);

      if(data.data.status == 1){
        document.querySelector(".is-paid").innerHTML="付款完成"
      }else if(data.data.status == 0){
        document.querySelector(".is-paid").innerHTML="未付款"
      }
    }catch(err){
      console.error(`請求失敗：${err}`)
    }
  } else {
    console.log('無此訂單')
    document.querySelector(".is-paid").innerHTML=""
    document.querySelector(".payment-order-num").innerHTML = "無此訂單。"
  }
}
getOrderStatus()
















