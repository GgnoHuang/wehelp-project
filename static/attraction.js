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
              //看一下上下差異
// !!!!!~~~~~~~~~~~~~~~~~~~~
async function fetchData(){
  try{
    const res = await fetch("http://54.65.60.124:3000/api/attraction/6");
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











// async function fetchData(){
//   try{
//     const res = await fetch("1234243awedfafds");
//     if(!res.ok){
//       throw new Error('api/attraction請求失敗');
//     }
//     const data = await res.json();
//     return data;
//   }
//   catch(err){
//     console.log(`先印出第一次err：${err}`)
//     throw err;
//   }
// }
// async function test(){
//   try{
//     const testResult =await fetchData()
//   }catch(err){
//     console.log(`又印出第2次err：${err}`)
//   }
// }
// test() //這裡一定要呼叫

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// async function fetchData() {
//   try {
//     const res = await fetch("123");
//     if (!res.ok) {
//       throw new Error('沒fetch到');
//     }
//     const data = await response.json();
//     return data;
//   }
//   catch (err){
//     console.error(`喔喔喔喔喔喔：${err}`);
//     throw err;
//   }
// }
// async function testErr() {
//   try {
//     const result = await fetchData();
//   } catch (err) {
//     console.error(`啊啊啊啊啊啊啊：${err}`);
//   }
// }
// testErr(); 




//~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// function test(){
//   try{
//     fetchData()
//   }
//   catch{

//   }
// }




// async function example() {
//   console.log('开始');
//   try {
//     const result1 = await fetchData()
//     console.log('第一个异步操作完成:', result1);
//   } catch (error) {
//     console.error('发生错误:', error);
//   }
//   console.log('结束');
// }

// async function hello(){
//   let ok =
// }
// example();
// console.log('异步操作进行中...');












// function test(){
//   throw new Error("錯誤ㄛ")
// }
// try{
//   test()
//   console.log("fine")
// }catch(err){
//   console.log(err)
// }