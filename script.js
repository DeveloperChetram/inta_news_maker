const state = {
  logoUrl: "logo.webp",
  showLogo: true,
  logoScale: 0.14,
  logoX: 50,
  logoY: 0,
  showTag: false,
  tagText: "Breaking News",
  tagBg: "#D22A1B",
  tagFg: "#ffffff",
  tagBorderRadius: 18,
  tagPadding: 14,
  headline: "From 2030 onwards, great company will be a permanent remote organization.",
  fontSize: 86,
  lineHeight: 1.16,
  fontFamily: "Poppins",
  fontWeight: 500,
  fontStyle: "normal",
  textY: 70,
  headlineColor: "#ffffff",
  align: "center",
  uppercase: false,
  bgImage: null,
  overlay: 52,
  padding: 64,
  showDecor: true,
  outW: 1080,
  outH: 1080,
  quality: 0.96
};

const el = {
  canvas: document.getElementById("canvas"),
  bgFile: document.getElementById("bgFile"),
  tagText: document.getElementById("tagText"),
  tagBg: document.getElementById("tagBg"),
  tagFg: document.getElementById("tagFg"),
  headline: document.getElementById("headline"),
  fontSize: document.getElementById("fontSize"),
  lineHeight: document.getElementById("lineHeight"),
  fontFamily: document.getElementById("fontFamily"),
  fontWeight: document.getElementById("fontWeight"),
  fontStyle: document.getElementById("fontStyle"),
  textY: document.getElementById("textY"),
  headlineColor: document.getElementById("headlineColor"),
  align: document.getElementById("align"),
  uppercase: document.getElementById("uppercase"),
  overlay: document.getElementById("overlay"),
  padding: document.getElementById("padding"),
  showDecor: document.getElementById("showDecor"),
  size: document.getElementById("size"),
  quality: document.getElementById("quality"),
  download: document.getElementById("download"),
  clearBg: document.getElementById("clearBg"),
  reset: document.getElementById("reset"),
  showLogo: document.getElementById("showLogo"),
  logoScale: document.getElementById("logoScale"),
  logoX: document.getElementById("logoX"),
  logoY: document.getElementById("logoY"),
  logoLeft: document.getElementById("logoLeft"),
  logoRight: document.getElementById("logoRight"),
  logoUp: document.getElementById("logoUp"),
  logoDown: document.getElementById("logoDown"),
  showTag: document.getElementById("showTag"),
  tagBorderRadius: document.getElementById("tagBorderRadius"),
  tagPadding: document.getElementById("tagPadding"),
  textUp: document.getElementById("textUp"),
  textDown: document.getElementById("textDown"),
};

const logoImg = new Image();
logoImg.crossOrigin = "anonymous";
logoImg.src = state.logoUrl;

// Add error handling for logo loading
logoImg.onload = function() {
  console.log("Logo loaded successfully");
  resizePreviewCanvas();
};

logoImg.onerror = function() {
  console.warn("Logo failed to load, using fallback");
  // Create a simple fallback logo
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ff3040';
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('LOGO', 50, 55);
  logoImg.src = canvas.toDataURL();
};

function parseSize(str){
  const [w,h] = str.split("x").map(n=>parseInt(n,10));
  return {w,h};
}

function roundedRect(ctx, x, y, w, h, r){
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y, x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x, y+h, rr);
  ctx.arcTo(x, y+h, x, y, rr);
  ctx.arcTo(x, y, x+w, y, rr);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth, font, lineHeightPx){
  ctx.font = font;
  const words = (text || "").split(/\s+/);
  const lines = [];
  let line = "";
  for (let i=0;i<words.length;i++){
    const test = line ? line + " " + words[i] : words[i];
    if(ctx.measureText(test).width > maxWidth && line){
      lines.push(line);
      line = words[i];
    } else {
      line = test;
    }
  }
  if(line) lines.push(line);
  const fixed = [];
  for(const l of lines){
    if(ctx.measureText(l).width <= maxWidth){ fixed.push(l); continue; }
    let acc = "";
    for(const ch of l){
      const t = acc + ch;
      if(ctx.measureText(t).width > maxWidth && acc){
        fixed.push(acc); acc = ch;
      } else acc = t;
    }
    if(acc) fixed.push(acc);
  }
  return { lines: fixed, height: fixed.length * lineHeightPx };
}



function drawPlaceholderBG(ctx, w, h){
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0, "#0e1338");
  g.addColorStop(1, "#101322");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);
  const density = Math.floor(w*h/8000);
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#fff";
  for(let i=0;i<density;i++){
    ctx.fillRect(Math.random()*w, Math.random()*h, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function renderTo(canvas){
  const ctx = canvas.getContext("2d");
  
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const W = state.outW, H = state.outH;
  
  // Debug: Log canvas dimensions
  console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}, Output: ${W}x${H}`);
  
  const scaleX = canvas.width / W;
  const scaleY = canvas.height / H;
  const scale = Math.min(scaleX, scaleY);
  
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Background
  if(state.bgImage?.complete){
    console.log("Drawing background image");
    // FIX: Replaced the background drawing logic with a more robust 'cover' implementation.
    // This ensures the image always fills the entire canvas area without gaps.
    const img = state.bgImage;
    const canvasAspect = W / H;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

    if (imgAspect > canvasAspect) { // Image is wider than canvas aspect
      sw = img.naturalHeight * canvasAspect;
      sx = (img.naturalWidth - sw) / 2;
    } else if (imgAspect < canvasAspect) { // Image is taller than canvas aspect
      sh = img.naturalWidth / canvasAspect;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  } else {
    console.log("Drawing placeholder background");
    drawPlaceholderBG(ctx, W, H);
  }

  const ol = Math.max(0, Math.min(90, +state.overlay))/100;
  if(ol > 0){
    const g = ctx.createLinearGradient(0, H, 0, 0);
    g.addColorStop(0, `rgba(0,0,0,${0.68 + ol*0.32})`);
    g.addColorStop(0.55, `rgba(0,0,0,${0.25 * ol})`);
    g.addColorStop(1, `rgba(0,0,0,${0.16 * ol})`);
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
  }

  const P = +state.padding;
  let yCursor = P;

  let logoH = 0;
  if(state.showLogo && logoImg?.complete){
    console.log("Drawing logo");
    const ratio = (logoImg.naturalWidth || 1) / (logoImg.naturalHeight || 1);
    const lw = Math.max(64, Math.min(W * state.logoScale, W * 0.34));
    const lh = lw / ratio;
    
    // Calculate logo position based on percentage values
    // When logoX/Y are 0, logo should be at the default position (top-left)
    // When logoX/Y are 100, logo should be at the bottom-right
    const availableWidth = W - P * 2 - lw;
    const availableHeight = H - P * 2 - lh;
    const logoX = P + availableWidth * (state.logoX / 100);
    const logoY = P + availableHeight * (state.logoY / 100);
    
    console.log(`Logo position: ${logoX}, ${logoY}, size: ${lw}x${lh}`);
    
    ctx.save();
    ctx.globalAlpha = 0.12;
    roundedRect(ctx, logoX-8, logoY-8, lw+16, lh+16, 12);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();
    ctx.drawImage(logoImg, logoX, logoY, lw, lh);
    logoH = lh;
    // Only advance yCursor if logo is positioned at the top (logoY close to P)
    if(state.logoY < 20) {
      yCursor += lh + 18;
    }
  } else {
    console.log(`Logo not shown: showLogo=${state.showLogo}, complete=${logoImg?.complete}`);
  }

  // Draw news tag only if showTag is true
  let tagH = 0;
  if(state.showTag) {
    const tagFontSize = Math.max(18, Math.min(42, Math.round(W * 0.035)));
    const tagFont = `700 ${tagFontSize}px Poppins, Inter, sans-serif`;
    ctx.font = tagFont;
    ctx.textBaseline = "middle";
    
    // Use custom padding from slider
    const padX = Math.max(8, +state.tagPadding);
    const padY = Math.max(6, Math.round(padX * 0.6));
    
    const tagTextW = ctx.measureText(state.tagText).width;
    const tagW = tagTextW + padX*2;
    tagH = padY*2 + tagFontSize*0.82;
    
    // Use custom border radius from slider
    const borderRadius = Math.min(+state.tagBorderRadius, tagH/2);
    roundedRect(ctx, P, yCursor, tagW, tagH, borderRadius);
    ctx.fillStyle = state.tagBg;
    ctx.fill();
    ctx.fillStyle = state.tagFg;
    ctx.fillText(state.tagText, P + padX, yCursor + tagH/2);
  }

    // Calculate content area more robustly
  const contentStartY = Math.max(yCursor + tagH + 22, P + 100); // Ensure minimum space from top
  const maxTextW = W - P*2;
  const catsTop = H - P; // No categories, so content can go to bottom

  let text = state.uppercase ? state.headline.toUpperCase() : state.headline;
  let fs = +state.fontSize;
  let lh = +state.lineHeight;
  let ff = state.fontFamily;
  let fw = +state.fontWeight;
  let fst = state.fontStyle;
  let font = `${fst} ${fw} ${fs}px "${ff}", sans-serif`;
  ctx.font = font;

  const lineHeightPx = fs * lh;
  let wrapped = wrapText(ctx, text, maxTextW, font, lineHeightPx);
  let needed = wrapped.lines.length * lineHeightPx;

  // Auto-scale text if it's too large for the available space
  const totalAvailableHeight = H - P * 2;
  if(needed > totalAvailableHeight * 0.8){
    const scaleDown = Math.max(0.55, Math.min(1, (totalAvailableHeight * 0.8) / needed));
    fs = Math.max(28, Math.floor(fs * scaleDown));
    font = `${fst} ${fw} ${fs}px "${ff}", sans-serif`;
    const lhAdj = Math.max(1.06, Math.min(1.6, lh * (1/scaleDown) * 0.94));
    lh = lhAdj;
    const lineH2 = fs * lh;
    wrapped = wrapText(ctx, text, maxTextW, font, lineH2);
    needed = wrapped.lines.length * lineH2;
  }

  ctx.font = font;
  ctx.fillStyle = state.headlineColor;
  ctx.textAlign = state.align === "center" ? "center" : "left";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = Math.max(6, Math.round(W*0.005));

  const x = state.align === "center" ? W/2 : P;
  const actualLineH = fs * lh;
  
  // Calculate text position based on textY percentage with more bottom range
  const availableHeight = H - P * 2;
  const textYOffset = availableHeight * (state.textY / 100);
  let yStart = P + textYOffset + fs*0.05;
  
  // Allow text to go all the way to the bottom edge
  // No boundary protection - text can be positioned at the very bottom

   for(let i=0;i<wrapped.lines.length;i++){
    ctx.fillText(wrapped.lines[i], x, yStart + i*actualLineH);
  }
 ctx.shadowBlur = 0;

  if(state.showDecor){
    const gridW = Math.min(100, Math.round(W * 0.09));
    const gridH = Math.min(80, Math.round(H * 0.10));
    const cols = 4, rows = 4;
    const dotW = Math.floor(gridW / (cols*2));
    const dotH = Math.floor(gridH / (rows*2));
    const gapX = dotW;
    const gapY = dotH;
    const startX = W - P - (cols*dotW + (cols-1)*gapX);
    const midY = yStart + needed/2 - gridH/2;
    const startY = Math.max(P, Math.min(H - P - gridH, midY));
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#ffffff";
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const rx = startX + c*(dotW + gapX);
        const ry = startY + r*(dotH + gapY);
        roundedRect(ctx, rx, ry, dotW, dotH, 4);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
}

function resizePreviewCanvas(){
  const c = el.canvas;
  const bounds = c.parentElement.getBoundingClientRect();
  const cssW = Math.max(280, Math.floor(bounds.width - 20)); // account for padding
  const ratio = state.outH / state.outW;
  const cssH = Math.floor(cssW * ratio);

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  
  c.style.width = cssW + "px";
  c.style.height = cssH + "px";
  
  c.width = cssW * dpr;
  c.height = cssH * dpr;

  renderTo(c);
}



function bind(){
  el.bgFile.addEventListener("change", e=>{
    const file = e.target.files?.[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = ()=>{
      state.bgImage = img;
      URL.revokeObjectURL(url);
      resizePreviewCanvas();
    };
    img.onerror = ()=> URL.revokeObjectURL(url);
    img.src = url;
  });

  document.addEventListener("dragover", e=> e.preventDefault());
  document.addEventListener("drop", e=>{
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if(file && file.type.startsWith("image/")){
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = ()=>{
        state.bgImage = img;
        URL.revokeObjectURL(url);
        resizePreviewCanvas();
      };
      img.src = url;
    }
  });

  el.showTag.addEventListener("change", e=>{ state.showTag = e.target.checked; resizePreviewCanvas(); });
  el.tagText.addEventListener("input", e=>{ state.tagText = e.target.value; resizePreviewCanvas(); });
  el.tagBg.addEventListener("input", e=>{ state.tagBg = e.target.value; resizePreviewCanvas(); });
  el.tagFg.addEventListener("input", e=>{ state.tagFg = e.target.value; resizePreviewCanvas(); });
  el.tagBorderRadius.addEventListener("input", e=>{ state.tagBorderRadius = +e.target.value; resizePreviewCanvas(); });
  el.tagPadding.addEventListener("input", e=>{ state.tagPadding = +e.target.value; resizePreviewCanvas(); });

  el.headline.addEventListener("input", e=>{ state.headline = e.target.value; resizePreviewCanvas(); });
  el.fontSize.addEventListener("input", e=>{ state.fontSize = +e.target.value; resizePreviewCanvas(); });
  el.lineHeight.addEventListener("input", e=>{ state.lineHeight = +e.target.value; resizePreviewCanvas(); });
  el.fontFamily.addEventListener("change", e=>{ state.fontFamily = e.target.value; resizePreviewCanvas(); });
  el.fontWeight.addEventListener("change", e=>{ state.fontWeight = +e.target.value; resizePreviewCanvas(); });
  el.fontStyle.addEventListener("change", e=>{ state.fontStyle = e.target.value; resizePreviewCanvas(); });
  el.textY.addEventListener("input", e=>{ state.textY = +e.target.value; resizePreviewCanvas(); });
  el.headlineColor.addEventListener("input", e=>{ state.headlineColor = e.target.value; resizePreviewCanvas(); });
  el.align.addEventListener("change", e=>{ state.align = e.target.value; resizePreviewCanvas(); });
  el.uppercase.addEventListener("change", e=>{ state.uppercase = e.target.checked; resizePreviewCanvas(); });



  el.overlay.addEventListener("input", e=>{ state.overlay = +e.target.value; resizePreviewCanvas(); });
  el.padding.addEventListener("input", e=>{ state.padding = +e.target.value; resizePreviewCanvas(); });
  el.showDecor.addEventListener("change", e=>{ state.showDecor = e.target.checked; resizePreviewCanvas(); });
  el.showLogo.addEventListener("change", e=>{ state.showLogo = e.target.checked; resizePreviewCanvas(); });
  el.logoScale.addEventListener("input", e=>{ state.logoScale = +e.target.value; resizePreviewCanvas(); });
  el.logoX.addEventListener("input", e=>{ state.logoX = +e.target.value; resizePreviewCanvas(); });
  el.logoY.addEventListener("input", e=>{ state.logoY = +e.target.value; resizePreviewCanvas(); });

  // Logo movement buttons
  el.logoLeft.addEventListener("click", e=>{ 
    e.preventDefault(); 
    state.logoX = Math.max(0, state.logoX - 5); 
    el.logoX.value = state.logoX; 
    resizePreviewCanvas(); 
  });
  el.logoRight.addEventListener("click", e=>{ 
    e.preventDefault(); 
    state.logoX = Math.min(100, state.logoX + 5); 
    el.logoX.value = state.logoX; 
    resizePreviewCanvas(); 
  });
  el.logoUp.addEventListener("click", e=>{ 
    e.preventDefault(); 
    state.logoY = Math.max(0, state.logoY - 5); 
    el.logoY.value = state.logoY; 
    resizePreviewCanvas(); 
  });
  el.logoDown.addEventListener("click", e=>{ 
    e.preventDefault(); 
    state.logoY = Math.min(100, state.logoY + 5); 
    el.logoY.value = state.logoY; 
    resizePreviewCanvas(); 
  });

  // Text movement buttons
  el.textUp.addEventListener("click", e=>{ 
    e.preventDefault(); 
    state.textY = Math.max(0, state.textY - 5); 
    el.textY.value = state.textY; 
    resizePreviewCanvas(); 
  });
  el.textDown.addEventListener("click", e=>{ 
    e.preventDefault(); 
    state.textY = Math.min(100, state.textY + 5); 
    el.textY.value = state.textY; 
    resizePreviewCanvas(); 
  });

  el.size.addEventListener("change", e=>{
    const {w,h} = parseSize(e.target.value);
    state.outW = w; state.outH = h;
    resizePreviewCanvas();
  });
  el.quality.addEventListener("input", e=>{ state.quality = +e.target.value; });

  el.download.addEventListener("click", downloadJPG);
  el.clearBg.addEventListener("click", ()=>{
    state.bgImage = null;
    el.bgFile.value = "";
    resizePreviewCanvas();
  });
  el.reset.addEventListener("click", ()=>{
    state.showLogo = true; el.showLogo.checked = true; state.logoScale = 0.14; el.logoScale.value = "0.14";
    state.logoX = 50; el.logoX.value = "50"; state.logoY = 0; el.logoY.value = "0";
    state.showTag = false; el.showTag.checked = false;
    state.tagText = "Breaking News"; el.tagText.value = state.tagText; state.tagBg = "#D22A1B"; el.tagBg.value = "#D22A1B"; state.tagFg = "#ffffff"; el.tagFg.value = "#ffffff";
    state.tagBorderRadius = 18; el.tagBorderRadius.value = "18"; state.tagPadding = 14; el.tagPadding.value = "14";
    state.headline = "From 2030 onwards, great company will be a permanent remote organization."; el.headline.value = state.headline;
    state.fontSize = 86; el.fontSize.value = "86"; state.lineHeight = 1.16; el.lineHeight.value = "1.16";
    state.fontFamily = "Poppins"; el.fontFamily.value = "Poppins"; state.fontWeight = 500; el.fontWeight.value = "500"; state.fontStyle = "normal"; el.fontStyle.value = "normal";
    state.textY = 70; el.textY.value = "70";
    state.headlineColor = "#ffffff"; el.headlineColor.value = "#ffffff"; state.align = "center"; el.align.value = "center"; state.uppercase = false; el.uppercase.checked = false;

    state.overlay = 52; el.overlay.value = "52"; state.padding = 64; el.padding.value = "64"; state.showDecor = true; el.showDecor.checked = true;
    state.outW = 1080; state.outH = 1080; el.size.value = "1080x1080"; state.quality = 0.96; el.quality.value = "0.96";
    state.bgImage = null; el.bgFile.value = "";
    resizePreviewCanvas();
  });

  window.addEventListener("resize", resizePreviewCanvas);
  window.addEventListener("orientationchange", ()=> setTimeout(resizePreviewCanvas, 200));
}

function downloadJPG(){
  const off = document.createElement("canvas");
  off.width = state.outW;
  off.height = state.outH;
  renderTo(off);
  try{
    const url = off.toDataURL("image/jpeg", state.quality);
    const a = document.createElement("a");
    a.href = url;
    a.download = "news-image.jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }catch(err){
    alert("Export failed (likely due to image CORS). Try another image or a CORS-enabled host.");
    console.error(err);
  }
}

bind();
logoImg.addEventListener("load", resizePreviewCanvas);
logoImg.addEventListener("error", ()=> console.warn("Logo failed to load; export will proceed without it."));
resizePreviewCanvas();
