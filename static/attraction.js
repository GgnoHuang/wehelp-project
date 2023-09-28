
// // ===================================
// async function checkUser(){

//   try{
//     const res = await fetch('http://54.65.60.124:3000/api/user/auth',{
//       method:'GET',
//       headers:{'Authorization': 'Bearer '+token}
//     })
//     if(!res.ok){ //有token但過期，api判斷token過期 會進入except，得到500狀態碼所以!res.ok
//       console.log('未登入')
//       localStorage.removeItem("token");
//       return;
//     }
//     const data = await res.json();
//     if(data.data == null){
//       return
//     }else if(data.data!=null){
//       console.log(data.data)

//     const userData = data.data
//     const userIdData = userData['id']
//     const userEmailData = userData['email']
//     const userNameData = userData['name']
//     }
//   }
//   catch{console.error("catch了");}
// }

// const startBooking = document.querySelector(".booking-btn")

async function startBooking(){
    // ----------------------------------------
    const token = localStorage.getItem('token')
    if(token == null){ // 沒有token情況直接return就不fetch了
      // alert('請先進行登入')
      const systemMsg = document.querySelector(".system-msg")
      systemMsg.innerHTML='預定行程前請先登入會員';
      systemMsg.style.opacity=1;
      openFrom();
      return;
      // 如果不在前端阻擋，那也要設計後端阻擋沒有token的使用者
    }else if(token != null){
      const selectedValue = document.querySelector('input[name="time-picker"]:checked');
      if(selectedValue == null){
        alert('請選擇上午或下午')
        return
      }
      // const a = document.querySelector('input[name="time-picker"]').value
      const userBookingDate = document.querySelector(".user-booking-date").value;
      if(userBookingDate == ""){
        alert("請選擇日期");
        return;
      }
      let price = document.querySelector(".price").innerHTML;
      price = parseInt(price.match(/\d+/)[0], 10);
      // ------------------------
      try{
        const currentUrl = location.href;
        const currentAttractionId = currentUrl.split('/')[currentUrl.split('/').length-1]
        console.log(`景點id為：${currentAttractionId}`)
        // ------------------把預定資料傳到後端＆資料庫--------------------------
        const res2 = await fetch("http://127.0.0.1:3000/api/booking",{
          method:'POST',
          headers:{
            'Authorization': 'Bearer '+token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "attractionId": currentAttractionId,
            "date": userBookingDate,
            "time": selectedValue.value,
            "price": price
          })
        })
        if (!res2.ok){
          let errData = await res2.json()
          console.log('response不ok')
          throw new Error(errData.message);
        }
        const data2 = await res2.json();
        console.log(data2)
        // -------------------------
        window.location.href = "http://127.0.0.1:3000/booking";

          // ---------------先確認會員身份-------------------------
          // let userIdData;
          // const res1 = await fetch('http://54.65.60.124:3000/api/user/auth',{
          //   method:'GET',
          //   headers:{'Authorization': 'Bearer '+token}
          // })
          // if(!res1.ok){ //有token但過期，api判斷token過期 會進入except，得到500狀態碼所以!res.ok
          //   localStorage.removeItem("token");
          //   throw new Error("用戶未登入");
          // }
          // const data1 = await res1.json();
          // if(data1.data == null){
          //   localStorage.removeItem("token");
          //   throw new Error("用戶未登入");
          // }else if(data1.data!=null){
          //   const userData = data1.data
          //   userIdData = userData['id']
          // }
          // console.log(`用戶id為：${userIdData}`)
      }catch(err){
        console.error(`請求失敗：${err}`)
      }
    }
}




































































async function mybooking(){
  const token = localStorage.getItem('token')
  if(token == null){
    const systemMsg = document.querySelector(".system-msg")
    systemMsg.innerHTML='預定行程前請先登入會員';
    systemMsg.style.opacity=1;
    openFrom();
    return; // 沒有token情況直接return就不fetch了
  } 
  try{
    // const res = await fetch('http://54.65.60.124:3000/api/user/auth',{
    const res = await fetch('http://127.0.0.1:3000/api/user/auth',{
      method:'GET',
      headers:{'Authorization': 'Bearer '+token}
    })
    if(!res.ok){ //有token但過期，api判斷token過期 得到500狀態碼所以!res.ok，進入except，
      console.error('用戶未登入');
      localStorage.removeItem("token");

      const systemMsg = document.querySelector(".system-msg")
      systemMsg.innerHTML='預定行程前請先登入會員';
      systemMsg.style.opacity=1;
      openFrom();
      return;
    }
    const data = await res.json();
    console.log(data)
    if(data.data == null){
      console.log(data)
      return;
    }
    else if(data.data != null){
      // 你只要有點可能，我就不給執行
    // 只要有一點點的可能性是null那就不讓執行
      
      // 發送請求booking api請求
      window.location.href = "http://127.0.0.1:3000/booking";
    }
  }
  catch{
    console.error("catch");
  }
}

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
    const data = await response.json();
    // console.log(data);
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

// ===========登入  ===

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
  document.body.style.overflow = 'hidden';
  document.querySelector('.form-wrapper')
  .setAttribute('style','pointer-events: auto;transform:translateY(0%)')
  document.querySelector('.bg-modal').style.backgroundColor = "rgba(0, 0, 0, 0.25)";
  
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
  document.querySelector(".system-msg").innerHTML=''
}

function confirmLogout(){
  localStorage.removeItem("token");
  document.querySelector('.open-form-btn').classList.remove("open-form-btn-hidden");//登入註冊選單按鈕出現
  document.querySelector('.logout-btn').classList.add("logout-btn-hidden");//登出按鈕消失
  document.querySelector('.confirm-logout').classList.add('logout-btn-hidden');
  checkUserAuth();
  location.reload();
}
// ===================================
async function checkUserAuth(){
  document.querySelector('.open-form-btn').classList.remove("open-form-btn-hidden");//登入註冊選單按鈕出現
  document.querySelector('.logout-btn').classList.add("logout-btn-hidden");//登出按鈕消失
  const token = localStorage.getItem('token')
  if(token == null){ // 沒有token情況直接return就不fetch了
    return
  }
  try{
    const res = await fetch('http://54.65.60.124:3000/api/user/auth',{
      method:'GET',
      headers:{'Authorization': 'Bearer '+token}
    })
    if(!res.ok){ //有token但過期，api判斷token過期 會進入except，得到500狀態碼所以!res.ok
      console.log('未登入')
      localStorage.removeItem("token");
      return;
    }
    const data = await res.json();
    console.log(data)
    if(data.data == null){
      return
    }else if(data.data!==null){
      console.log(data.data)

    const userData = data.data
    const userIdData = userData['id']
    const userEmailData = userData['email']
    const userNameData = userData['name']
    console.log(userIdData,userNameData,userEmailData)
    document.querySelector('.open-form-btn').classList.add("open-form-btn-hidden");//登入註冊選單按鈕消失
    document.querySelector('.logout-btn').classList.remove("logout-btn-hidden");//登出按鈕出現
    }
  }
  catch{
    console.error("catch了");
  }
}
checkUserAuth();



// =================fetch===================
const pageId = location.href.split('/')[location.href.split('/').length-1]
// 把目前所在的url尾端的數字（景點的對應id）取出
// 這個id拿來給後端的動態路由使用 /api/attraction/<id>
// 以下操作為：使用fetch從 /api/attraction/<id> 取得資料庫中的景點資訊，再用資料渲染頁面
// 所以id的流動過程為：
// 1.首頁在創建並渲染景點圖卡時，事件監聽使點擊的時候跳轉到url = location.href+ 'attraction/' + idData
// 2.
// 3.
const attractionApiUrl = `http://54.65.60.124:3000/api/attraction/${pageId}`
async function fetchData(url){
  try{
    const res = await fetch(url);
    if(!res.ok){
      throw new Error(`fetch失敗，api地址為：${url}`)
    }
    const data = await res.json();
    return data;
  }
  catch(err){
    console.error(err)
  }
}
// =================載入內容==================
let nameData, catData, mrtData, descriptionData, addData, transportData, imgDatas
async function useFetchData(){
  try{
    const result = await fetchData(attractionApiUrl);
    nameData = result.data.name;
    catData = result.data.category;
    mrtData = result.data.mrt;
    descriptionData = result.data.description;
    addData = result.data.address;
    transportData = result.data.transport;    
    imgDatas = result.data.images
    // console.log(nameData,catData,mrtData,descriptionData,addData,transportData,imgDatas)

    loadData();
  }catch (err) {
    console.log(err);
  }
}
useFetchData();//async function不會提升 所以呼叫要寫在下面
function loadData(){
  const placeName = document.querySelector(".attraction-name")
  const catAndMrt = document.querySelector(".attraction-class-mrt")
  const description = document.querySelector(".description")
  const address = document.querySelector(".address")
  const transport = document.querySelector(".transport")
  placeName.innerHTML = nameData;
  catAndMrt.innerHTML = catData +' at '+ mrtData
  description.innerHTML = descriptionData
  address.innerHTML = addData
  transport.innerHTML = transportData

  imgDatas.forEach((imgData)=>{
    const newAttractionImg = document.createElement("img");
    newAttractionImg.className ='attraction-img';
    newAttractionImg.setAttribute('src', imgData);
    carousel.appendChild(newAttractionImg)
  })
  imgsCnt = imgDatas.length;//
  // ``````````````按照數量創造dot````````````
  const dotArea = document.querySelector(".dot-area"); 
  function createBlackDot(){
    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEl.setAttribute("class", "dot-parent");
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.setAttribute("width", "12");
    svgEl.setAttribute("height", "12");
    svgEl.setAttribute("viewBox", "0 0 12 12");
    svgEl.setAttribute("fill", "none");
    const blackDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    blackDot.setAttribute("class", "dots");
    blackDot.setAttribute("cx", "6");
    blackDot.setAttribute("cy", "6");
    blackDot.setAttribute("r", "5.5");
    blackDot.setAttribute("fill", "black");
    blackDot.setAttribute("stroke", "white");
    svgEl.appendChild(blackDot);
    dotArea.appendChild(svgEl);
  }
  function createWhiteDots(){
    for(let i=1; i<imgsCnt; i++){
      const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgEl.setAttribute("class", "dot-parent");
      svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgEl.setAttribute("width", "12");
      svgEl.setAttribute("height", "12");
      svgEl.setAttribute("viewBox", "0 0 12 12");
      svgEl.setAttribute("fill", "none");
      const whiteDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      whiteDot.setAttribute("class", "dots");
      whiteDot.setAttribute("cx", "6");
      whiteDot.setAttribute("cy", "6");
      whiteDot.setAttribute("r", "6");
      whiteDot.setAttribute("fill", "white");
      svgEl.appendChild(whiteDot);
      dotArea.appendChild(svgEl);
    }
  }
  createBlackDot();
  createWhiteDots();
  function selectImg(){
    const dots = document.querySelectorAll(".dots")
    dots.forEach((dot,index) => {
      dot.addEventListener('click',(e)=>{
        dots.forEach(dot=>{
          dot.setAttribute("r", "6"); 
          dot.setAttribute("fill", "white"); 
          dot.setAttribute("stroke",null); 
        });
        e.target.setAttribute("r", "5.5"); 
        e.target.setAttribute("fill", "black"); 
        e.target.setAttribute("stroke", "white"); 
        imageIndex = index;
        carousel.style.transform = `translate(-${imageIndex*100}%)`;
        // console.log(`目前第${imageIndex}張`)
      });
    });
  };
  selectImg()
  // ````````````````````````````````````
}

// ================= CAROUSEL ==================
let imgsCnt;
const carousel = document.querySelector(".carousel")
let imageIndex = 0;
// 當 imageIndex = 0;時候`translate(-${imageIndex*100}%)`;就是`translate(0%)`;也就不會動
let intervalId ;
function autoSlide(){
  intervalId = setInterval(() => {
    slideImage()
  }, 1500);
}
//===================CAROUSEL + DOT==============================
function slideImage(){
  const dots = document.querySelectorAll(".dots")
  dots.forEach(dot => {
        dot.setAttribute("r", "6"); 
        dot.setAttribute("fill", "white"); 
        dot.setAttribute("stroke",null); 
  });
  imageIndex ++;
  if(imageIndex == imgsCnt){
    imageIndex = 0;
  }
  let currentBlackDot = dots[imageIndex]
  currentBlackDot.setAttribute("r", "5.5"); 
  currentBlackDot.setAttribute("fill", "black"); 
  currentBlackDot.setAttribute("stroke", "white"); 
  carousel.style.transform = `translate(-${imageIndex*100}%)`;
  // console.log(`目前第${imageIndex}張`)
}


const imgWrapper = document.querySelector(".attraction-img-wrapper")
imgWrapper.addEventListener('mouseover', ()=>{
  clearInterval(intervalId);
})
imgWrapper.addEventListener('mouseleave', ()=>{
  autoSlide();
})
//==================================================
const imgBtns = document.querySelectorAll(".img-btn")
imgBtns.forEach(btn =>{
  btn.addEventListener("click",(e) =>{
    clearInterval(intervalId);
    if (e.target.className.includes('prev-btn')){
      imageIndex -= 2//  -2是因為 slideImage()等等會+1
      if(imageIndex < -1){
        imageIndex = imgsCnt-2 
      }
    }
    slideImage()
  })
})

autoSlide();


//研究一下這個呼叫擺放的位置

//=================== radioStyleChange ===========================
const timePickerLabel = document.querySelectorAll(".time-picker-label");
const radioSVGs = document.querySelectorAll(".radio-svgs");
const morningLabel = document.getElementById('morning');
const afternoonLabel = document.getElementById('afternoon');
function radioColorChange(radio){
  radio.innerHTML=`<g clip-path="url(#clip0_3_336)"><circle cx="11" cy="11" r="11" fill="white"/><circle cx="11" cy="11" r="9" fill="#448899"/></g><defs><clippath><rect width="22" height="22" fill="white"/></clippath></defs>`
}
function radioColorRestore(radio){
  radio.innerHTML=`<g clip-path="url(#clip0_3_341)"><circle cx="11" cy="11" r="11" fill="white"/></g><defs><clippath ><rect width="22" height="22" fill="white"/></clippath></defs>`
}
morningLabel.addEventListener('click',()=>{
  for(let i=0; i<radioSVGs.length; i++){
    radioColorRestore(radioSVGs[i])
  };
  radioColorChange(document.querySelector('.radio-svgs-1'))
})

afternoonLabel.addEventListener('click',()=>{
  for(let i=0; i<radioSVGs.length; i++){
    radioColorRestore(radioSVGs[i])
  };
  radioColorChange(document.querySelector('.radio-svgs-2'))
})

//-------------------------------------------------------
const price = document.querySelector(".price");
const timePickerBtns = document.querySelectorAll(".time-picker-btn");
timePickerBtns.forEach(btn =>{
  btn.addEventListener('click', ()=>{
    const selectedValue = document.querySelector('input[name="time-picker"]:checked').value;
    price.innerHTML = selectedValue == "morning" ? "新台幣2000元"
                      :selectedValue == "afternoon" ? "新台幣2500元"
                      : ""
  })
})



