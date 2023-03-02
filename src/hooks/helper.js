const stopScroll = ()=>{
    document.body.style.overflowY = "hidden"
}
const startScroll = ()=>{
    document.body.style.overflowY = "scroll"
}

const scrollToTop = ()=>{
    window.scrollTo(0, 0);
}

export {
    stopScroll,
    startScroll,
    scrollToTop
}