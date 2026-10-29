(function(){
  function $(id){ return document.getElementById(id); }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme ---------- */
  var root = document.documentElement, themeBtn = $("themeBtn");
  function isDark(){
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncTheme(){ themeBtn.textContent = isDark() ? "Light mode" : "Dark mode"; }
  themeBtn.addEventListener("click", function(){ root.setAttribute("data-theme", isDark() ? "light" : "dark"); syncTheme(); });
  syncTheme();

  /* ---------- tabs and routing ---------- */
  var ROUTES = {
    home:["home"], top:["home"],
    cases:["cases","qa"], "case-studies":["cases","qa"], "qa-tool":["cases","qa"], qa:["cases","qa"],
    "test-bed":["cases","test-sites"], "test-sites":["cases","test-sites"],
    revcloud:["cases","revcloud"],
    "market-model":["cases","market"], market:["cases","market"],
    excel:["excel"],
    python:["python","houses"], houses:["python","houses"], hoi:["python","hoi"], emp:["python","emp"], rev:["python","rev"], stata:["python","stata"],
    projects:["projects"], toolkit:["projects","toolkit"],
    experience:["about"], about:["about"]
  };
  var NAV_LINKS = document.querySelectorAll(".links a");
  function showTab(tab){
    var panels = document.querySelectorAll(".tab-panel");
    for (var i = 0; i < panels.length; i++) panels[i].classList.toggle("on", panels[i].id === "tab-" + tab);
    for (var j = 0; j < NAV_LINKS.length; j++){
      if (NAV_LINKS[j].getAttribute("data-s") === tab) NAV_LINKS[j].setAttribute("aria-current", "true");
      else NAV_LINKS[j].removeAttribute("aria-current");
    }
  }
  function showCase(sub){
    var bs = document.querySelectorAll(".case-tabs button"), ps = document.querySelectorAll(".case-pane");
    for (var i = 0; i < bs.length; i++){ var on = bs[i].getAttribute("data-case") === sub; bs[i].setAttribute("aria-selected", on ? "true" : "false"); bs[i].tabIndex = on ? 0 : -1; }
    for (var j = 0; j < ps.length; j++) ps[j].classList.toggle("on", ps[j].getAttribute("data-case") === sub);
  }
  function go(id, opts){
    opts = opts || {};
    var r = ROUTES[id]; if (!r) return false;
    showTab(r[0]);
    if (r[0] === "cases") showCase(r[1]);
    if (r[0] === "python") showPane(r[1]);
    if (!opts.noHash){ try { if (location.hash.slice(1) !== id) location.hash = id; } catch (e) {} }
    if (opts.scroll !== false){
      var target = document.getElementById(id);
      if (target && ["home","top"].indexOf(id) === -1) target.scrollIntoView({behavior: reduce ? "auto" : "smooth", block: "start"});
      else window.scrollTo({top: 0, behavior: reduce ? "auto" : "smooth"});
    }
    return true;
  }
  var anchors = document.querySelectorAll("a[data-s]");
  for (var a = 0; a < anchors.length; a++){
    anchors[a].addEventListener("click", function(e){
      var id = this.getAttribute("data-pane") || this.getAttribute("data-s");
      if (ROUTES[id]){ e.preventDefault(); go(id); }
    });
  }
  var caseBtns = document.querySelectorAll(".case-tabs button");
  for (var cb = 0; cb < caseBtns.length; cb++){
    caseBtns[cb].addEventListener("click", function(){ go(this.getAttribute("data-case"), {scroll: false}); });
    caseBtns[cb].addEventListener("keydown", function(e){
      var arr = Array.prototype.slice.call(caseBtns), idx = arr.indexOf(this), nxt = -1;
      if (e.key === "ArrowRight") nxt = (idx + 1) % arr.length;
      if (e.key === "ArrowLeft") nxt = (idx - 1 + arr.length) % arr.length;
      if (nxt > -1){ e.preventDefault(); arr[nxt].focus(); go(arr[nxt].getAttribute("data-case"), {scroll: false}); }
    });
  }
  window.addEventListener("hashchange", function(){
    var id = location.hash.slice(1);
    if (ROUTES[id]){ go(id, {noHash: true, scroll: false}); window.scrollTo(0, 0); }
  });
  if ("IntersectionObserver" in window){
    var grow = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add("in"); grow.unobserve(en.target); } });
    }, {threshold: .35});
    var bars = document.querySelectorAll("[data-ba]");
    for (var b = 0; b < bars.length; b++) grow.observe(bars[b]);
  } else {
    var allBars = document.querySelectorAll("[data-ba]");
    for (var q = 0; q < allBars.length; q++) allBars[q].classList.add("in");
  }

  /* ---------- count-up (one page-load moment) ---------- */
  function fmt(n){ return Math.round(n).toLocaleString("en-US"); }
  var counters = document.querySelectorAll(".countup");
  for (var c = 0; c < counters.length; c++){
    (function(el){
      var to = Number(el.getAttribute("data-to")), pre = el.getAttribute("data-prefix") || "", suf = el.getAttribute("data-suffix") || "";
      if (reduce){ el.textContent = pre + fmt(to) + suf; return; }
      var start = null, dur = 1400;
      function tick(ts){
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + fmt(to * eased) + suf;
        if (p < 1) requestAnimationFrame(tick);
      }
      el.textContent = pre + "0" + suf;
      requestAnimationFrame(tick);
    })(counters[c]);
  }

  /* ---------- editable market model ---------- */
  var PRESETS = {
    pakistan:  {adults:72000000, gym:1},
    lahore:    {adults:4060000,  gym:3},
    karachi:   {adults:5240000,  gym:3},
    islamabad: {adults:377000,   gym:3},
    peshawar:  {adults:739189,   gym:3}
  };
  var BASE = {kg:12.47, price:12500, supp:35, spend:4000, som:1};
  var currentPreset = "pakistan";
  var F = {adults:$("inAdults"), gym:$("inGym"), kg:$("inKg"), price:$("inPrice"), supp:$("inSupp"), spend:$("inSpend"), som:$("inSom")};
  function pkr(v){
    if (v >= 1e9) return "PKR " + (v/1e9).toFixed(v >= 1e11 ? 1 : 2) + "B";
    if (v >= 1e6) return "PKR " + (v/1e6).toFixed(v >= 1e8 ? 0 : 1) + "M";
    return "PKR " + Math.round(v).toLocaleString("en-US");
  }
  function num(el){ var v = parseFloat(el.value); return isNaN(v) ? 0 : Math.max(0, v); }
  function compute(){
    var adults = num(F.adults), gymPct = num(F.gym)/100, kg = num(F.kg), price = num(F.price);
    var suppPct = num(F.supp)/100, spend = num(F.spend), somPct = num(F.som)/100;
    var gymGoers = adults * gymPct, users = gymGoers * suppPct;
    var tam = gymGoers * kg * price, sam = users * spend * 12, som = sam * somPct;
    $("tamV").textContent = pkr(tam); $("samV").textContent = pkr(sam); $("somV").textContent = pkr(som);
    $("tamF").textContent = fmt(gymGoers) + " gym-goers \u00D7 " + kg + " kg \u00D7 PKR " + fmt(price) + " per kg";
    $("samF").textContent = fmt(users) + " supplement users \u00D7 PKR " + fmt(spend) + " \u00D7 12 months";
    $("somF").textContent = (somPct*100).toFixed(1).replace(/\.0$/,"") + "% of the serviceable market";
    $("usdNote").textContent = "Total market is about US$" + (tam/280/1e6).toFixed(tam/280 >= 1e8 ? 0 : 1) + " million.";
  }
  function loadPreset(key){
    currentPreset = key;
    var p = PRESETS[key];
    F.adults.value = p.adults; F.gym.value = p.gym; F.kg.value = BASE.kg; F.price.value = BASE.price;
    F.supp.value = BASE.supp; F.spend.value = BASE.spend; F.som.value = BASE.som;
    var btns = document.querySelectorAll(".presets button");
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-p") === key ? "true" : "false");
    compute();
  }
  var pbtns = document.querySelectorAll(".presets button");
  for (var pb = 0; pb < pbtns.length; pb++) pbtns[pb].addEventListener("click", function(){ loadPreset(this.getAttribute("data-p")); });
  Object.keys(F).forEach(function(k){ F[k].addEventListener("input", compute); });
  $("resetModel").addEventListener("click", function(){ loadPreset(currentPreset); });
  loadPreset("pakistan");

  /* ---------- project filter ---------- */
  var chips = document.querySelectorAll(".filters button");
  var cards = document.querySelectorAll("#projgrid .proj");
  function applyFilter(f){
    var shown = 0;
    for (var i = 0; i < cards.length; i++){
      var tags = (cards[i].getAttribute("data-tags") || "").split(" ");
      var show = f === "all" || tags.indexOf(f) !== -1;
      cards[i].hidden = !show;
      if (show) shown++;
    }
    for (var j = 0; j < chips.length; j++) chips[j].setAttribute("aria-pressed", chips[j].getAttribute("data-f") === f ? "true" : "false");
    $("count").textContent = "Showing " + shown + " of " + cards.length + " projects";
  }
  for (var k = 0; k < chips.length; k++) chips[k].addEventListener("click", function(){ applyFilter(this.getAttribute("data-f")); });
  applyFilter("all");
  var jumps = document.querySelectorAll("[data-jump]");
  for (var m = 0; m < jumps.length; m++){
    jumps[m].addEventListener("click", function(){
      applyFilter(this.getAttribute("data-jump"));
      var el = $("projects"); if (el) el.scrollIntoView({behavior: reduce ? "auto" : "smooth", block: "start"});
    });
  }


  /* ---------- test-case walkthrough (generic examples) ---------- */
  var CASES = {
    deadline:{branch:"test-case/application-deadline", change:"the application deadline changed"},
    amount:{branch:"test-case/funding-amount", change:"the funding amount changed"},
    link:{branch:"test-case/application-link", change:"the application link changed"},
    page:{branch:"test-case/page-removed", change:"a page is no longer there"},
    newp:{branch:"test-case/new-opportunity", change:"a new opportunity page appeared"}
  };
  var simSel = $("simCase"), simMerge = $("simMerge"), simRun = $("simRun"), simReset = $("simReset"), simLog = $("simLog"), simMain = $("simMain");
  simMerge.addEventListener("click", function(){
    var c = CASES[simSel.value];
    simLog.textContent = "$ git merge " + c.branch + "\nmain now differs from baseline-v1: " + c.change + ".";
    simMain.textContent = "baseline-v1 plus one test case";
    simMerge.disabled = true; simSel.disabled = true; simRun.disabled = false; simReset.disabled = false;
  });
  simRun.addEventListener("click", function(){
    var c = CASES[simSel.value];
    simLog.textContent += "\n\nUpdate flow: comparing the site with the version it saw before.\nFound: " + c.change + ".\nSending the updated information to the data onboarding system.";
    simRun.disabled = true;
  });
  simReset.addEventListener("click", function(){
    simLog.textContent = "$ git checkout baseline-v1 -- .\nmain is back to the untouched copy.";
    simMain.textContent = "baseline-v1, untouched";
    simMerge.disabled = false; simSel.disabled = false; simRun.disabled = true; simReset.disabled = true;
  });

  /* ---------- illustrative dashboard (invented data) ---------- */
  (function(){
    var DAYS = 90, NS = "http://www.w3.org/2000/svg";
    function hash(s){ var h = 2166136261; for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function rng(seed){ var a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    var METRICS = {
      cvr: {label:"CVR",  base:3.4,  spread:.35, fmt:function(v){ return v.toFixed(2) + "%"; }},
      rpl: {label:"RPL",  base:11.5, spread:.30, fmt:function(v){ return "$" + v.toFixed(2); }},
      rpc: {label:"RPC",  base:.62,  spread:.30, fmt:function(v){ return "$" + v.toFixed(2); }},
      roas:{label:"ROAS", base:5.6,  spread:.25, fmt:function(v){ return v.toFixed(1) + "x"; }}
    };
    var ORDER = ["cvr","rpl","rpc","roas"];
    var VIEWS = {
      account:  ["Account A","Account B","Account C","Account D"],
      page:     ["Landing page A","Landing page B","Landing page C"],
      creative: ["Creative A","Creative B","Creative C","Creative D"],
      audience: ["Audience A","Audience B","Audience C","Audience D"]
    };
    var COLORS = ["var(--btn)","var(--teal)","#E0657A","var(--gold)"];
    var DATA = {};
    Object.keys(VIEWS).forEach(function(v){
      DATA[v] = {};
      VIEWS[v].forEach(function(seg){
        DATA[v][seg] = {};
        ORDER.forEach(function(m){
          var r = rng(hash(v + seg + m)), M = METRICS[m];
          var offset = (r() - .5) * 2 * M.spread * .6, trend = (r() - .42) * .18, phase = r() * 6.28, arr = [];
          for (var d = 0; d < DAYS; d++){
            var val = M.base * (1 + offset) * (1 + trend * d / (DAYS - 1)) * (1 + .05 * Math.sin(2 * Math.PI * d / 7 + phase) + (r() - .5) * .08);
            arr.push(val);
          }
          DATA[v][seg][m] = arr;
        });
      });
    });
    var OVERALL = {};
    ORDER.forEach(function(m){
      var arr = [];
      for (var d = 0; d < DAYS; d++){
        var sum = 0, segs = VIEWS.account;
        segs.forEach(function(s){ sum += DATA.account[s][m][d]; });
        arr.push(sum / segs.length);
      }
      OVERALL[m] = arr;
    });
    var end = new Date(); end.setHours(0,0,0,0);
    function dayLabel(i){ var d = new Date(end.getTime()); d.setDate(d.getDate() - (DAYS - 1 - i)); return d.toLocaleDateString("en-US", {month:"short", day:"numeric"}); }
    $("dashStamp").textContent = "Data through " + dayLabel(DAYS - 1) + ". Invented data.";

    var st = {view:"overall", metric:"cvr", range:30};
    function slice(arr){ return arr.slice(DAYS - st.range); }
    function chg(arr){ var a = slice(arr); return (a[a.length - 1] - a[0]) / a[0]; }
    function chgHtml(c){ if (Math.abs(c) < 0.0005) return "<span>Flat</span>"; var up = c >= 0; return '<span class="' + (up ? "k-up" : "k-down") + '">' + (up ? "Up " : "Down ") + Math.abs(c * 100).toFixed(1) + "%</span>"; }
    function el(tag, attrs){ var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

    function renderKpis(){
      var box = $("dashKpis"); box.innerHTML = "";
      ORDER.forEach(function(m){
        var arr = OVERALL[m], b = document.createElement("button");
        b.type = "button"; b.className = "kpi"; b.setAttribute("aria-pressed", st.metric === m ? "true" : "false");
        b.innerHTML = '<span class="k-name">' + METRICS[m].label + '</span><span class="k-val">' + METRICS[m].fmt(arr[DAYS - 1]) + '</span><span class="k-chg">' + chgHtml(chg(arr)) + '</span>';
        b.addEventListener("click", function(){ st.metric = m; render(); });
        box.appendChild(b);
      });
    }
    function series(){
      if (st.view === "overall") return [{name:"All accounts", data:slice(OVERALL[st.metric])}];
      return VIEWS[st.view].map(function(seg){ return {name:seg, data:slice(DATA[st.view][seg][st.metric])}; });
    }
    function renderChart(){
      var svg = $("dashChart"); while (svg.firstChild) svg.removeChild(svg.firstChild);
      var S = series(), W = 680, H = 260, L = 48, R = 14, T = 12, B = 30, n = S[0].data.length;
      var min = Infinity, max = -Infinity;
      S.forEach(function(s){ s.data.forEach(function(v){ if (v < min) min = v; if (v > max) max = v; }); });
      var pad = (max - min) * .12 || 1; min -= pad; max += pad;
      function X(i){ return L + (W - L - R) * (n === 1 ? 0 : i / (n - 1)); }
      function Y(v){ return T + (H - T - B) * (1 - (v - min) / (max - min)); }
      for (var g = 0; g <= 4; g++){
        var gv = min + (max - min) * g / 4, gy = Y(gv);
        svg.appendChild(el("line", {x1:L, x2:W - R, y1:gy, y2:gy, "class":"c-axis"}));
        var t = el("text", {x:L - 8, y:gy + 4, "text-anchor":"end", "class":"c-txt"}); t.textContent = METRICS[st.metric].fmt(gv).replace(/\.00$/, ""); svg.appendChild(t);
      }
      [0, Math.floor((n - 1) / 2), n - 1].forEach(function(i, k){
        var t = el("text", {x:X(i), y:H - 8, "text-anchor":k === 0 ? "start" : (k === 2 ? "end" : "middle"), "class":"c-txt"});
        t.textContent = dayLabel(DAYS - n + i); svg.appendChild(t);
      });
      S.forEach(function(s, idx){
        var pts = s.data.map(function(v, i){ return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ");
        svg.appendChild(el("polyline", {points:pts, fill:"none", "stroke-width":3, "stroke-linejoin":"round", "stroke-linecap":"round", style:"stroke:" + COLORS[idx % COLORS.length]}));
      });
      var cross = el("line", {x1:0, x2:0, y1:T, y2:H - B, "class":"c-cross", visibility:"hidden"}); svg.appendChild(cross);
      var hit = el("rect", {x:L, y:T, width:W - L - R, height:H - T - B, fill:"transparent"}); svg.appendChild(hit);
      function show(evt){
        var rect = svg.getBoundingClientRect(), px = ((evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left) / rect.width * W;
        var i = Math.max(0, Math.min(n - 1, Math.round((px - L) / (W - L - R) * (n - 1))));
        cross.setAttribute("x1", X(i)); cross.setAttribute("x2", X(i)); cross.setAttribute("visibility", "visible");
        $("dashRead").textContent = dayLabel(DAYS - n + i) + ": " + S.map(function(s){ return s.name + " " + METRICS[st.metric].fmt(s.data[i]); }).join(", ");
      }
      hit.addEventListener("mousemove", show); hit.addEventListener("touchstart", show, {passive:true}); hit.addEventListener("touchmove", show, {passive:true});
      hit.addEventListener("mouseleave", function(){ cross.setAttribute("visibility", "hidden"); $("dashRead").textContent = "Hover or tap the chart to read a day."; });
      var lg = $("dashLegend"); lg.innerHTML = "";
      S.forEach(function(s, idx){ var li = document.createElement("li"); li.innerHTML = '<i style="background:' + COLORS[idx % COLORS.length] + '"></i>' + s.name; lg.appendChild(li); });
    }
    function renderTable(){
      var t = $("dashTable"), html = "";
      if (st.view === "overall"){
        html = "<thead><tr><th scope=\"col\">Metric</th><th scope=\"col\">Latest</th><th scope=\"col\">Average</th><th scope=\"col\">Change over " + st.range + " days</th></tr></thead><tbody>";
        ORDER.forEach(function(m){
          var a = slice(OVERALL[m]), avg = a.reduce(function(x, y){ return x + y; }, 0) / a.length;
          html += "<tr><th scope=\"row\">" + METRICS[m].label + "</th><td>" + METRICS[m].fmt(a[a.length - 1]) + "</td><td>" + METRICS[m].fmt(avg) + "</td><td>" + chgHtml(chg(OVERALL[m])) + "</td></tr>";
        });
      } else {
        html = "<thead><tr><th scope=\"col\">" + ({account:"Account", page:"Landing page", creative:"Creative", audience:"Audience"})[st.view] + "</th><th scope=\"col\">" + METRICS[st.metric].label + " latest</th><th scope=\"col\">Average</th><th scope=\"col\">Change over " + st.range + " days</th></tr></thead><tbody>";
        var rows = VIEWS[st.view].map(function(seg){
          var full = DATA[st.view][seg][st.metric], a = slice(full);
          return {seg:seg, last:a[a.length - 1], avg:a.reduce(function(x, y){ return x + y; }, 0) / a.length, c:chg(full)};
        }).sort(function(p, q){ return q.last - p.last; });
        rows.forEach(function(r){ html += "<tr><th scope=\"row\">" + r.seg + "</th><td>" + METRICS[st.metric].fmt(r.last) + "</td><td>" + METRICS[st.metric].fmt(r.avg) + "</td><td>" + chgHtml(r.c) + "</td></tr>"; });
      }
      t.innerHTML = html + "</tbody>";
    }
    function render(){
      renderKpis(); renderChart(); renderTable();
      var rb = document.querySelectorAll("#dashRange button"); for (var i = 0; i < rb.length; i++) rb[i].setAttribute("aria-pressed", Number(rb[i].getAttribute("data-r")) === st.range ? "true" : "false");
      var vb = document.querySelectorAll("#dashViews button"); for (var j = 0; j < vb.length; j++) vb[j].setAttribute("aria-pressed", vb[j].getAttribute("data-v") === st.view ? "true" : "false");
    }
    var rbs = document.querySelectorAll("#dashRange button"); for (var a = 0; a < rbs.length; a++) rbs[a].addEventListener("click", function(){ st.range = Number(this.getAttribute("data-r")); render(); });
    var vbs = document.querySelectorAll("#dashViews button"); for (var b = 0; b < vbs.length; b++) vbs[b].addEventListener("click", function(){ st.view = this.getAttribute("data-v"); render(); });
    render();
  })();



  /* ---------- Excel section: Philip Morris Pakistan ---------- */
  var FB = {"Stock in trade": {"base": 12033405, "rows": [["Economic", "Inflation: cost of raw and packing materials", 5, 0.25], ["Economic", "Taxation on raw materials", 20, 0.1], ["Industry", "Illicit trade", 8, 0.15], ["Company", "Increased stock holding", 20, 0.15], ["Company", "Product line expansion", 40, 0.35]], "report": 14614570.37}, "Trade and other payables": {"base": 13504425, "rows": [["Economic", "Improved conditions (inflation)", -5, 0.05], ["Economic", "Increased taxes and regulatory pressure", 15, 0.2], ["Company", "Increase in advances from customers", 13, 0.25], ["Company", "Increased raw material requirements", 18, 0.3], ["Company", "Focus on sustainability may extend credit", 5, 0.2]], "report": 15178973.7}, "Cash and bank balances": {"base": 9062895, "rows": [["Company", "Selling off assets", 15, 0.5], ["Company", "Product line expansion", 15, 0.25], ["Company", "Unpaid dividends", 60, 0.25]], "report": 11441904.94}, "Administrative expenses": {"base": 1838038, "rows": [["Economic", "Professional service costs", 20, 0.2], ["Economic", "Rising energy tariffs on office operations", 15, 0.2], ["Economic", "Wage inflation", 10, 0.2], ["Company", "Depreciation", 30, 0.25], ["Company", "Reduced philanthropy", -12, 0.15]], "report": 2108229.586}, "Other income": {"base": 3409915, "rows": [["Economic", "Interest rates", 15, 0.3], ["Company", "Disposal of assets", 40, 0.7]], "report": 4518137.375}};
  var FB_ORDER = ["Stock in trade","Trade and other payables","Cash and bank balances","Administrative expenses","Other income"];
  var fbCur = FB_ORDER[0];
  var fbDraft = {};
  function fbLoad(name){ fbDraft = FB[name].rows.map(function(r){ return {c:r[0], f:r[1], g:r[2], w:r[3]}; }); }
  function fbNum(v){ var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function fbRender(){
    var item = FB[fbCur], tbl = $("fbTable"), html = '<thead><tr><th scope="col">Type</th><th scope="col">Factor</th><th scope="col" class="num">Growth (%)</th><th scope="col" class="num">Weight</th><th scope="col" class="num">Weighted growth</th></tr></thead><tbody>';
    fbDraft.forEach(function(r, i){
      html += '<tr><td><span class="cat">' + r.c + '</span></td><td>' + r.f + '</td>' +
        '<td class="num"><input type="number" step="0.5" data-i="' + i + '" data-k="g" value="' + r.g + '" aria-label="Growth for ' + r.f + '"></td>' +
        '<td class="num"><input type="number" step="0.05" min="0" data-i="' + i + '" data-k="w" value="' + r.w + '" aria-label="Weight for ' + r.f + '"></td>' +
        '<td class="num" id="fbw' + i + '"></td></tr>';
    });
    html += '</tbody><tfoot><tr><td colspan="4">Total weighted growth</td><td class="num" id="fbTot"></td></tr></tfoot>';
    tbl.innerHTML = html;
    var inputs = tbl.querySelectorAll("input");
    for (var j = 0; j < inputs.length; j++) inputs[j].addEventListener("input", function(){ fbDraft[Number(this.getAttribute("data-i"))][this.getAttribute("data-k")] = fbNum(this.value); fbCalc(); });
    fbCalc();
  }
  function fbCalc(){
    var item = FB[fbCur], tot = 0;
    fbDraft.forEach(function(r, i){ var wg = r.g * r.w; tot += wg; $("fbw" + i).textContent = wg.toFixed(2) + "%"; });
    $("fbTot").textContent = tot.toFixed(2) + "%";
    var fc = item.base * (1 + tot / 100);
    $("fbLabel").textContent = "2024 forecast for " + fbCur.toLowerCase() + " (Rs 000)";
    $("fbOut").textContent = Math.round(fc).toLocaleString("en-US");
    $("fbSub").textContent = (tot >= 0 ? "Up " : "Down ") + Math.abs(tot).toFixed(2) + "% from " + item.base.toLocaleString("en-US") + " in 2023, or about PKR " + (fc / 1e6).toFixed(2) + " billion.";
    var diff = Math.abs(fc - item.report);
    var chk = $("fbCheck");
    if (diff < 2){ chk.textContent = "Matches the report."; chk.className = "note chk-ok"; }
    else { var pct = (fc / item.report - 1) * 100; chk.textContent = "Differs from the report by " + (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%."; chk.className = "note"; }
    var bs = document.querySelectorAll("#fbItems button");
    for (var b = 0; b < bs.length; b++) bs[b].setAttribute("aria-pressed", bs[b].getAttribute("data-n") === fbCur ? "true" : "false");
  }
  (function(){
    var box = $("fbItems");
    FB_ORDER.forEach(function(n){
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("data-n", n); b.textContent = n; b.setAttribute("aria-pressed", n === fbCur ? "true" : "false");
      b.addEventListener("click", function(){ fbCur = n; fbLoad(n); fbRender(); });
      box.appendChild(b);
    });
    $("fbReset").addEventListener("click", function(){ fbLoad(fbCur); fbRender(); });
    fbLoad(fbCur); fbRender();
  })();

  /* the 2023 squeeze chart, from the report's tables */
  (function(){
    var YEARS = [2019, 2020, 2021, 2022, 2023];
    var SALES = [13334498, 16596036, 17458557, 19838541, 18219709];
    var COGS = [9144670, 10138881, 9975405, 10943558, 12082355];
    var DM = [2663662, 2601318, 2979029, 3329049, 5578496];
    var M = {
      cogs: SALES.map(function(s, i){ return COGS[i] / s * 100; }),
      dm: SALES.map(function(s, i){ return DM[i] / s * 100; }),
      left: SALES.map(function(s, i){ return 100 - COGS[i] / s * 100 - DM[i] / s * 100; })
    };
    var CAP = {
      cogs: function(v){ return "Cost of sales as a share of sales: " + v[3].toFixed(1) + "% in 2022, " + v[4].toFixed(1) + "% in 2023."; },
      dm: function(v){ return "Distribution and marketing as a share of sales: " + v[3].toFixed(1) + "% in 2022, " + v[4].toFixed(1) + "% in 2023."; },
      left: function(v){ return "Share of sales left after cost of sales and distribution and marketing: " + v[3].toFixed(1) + "% in 2022, " + v[4].toFixed(1) + "% in 2023."; }
    };
    var cur = "cogs", svg = $("sqChart"), NS = "http://www.w3.org/2000/svg";
    function el(t, a){ var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
    function draw(){
      var v = M[cur], W = 600, H = 250, L = 36, R = 12, T = 22, B = 34, max = 80;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      [0, 20, 40, 60, 80].forEach(function(g){
        var y = T + (H - T - B) * (1 - g / max);
        svg.appendChild(el("line", {x1:L, x2:W - R, y1:y, y2:y, "class":"c-axis"}));
        var t = el("text", {x:L - 6, y:y + 4, "text-anchor":"end", "class":"c-txt"}); t.textContent = g + "%"; svg.appendChild(t);
      });
      var bw = (W - L - R) / v.length;
      v.forEach(function(val, i){
        var h = (H - T - B) * (Math.max(val, 0) / max), x = L + i * bw + bw * .18, w = bw * .64, y = H - B - h;
        svg.appendChild(el("rect", {x:x, y:y, width:w, height:Math.max(h, 1), rx:6, "class":"sq-bar" + (i === 4 ? " hi" : "")}));
        var lab = el("text", {x:x + w / 2, y:y - 6, "text-anchor":"middle", "class":"sq-val"}); lab.textContent = val.toFixed(1) + "%"; svg.appendChild(lab);
        var yr = el("text", {x:x + w / 2, y:H - 12, "text-anchor":"middle", "class":"c-txt"}); yr.textContent = YEARS[i]; svg.appendChild(yr);
      });
      $("sqCap").textContent = CAP[cur](v) + " Sales in PKR billion: " + SALES.map(function(s){ return (s / 1e6).toFixed(1); }).join(", ") + ".";
      var bs = document.querySelectorAll("#sqMetric button");
      for (var b = 0; b < bs.length; b++) bs[b].setAttribute("aria-pressed", bs[b].getAttribute("data-q") === cur ? "true" : "false");
    }
    var qb = document.querySelectorAll("#sqMetric button");
    for (var q = 0; q < qb.length; q++) qb[q].addEventListener("click", function(){ cur = this.getAttribute("data-q"); draw(); });
    draw();
  })();

  /* naive-forecast steadiness bars */
  (function(){
    var rows = [["Cost of sales", 7.43], ["Sales", 11.37], ["Administrative expenses", 11.83], ["Distribution and marketing", 16.48], ["Trade and other payables", 24.45], ["Finance cost", 25.65], ["Stock in trade", 25.88], ["Other income", 30.20]];
    var box = $("mapeBars"), mx = 30.2;
    rows.forEach(function(r, i){
      var row = document.createElement("div"); row.className = "lrow";
      row.innerHTML = '<span>' + r[0] + '</span><span class="lt"><span class="lf' + (i === 0 ? " best" : "") + '" style="width:' + (r[1] / mx * 100).toFixed(1) + '%"></span></span><span class="lv">' + r[1].toFixed(1) + '%</span>';
      box.appendChild(row);
    });
  })();

  /* ---------- Python analysis section ---------- */
  var PY_TABS = document.querySelectorAll(".py-tabs [role=tab]");
  function showPane(id){
    for (var i = 0; i < PY_TABS.length; i++){
      var on = PY_TABS[i].getAttribute("data-pane") === id;
      PY_TABS[i].setAttribute("aria-selected", on ? "true" : "false");
      PY_TABS[i].tabIndex = on ? 0 : -1;
    }
    var panes = document.querySelectorAll(".py-pane");
    for (var j = 0; j < panes.length; j++){
      var onp = panes[j].id === "pane-" + id;
      panes[j].classList.toggle("on", onp);
      panes[j].hidden = !onp;
    }
  }
  for (var pt = 0; pt < PY_TABS.length; pt++){
    PY_TABS[pt].addEventListener("click", function(){ go(this.getAttribute("data-pane"), {scroll: false}); });
    PY_TABS[pt].addEventListener("keydown", function(e){
      var arr = Array.prototype.slice.call(PY_TABS), idx = arr.indexOf(this), nxt = -1;
      if (e.key === "ArrowRight") nxt = (idx + 1) % arr.length;
      if (e.key === "ArrowLeft") nxt = (idx - 1 + arr.length) % arr.length;
      if (nxt > -1){ e.preventDefault(); arr[nxt].focus(); go(arr[nxt].getAttribute("data-pane"), {scroll: false}); }
    });
  }

  /* houses: estimator from the log-log model */
  var HT = {Condo:0, Ranch:-1.0366, Split:-0.7404, Townhouse:-0.3648};
  var HMEAN = 706970;
  function houseEst(){
    var ty = $("hType").value, size = Number($("hSize").value), dist = Number($("hDist").value), pm = Number($("hPm").value), no2 = Number($("hNo2").value);
    $("hSizeV").textContent = size.toLocaleString("en-US"); $("hDistV").textContent = dist; $("hPmV").textContent = pm; $("hNo2V").textContent = no2;
    var pol = Math.sqrt(pm * no2);
    var lp = 12.1868 + HT[ty] + 0.3484 * Math.log(size) - 0.1352 * Math.log(dist) - 0.1801 * Math.log(pol);
    var price = Math.exp(lp), rounded = Math.round(price / 1000) * 1000;
    $("hOut").textContent = "$" + rounded.toLocaleString("en-US");
    var diff = (price / HMEAN - 1) * 100;
    $("hCmp").textContent = Math.abs(diff).toFixed(0) + "% " + (diff >= 0 ? "above" : "below") + " the average price in the data ($707K).";
  }
  ["hType","hSize","hDist","hPm","hNo2"].forEach(function(id){ $(id).addEventListener("input", houseEst); });
  houseEst();

  var LADDER = [
    ["Size only", 0.657], ["Size and type", 0.838], ["Plus distance, PM2.5, NO2", 0.885], ["With pollution index", 0.883], ["Log-log model", 0.927]
  ];
  var lb = $("ladder");
  LADDER.forEach(function(r, i){
    var row = document.createElement("div"); row.className = "lrow";
    row.innerHTML = '<span>' + r[0] + '</span><span class="lt"><span class="lf' + (i === LADDER.length - 1 ? " best" : "") + '" style="width:' + (r[1] * 100).toFixed(1) + '%"></span></span><span class="lv">' + r[1].toFixed(3) + '</span>';
    lb.appendChild(row);
  });

  /* Hind Oil style pricing simulation */
  var HOI = {"base": [[91.38, 13012.990318], [92.38, 12876.373552], [93.38, 12739.756787], [94.38, 12603.140021], [95.38, 12466.523256], [96.38, 12329.90649], [97.38, 12193.289725], [98.38, 12056.672959], [99.38, 11920.056194], [100.38, 11783.439428], [101.38, 11646.822663], [102.38, 11510.205897], [103.38, 11373.589132], [104.38, 11236.972366], [105.38, 11100.355601], [106.38, 10963.738835], [107.38, 10827.12207], [108.38, 10690.505304], [109.38, 10553.888539], [110.38, 10417.271773]], "month": [[91.38, 13109.169052], [92.38, 12988.015003], [93.38, 12866.860954], [94.38, 12745.706904], [95.38, 12624.552855], [96.38, 12503.398806], [97.38, 12382.244757], [98.38, 12261.090708], [99.38, 12139.936658], [100.38, 12018.782609], [101.38, 11897.62856], [102.38, 11776.474511], [103.38, 11655.320462], [104.38, 11534.166412], [105.38, 11413.012363], [106.38, 11291.858314], [107.38, 11170.704265], [108.38, 11049.550215], [109.38, 10928.396166], [110.38, 10807.242117]]};
  var hoiState = {m:"base"};
  var hoiSvg = $("hoiChart");
  function hoiRender(){
    var rows = HOI[hoiState.m], idx = Number($("hoiPrice").value);
    var rev = rows.map(function(r){ return r[0] * r[1]; });
    var peak = 0; for (var i = 1; i < rev.length; i++) if (rev[i] > rev[peak]) peak = i;
    var W = 640, H = 260, L = 64, R = 16, T = 16, B = 36;
    var min = Math.min.apply(null, rev), max = Math.max.apply(null, rev), pad = (max - min) * .15; min -= pad; max += pad;
    function X(i){ return L + (W - L - R) * i / (rows.length - 1); }
    function Y(v){ return T + (H - T - B) * (1 - (v - min) / (max - min)); }
    var NS = "http://www.w3.org/2000/svg";
    function el(t, a){ var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
    while (hoiSvg.firstChild) hoiSvg.removeChild(hoiSvg.firstChild);
    for (var g = 0; g <= 3; g++){
      var gv = min + (max - min) * g / 3, gy = Y(gv);
      hoiSvg.appendChild(el("line", {x1:L, x2:W - R, y1:gy, y2:gy, "class":"c-axis"}));
      var tx = el("text", {x:L - 8, y:gy + 4, "text-anchor":"end", "class":"c-txt"}); tx.textContent = (gv / 1e6).toFixed(3) + "M"; hoiSvg.appendChild(tx);
    }
    [0, 6, 13, 19].forEach(function(i){
      var tx = el("text", {x:X(i), y:H - 10, "text-anchor":"middle", "class":"c-txt"}); tx.textContent = rows[i][0].toFixed(2); hoiSvg.appendChild(tx);
    });
    var xl = el("text", {x:(L + W - R) / 2, y:H - 0, "text-anchor":"middle", "class":"c-txt"}); xl.textContent = ""; hoiSvg.appendChild(xl);
    hoiSvg.appendChild(el("polyline", {points:rev.map(function(v, i){ return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" "), fill:"none", "stroke-width":3.5, "stroke-linejoin":"round", "stroke-linecap":"round", style:"stroke:var(--teal)"}));
    hoiSvg.appendChild(el("circle", {cx:X(peak), cy:Y(rev[peak]), r:9, fill:"none", "stroke-width":3, style:"stroke:var(--gold)"}));
    hoiSvg.appendChild(el("circle", {cx:X(idx), cy:Y(rev[idx]), r:6, style:"fill:var(--btn)"}));
    $("hoiPriceV").textContent = rows[idx][0].toFixed(2);
    $("hoiOut").textContent = Math.round(rows[idx][1]).toLocaleString("en-US") + " units, " + Math.round(rev[idx]).toLocaleString("en-US");
    $("hoiPeak").textContent = "Revenue peaks at a price of " + rows[peak][0].toFixed(2) + " (" + Math.round(rev[peak]).toLocaleString("en-US") + ") in this model. The gold ring marks the peak.";
    var mb = document.querySelectorAll("#hoiModel button");
    for (var b = 0; b < mb.length; b++) mb[b].setAttribute("aria-pressed", mb[b].getAttribute("data-m") === hoiState.m ? "true" : "false");
  }
  $("hoiPrice").addEventListener("input", hoiRender);
  var hmb = document.querySelectorAll("#hoiModel button");
  for (var hb = 0; hb < hmb.length; hb++) hmb[hb].addEventListener("click", function(){ hoiState.m = this.getAttribute("data-m"); hoiRender(); });
  hoiRender();

  /* salary: forest plot of regression coefficients */
  (function(){
    var NS = "http://www.w3.org/2000/svg", T95 = 1.9626;
    var ROWS = [
      ["g","Gender, age, rating"],
      ["Male (vs female)", 8537.217, 1407.599, 0.000],
      ["Age (per year)", 1995.530, 64.374, 0.000],
      ["Rating (per point)", 5073.4675, 368.329, 0.000],
      ["g","Degree (vs Associate\u2019s)"],
      ["Bachelor\u2019s", 7046.7253, 2618.119, 0.007],
      ["High School", -4756.2391, 2296.895, 0.039],
      ["Master\u2019s", 12790, 2734.634, 0.000],
      ["Ph.D.", 18870, 3504.650, 0.000],
      ["g","Division (vs Accounting)"],
      ["Corporate", 8023.7103, 3691.076, 0.030],
      ["Engineering", 4167.1267, 3543.618, 0.240],
      ["Human Resources", -5867.3196, 3689.578, 0.112],
      ["Operations", -31380, 3698.791, 0.000],
      ["Sales", -7304.1825, 3367.735, 0.030]
    ];
    var svg = $("forest"), W = 680, RH = 25, GH = 30, top = 14, left = 236, right = 664;
    var lo = -40000, hi = 28000;
    function X(v){ return left + (right - left) * (v - lo) / (hi - lo); }
    function el(t, a){ var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
    var y = top, rowsY = [];
    ROWS.forEach(function(r){ if (r[0] === "g"){ y += GH; rowsY.push(y - 8); } else { y += RH; rowsY.push(y - 8); } });
    var H = y + 34; svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    [-40000, -20000, 0, 20000].forEach(function(t){
      svg.appendChild(el("line", {x1:X(t), x2:X(t), y1:top, y2:H - 28, "class": t === 0 ? "f-zero" : "c-axis"}));
      var tx = el("text", {x:X(t), y:H - 10, "text-anchor":"middle", "class":"c-txt"}); tx.textContent = (t < 0 ? "-$" : "$") + Math.abs(t / 1000) + "K"; svg.appendChild(tx);
    });
    ROWS.forEach(function(r, i){
      var yy = rowsY[i];
      if (r[0] === "g"){
        var gt = el("text", {x:8, y:yy, "class":"f-grp"}); gt.textContent = r[1]; svg.appendChild(gt); return;
      }
      var coef = r[1], se = r[2], p = r[3], sig = p < 0.05, lo95 = coef - T95 * se, hi95 = coef + T95 * se;
      var lab = el("text", {x:8, y:yy + 4, "class":"f-txt"}); lab.textContent = r[0]; svg.appendChild(lab);
      var val = el("text", {x:226, y:yy + 4, "text-anchor":"end", "class":"f-val"}); val.textContent = (coef < 0 ? "-$" : "+$") + Math.round(Math.abs(coef)).toLocaleString("en-US"); svg.appendChild(val);
      svg.appendChild(el("line", {x1:X(lo95), x2:X(hi95), y1:yy, y2:yy, "class":"f-ci", style:"stroke:" + (sig ? "var(--teal)" : "var(--faint)")}));
      svg.appendChild(el("circle", {cx:X(coef), cy:yy, r:5.5, "stroke-width":2.5, style:"stroke:" + (sig ? "var(--teal)" : "var(--faint)") + ";fill:" + (sig ? "var(--teal)" : "var(--panel)")}));
    });
  })();

  /* revenue: model comparison bars */
  (function(){
    var M = [["AR(2)", 2.078956], ["AR(3)", 2.209311], ["AR(1)", 2.450292], ["Quadratic trend", 4.817020], ["Linear trend", 5.031316], ["Exponential trend", 5.394838]];
    var box = $("madBars"), mx = 5.394838;
    M.forEach(function(r, i){
      var row = document.createElement("div"); row.className = "lrow";
      row.innerHTML = '<span>' + r[0] + '</span><span class="lt"><span class="lf' + (i === 0 ? " best" : "") + '" style="width:' + (r[1] / mx * 100).toFixed(1) + '%"></span></span><span class="lv">' + r[1].toFixed(2) + '</span>';
      box.appendChild(row);
    });
  })();


  /* ---------- Stata thesis: odds-ratio explorer ---------- */
  (function(){
    var ST = {"models": {"all": {"1": [{"v": "Technology", "b": 0.617, "se": 0.133, "s": "***"}, {"v": "Awareness", "b": 0.689, "se": 0.379, "s": "*"}, {"v": "FintechUsage", "b": 0.864, "se": 0.298, "s": "***"}, {"v": "Security", "b": 0.47, "se": 0.175, "s": "***"}, {"v": "reliability", "b": 0.352, "se": 0.184, "s": "*"}, {"v": "losses", "b": -0.265, "se": 0.146, "s": "*"}, {"v": "Privacy", "b": 0.245, "se": 0.152, "s": ""}, {"v": "ease", "b": 0.0607, "se": 0.162, "s": ""}, {"v": "convenience", "b": 0.75, "se": 0.168, "s": "***"}, {"v": "socialmedia", "b": -0.157, "se": 0.133, "s": ""}], "2": [{"v": "Technology", "b": 0.404, "se": 0.153, "s": "***"}, {"v": "Awareness", "b": 0.781, "se": 0.385, "s": "**"}, {"v": "FintechUsage", "b": 0.741, "se": 0.313, "s": "**"}, {"v": "Security", "b": 0.526, "se": 0.18, "s": "***"}, {"v": "reliability", "b": 0.236, "se": 0.187, "s": ""}, {"v": "losses", "b": -0.191, "se": 0.153, "s": ""}, {"v": "Privacy", "b": 0.204, "se": 0.157, "s": ""}, {"v": "ease", "b": 0.185, "se": 0.169, "s": ""}, {"v": "convenience", "b": 0.676, "se": 0.174, "s": "***"}, {"v": "socialmedia", "b": -0.0759, "se": 0.14, "s": ""}, {"v": "Age", "b": -0.549, "se": 0.274, "s": "**"}, {"v": "Gender", "b": -0.651, "se": 0.249, "s": "***"}, {"v": "Unemployed", "b": 0.257, "se": 0.605, "s": ""}, {"v": "Housewife", "b": 0.676, "se": 0.705, "s": ""}, {"v": "Public", "b": 0.481, "se": 0.444, "s": ""}, {"v": "Private", "b": 0.978, "se": 0.421, "s": "**"}, {"v": "Selfemployed", "b": 0.732, "se": 0.45, "s": ""}, {"v": "Education", "b": 0.344, "se": 0.179, "s": "*"}], "3": [{"v": "Technology", "b": 0.347, "se": 0.159, "s": "**"}, {"v": "Awareness", "b": 0.751, "se": 0.387, "s": "*"}, {"v": "FintechUsage", "b": 0.755, "se": 0.317, "s": "**"}, {"v": "Security", "b": 0.526, "se": 0.182, "s": "***"}, {"v": "reliability", "b": 0.2, "se": 0.189, "s": ""}, {"v": "losses", "b": -0.229, "se": 0.155, "s": ""}, {"v": "Privacy", "b": 0.212, "se": 0.157, "s": ""}, {"v": "ease", "b": 0.168, "se": 0.168, "s": ""}, {"v": "convenience", "b": 0.624, "se": 0.179, "s": "***"}, {"v": "socialmedia", "b": -0.1, "se": 0.144, "s": ""}, {"v": "Age", "b": -0.541, "se": 0.275, "s": "**"}, {"v": "Gender", "b": -0.715, "se": 0.253, "s": "***"}, {"v": "Unemployed", "b": 0.158, "se": 0.614, "s": ""}, {"v": "Housewife", "b": 0.712, "se": 0.716, "s": ""}, {"v": "Public", "b": 0.486, "se": 0.444, "s": ""}, {"v": "Private", "b": 0.968, "se": 0.422, "s": "**"}, {"v": "Selfemployed", "b": 0.732, "se": 0.454, "s": ""}, {"v": "Education", "b": 0.314, "se": 0.181, "s": "*"}, {"v": "Income", "b": 0.155, "se": 0.109, "s": ""}, {"v": "Family", "b": 0.17, "se": 0.151, "s": ""}], "4": [{"v": "Technology", "b": 0.327, "se": 0.16, "s": "**"}, {"v": "Awareness", "b": 0.795, "se": 0.391, "s": "**"}, {"v": "FintechUsage", "b": 0.709, "se": 0.319, "s": "**"}, {"v": "Security", "b": 0.501, "se": 0.183, "s": "***"}, {"v": "reliability", "b": 0.191, "se": 0.19, "s": ""}, {"v": "losses", "b": -0.219, "se": 0.156, "s": ""}, {"v": "Privacy", "b": 0.206, "se": 0.158, "s": ""}, {"v": "ease", "b": 0.151, "se": 0.169, "s": ""}, {"v": "convenience", "b": 0.645, "se": 0.181, "s": "***"}, {"v": "socialmedia", "b": -0.087, "se": 0.145, "s": ""}, {"v": "Age", "b": -0.464, "se": 0.282, "s": "*"}, {"v": "Gender", "b": -0.727, "se": 0.254, "s": "***"}, {"v": "Unemployed", "b": 0.0939, "se": 0.613, "s": ""}, {"v": "Housewife", "b": 0.628, "se": 0.721, "s": ""}, {"v": "Public", "b": 0.586, "se": 0.45, "s": ""}, {"v": "Private", "b": 0.95, "se": 0.421, "s": "**"}, {"v": "Selfemployed", "b": 0.764, "se": 0.453, "s": "*"}, {"v": "Education", "b": 0.314, "se": 0.181, "s": "*"}, {"v": "Income", "b": 0.154, "se": 0.109, "s": ""}, {"v": "Family", "b": 0.188, "se": 0.152, "s": ""}, {"v": "location", "b": 0.439, "se": 0.325, "s": ""}]}, "male": {"1": [{"v": "Technology", "b": 0.673, "se": 0.219, "s": "***"}, {"v": "Awareness", "b": 0.43, "se": 0.757, "s": ""}, {"v": "FintechUsage", "b": 1.213, "se": 0.628, "s": "*"}, {"v": "Security", "b": 0.49, "se": 0.258, "s": "*"}, {"v": "reliability", "b": 0.101, "se": 0.278, "s": ""}, {"v": "losses", "b": -0.0959, "se": 0.227, "s": ""}, {"v": "Privacy", "b": 0.387, "se": 0.251, "s": ""}, {"v": "ease", "b": 0.329, "se": 0.238, "s": ""}, {"v": "convenience", "b": 0.493, "se": 0.233, "s": "**"}, {"v": "socialmedia", "b": -0.336, "se": 0.199, "s": "*"}], "2": [{"v": "Technology", "b": 0.517, "se": 0.259, "s": "**"}, {"v": "Awareness", "b": 0.814, "se": 0.812, "s": ""}, {"v": "FintechUsage", "b": 1.428, "se": 0.671, "s": "**"}, {"v": "Security", "b": 0.458, "se": 0.274, "s": "*"}, {"v": "reliability", "b": 0.201, "se": 0.307, "s": ""}, {"v": "losses", "b": -0.0445, "se": 0.245, "s": ""}, {"v": "Privacy", "b": 0.45, "se": 0.262, "s": "*"}, {"v": "ease", "b": 0.439, "se": 0.249, "s": "*"}, {"v": "convenience", "b": 0.314, "se": 0.252, "s": ""}, {"v": "socialmedia", "b": -0.269, "se": 0.212, "s": ""}, {"v": "Age", "b": -0.854, "se": 0.542, "s": ""}, {"v": "Unemployed", "b": 17.32, "se": 1007.0, "s": ""}, {"v": "Housewife", "b": 0.481, "se": 1.69, "s": ""}, {"v": "Public", "b": 0.969, "se": 1.037, "s": ""}, {"v": "Private", "b": 0.792, "se": 0.672, "s": ""}, {"v": "Selfemployed", "b": 0.42, "se": 0.66, "s": ""}, {"v": "Education", "b": 0.54, "se": 0.325, "s": "*"}], "3": [{"v": "Technology", "b": 0.189, "se": 0.275, "s": ""}, {"v": "Awareness", "b": 1.358, "se": 0.85, "s": ""}, {"v": "FintechUsage", "b": 1.132, "se": 0.719, "s": ""}, {"v": "Security", "b": 0.3, "se": 0.31, "s": ""}, {"v": "reliability", "b": 0.223, "se": 0.32, "s": ""}, {"v": "losses", "b": -0.165, "se": 0.255, "s": ""}, {"v": "Privacy", "b": 0.57, "se": 0.277, "s": "**"}, {"v": "ease", "b": 0.501, "se": 0.262, "s": "*"}, {"v": "convenience", "b": 0.267, "se": 0.26, "s": ""}, {"v": "socialmedia", "b": -0.364, "se": 0.221, "s": "*"}, {"v": "Age", "b": -0.975, "se": 0.55, "s": "*"}, {"v": "Unemployed", "b": 17.03, "se": 1001.0, "s": ""}, {"v": "Housewife", "b": 0.709, "se": 1.773, "s": ""}, {"v": "Public", "b": 1.351, "se": 1.066, "s": ""}, {"v": "Private", "b": 0.589, "se": 0.69, "s": ""}, {"v": "Selfemployed", "b": -0.0357, "se": 0.667, "s": ""}, {"v": "Education", "b": 0.708, "se": 0.338, "s": "**"}, {"v": "Income", "b": 0.602, "se": 0.18, "s": "***"}, {"v": "Family", "b": 0.395, "se": 0.245, "s": ""}], "4": [{"v": "Technology", "b": 0.186, "se": 0.274, "s": ""}, {"v": "Awareness", "b": 1.436, "se": 0.846, "s": "*"}, {"v": "FintechUsage", "b": 1.112, "se": 0.715, "s": ""}, {"v": "Security", "b": 0.324, "se": 0.311, "s": ""}, {"v": "reliability", "b": 0.203, "se": 0.318, "s": ""}, {"v": "losses", "b": -0.161, "se": 0.255, "s": ""}, {"v": "Privacy", "b": 0.604, "se": 0.28, "s": "**"}, {"v": "ease", "b": 0.541, "se": 0.266, "s": "**"}, {"v": "convenience", "b": 0.261, "se": 0.259, "s": ""}, {"v": "socialmedia", "b": -0.377, "se": 0.221, "s": "*"}, {"v": "Age", "b": -1.01, "se": 0.554, "s": "*"}, {"v": "Unemployed", "b": 16.36, "se": 672.7, "s": ""}, {"v": "Housewife", "b": 0.395, "se": 1.795, "s": ""}, {"v": "Public", "b": 1.169, "se": 1.077, "s": ""}, {"v": "Private", "b": 0.614, "se": 0.69, "s": ""}, {"v": "Selfemployed", "b": -0.0729, "se": 0.671, "s": ""}, {"v": "Education", "b": 0.703, "se": 0.338, "s": "**"}, {"v": "Income", "b": 0.613, "se": 0.181, "s": "***"}, {"v": "Family", "b": 0.375, "se": 0.246, "s": ""}, {"v": "location", "b": -0.488, "se": 0.575, "s": ""}]}, "female": {"1": [{"v": "Technology", "b": 0.616, "se": 0.187, "s": "***"}, {"v": "Awareness", "b": 0.734, "se": 0.437, "s": "*"}, {"v": "FintechUsage", "b": 0.569, "se": 0.348, "s": ""}, {"v": "Security", "b": 0.526, "se": 0.254, "s": "**"}, {"v": "reliability", "b": 0.464, "se": 0.253, "s": "*"}, {"v": "losses", "b": -0.362, "se": 0.202, "s": "*"}, {"v": "Privacy", "b": 0.253, "se": 0.197, "s": ""}, {"v": "ease", "b": -0.178, "se": 0.239, "s": ""}, {"v": "convenience", "b": 0.986, "se": 0.259, "s": "***"}, {"v": "socialmedia", "b": -0.00348, "se": 0.189, "s": ""}], "2": [{"v": "Technology", "b": 0.428, "se": 0.214, "s": "**"}, {"v": "Awareness", "b": 0.968, "se": 0.453, "s": "**"}, {"v": "FintechUsage", "b": 0.442, "se": 0.368, "s": ""}, {"v": "Security", "b": 0.532, "se": 0.271, "s": "**"}, {"v": "reliability", "b": 0.444, "se": 0.261, "s": "*"}, {"v": "losses", "b": -0.372, "se": 0.23, "s": ""}, {"v": "Privacy", "b": 0.248, "se": 0.213, "s": ""}, {"v": "ease", "b": -0.177, "se": 0.249, "s": ""}, {"v": "convenience", "b": 1.004, "se": 0.272, "s": "***"}, {"v": "socialmedia", "b": 0.0441, "se": 0.204, "s": ""}, {"v": "Age", "b": -0.379, "se": 0.348, "s": ""}, {"v": "Unemployed", "b": -0.595, "se": 0.689, "s": ""}, {"v": "Housewife", "b": 0.533, "se": 0.794, "s": ""}, {"v": "Public", "b": 0.4, "se": 0.537, "s": ""}, {"v": "Private", "b": 1.334, "se": 0.587, "s": "**"}, {"v": "Selfemployed", "b": 1.301, "se": 0.68, "s": "*"}, {"v": "Education", "b": 0.27, "se": 0.239, "s": ""}], "3": [{"v": "Technology", "b": 0.46, "se": 0.221, "s": "**"}, {"v": "Awareness", "b": 1.016, "se": 0.459, "s": "**"}, {"v": "FintechUsage", "b": 0.404, "se": 0.371, "s": ""}, {"v": "Security", "b": 0.505, "se": 0.274, "s": "*"}, {"v": "reliability", "b": 0.477, "se": 0.265, "s": "*"}, {"v": "losses", "b": -0.356, "se": 0.231, "s": ""}, {"v": "Privacy", "b": 0.254, "se": 0.213, "s": ""}, {"v": "ease", "b": -0.17, "se": 0.249, "s": ""}, {"v": "convenience", "b": 1.043, "se": 0.282, "s": "***"}, {"v": "socialmedia", "b": 0.0529, "se": 0.211, "s": ""}, {"v": "Age", "b": -0.378, "se": 0.348, "s": ""}, {"v": "Unemployed", "b": -0.536, "se": 0.7, "s": ""}, {"v": "Housewife", "b": 0.497, "se": 0.804, "s": ""}, {"v": "Public", "b": 0.393, "se": 0.538, "s": ""}, {"v": "Private", "b": 1.353, "se": 0.589, "s": "**"}, {"v": "Selfemployed", "b": 1.253, "se": 0.688, "s": "*"}, {"v": "Education", "b": 0.32, "se": 0.246, "s": ""}, {"v": "Income", "b": -0.111, "se": 0.154, "s": ""}, {"v": "Family", "b": -0.102, "se": 0.234, "s": ""}], "4": [{"v": "Technology", "b": 0.372, "se": 0.225, "s": "*"}, {"v": "Awareness", "b": 1.098, "se": 0.463, "s": "**"}, {"v": "FintechUsage", "b": 0.322, "se": 0.374, "s": ""}, {"v": "Security", "b": 0.453, "se": 0.277, "s": ""}, {"v": "reliability", "b": 0.409, "se": 0.27, "s": ""}, {"v": "losses", "b": -0.292, "se": 0.232, "s": ""}, {"v": "Privacy", "b": 0.264, "se": 0.215, "s": ""}, {"v": "ease", "b": -0.17, "se": 0.252, "s": ""}, {"v": "convenience", "b": 1.077, "se": 0.286, "s": "***"}, {"v": "socialmedia", "b": 0.068, "se": 0.213, "s": ""}, {"v": "Age", "b": -0.241, "se": 0.359, "s": ""}, {"v": "Unemployed", "b": -0.688, "se": 0.704, "s": ""}, {"v": "Housewife", "b": 0.156, "se": 0.834, "s": ""}, {"v": "Public", "b": 0.59, "se": 0.55, "s": ""}, {"v": "Private", "b": 1.291, "se": 0.585, "s": "**"}, {"v": "Selfemployed", "b": 1.326, "se": 0.678, "s": "*"}, {"v": "Education", "b": 0.317, "se": 0.25, "s": ""}, {"v": "Income", "b": -0.118, "se": 0.154, "s": ""}, {"v": "Family", "b": -0.0388, "se": 0.236, "s": ""}, {"v": "location", "b": 0.885, "se": 0.444, "s": "**"}]}}, "fit": {"all": {"n": 334, "chosen": 2, "ll": [-363.953, -351.456, -349.788, -348.879], "aic": [755.906, 746.913, 747.576, 747.758], "bic": [809.262, 830.758, 839.044, 843.037], "lr": [null, "LR \u03c7\u00b2(8) = 24.99, p = 0.0016", "LR \u03c7\u00b2(2) = 3.34, p = 0.1886", "LR \u03c7\u00b2(1) = 1.82, p = 0.1776"]}, "male": {"n": 152, "chosen": 3, "ll": [-141.893, -133.508, -125.575, -125.207], "aic": [311.787, 309.015, 297.15, 298.414], "bic": [354.121, 372.517, 366.699, 370.987], "lr": [null, "LR \u03c7\u00b2(7) = 16.77, p = 0.0189", "LR \u03c7\u00b2(2) = 15.87, p = 0.0004", "LR \u03c7\u00b2(1) = 0.74, p = 0.3910"]}, "female": {"n": 182, "chosen": 1, "ll": [-211.054, -204.047, -203.719, -201.726], "aic": [450.107, 450.093, 453.438, 451.452], "bic": [494.963, 517.377, 527.13, 528.349], "lr": [null, "LR \u03c7\u00b2(7) = 14.01, p = 0.0509", "LR \u03c7\u00b2(2) = 0.66, p = 0.7205", "LR \u03c7\u00b2(1) = 3.99, p = 0.0459"]}}};
    var LABEL = {Technology:"Technology experience", Awareness:"Awareness of fintech", FintechUsage:"Current fintech use", Security:"Security", reliability:"Reliability", losses:"Perceived losses", Privacy:"Privacy", ease:"Ease of use", convenience:"Convenience", socialmedia:"Social media influence", Age:"Older age group", Gender:"Female (vs male)", Education:"Education level", Unemployed:"Unemployed", Housewife:"Housewife", Public:"Public sector", Private:"Private sector", Selfemployed:"Self-employed", Income:"Income", Family:"Family influence", location:"Metropolitan location"};
    var GROUPS = [
      ["Attitudes and experience", ["Technology","Awareness","FintechUsage","Security","reliability","losses","Privacy","ease","convenience","socialmedia"]],
      ["Personal", ["Age","Gender","Education"]],
      ["Occupation (vs students)", ["Unemployed","Housewife","Public","Private","Selfemployed"]],
      ["Household", ["Income","Family"]],
      ["Location", ["location"]]
    ];
    var MODEL_DESC = {1:"Model 1: attitudes and experience only.", 2:"Model 2: adds age, gender, occupation, and education.", 3:"Model 3: adds income and family influence.", 4:"Model 4: adds location."};
    var SAMPLE_NAME = {all:"everyone", male:"men", female:"women"};
    var st = {g:"all", m:2}, NS = "http://www.w3.org/2000/svg", T95 = 1.96, svg = document.getElementById("stForest");
    function el(t, a){ var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
    function fmt(v){ return v >= 100 ? v.toFixed(0) : (v >= 10 ? v.toFixed(1) : v.toFixed(2)); }
    function r1(v){ return (Math.round((v + (v < 0 ? -1e-9 : 1e-9)) * 10) / 10).toFixed(1); }
    function draw(){
      var rows = ST.models[st.g][st.m], byVar = {}, omitted = false;
      rows.forEach(function(r){ byVar[r.v] = r; });
      var W = 680, left = 244, right = 662, RH = 24, GH = 30, top = 10, lo = 0.1, hi = 20;
      function X(v){ var c = Math.max(lo, Math.min(hi, v)); return left + (right - left) * (Math.log(c) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)); }
      var plan = [], y = top;
      GROUPS.forEach(function(g){
        var vars = g[1].filter(function(v){ return byVar[v] && !(st.g === "male" && v === "Unemployed"); });
        if (g[1].indexOf("Unemployed") > -1 && st.g === "male" && byVar.Unemployed) omitted = true;
        if (!vars.length) return;
        y += GH; plan.push({g:g[0], y:y - 8});
        vars.forEach(function(v){ y += RH; plan.push({v:v, y:y - 8}); });
      });
      var H = y + 34;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      [0.25, 0.5, 1, 2, 4, 8, 16].forEach(function(t){
        svg.appendChild(el("line", {x1:X(t), x2:X(t), y1:top, y2:H - 28, "class": t === 1 ? "s-ref" : "c-axis"}));
        var tx = el("text", {x:X(t), y:H - 10, "text-anchor":"middle", "class":"c-txt"}); tx.textContent = t; svg.appendChild(tx);
      });
      plan.forEach(function(p){
        if (p.g){ var gt = el("text", {x:8, y:p.y, "class":"f-grp"}); gt.textContent = p.g; svg.appendChild(gt); return; }
        var r = byVar[p.v], or = Math.exp(r.b), l = Math.exp(r.b - T95 * r.se), u = Math.exp(r.b + T95 * r.se), sig = r.s.length >= 2, weak = r.s.length === 1;
        var col = sig ? "var(--teal)" : (weak ? "var(--teal)" : "var(--faint)");
        var g = el("g", {});
        var tip = el("title", {}); tip.textContent = LABEL[p.v] + ": odds ratio " + or.toFixed(2) + r.s + " (95% CI " + fmt(l) + " to " + fmt(u) + ")"; g.appendChild(tip);
        var lab = el("text", {x:8, y:p.y + 4, "class":"f-txt"}); lab.textContent = LABEL[p.v]; g.appendChild(lab);
        var val = el("text", {x:236, y:p.y + 4, "text-anchor":"end", "class":"f-val"}); val.textContent = fmt(or) + r.s; g.appendChild(val);
        g.appendChild(el("line", {x1:X(l), x2:X(u), y1:p.y, y2:p.y, "class":"s-ci", style:"stroke:" + col}));
        g.appendChild(el("circle", {cx:X(or), cy:p.y, r:5.5, "stroke-width":2.5, style:"stroke:" + col + ";fill:" + (sig ? "var(--teal)" : "var(--panel)")}));
        svg.appendChild(g);
      });
      var f = ST.fit[st.g], i = st.m - 1;
      document.getElementById("stModelDesc").textContent = MODEL_DESC[st.m] + (st.g === "all" ? "" : " (Gender is not a variable within one gender.)");
      document.getElementById("stFitLabel").textContent = "Model " + st.m + ", " + SAMPLE_NAME[st.g] + (st.m === f.chosen ? ", the model chosen in the thesis" : "");
      document.getElementById("stFitMain").textContent = "AIC " + r1(f.aic[i]) + ", log likelihood " + r1(f.ll[i]);
      document.getElementById("stFitSub").textContent = "BIC " + r1(f.bic[i]) + ", N = " + f.n + (f.lr[i] ? ". Against the previous model: " + f.lr[i] + "." : ".");
      document.getElementById("stNote").textContent = "Filled dots are significant at 5%, rings at 10%, grey is not significant. Occupation is compared with students, the omitted group." + (omitted ? " Unemployed men (only 3 respondents) are left out because the estimate is not stable." : "");
      var gb = document.querySelectorAll("#stSample button"); for (var a = 0; a < gb.length; a++) gb[a].setAttribute("aria-pressed", gb[a].getAttribute("data-g") === st.g ? "true" : "false");
      var mb = document.querySelectorAll("#stModel button"); for (var b = 0; b < mb.length; b++) mb[b].setAttribute("aria-pressed", Number(mb[b].getAttribute("data-m")) === st.m ? "true" : "false");
    }
    var gbs = document.querySelectorAll("#stSample button");
    for (var i = 0; i < gbs.length; i++) gbs[i].addEventListener("click", function(){ st.g = this.getAttribute("data-g"); st.m = ST.fit[st.g].chosen; draw(); });
    var mbs = document.querySelectorAll("#stModel button");
    for (var j = 0; j < mbs.length; j++) mbs[j].addEventListener("click", function(){ st.m = Number(this.getAttribute("data-m")); draw(); });
    draw();
  })();

  /* ---------- live QA tool ---------- */
  var QA_B64 = "";
  var QA_SAMPLE = "[\n  {\n    \"title\": \"Neighborhood Youth Literacy Grant\",\n    \"funder\": \"Riverbend Community Foundation\",\n    \"status\": \"open\",\n    \"currency\": \"usd\",\n    \"fundingAmountLow\": 5000,\n    \"fundingAmountHigh\": 25000,\n    \"fundingPeriod\": \"1-year\",\n    \"currentStage\": \"application\",\n    \"cycleName\": \"Spring 2027\",\n    \"cycleIdentifierId\": \"spring-2027\",\n    \"for\": [\n      \"Nonprofits\"\n    ],\n    \"beneficiaries\": \"Children and youth\",\n    \"keywords\": [\n      \"literacy\",\n      \"education\",\n      \"after-school\"\n    ],\n    \"areaOfInterest\": [\n      \"B\"\n    ],\n    \"areasOfFocus\": [\n      \"Early literacy\"\n    ],\n    \"fundingVehicles\": [\n      \"Grant\"\n    ],\n    \"countries\": [\n      \"United States\"\n    ],\n    \"states\": [\n      \"Michigan\"\n    ],\n    \"mainOpportunityLink\": \"https://example.org/grants/youth-literacy\",\n    \"applicationLink\": \"https://example.org/apply\",\n    \"summary\": \"Supports local nonprofits that help children build reading skills through tutoring, family literacy nights, and after-school programs in the Riverbend service area.\",\n    \"eligibility\": \"Registered 501(c)(3) organizations serving Riverbend County.\",\n    \"howToApply\": \"Submit the online application before the spring deadline.\",\n    \"isMultiAreaOpportunity\": false,\n    \"isInviteOnly\": false,\n    \"smallBusinessSetAside\": false,\n    \"isRollingOpportunity\": false,\n    \"isContactFunderOpportunity\": false,\n    \"contactInformation\": {\n      \"name\": \"Jordan Ellis\",\n      \"designation\": \"Program Officer\",\n      \"telephone\": \"\",\n      \"email\": \"grants@example.org\",\n      \"mailingAddress\": \"\"\n    },\n    \"fundingMechanism\": [\n      {\n        \"parentFundingMechanism\": \"Project and Program Support\",\n        \"subFundingMechanism\": [\n          \"Project / Program Grant\"\n        ]\n      }\n    ],\n    \"dueDate\": {\n      \"openingDate\": {\n        \"date\": \"2027-01-15\",\n        \"isDayExplicit\": true,\n        \"isYearExplicit\": true\n      },\n      \"applicationDeadline\": {\n        \"date\": \"2027-03-31\",\n        \"isDayExplicit\": true,\n        \"isYearExplicit\": true\n      }\n    },\n    \"stages\": [\n      {\n        \"name\": \"Application\",\n        \"dateCategory\": \"applicationDeadline\",\n        \"isStageApplicable\": true,\n        \"isTemplateExplicit\": false,\n        \"template\": \"\",\n        \"solicitationLinks\": [],\n        \"additionalLinks\": []\n      }\n    ]\n  },\n  {\n    \"title\": \"Community Garden Mini-Grants\",\n    \"funder\": \"Lakeshore Giving Circle\",\n    \"status\": \"opened\",\n    \"currency\": \"usd\",\n    \"fundingAmountLow\": 500,\n    \"fundingAmountHigh\": \"2k\",\n    \"currentStage\": \"pending\",\n    \"for\": \"Nonprofits\",\n    \"mainOpportunityLink\": \"example.org/gardens\",\n    \"eligibility\": \"\",\n    \"isInviteOnly\": \"yes\",\n    \"isMultiAreaOpportunity\": false,\n    \"smallBusinessSetAside\": false,\n    \"isRollingOpportunity\": true,\n    \"isContactFunderOpportunity\": false\n  },\n  {\n    \"title\": \"Arts Access Fund\",\n    \"funder\": \"Harbor Arts Alliance\",\n    \"status\": \"forecasted\",\n    \"currency\": \"usd\",\n    \"summary\": \"Funds arts programs that reduce cost barriers for first-time visitors.\",\n    \"eligibility\": \"Nonprofits and fiscally sponsored projects.\",\n    \"isMultiAreaOpportunity\": false,\n    \"isInviteOnly\": false,\n    \"smallBusinessSetAside\": false,\n    \"isRollingOpportunity\": false,\n    \"isContactFunderOpportunity\": true,\n    \"dueDate\": {\n      \"openingDate\": {\n        \"date\": \"2027-06-01\",\n        \"isDayExplicit\": true,\n        \"isYearExplicit\": true\n      },\n      \"applicationDeadline\": {\n        \"date\": \"2027-04-15\",\n        \"isDayExplicit\": true,\n        \"isYearExplicit\": true\n      }\n    },\n    \"fundingAmountLow\": 40000,\n    \"fundingAmountHigh\": 10000\n  }\n]";
  function qaHtml(){
    var bin = atob(QA_B64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }
  var host = $("qaHost"), stageHTML = host.innerHTML;
  function launchQA(){
    var frame = document.createElement("iframe");
    frame.className = "qa-frame";
    frame.title = "Opportunity QA tool running on three invented sample records";
    frame.addEventListener("load", function(){
      try {
        var doc = frame.contentDocument;
        doc.getElementById("input").value = QA_SAMPLE;
        doc.getElementById("loadBtn").click();
        $("sampleBox").hidden = true;
      } catch (e) {
        $("samplePre").textContent = QA_SAMPLE;
        $("sampleBox").hidden = false;
      }
    });
    frame.src = "tools/opportunity-qa.html";
    host.innerHTML = "";
    host.appendChild(frame);
    $("qaReload").hidden = false;
  }
  $("qaLaunch").addEventListener("click", launchQA);
  $("qaReload").addEventListener("click", launchQA);

  /* open the section named in the address, else the home tab */
  var startId = location.hash.slice(1);
  go(ROUTES[startId] ? startId : "home", {noHash: true, scroll: false});
})();
