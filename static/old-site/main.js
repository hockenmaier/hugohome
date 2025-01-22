var lastHeader = ""

window.onscroll = function() {headerStick(),topButtonDisplay()};
    
    var headerList = document.getElementsByClassName("header");
    console.log(headerList)
    
    // When the user scrolls down 20px from the top of the document, show the button
    
    // console.log(topButton)
    
    function headerStick() {
        let isHeader = false;
        let isNewHeader = false;
        let header = "";
        let lastHeaderHeight = 0;
        let i;
        let minOffset = window.pageYOffset;
        for (i = 0; i < headerList.length; i++) {
            headerList[i].classList.remove("sticky");
            let thisOffset = window.pageYOffset - headerList[i].offsetTop + 17;
            if (thisOffset > 0){
                if (thisOffset < minOffset){
                    // console.log('lastHeader')
                    // console.log(lastHeader)
                    // console.log(headerList[i])
                    
                    if (headerList[i] !== lastHeader){
                        lastHeader = headerList[i];
                        isNewHeader = true;
                        lastHeaderHeight = lastHeader.offsetHeight;
                    }
                    isHeader = true;
                    minOffset = thisOffset;
                    header = headerList[i];
                }
            }
        }
        
        if (isHeader){
            
            // console.log(header.offsetTop)
            // window.scroll(window.pageXOffset, header.offsetTop + 100)
            
            let sticky = header.offsetTop + 17;
            header.classList.add("sticky");
            
            
            let root = document.documentElement;
            if (isNewHeader){
                root.style.setProperty('--stickyContentPadding', lastHeaderHeight  + "px");
            }else{
                root.style.setProperty('--stickyContentPadding', (header.offsetHeight)  + "px");
            }
        }
    }
    
    function topButtonDisplay() {
    var topButton = document.getElementById("top_button");
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        topButton.style.display = "block";
    } else {
        topButton.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}