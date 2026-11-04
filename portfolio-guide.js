(function(){
 'use strict';
 var data=window.PORTFOLIO_KNOWLEDGE;if(!data)return;
 var facts=data.facts;
 var stop=new Set('a an and are as at be by can could do does for from has have he her him his how i in is it me my of on or please s she show tell that the their them there these they this to us was what when where which who why will with work you your see should would ibrahim javed about'.split(' '));
 function tokens(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').split(/\s+/).filter(function(w){return w.length>1&&!stop.has(w);}).map(function(w){return w.replace(/(ing|ies|s)$/,'');});}
 function search(query){
  if(typeof query!=='string'||query.length>500)return [];
  var q=query.toLowerCase(),terms=tokens(q),forced=[];
  if(/\b(now|nowadays|currently|lately|these days|up to|doing today)\b/.test(q))forced.push('current');
  if(/\b(studying|studies|degree|education|masters|master|lums)\b/.test(q))forced.push('education');
  if(/^which projects should i see[?!.]*$/i.test(query.trim()))return ['evidence','qa-impact','auto-method'].map(function(id){return facts.find(function(f){return f.id===id;});});
  if(/\b(contact|email|hire|availability|available|rate|salary|book|meeting|interview)\b/.test(q))forced.push('contact');
  if(/\b(why|fit|strength|recommend|shortlist)\b/.test(q))forced.push('evidence');
  if(/\b(who|introduce|introduction|overview|summary)\b/.test(q))forced.push('profile');
  if(/\b(skill|skills|tool|tools|stack)\b/.test(q))forced.push('skills');
  if(/\b(project|projects)\b/.test(q)&&terms.length<3)forced.push(/university|academic|python|stata|excel/.test(q)?'rev':'evidence');
  return facts.map(function(f){var words=tokens(f.title+' '+f.keywords),body=tokens(f.text);var score=terms.reduce(function(n,t){return n+(words.includes(t)?3:body.includes(t)?1:0);},0)+(forced.includes(f.id)?20:0);return {fact:f,score:score};}).filter(function(r){return r.score>=3;}).sort(function(a,b){return b.score-a.score;}).slice(0,3).map(function(r){return r.fact;});
 }
 window.PortfolioGuide={search:search};
 var host=document.createElement('div');host.className='portfolio-guide';
 host.innerHTML='<button class="guide-launcher" type="button" aria-expanded="false" aria-controls="portfolio-guide-panel"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 4h16v12H9l-5 4V4Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span>Ask about Ibrahim</span></button><section id="portfolio-guide-panel" class="guide-panel" aria-label="Ibrahim’s portfolio guide" hidden><header class="guide-header"><div><h2>Ask about Ibrahim</h2><p>His work, with the sources.</p></div><button class="guide-close" type="button" aria-label="Close portfolio guide"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button></header><p class="guide-engine-status" role="status">Answers grounded in Ibrahim’s published work.</p><div class="guide-conversation" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions"></div><div class="guide-prompts"><button type="button">Which projects should I see?</button><button type="button">What tools does he use?</button><button type="button">How can I contact him?</button></div><p class="guide-recording-notice">Browsing activity and chats are recorded to improve this portfolio. Contact details are optional. Chat messages and any optional name and email you share are visible in recordings. <a href="privacy.html" target="_blank" rel="noopener">Privacy details</a>. Avoid confidential information. <label class="guide-notice-ack"><input type="checkbox" id="guide-notice-ack"> I understand—hide this notice</label></p><form class="guide-form"><details class="guide-contact"><summary>Add contact details (optional)</summary><div class="guide-identity"><label for="guide-name">Name (optional)</label><input id="guide-name" maxlength="100" autocomplete="name"><label for="guide-email">Email (optional)</label><input id="guide-email" type="email" maxlength="254" autocomplete="email"></div></details><label for="guide-question">Your question</label><div><input id="guide-question" name="question" maxlength="500" autocomplete="off" placeholder="Ask about a project or skill…" required><button type="submit">Ask</button></div><p class="guide-error" role="status"></p></form><div class="guide-privacy-controls"><button type="button" class="guide-privacy-button">Privacy</button><a href="privacy.html" target="_blank" rel="noopener">Full details</a></div><div class="guide-disclosure" hidden>Source-based portfolio guide. Chat messages are recorded for portfolio analytics. AI finds relevant facts; it does not invent answers or speak for Ibrahim.</div></section>';
 document.body.appendChild(host);
 var notice=host.querySelector('.guide-recording-notice'),ack=host.querySelector('#guide-notice-ack');
 var noticePreference='portfolio-chat-notice-v2';
 try{notice.hidden=localStorage.getItem(noticePreference)==='acknowledged';}catch(_){}
 if(ack)ack.addEventListener('change',function(){if(ack.checked){notice.hidden=true;try{localStorage.setItem(noticePreference,'acknowledged');}catch(_){} }});
 host.querySelector('.guide-privacy-button').addEventListener('click',function(){notice.hidden=!notice.hidden;if(!notice.hidden&&ack)ack.checked=false;});

 var launch=host.querySelector('.guide-launcher'),panel=host.querySelector('.guide-panel'),log=host.querySelector('.guide-conversation'),input=host.querySelector('#guide-question'),form=host.querySelector('form'),error=host.querySelector('.guide-error'),last=[],busy=false,previousQuestion='';
 var conversation=[],representativeEndpoint=null;
 var representativeReady=fetch('./representative.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('No configuration');return r.json();}).then(function(c){if(c.endpoint&&/^https:\/\//.test(c.endpoint)){representativeEndpoint=c.endpoint.replace(/\/$/,'');return true;}return false;}).catch(function(){return false;});
 async function askRepresentative(question,history,onText){
  if(!await representativeReady)throw new Error('Representative not activated');
  var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},90000),reader=null;
  try{
   var response=await fetch(representativeEndpoint+'/v1/chat',{method:'POST',headers:{'Content-Type':'application/json','Accept':'text/event-stream, application/json'},body:JSON.stringify({question:question,history:history||[],stream:typeof onText==='function'}),signal:controller.signal});
   if(!response.ok)throw new Error('Representative unavailable');
   var answer=null;
   if((response.headers.get('content-type')||'').includes('text/event-stream')){
    if(!response.body)throw new Error('Streaming unavailable');
    reader=response.body.getReader();var decoder=new TextDecoder(),buffer='';
    function frame(block){
     var lines=block.split('\n'),event='message',payload=[];
     lines.forEach(function(line){if(line.indexOf('event:')===0)event=line.slice(6).trim();if(line.indexOf('data:')===0)payload.push(line.slice(5).trimStart());});
     if(!payload.length)return;
     var packet=JSON.parse(payload.join('\n'));
     if(event==='failure')throw new Error('Reply interrupted');
     if(event==='answer'&&onText&&typeof packet.text==='string')onText(packet.text);
     if(event==='complete')answer=packet;
    }
    while(!answer){
     var chunk=await reader.read();if(chunk.done)break;
     buffer+=decoder.decode(chunk.value,{stream:true});buffer=buffer.replace(/\r\n/g,'\n');
     var end;while((end=buffer.indexOf('\n\n'))>=0){var block=buffer.slice(0,end);buffer=buffer.slice(end+2);frame(block);}
     if(buffer.length>100000)throw new Error('Invalid stream');
    }
    buffer+=decoder.decode();if(buffer.trim()&&!answer)frame(buffer);
   }else{answer=await response.json();}
   if(!answer||answer.mode!=='generative'||typeof answer.answer!=='string'||!Array.isArray(answer.sources))throw new Error('Invalid answer');
   return answer;
  }finally{clearTimeout(timer);if(reader)reader.cancel().catch(function(){});}
 }
 var status=host.querySelector('.guide-engine-status'),worker=null,ready=null,requestId=0,pendingRequests=new Map();
 function startSemantic(){
  if(ready)return ready;
  status.textContent='Loading local AI for natural questions… First visit downloads about 45 MB; no account or GPU needed.';
  ready=new Promise(function(resolve,reject){
   worker=new Worker(new URL('./portfolio-semantic-worker.js',document.baseURI),{type:'module'});
   var timer=setTimeout(function(){reject(new Error('Model loading timed out'));worker.terminate();worker=null;},90000);
   worker.onmessage=function(e){var m=e.data;if(m.type==='ready'){clearTimeout(timer);status.textContent='Local AI ready · answers from portfolio sources. Questions stay on this device.';resolve();}else if(m.type==='error'){clearTimeout(timer);reject(new Error(m.message));var pending=pendingRequests.get(m.id);if(pending){pending.reject(new Error(m.message));pendingRequests.delete(m.id);}}else if(m.type==='results'){var pending=pendingRequests.get(m.id);if(pending){pending.resolve(m.results);pendingRequests.delete(m.id);}}};
   worker.onerror=function(){clearTimeout(timer);reject(new Error('Local AI could not load'));};
   worker.postMessage({type:'init',facts:facts});
  }).catch(function(e){status.textContent='Local AI could not load. Basic source search is available; reload to retry.';throw e;});
  return ready;
 }
 async function semantic(query){await startSemantic();return new Promise(function(resolve,reject){var id=++requestId;var timer=setTimeout(function(){pendingRequests.delete(id);reject(new Error('Search timed out'));},15000);pendingRequests.set(id,{resolve:function(v){clearTimeout(timer);resolve(v);},reject:reject});worker.postMessage({type:'search',id:id,query:query});});}
 async function retrieve(query){
  var basic=search(query),ranked=[];
  try{ranked=await semantic(query);}catch(e){return basic;}
  var chosen=ranked.filter(function(r){return r.score>=0.27&&r.score>=ranked[0].score-0.065;}).slice(0,2).map(function(r){return facts.find(function(f){return f.id===r.id;});});
  if(/\b(now|nowadays|currently|lately|these days|up to|doing today)\b/i.test(query))return [facts.find(function(f){return f.id==='current';})];
  if(/\b(rate|salary|availability|available|hire|contact|email)\b/i.test(query))return [facts.find(function(f){return f.id==='contact';})];
  return chosen;
 }
 window.PortfolioGuide.retrieve=retrieve;
 function open(value){if(value&&window.PortfolioAnalytics)window.PortfolioAnalytics.chat('chat_opened');panel.hidden=!value;launch.setAttribute('aria-expanded',String(value));if(value){input.focus();representativeReady.then(function(active){if(active){status.textContent='Ibrahim’s AI representative · answers with portfolio evidence.';host.querySelector('.guide-disclosure').textContent='Ibrahim’s AI representative. Can make mistakes—check the linked evidence. Messages are sent to the hosted model; avoid sharing confidential details.';}else startSemantic().catch(function(){});});}else launch.focus();}
 launch.addEventListener('click',function(){open(panel.hidden);});host.querySelector('.guide-close').addEventListener('click',function(){open(false);});
 host.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden){e.preventDefault();open(false);}});
 function message(text,kind,refs){if(kind==='assistant'&&text!=='Finding the relevant details…'&&log.children.length&&window.PortfolioAnalytics)window.PortfolioAnalytics.chat('chat_answer',representativeEndpoint?'representative-or-fallback':'local',text);var article=document.createElement('article');article.className='guide-message '+kind;var label=document.createElement('strong');label.className='guide-speaker';label.textContent=kind==='visitor'?'You':'Portfolio guide';article.appendChild(label);var p=document.createElement('p');p.textContent=text;article.appendChild(p);if(refs&&refs.length){var links=document.createElement('ul');links.className='guide-sources';refs.forEach(function(f){var li=document.createElement('li'),a=document.createElement('a');a.textContent=f.title;a.href=f.url;li.appendChild(a);links.appendChild(li);});article.appendChild(links);}log.appendChild(article);log.scrollTop=log.scrollHeight;return article;}
 async function ask(q){
  if(busy)return;q=q.trim();if(!q||q.length>500){error.textContent='Please enter a question of up to 500 characters.';return;}
  if(window.PortfolioAnalytics){window.PortfolioAnalytics.identify(host.querySelector('#guide-name').value,host.querySelector('#guide-email').value);window.PortfolioAnalytics.chat('chat_question',null,q);}
  error.textContent='';host.querySelector('.guide-prompts').hidden=true;message(q,'visitor');input.value='';
  if(!await representativeReady&&/^(hi|hello|hey|salam)[.!?\s]*$/i.test(q)){message('Hello! Ask me about Ibrahim’s work, studies, projects or life outside work.','assistant');return;}
  busy=true;form.querySelector('button').disabled=true;var pending=message('Finding the relevant details…','assistant');
  if(await representativeReady){
   try{pending.setAttribute('aria-busy','true');var answer=await askRepresentative(q,conversation,function(text){var nearBottom=log.scrollHeight-log.scrollTop-log.clientHeight<100;pending.querySelector('p').textContent=text;if(nearBottom)log.scrollTop=log.scrollHeight;});pending.remove();message(answer.answer,'assistant',answer.sources);conversation.push({role:'user',content:q},{role:'assistant',content:answer.answer.slice(0,2000)});conversation=conversation.slice(-6);busy=false;form.querySelector('button').disabled=false;if(!panel.hidden)input.focus();return;}
   catch(e){pending.querySelector('p').textContent='Finding the relevant details…';pending.removeAttribute('aria-busy');if(window.PortfolioAnalytics)window.PortfolioAnalytics.chat('chat_fallback','local');status.textContent='The conversational representative is unavailable. Showing published facts from local search.';}
  }
  var effective=q;
  if(/\b(phd|doctorate)\b/i.test(q)){message('His published education lists a BS (Hons.) in Economics and Finance and ongoing MS studies at LUMS. It does not list a PhD.','assistant',[facts.find(function(f){return f.id==='education';})]);pending.remove();busy=false;form.querySelector('button').disabled=false;return;}
  if(last.length&&/^(and |what about |where |tell me more|more|go on)/i.test(q))effective=last[0].title+' '+q;
  if(/\b(studying|degree|education|university|masters)\b/i.test(q))effective=q;
  var results=await retrieve(effective);
  pending.remove();
  if(results.length){last=results;previousQuestion=effective;message(results.map(function(f){return f.text;}).join('\n\n'),'assistant',results);}
  else message('I don’t have a reliable answer to that in Ibrahim’s published portfolio. You can ask about his work, education, projects or interests—or contact him for details that aren’t published.','assistant',[facts.find(function(f){return f.id==='contact';})]);
  busy=false;form.querySelector('button').disabled=false;if(!panel.hidden)input.focus();
 }
 message('I’m Ibrahim’s portfolio guide. I can help you explore his experience, projects and interests, and link to the details. What would you like to know?','assistant');
 form.addEventListener('submit',function(e){e.preventDefault();ask(input.value);});host.querySelectorAll('.guide-prompts button').forEach(function(b){b.addEventListener('click',function(){ask(b.textContent);});});
 // Optional read-only discovery for agents already visiting in a supported browser.
 representativeReady.then(function(active){
  if(!active||!document.modelContext||typeof document.modelContext.registerTool!=='function')return;
  try{Promise.resolve(document.modelContext.registerTool({name:'talk_to_ibrahim_representative',description:'Talk to Ibrahim Javed’s authorized AI representative about a role or project. Returns a tailored assessment backed by first-party evidence and source links.',inputSchema:{type:'object',properties:{question:{type:'string',maxLength:1500}},required:['question'],additionalProperties:false},annotations:{readOnlyHint:true},execute:function(args){if(!args||typeof args.question!=='string'||args.question.length>1500)throw new Error('Provide a question of up to 1500 characters.');return askRepresentative(args.question,[]);}})).catch(function(){});}catch(e){}
 });
 var registry=document.modelContext;
 if(registry&&typeof registry.registerTool==='function'){
  try{Promise.resolve(registry.registerTool({name:'search_ibrahim_portfolio',description:'Search Ibrahim Javed’s published portfolio facts and source links. Distinguishes professional work from university projects. Returns first-party claims, not independent endorsements.',inputSchema:{type:'object',properties:{query:{type:'string',maxLength:500}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:true},execute:async function(args){if(!args||typeof args.query!=='string'||args.query.length>500||Object.keys(args).some(function(k){return k!=='query';}))throw new Error('Provide a query of at most 500 characters.');return {name:data.name,role:data.role,updated:data.updated,provenance:data.provenance,results:await retrieve(args.query)};}})).catch(function(){});}catch(e){}
 }
})();
