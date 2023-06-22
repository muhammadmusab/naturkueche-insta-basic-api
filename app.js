async function randomPromise(count,data = []){

    let newArr = [...data]
    newArr.push(count)
    if(count === 5){
       return newArr
    }
  
    return randomPromise(count + 1,newArr)
}


const app = async ()=>{
   const data =  await randomPromise(1)
   console.log(data)
}

app()