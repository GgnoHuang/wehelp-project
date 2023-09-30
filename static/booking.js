// const bd=document.querySelector("body");
// bd.removeChild(document.querySelector(".place-info-area-wrapper"));

// bd.removeChild(document.querySelector(".contact-info-wrapper"));
// bd.removeChild(document.querySelector(".credit-info-wrapper"));
// bd.removeChild(document.querySelector(".confirm-booking-wrapper"));


// document.querySelectorAll(".separator").forEach(separator=>{
//   bd.removeChild(separator);
// });


// document.querySelector("html").classList.add("no-booking-result-html")
// document.querySelector("body").classList.add("no-booking-result-body")
// document.querySelector(".footer-wrapper").classList.add("no-booking-result-footer-wrapper")
// console.log("沒行程")















function mybooking(){ location.reload(); }

// ================ modal =======================================
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

function switchToLogin(){
  const usernameInputBox = document.getElementById("username"); 
  usernameInputBox.classList.add('username-field-hidden')
  
  const registerText= document.querySelector(".register-text"); 
  registerText.innerHTML='登入會員帳號'

  const already= document.querySelector(".already"); 
  const donthave =document.querySelector(".dont-have"); 
  already.classList.add('already-or-donthave-hidden');
  donthave.classList.remove('already-or-donthave-hidden');

  const loginBtn=document.querySelector('.login-btn');
  const memberBtn=document.querySelector('.member-btn');
  loginBtn.classList.remove('member-btn-hidden');
  memberBtn.classList.add('member-btn-hidden');

  document.getElementById('username').value="";
  document.getElementById('useremail').value="";
  document.getElementById('password').value="";
  document.querySelector(".system-msg").innerHTML=''
}

function switchToRegister(){
  const usernameInputBox = document.getElementById("username"); 
  usernameInputBox.classList.remove("username-field-hidden")
  
  const registerText= document.querySelector(".register-text"); 
  registerText.innerHTML='註冊會員帳號'

  const already= document.querySelector(".already"); 
  const donthave =document.querySelector(".dont-have"); 
  already.classList.remove('already-or-donthave-hidden');//
  donthave.classList.add('already-or-donthave-hidden');

  const loginBtn=document.querySelector('.login-btn');
  const memberBtn=document.querySelector('.member-btn');
  loginBtn.classList.add('member-btn-hidden');
  memberBtn.classList.remove('member-btn-hidden');

  document.getElementById('username').value="";
  document.getElementById('useremail').value="";
  document.getElementById('password').value="";
  document.querySelector(".system-msg").innerHTML=''
}
// ================註冊=====================================
async function register(){
  const apiUrl ='http://54.65.60.124:3000/api/user'
  const usernameInput = document.getElementById('username').value;
  const useremailInput = document.getElementById('useremail').value;
  const passwordInput = document.getElementById('password').value;
  const systemMsg = document.querySelector(".system-msg")
  systemMsg.style.color="rgb(227, 60, 60)";
  systemMsg.innerHTML="";
  systemMsg.style.opacity=0;
  if(usernameInput == "" || useremailInput == "" || passwordInput == ""){
    systemMsg.innerHTML='請填寫每個欄位';
    systemMsg.style.opacity=1;
    return;
  };
  if(usernameInput != usernameInput.trim() || useremailInput != useremailInput.trim() || passwordInput!=passwordInput.trim()){
    systemMsg.innerHTML='請勿輸入空格';
    systemMsg.style.opacity=1;
    return;
  };
  const passwordpattern = /^[a-zA-Z0-9]+$/;
  if(!passwordpattern.test(passwordInput)){
    systemMsg.innerHTML='僅能輸入英文及數字';
    systemMsg.style.opacity=1;
    return;
  };
  const emailPattern = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if(!emailPattern.test(useremailInput)){
    systemMsg.innerHTML='請輸入正確的電子信箱格式';
    systemMsg.style.opacity=1;
    return;
  };// ------------------------
  try{
    const response = await fetch(apiUrl,{
      method:'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": usernameInput,
        "useremail": useremailInput,
        "password": passwordInput
      })
    })

    if (!response.ok) {
      let errData = await response.json()
      systemMsg.innerHTML=errData.message;
      systemMsg.style.opacity=1;
      throw new Error(errData.message);
    }
    systemMsg.innerHTML="註冊成功！"
    systemMsg.style.color="rgb(69, 199, 89)";
    systemMsg.style.opacity=1;
    document.getElementById('username').value="";
    document.getElementById('useremail').value="";
    document.getElementById('password').value="";
  }catch(err){
    // document.querySelector(".register-success").innerHTML="不明錯誤"
    console.error(`請求失敗：${err}`)
  }
}
// ===========  登入  ==============
async function login(){
  const useremailInput = document.getElementById('useremail').value;
  const passwordInput = document.getElementById('password').value;
  const systemMsg = document.querySelector(".system-msg");
  systemMsg.style.color="rgb(227, 60, 60)";
  if(useremailInput == "" || passwordInput == ""){
    systemMsg.innerHTML='請填寫每個欄位';
    systemMsg.style.opacity=1;
    return;
  };
  if(useremailInput != useremailInput.trim() || passwordInput!=passwordInput.trim()){
    systemMsg.innerHTML='請勿輸入空格';
    systemMsg.style.opacity=1;
    return;
  };
  const passwordpattern = /^[a-zA-Z0-9]+$/;
  if(!passwordpattern.test(passwordInput)){
    systemMsg.innerHTML='僅能輸入英文及數字';
    systemMsg.style.opacity=1;
    return;
  };
  const emailPattern = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if(!emailPattern.test(useremailInput)){
    systemMsg.innerHTML='請輸入正確的電子信箱格式';
    systemMsg.style.opacity=1;
    return;
  };

  try{
    const apiUrl ='http://54.65.60.124:3000/api/user/auth'
    const res = await fetch(apiUrl,{
      method:'PUT',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "useremail": useremailInput,
        "password": passwordInput
      })
    })
    if(!res.ok){
      const data = await res.json();
      errData = data.message;
      systemMsg.innerHTML = errData;
      systemMsg.style.opacity=1;
      throw new Error(errData);
    }
    
    const data = await res.json();
    // console.log(data)
    const token = data.token
    localStorage.setItem('token', token);
    // systemMsg.innerHTML='登入成功';
    // systemMsg.style.color="rgb(69, 199, 89)";
    // systemMsg.style.opacity=1;
    document.getElementById('useremail').value="";
    document.getElementById('password').value="";

    document.querySelector('.open-form-btn').classList.add("open-form-btn-hidden");//登入註冊選單按鈕消失
    document.querySelector('.logout-btn').classList.remove("logout-btn-hidden");//登出按鈕出現

    document.getElementById('useremail').value="";
    document.getElementById('password').value="";

    location.reload();
  }
  catch(err){
    console.error(err);
  }
}
// =======================================
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

  document.querySelector(".system-msg").innerHTML=''
}

function confirmLogout(){
  localStorage.removeItem("token");
  document.querySelector('.open-form-btn').classList.remove("open-form-btn-hidden");//登入註冊選單按鈕消失
  document.querySelector('.logout-btn').classList.add("logout-btn-hidden");//登出按鈕出現
  document.querySelector('.confirm-logout').classList.add('logout-btn-hidden');
  // checkUserAuth();
  window.location.href = "http://127.0.0.1:3000/";
  // location.reload();
}
// ===================================



// ~~~~~~~~~~~~~~~~~~~~確定會員身份，取得會員姓名~~~~~~~~~~~~~~~~~~~~~~~
let userNameData;
async function checkUserAuth(){
  document.querySelector('.open-form-btn').classList.remove("open-form-btn-hidden");//登入註冊選單按鈕出現
  document.querySelector('.logout-btn').classList.add("logout-btn-hidden");//登出按鈕消失
  const token = localStorage.getItem('token')
  if( token == null ) { return } // 沒有token情況直接return就不fetch了
  try{
    // const res = await fetch('http://54.65.60.124:3000/api/user/auth',{
    const res = await fetch('http://127.0.0.1:3000/api/user/auth',{
      method:'GET',
      headers:{'Authorization': 'Bearer '+token}
    })
    if(!res.ok){ //有token但過期，api判斷token過期 得到500狀態碼所以!res.ok，進入except，
      console.error('用戶未登入');
      localStorage.removeItem("token");
      return;
    }
    const data = await res.json();
    if(data.data == null){
      console.log(data)
      return
    }else if(data.data!==null){
    const userData = data.data

    userNameData = userData['name']
    document.querySelector(".hello-username").innerHTML=userNameData;

    document.querySelector('.open-form-btn').classList.add("open-form-btn-hidden");//登入註冊選單按鈕消失
    document.querySelector('.logout-btn').classList.remove("logout-btn-hidden");//登出按鈕出現
    }
  }
  catch{
    console.error("catch");
  }
}
checkUserAuth();
// -----------------預訂頁面資料加載--------------------
async function loadBookingInfo(){
  const token = localStorage.getItem('token')
  if(token == null){
    console.log('沒有token登入');
    window.location.href = "http://127.0.0.1:3000/";
    return;
  }
  try{
    const res = await fetch("http://127.0.0.1:3000/api/booking",{
      method:'GET',
      headers:{'Authorization': 'Bearer '+token,},
    })
    if (!res.ok){
      let errData = await res.json()
      if(errData.error){
        console.log('這邊開始寫讓頁面清空的代碼');
        const bd=document.querySelector("body");
        bd.removeChild(document.querySelector(".place-info-area-wrapper"));
        bd.removeChild(document.querySelector(".contact-info-wrapper"));
        bd.removeChild(document.querySelector(".credit-info-wrapper"));
        bd.removeChild(document.querySelector(".confirm-booking-wrapper"));
        document.querySelectorAll(".separator").forEach(separator=>{
          bd.removeChild(separator);
        });
        document.querySelector("html").classList.add("no-booking-result-html")
        document.querySelector("body").classList.add("no-booking-result-body")
        document.querySelector(".footer-wrapper").classList.add("no-booking-result-footer-wrapper")
        console.log("沒行程")
        document.querySelector(".no-booking-text").classList.remove("username-field-hidden")

      }
      throw new Error(errData.message);
    }
    document.querySelector(".no-booking-text").classList.add("username-field-hidden")

    // document.querySelector("html").classList.remove("no-booking-result-html")
    // document.querySelector("body").classList.remove("no-booking-result-body")
    // document.querySelector(".footer-wrapper").classList.remove("no-booking-result-footer-wrapper")
    // 上面這個不用加
    console.log("有行程")
    const data = await res.json();

    const attractionName = data.data.attraction.name;
    const attractionAdd = data.data.attraction.address;
    const attractionImg = data.data.attraction.image;
    const bookingDate = data.data.date;
    const bookingTime = data.data.time;
    const bookingPrice = data.data.price;
    document.querySelector(".place-name-span").innerHTML=attractionName;
    document.querySelector(".date").innerHTML=bookingDate;
    if(bookingTime == "afternoon"){
      document.querySelector(".time").innerHTML='下午 2 點到晚上 9 點';
    }else if(bookingTime == "morning"){
      document.querySelector(".time").innerHTML='早上 9 點到下午 4 點';
    }
    document.querySelector(".price").innerHTML=bookingPrice;
    document.querySelector(".price-2").innerHTML=bookingPrice;
    document.querySelector(".place-img-src").setAttribute('src',attractionImg);
    document.querySelector(".add").innerHTML=attractionAdd;

    console.log(attractionName,attractionAdd,attractionImg,bookingDate,bookingTime,bookingPrice);
  }catch(err){
    console.log(err);
  }
}
loadBookingInfo();



function deleteBooking(){
  // document.body.style.overflow = 'hidden';
  // document.querySelector('.form-wrapper')
  // .setAttribute('style','pointer-events: auto;transform:translateY(0%)')
  // document.querySelector('.bg-modal').style.backgroundColor = "rgba(0, 0, 0, 0.25)";
  openFrom();
  document.getElementById("username").classList.add("username-field-hidden")
  document.getElementById("useremail").classList.add("username-field-hidden")
  document.getElementById("password").classList.add("username-field-hidden")
    
  const registerText= document.querySelector(".register-text"); 
  registerText.innerHTML='確定要刪除行程嗎？'

  document.querySelector(".already").classList.add('already-or-donthave-hidden');
  document.querySelector(".dont-have").classList.add('already-or-donthave-hidden');

  document.querySelector('.login-btn').classList.add('member-btn-hidden');
  document.querySelector('.member-btn').classList.add('member-btn-hidden');

  document.querySelector('.confirm-logout').classList.add('confirm-logout-hidden');
  document.querySelector('.confirm-delete').classList.remove('confirm-delete-hidden');
  document.querySelector('.confirm-delete').style.margin = "0";

  document.querySelector(".system-msg").innerHTML=''
}


async function confirmDeleteBooking(){
  const token = localStorage.getItem('token')
  if(token == null){
    console.log('沒有token登入');
    window.location.href = "http://127.0.0.1:3000/";
    return;
  }
  try{
    const res = await fetch("http://127.0.0.1:3000/api/booking",{
      method:'DELETE',
      headers:{'Authorization': 'Bearer '+token,},
    })
    if (!res.ok){
      let errData = await res.json()
      console.log('response is not ok')
      throw new Error(errData.message);
    }
    const data = await res.json();
    console.log(data)
  }catch{
    console.log("catch");
  }
  location.reload();
}