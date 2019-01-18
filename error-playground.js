const sum = (a,b) => {
    if(a && b){
        return a+b
    }
    throw new Error('invalid values')
}

try {
    console.log(sum(1))
} catch{
    console.log('Error occured')
}