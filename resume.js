(function(){var root=document.documentElement,button=document.getElementById('resumeTheme');try{var saved=localStorage.getItem('portfolio-theme-v2');if(saved==='light'||saved==='dark')root.dataset.theme=saved;}catch(e){}function sync(){button.textContent=root.dataset.theme==='dark'?'Light mode':'Dark mode';}button.addEventListener('click',function(){root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('portfolio-theme-v2',root.dataset.theme);}catch(e){}sync();});sync();
var printButton=document.getElementById('resumePrint'),help=document.getElementById('printHelp');
printButton.addEventListener('click',function(){
 help.hidden=false;help.replaceChildren();
 var link=document.createElement('a');link.href='Ibrahim-Javed-Resume.pdf';link.download='Ibrahim-Javed-Resume.pdf';link.textContent='Download the PDF';
 help.append('If the print dialog doesn’t open here, ',link,' and print it from your PDF viewer.');
 try{window.print();}catch(e){}
});
})();