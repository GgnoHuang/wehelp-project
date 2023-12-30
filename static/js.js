// const Ip ='http://127.0.0.1:3000/';
const Ip ='http://54.65.60.124:3000/';


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

    const res = await fetch(`${Ip}api/user/auth`,{
      method:'GET',
      headers:{'Authorization': 'Bearer '+token}
    })
    if(!res.ok){ //有token但過期，api判斷token過期 得到500狀態碼所以!res.ok，進入except，
      // console.error('用戶未登入');
      localStorage.clear();
      const systemMsg = document.querySelector(".system-msg")
      systemMsg.innerHTML='預定行程前請先登入會員';
      systemMsg.style.opacity=1;
      openFrom();
      return;
    }
    const data = await res.json();
    // console.log(data)
    if(data.data == null){
      // console.log(data)
      return;
    }
    else if(data.data != null){
      // 只要有點可能null，我就不給執行
    // 只要有一點點的可能性是null那就不讓執行

      window.location.href =  `${Ip}booking`;
    }
  }
  catch{
    // console.error("catch");
  }
}

// ======== Member System  Modal  ====================
// ======== Member System  Modal  ====================
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
  document.querySelector(".system-msg").innerHTML="";
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

//--------- 註冊功能 -----------
async function register(){
  const apiUrl = `${Ip}api/user`

  const usernameInput = document.getElementById('username').value;
  const useremailInput = document.getElementById('useremail').value;
  const passwordInput = document.getElementById('password').value;
  const systemMsg = document.querySelector(".system-msg");
  systemMsg.style.color="rgb(227, 60, 60)";
  systemMsg.innerHTML="";
  /*這邊css中使用了 .system-msg:empty{} */
  if(usernameInput == "" || useremailInput == "" || passwordInput == ""){
    systemMsg.innerHTML='請填寫每個欄位';
    return;
  };
  if(usernameInput != usernameInput.trim() || useremailInput != useremailInput.trim() || passwordInput!=passwordInput.trim()){
    systemMsg.innerHTML='請勿輸入空格';
    return;
  };
  const passwordpattern = /^[a-zA-Z0-9]+$/;
  if(!passwordpattern.test(passwordInput)){
    systemMsg.innerHTML='僅能輸入英文及數字';
    return;
  };
  const emailPattern = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if(!emailPattern.test(useremailInput)){
    systemMsg.innerHTML='請輸入正確的電子信箱格式';
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
      // alert(errData)
      // document.querySelector(".register-success").innerHTML=errData
      throw new Error(errData.message);
    }
    const data = await response.json();
    // console.log(data)
    systemMsg.innerHTML="註冊成功！";
    systemMsg.style.color="rgb(69, 199, 89)";
    document.getElementById('username').value="";
    document.getElementById('useremail').value="";
    document.getElementById('password').value="";
  }catch(err){
    console.error(`請求失敗：${err}`)
  }
}

////--------- 登入功能 -----------
async function login(){
  const useremailInput = document.getElementById('useremail').value
  const passwordInput = document.getElementById('password').value
  const systemMsg = document.querySelector(".system-msg")
  systemMsg.innerHTML=""
   /*這邊css中使用了 .system-msg:empty{} */
  if(useremailInput == "" || passwordInput == ""){
    systemMsg.innerHTML='請填寫每個欄位';
    return;
  };
  if(useremailInput != useremailInput.trim() || passwordInput!=passwordInput.trim()){
    systemMsg.innerHTML='請勿輸入空格';
    return;
  };
  const passwordpattern = /^[a-zA-Z0-9]+$/;
  if(!passwordpattern.test(passwordInput)){
    systemMsg.innerHTML='僅能輸入英文及數字';
    return;
  };
  const emailPattern = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if(!emailPattern.test(useremailInput)){
    systemMsg.innerHTML='請輸入正確的電子信箱格式';
    return;
  };
  try{
    const apiUrl = `${Ip}api/user/auth`
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
      throw new Error(errData);
    }
    const data = await res.json();
    // console.log(data)
    const token = data.token
    localStorage.setItem('token', token);


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
  document.querySelector('.confirm-logout').style.margin = "0";
  document.querySelector(".system-msg").innerHTML=''
}

function confirmLogout(){
  localStorage.clear();
  document.querySelector('.open-form-btn').classList.remove("open-form-btn-hidden");//登入註冊選單按鈕消失
  document.querySelector('.logout-btn').classList.add("logout-btn-hidden");//登出按鈕出現
  document.querySelector('.confirm-logout').classList.add('logout-btn-hidden');

  location.reload();
}
// -----------  確認會員狀態 -----------------
async function checkUserAuth(){
  document.querySelector('.open-form-btn').classList.remove("open-form-btn-hidden");//登入註冊選單按鈕出現
  document.querySelector('.logout-btn').classList.add("logout-btn-hidden");//登出按鈕消失
  const token = localStorage.getItem('token')
  if( token == null ) { 
    // console.log("登入狀態：未登入")
    return } // 沒有token情況直接return就不fetch了
  try{
    const res = await fetch( `${Ip}api/user/auth`,{
      method:'GET',
      headers:{'Authorization': 'Bearer '+token}
    })
    if(!res.ok){ //有token但過期，api判斷token過期 得到500狀態碼所以!res.ok，進入except，
      console.error('用戶未登入');
      localStorage.clear();
      return;
    }
    const data = await res.json();
    if(data.data == null){
      // console.log(data)
      return
    }else if(data.data!==null){
    const userData = data.data
    const userIdData = userData['id']
    const userEmailData = userData['email']
    const userNameData = userData['name']
    // console.log(userIdData,userNameData,userEmailData)

    //💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment
    localStorage.setItem('userid', userIdData);
    localStorage.setItem('username', userNameData);
    localStorage.setItem('username', userEmailData);
//💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment


    document.querySelector('.open-form-btn').classList.add("open-form-btn-hidden");//登入註冊選單按鈕出現
    document.querySelector('.logout-btn').classList.remove("logout-btn-hidden");//登出按鈕消失
    }
  }
  catch{
    // console.error("catch");
  }
}
checkUserAuth();

// =====// ▼ ▼ ▼載入各個捷運站按鈕▼ ▼ ▼ ▼ ▼ =====// =====// =====// =====// =====
fetch(`${Ip}api/mrts`)
  .then(res=>{
    if(!res.ok){throw new Error('fetch抓失敗')}
    // console.log('fetch成功:api/mrts')
    return res.json();
  })
  .then(data=>{
    let results=data.data;
    for(let i=0; i<results.length;i++){
      mrtsArr.push(results[i])
    };
    loadMrt();
  })
  .catch(error => {
    console.error('api/mrts的API請求錯誤:', error);
  })

let mrtsArr = [];
function loadMrt(){
  for(let i=0 ; i< mrtsArr.length ; i++){
    const placeBar = document.querySelector('.place') 
    const NewDiv = document.createElement("div");
    NewDiv.className='mrt';
    const newP = document.createElement('p');
    newP.textContent=mrtsArr[i];
    newP.className='mrt-text';
    NewDiv.appendChild(newP);
    placeBar.appendChild(NewDiv);
  };
  const mrtBtns = document.querySelectorAll(".mrt-text");
  mrtBtns.forEach((mrtBtn) => { //這邊一定要放在loadMrt裡面，因為mrtBtns在fetch之後才出現
    mrtBtn.addEventListener("click", ()=>{
      keyword = mrtBtn.innerText
      nextPage = 0; //可以直接用底下的變數，因為這裡是非同步執行，執行的時候變數已經宣告
      imgZone.innerHTML = ""
      const userInput = document.querySelector(".user-input");
      userInput.value=mrtBtn.innerText
      io.observe(document.getElementById("watch_end_of_document"));
      // 這邊可以呼叫下面的io是因為addEventListener裡面的callback也是非同步
    });
  });
}
// =====△ △ △ △載入各個捷運站按鈕△ △ △ △==// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====
// =====▼ ▼ ▼▼ io 和 io要呼叫的函式 ▼▼ ▼ ▼ ▼ ▼==// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====
let catArr=[];
let imgArr=[];
let mrtArr=[];
let nameArr=[];
let idArr = [];
// ===============---io---=====================
const io = new IntersectionObserver(handleIntersection);
let apiRequestTriggered = false;
let nextPage = 0;
let keyword= "";
let dataNum;
function handleIntersection(entries){
  entries.forEach(entry =>{
    if (entry.isIntersecting && !apiRequestTriggered){
      apiRequestTriggered = true;

//💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment
      // userId= localStorage.getItem('userid')
      // console.log(`拿到id了：${userId}`)
      // console.log(`${Ip}api/attractions?page=${nextPage}&keyword=${keyword}`)
      // fetch(`${Ip}api/attractions?page=${nextPage}&keyword=${keyword}&userid=${userId}`)
//💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment

      fetch(`${Ip}api/attractions?page=${nextPage}&keyword=${keyword}`)
        .then(res =>{
          if(!res.ok){throw new Error('fetch抓失敗')}
          // 如果throw new Error，就會立即中斷Promise 所以不會執行return res.json()
          // console.log('fetch成功:api/attractions')
          return res.json();
        })
        .then(data =>{
          const results = data.data;
          dataNum = results.length;
          catArr = [];
          imgArr = [];
          mrtArr = [];
          nameArr = [];
          idArr = []; 
          for (let i=0; i<results.length; i++) {

            //💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment
            // console.log(results[i].ok)
            //💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment

            catArr.push(results[i].category);
            imgArr.push(results[i].images[0]);
            mrtArr.push(results[i].mrt);
            nameArr.push(results[i].name);
            idArr.push(results[i].id);
          }
          
          load();

          // console.log(`成功加載${dataNum}筆資料`)
          nextPage = data.nextPage;
          if(nextPage == null){
            io.disconnect();
            // console.log('nextPage為null，停止觀測')
          }
          if(imgZone.innerHTML==""){ //沒搜到
            if(document.querySelector(".no-search-result")==null){
              const NewDiv = document.createElement('div');
              NewDiv.className='no-search-result';
              NewDiv.innerHTML="找不到符合搜尋的結果";
              document.querySelector(".mainwrapper").appendChild(NewDiv)
            }
          }else if(document.querySelector(".no-search-result")!=null){
            document.querySelector(".mainwrapper").removeChild(document.querySelector(".no-search-result"))
          }
        })
        .catch(error => {
          console.error('api/attractions的API請求錯誤:', error);
        })
        .finally(() => {
          apiRequestTriggered = false; // 重設為false，以便可以再次觸發API請求
        });
    }
  });
}


//💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment
// io.observe(document.getElementById("watch_end_of_document"));
setTimeout(() => {
  io.observe(document.getElementById("watch_end_of_document"));
}, 50); 
//先確保checkAuth()打api先拿到id，才能用id去跑
//💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment


// =====△ △ △ △ io和io 要呼叫的函式△ △ △ △==// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====
// =====▼ ▼ ▼▼ 搜尋功能▼▼ ▼ ▼ ▼ ▼==// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====// =====
const submitBtn = document.querySelector(".submit-btn");
submitBtn.addEventListener("click", function(){
  // catArr=[];imgArr=[];mrtArr=[];nameArr=[];
  nextPage = 0;
  imgZone.innerHTML = ""
  //innerHTML 比這個好  document.querySelectorAll(".imggbox").forEach((imgBox) => {
  //   imgBox.parentNode.removeChild(imgBox);});
  const userInput = document.querySelector(".user-input");
  const userInputValue = userInput.value;
  keyword = userInputValue;
  io.observe(document.getElementById("watch_end_of_document"));
});

//@@@@@@@@@@@@@@@@@@@@--創建元素--@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const imgZone = document.querySelector('.img-zone')
function load(){
  for(let i=0 ;i< dataNum ;i++){
    let imgData = imgArr[i];
    let mrtData = mrtArr[i];
    let catData = catArr[i];
    let nameData = nameArr[i];
    let idData = idArr[i];

    const Newimggbox = document.createElement("div");
    Newimggbox.className='imggbox';


    //💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment
    // const newI = document.createElement('i');
    // newI.className = 'fa-solid  fa-heart not-favorited';
    // newI.id = `placeIdIs-${idData}`;
//💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment


    const NewimgAndMask = document.createElement('div');
    NewimgAndMask.className='imgand-mask';
    const Newmask = document.createElement('div');
    Newmask.className = 'mask';
    const newImg = document.createElement('img');
    newImg.setAttribute('src',imgData);

    const newP = document.createElement('p');
    newP.textContent=nameData;

    Newmask.appendChild(newP);
    NewimgAndMask.appendChild(Newmask);
    NewimgAndMask.appendChild(newImg);

    const textBoxTwo = document.createElement('div');
    textBoxTwo.className='textbox-2';

    const newDiv1 = document.createElement('div');
    const newDiv2 = document.createElement('div');

    const newP1 =document.createElement('p');
    const newP2 = document.createElement('p');
    newP1.textContent=mrtData
    newP2.textContent=catData;
    newP2.className = 'p-2';

    newDiv1.appendChild(newP1);
    newDiv2.appendChild(newP2);

    textBoxTwo.appendChild(newDiv1);
    textBoxTwo.appendChild(newDiv2);

//💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment
    // Newimggbox.appendChild(newI)
//💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment

    Newimggbox.appendChild(NewimgAndMask)
    Newimggbox.appendChild(textBoxTwo)

    imgZone.appendChild(Newimggbox)


  //💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment
    // document.getElementById(`placeIdIs-${idData}`).addEventListener("click", () => {
    //   console.log(idData);
    //   document.getElementById(`placeIdIs-${idData}`).classList.toggle('fontawesome');
    //   document.getElementById(`placeIdIs-${idData}`).classList.toggle('not-favorited');
    // });
  //💕💕💕💕💕我的最愛功能 開發到一半，要繼續開發請解開comment


    Newimggbox.addEventListener('click',()=>{
      let url = location.href;
      url = url + 'attraction/' + idData
      window.location.href = url
      // console.log(url)
    })
  }
}

//@@@@@@@@@@@@@@@----左右滾動----@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const Place = document.querySelector(".place");
// const Btns = document.querySelectorAll(".btn");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

// 拿來檢查視窗為大或小
const mainwrapper = document.querySelector(".mainwrapper");
let screenSize=window.getComputedStyle(mainwrapper).width
let slideIndex = 0;
function handleResize(){
  screenSize = window.getComputedStyle(mainwrapper).width;
  slideIndex=0;
}
window.addEventListener("resize", handleResize);
handleResize();//偵測螢幕大小變化，防止被亂玩，防止螢幕變化使得slideIndex數值混亂
prevBtn.addEventListener('click', () => {
      slideIndex--;
      if(slideIndex<0){
      slideIndex=0
    }
  updateSlider();
});
nextBtn.addEventListener('click', () => {
  slideIndex++;
  if(screenSize=="360px"){
    if (slideIndex==10){
      slideIndex=9;
    }
  }
  else if(screenSize=="768px"){
    if (slideIndex==4){
      slideIndex=3;
    }
  }
  else if(screenSize=="376px"){
    if (slideIndex==9){
      slideIndex=8;
    }
  }
  else{
    if (slideIndex==3){
      slideIndex=2;
    }
  }
  updateSlider();
});
function updateSlider() {
  const translateX = slideIndex * 100 + '%';
  Place.style.transform = `translateX(-${translateX})`;
// translateX(-100%)負數就是整個向左滾動，也就是按下next的效果
}

