(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function e(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=e(a);fetch(a.href,n)}})();class l{constructor(t){this.API_KEY=t,this.BASE_URL="https://api.scripture.api.bible/v1/",this.TIMEOUT=5e3}async makeRequest(t){const e=new URL(t,this.BASE_URL);try{const s=await Promise.race([fetch(e.toString(),{headers:{"api-key":this.API_KEY}}),new Promise((a,n)=>setTimeout(()=>n(new Error("Request timeout")),this.TIMEOUT))]);if(!s.ok)throw new Error(`Request failed with status ${s.status}`);return s.json()}catch(s){throw console.error("Error making request:",s),s}}async getBooks(t){const e=`/bibles/${t}/books`;return(await this.makeRequest(e)).map(({name:a,id:n})=>({name:a,id:n}))}async getChapters(t,e){const s=`/bibles/${t}/books/${e}/chapters`;return(await this.makeRequest(s)).map(({number:n,id:i})=>({number:n,id:i}))}async getVerses(t,e){const s=`/bibles/${t}/chapters/${e}/verses`;return(await this.makeRequest(s)).map(({id:n})=>({id:n}))}async getBibleVersions(){const t="/bibles";return(await this.makeRequest(t)).map(({name:s,id:a,abbreviation:n,description:i,language:o})=>({name:s,id:a,abbreviation:n,description:i,language:o.name}))}async LoadBibleData(t){const e={};try{const s=await this.getBooks(t);for(let a of s){const n=a.name;e[n]={};const i=await this.getChapters(t,a.id);for(let o of i){const c=o.number,d=await this.getVerses(t,o.id);e[n][c]=d.map(h=>h.id)}}return e}catch(s){return console.error("Error fetching Bible data:",s),{}}}LoadMockData(){return{OldTestament:{Genesis:{1:31,2:25,3:24,4:26,5:32,6:22,7:24},Exodus:{1:22,2:25,3:22,4:31,5:23,6:30,7:25},Leviticus:{1:17,2:16,3:17,4:35,5:19,6:30,7:38},Numbers:{1:54,2:34,3:51,4:49,5:31,6:27,7:89},Deuteronomy:{1:46,2:37,3:29,4:49,5:33,6:25,7:26},Joshua:{1:18,2:24,3:17,4:24,5:15,6:27,7:26},Judges:{1:36,2:23,3:31,4:24,5:31,6:40,7:25},Ruth:{1:22,2:23,3:18,4:22},"1 Samuel":{1:28,2:36,3:21,4:22,5:12,6:21,7:17},"2 Samuel":{1:27,2:32,3:39,4:12,5:25,6:23,7:29},"1 Kings":{1:53,2:46,3:28,4:34,5:18,6:38,7:51},"2 Kings":{1:18,2:25,3:27,4:44,5:27,6:33,7:20}},NewTestament:{Matthew:{1:25,2:23,3:17,4:25,5:48,6:34,7:29},Mark:{1:45,2:28,3:35,4:41,5:43,6:56,7:37},Luke:{1:80,2:52,3:38,4:44,5:39,6:49,7:50},John:{1:51,2:25,3:36,4:54,5:47,6:71,7:53},Acts:{1:26,2:47,3:26,4:37,5:42,6:15,7:60},Romans:{1:32,2:29,3:31,4:25,5:21,6:23,7:25}},Translations:["NIV","KJV","ESV","NLT","MSG"]}}}class u{constructor(){this.apiKey="d42753bd397e6f90fcaaa710a6dbfbdf",this.BibleAPI=new l(this.apiKey),this.bibleData=this.BibleAPI.LoadMockData(),console.log(JSON.stringify(this.bibleData,null,2)),this.appContent=document.getElementById("app-content"),this.breadcrumbElement=document.getElementById("breadcrumb"),this.bindNavigation(),this.bindEvents(),this.navigateByURL()}bindNavigation(){window.addEventListener("popstate",()=>this.navigateByURL())}async LoadBibleData(){try{const t=new l(this.apiKey),e="de4e12af7f28f599-02",s=await t.getAllData(e);console.log(JSON.stringify(s,null,2))}catch(t){console.error("Error:",t)}}navigateByURL(){let{book:t,chapter:e,verse:s}=this.getURLParams();t=this.formatBook(t)||null,this.getTestament(t),console.log(t,e,s),this.redirectIfInvalid(),t=this.unformatBook(t)||null,t&&e&&s?this.loadTranslationPage(t,e,s):t&&e?this.loadVersesPage(t,e):t?this.loadChaptersPage(t):this.loadHomePage()}formatBook(t){return t?t.toLowerCase().replace(/\b[a-z]/g,e=>e.toUpperCase()).replace(/\s/g,"-"):null}unformatBook(t){return t?t.replace(/-/g," "):null}updatePath(t,e,s){t=this.formatBook(t)||null,console.log("!updatePath",t,e,s),console.log(t,e,s),t&&e&&s?window.history.pushState({},"",`/${t}/${e}/${s}`):t&&e?window.history.pushState({},"",`/${t}/${e}`):t?window.history.pushState({},"",`/${t}`):window.history.pushState({},"","/")}loadHomePage(){this.updateBreadcrumb(),this.updatePath(),this.newTestamentBooks=Object.keys(this.bibleData.NewTestament),this.oldTestamentBooks=Object.keys(this.bibleData.OldTestament);const t=`
      <div class="flex-sect">
        <div class="sect sect-grid3">
        <h2>Old Testament</h2>
        <ul>
          ${this.oldTestamentBooks.map(e=>`<li><button class="book" data-book="${e}">${e}</button></li>`).join("")}
        </ul>
        </div>
        
        <div class="sect sect-grid3">
        <h2>New Testament</h2>
        <ul>
          ${this.newTestamentBooks.map(e=>`<li><button class="book" data-book="${e}">${e}</button></li>`).join("")}
        </ul>
        </div>
      </div>`;this.appContent.innerHTML=t,this.updateBreadcrumb()}loadChaptersPage(t){const e=this.getTestament(t);if(!e){console.error(`Unable to determine testament for the book: ${t}`);return}if(!this.bibleData||!this.bibleData[e]){console.error(`Bible data missing or does not contain the testament: ${e}`);return}this.updatePath(t),this.updateBreadcrumb(),this.chapters=Object.keys(this.bibleData[e][t]),console.log("chapters",this.chapters);const s=`
      <div class="sect sect-grid">
      <h2>${t}</h2>
      <ul>
        ${this.chapters.map(a=>`<li><button class="chapter" data-chapter="${a}">${a}</button></li>`).join("")}
      </ul>
      </div>`;this.appContent.innerHTML=s}loadVersesPage(t,e){const s=this.getTestament(t);this.updatePath(t,e),this.updateBreadcrumb();const a=this.bibleData[s][t][e];this.verses=Array.from({length:a},(i,o)=>o+1),console.log("verses",this.verses);const n=`
      <div class="sect sect-grid">
      <h2>${t} Chapter ${e}</h2>
      
      <ul>
        ${this.verses.map(i=>`<li><button class="verse" data-verse="${i}">${i}</button></li>`).join("")}
      </ul>
      </div>`;this.appContent.innerHTML=n}loadTranslationPage(t,e,s){this.updatePath(t,e,s),this.updateBreadcrumb();const a=`
      <div class="sect sect-translation">
      <h2>Translations for: ${t} Chapter ${e}:${s}</h2>
      <ul>
        ${this.bibleData.Translations.map(n=>`<li>${n}: ${s}</li>`).join("")}      
      </ul>
      </div>`;this.appContent.innerHTML=a}loadPageNotFound(){this.appContent.innerHTML="<h2>Page not found</h2>"}updateBreadcrumb(){console.log("updateBreadcrumb!!!!!!!!");let{book:t,chapter:e,verse:s}=this.getURLParams();const a=[t,e,s].filter(Boolean);t=this.formatBook(t)||null,a.unshift("Home");const n=a.map((i,o)=>`<li><a href="#" data-index="${o}">${i}</a></li>`).join("");this.breadcrumbElement.innerHTML=n}bindEvents(){this.breadcrumbElement.addEventListener("click",t=>this.handleBreadcrumbClick(t)),this.appContent.addEventListener("click",t=>this.handleContentClick(t))}getTestament(t){return this.bibleData.OldTestament[t]?"OldTestament":this.bibleData.NewTestament[t]?"NewTestament":null}getURLParams(){const t=window.location.pathname.split("/").filter(Boolean);return{book:t[0]||null,chapter:t[1]||null,verse:t[2]||null}}redirectIfInvalid(){let{book:t,chapter:e,verse:s}=this.getURLParams();const a=this.getTestament(t);t?t&&!a?(this.loadHomePage(),console.log("book not found")):t&&e&&!this.bibleData[a][t][e]?(this.loadChaptersPage(t),console.log("chapter not found")):t&&e&&s&&!this.bibleData[a][t][e][s]&&(this.loadVersesPage(t,e),console.log("verse not found")):(this.loadHomePage(),console.log("book not found"))}handleContentClick(t){let{book:e,chapter:s,verse:a}=this.getURLParams();if(e=this.unformatBook(e)||null,t.target.classList.contains("book")){const n=t.target.dataset.book;this.loadChaptersPage(n)}else if(t.target.classList.contains("chapter")){const n=t.target.dataset.chapter;this.loadVersesPage(e,n)}else if(t.target.classList.contains("verse")){console.log("verse selected!");const n=t.target.dataset.verse;console.log(n),this.loadTranslationPage(e,s,n)}}handleBreadcrumbClick(t){t.preventDefault();const e=t.target.dataset.index;let{book:s,chapter:a,verse:n}=this.getURLParams();s=this.unformatBook(s)||null,e==0?this.loadHomePage():e==1?this.loadChaptersPage(s):e==2?this.loadVersesPage(s,a):e==3&&this.loadTranslationPage(s,a,n)}}document.addEventListener("DOMContentLoaded",()=>{new u});