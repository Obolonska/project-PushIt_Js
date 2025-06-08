import{S as d}from"./assets/vendor-CQMm3erF.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function o(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(e){if(e.ep)return;e.ep=!0;const s=o(e);fetch(e.href,s)}})();const u="/project-PushIt_Js/assets/icons-0zWjcESH.svg",p=document.querySelector(".swiper-wrapper");async function f(){try{const r=await(await fetch("https://sound-wave.b.goit.study/api/feedbacks?limit=3&page=2")).json();console.log("API response:",r);const o=m(r.data);p.innerHTML=o,new d(".swiper",{loop:!0,centeredSlides:!1,spaceBetween:0,pagination:{el:".swiper-pagination",clickable:!0},navigation:{nextEl:".right_btn",prevEl:".left_btn"},scrollbar:{el:".swiper-scrollbar"}})}catch(t){console.error("Fetch error:",t)}}function g(t){return`
    <div class="fb_item swiper-slide">
      <div class="stars">${y(t.rating)}</div>
      <p class="fb_user_text">"${t.descr}"</p>
      <p class="fb_user_name">${t.name}</p>
    </div>
  `}function m(t){return t.map(r=>g(r)).join("")}function y(t){let r="";for(let n=1;n<=5;n++){const e=n<=t?"icon-purple-star":"icon-white-star";r+=`
      <svg width="20" height="20">
        <use href="${u}#${e}"></use>
      </svg>
    `}return r}document.addEventListener("DOMContentLoaded",()=>{f()});const c=document.querySelector(".left_btn"),a=document.querySelector(".right_btn");function l(){window.innerWidth>=768?(c.style.display="flex",a.style.display="flex"):(c.style.display="none",a.style.display="none")}l();window.addEventListener("resize",l);
//# sourceMappingURL=index.js.map
