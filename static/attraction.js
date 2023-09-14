// async function fetchData(){
//   try{
//     const res = await fetch("1http://54.65.60.124:3000/api/attraction/5");
//     if(!res.ok){
//       throw new Error('api/attraction請求失敗');
//     }
//     const data = await res.json();
//     return data;
//   }catch(err){
//     throw err;
//   }
// }

const currentURL = location.href
const pageId = location.href.split('/')[location.href.split('/').length-1]
console.log(`當前id:${pageId}`)

              //看一下上下差異
async function fetchData(){
  try{
    const res = await fetch(`http://54.65.60.124:3000/api/attraction/${pageId}`);
    const data = await res.json();
    return data;
  }
  catch(err){
    throw new Error('api/attraction/{attractionId} 請求失敗!');
  }
  finally{
    // console.log(1)
  }
}
// ~~~~~~~~~~~~~~~~~~~~
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
useFetchData();//async function不會提升

function loadData(){
  const imgSrc = document.querySelector(".attraction-img")
  const placeName = document.querySelector(".attraction-name")
  const catAndMrt = document.querySelector(".attraction-class-mrt")
  const description = document.querySelector(".description")
  const address = document.querySelector(".address")
  const transport = document.querySelector(".transport")

  imgSrc.setAttribute('src', imgDatas[0]);
  placeName.innerHTML = nameData;
  catAndMrt.innerHTML = catData+' at '+mrtData
  description.innerHTML = descriptionData
  address.innerHTML = addData
  transport.innerHTML = transportData
}

//============================================================


// const price = document.querySelector(".price");
// const morning = document.getElementById("morning");
// morning.addEventListener('click',()=>{
//   var selectedValue = document.querySelector('input[name="time-picker"]:checked').value;
//   console.log(morning.checked)
//   console.log(selectedValue);
//   price.innerHTML = "新台幣2000元" 
// })
// const afternoon = document.getElementById("afternoon");
// afternoon.addEventListener('click',()=>{
//   var selectedValue = document.querySelector('input[name="time-picker"]:checked').value;
//   console.log(afternoon.checked)
//   console.log(selectedValue);
//   price.innerHTML = "新台幣2500元" 
// })

// 這樣比上面更好
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