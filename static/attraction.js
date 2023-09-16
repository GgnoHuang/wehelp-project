// =================fetch===================
const pageId = location.href.split('/')[location.href.split('/').length-1]
async function fetchData(){
  try{
    const res = await fetch(`http://54.65.60.124:3000/api/attraction/${pageId}`);
    const data = await res.json();
    return data;
  }
  catch(err){
    throw new Error('api/attraction/{attractionId} 請求失敗!');
  }
}
// =================載入內容==================
let nameData, catData, mrtData, descriptionData, addData, transportData, imgDatas
async function useFetchData(){
  try{
    const result = await fetchData();
    nameData = result.data.name;
    catData = result.data.category;
    mrtData = result.data.mrt;
    descriptionData = result.data.description;
    addData = result.data.address;
    transportData = result.data.transport;    
    imgDatas = result.data.images

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
    const dots = document.querySelectorAll("circle")
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
let intervalId ;
function autoSlide(){
  intervalId = setInterval(() => {
    slideImage()
  }, 1500);
}
//===================CAROUSEL + DOT==============================
function slideImage(){
  const dots = document.querySelectorAll("circle")
  dots.forEach(dot => {
        dot.setAttribute("r", "6"); 
        dot.setAttribute("fill", "white"); 
        dot.setAttribute("stroke",null); 
  });
  imageIndex++;
  if(imageIndex == imgsCnt){
    imageIndex = 0;
  }
  let currentBlackDot = dots[imageIndex]
  currentBlackDot.setAttribute("r", "5.5"); 
  currentBlackDot.setAttribute("fill", "black"); 
  currentBlackDot.setAttribute("stroke", "white"); 
  carousel.style.transform = `translate(-${imageIndex*100}%)`;
  console.log(imageIndex)
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
      if(imageIndex < 0){
        imageIndex = -1 //-1之後讓他++變回0
      }
    }
    slideImage()
  })
})

autoSlide();//研究一下這個呼叫擺放的位置

//==========================================================

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