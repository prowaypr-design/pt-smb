/* v2.0.0: текстуры вынесены в img/tex-*.jpg — браузер скачивает только те, что нужны сцене (раньше весь файл был 868 КБ base64) */
const TEX=(()=>{const s=document.currentScript&&document.currentScript.src,b=s?s.replace(/tex\.js(\?.*)?$/,''):'https://cdn.jsdelivr.net/gh/prowaypr-design/pt-smb@main/';
  return {ngfw:b+"img/tex-ngfw.jpg",pt:b+"img/tex-pt.jpg",epp:b+"img/tex-epp.jpg",email:b+"img/tex-email.jpg",xspider:b+"img/tex-xspider.jpg",maze:b+"img/tex-maze.jpg"}})();
