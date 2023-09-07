url="http://54.65.60.124:3000/api/mrts"

let mrtsArr=[];
const userInput = document.querySelector(".user-input");

fetch(url).then(res=>{
    return res.json();
  }).then(data=>{
    let results=data.data;
    for(let i=0;i<results.length;i++){
      mrtsArr.push(results[i])
    };
    loadMrt();
  })
const placeBar = document.querySelector('.place') 
let loadMrt=()=>{
  for(let i=0 ; i< mrtsArr.length ; i++){
    const NewDiv = document.createElement("div");
    NewDiv.className='mrt';
    // ===========================  // ============================
    const newP = document.createElement('p');
    newP.textContent=mrtsArr[i];
    newP.className='mrt-text';

    NewDiv.appendChild(newP);
    placeBar.appendChild(NewDiv);
  }
  const mrtBtns = document.querySelectorAll(".mrt-text");
  mrtBtns.forEach((mrtBtn) => {
    mrtBtn.addEventListener("click", function () {

      keyword=mrtBtn.innerText
      nextPage=undefined;
      imgZone.innerHTML = ""

      userInput.value=mrtBtn.innerText
      io.observe(document.getElementById("watch_end_of_document"));
    });
  });
}
let nextPage ;// 不需要給值，因為querystr預設是零  ?page=0
let catArr=[];
let imgArr=[];
let mrtArr=[];
let nameArr=[];

const submitBtn = document.querySelector(".submit-btn");

// ============@@@=----搜尋功能----@@@============
submitBtn.addEventListener("click", function() {
  // catArr=[];imgArr=[];mrtArr=[];nameArr=[];
  nextPage=undefined;
  imgZone.innerHTML = ""
  //innerHTML 比這個好  document.querySelectorAll(".imggbox").forEach((imgBox) => {
  //   imgBox.parentNode.removeChild(imgBox);});
  const userInputValue = userInput.value;
  keyword = userInputValue;
  io.observe(document.getElementById("watch_end_of_document"));
  // 這邊如果重新啟用observe就不用io.disconnect();
});


let apiRequestTriggered = false;
let keyword="";
function fetchNextPageData(){
    const nextPageUrl = `http://54.65.60.124:3000/api/attractions?page=${nextPage}&keyword=${keyword}`;

    // 定義url不能放函數外面，不然他不會重新賦值
    return fetch(nextPageUrl).then((res) => res.json());
}
// ===============---io---=====================
function handleIntersection(entries){
  entries.forEach((entry) => {
    if (entry.isIntersecting && !apiRequestTriggered){
      apiRequestTriggered = true;
      fetchNextPageData().then((data) => {
        const results = data.data;
          dataNum = results.length;
          catArr=[];
          imgArr=[];
          mrtArr=[];
          nameArr=[];
          for (let i = 0; i < results.length; i++) {
            catArr.push(results[i].category);
            imgArr.push(results[i].images[0]);
            mrtArr.push(results[i].mrt);
            nameArr.push(results[i].name);
          }
          load();
          nextPage=data.nextPage;
          if(nextPage==null){
            io.disconnect();
          }
          if(imgZone.innerHTML==""){
            imgZone.innerHTML=` <h3>查無景點資料</h3>`
          }
      })
      .catch(error => {
        console.error('API請求錯誤:', error);
      })
      .finally(() => {
        apiRequestTriggered = false; // 重設為false，以便可以再次觸發API請求
      });
    }
  });
}
const io = new IntersectionObserver(handleIntersection);
io.observe(document.getElementById("watch_end_of_document"));

//@@@@@@@@@@創建元素@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const imgZone = document.querySelector('.img-zone')
let load=()=>{
  for(let i=0 ;i<dataNum;i++){
    let imgData = imgArr[i];
    let mrtData = mrtArr[i];
    let catData = catArr[i];
    let nameData = nameArr[i];
    const Newimggbox = document.createElement("div");
    Newimggbox.className='imggbox';

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

    Newimggbox.appendChild(NewimgAndMask)
    Newimggbox.appendChild(textBoxTwo)

    imgZone.appendChild(Newimggbox)
  }
}

//@@@@@@@@@@@@@@@----左右滾動----@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const Place = document.querySelector(".place");
const Btns = document.querySelectorAll(".btn");
const nextBtns = document.getElementById("next");
const prevBtns = document.getElementById("prev");

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
prevBtns.addEventListener('click', () => {
      slideIndex--;
      if(slideIndex<0){
      slideIndex=0
    }
  updateSlider();
});
nextBtns.addEventListener('click', () => {
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

