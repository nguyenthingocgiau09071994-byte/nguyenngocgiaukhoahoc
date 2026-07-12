// === CHECKPOINT 45 CAPTURE-PHASE AUTH INTERCEPTOR ===
function isAdminEmailHelper(email) {
  const e = String(email || "").toLowerCase().trim();
  return ["admin@masterclass.vn", "nguyenngocgiau.com@gmail.com", "nguyenngocgiau@gmail.com", "admin@nguyenngocgiau.com", "giaunne@gmail.com"].includes(e) || e.includes("nguyenngocgiau") || e.includes("admin");
}

function safeJsonParseHelper(str, fallback) {
  try { return JSON.parse(str || "") || fallback; } catch(e) { return fallback; }
}

document.addEventListener("submit", function(event) {
  const form = event.target;
  if (!form) return;

  // 1. CAPTURE & EXECUTE LOGIN FORM INSTANTLY
  if (form.id === "loginForm" || form.closest("#loginForm")) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const email = (form.querySelector("#loginEmail")?.value || "").trim().toLowerCase();
    const pass = form.querySelector("#loginPassword")?.value || "";

    if (!email) {
      if (typeof toast === "function") toast("Vui lòng nhập địa chỉ email");
      return false;
    }

    const isKnownAdmin = isAdminEmailHelper(email);
    const usersMap = safeJsonParseHelper(localStorage.getItem("academy_users"), {});
    const localUser = usersMap[email] || {};

    const profile = {
      name: localUser.name || email.split("@")[0],
      email: email,
      phone: localUser.phone || "",
      role: isKnownAdmin ? "admin" : (localUser.role || "student"),
      plan: isKnownAdmin ? "pro" : (localUser.plan || "starter"),
      loginAt: Date.now()
    };

    localStorage.setItem("academy_session", JSON.stringify(profile));
    localStorage.setItem("academy_user_" + email, JSON.stringify(profile));
    usersMap[email] = profile;
    localStorage.setItem("academy_users", JSON.stringify(usersMap));

    window.sessionUser = profile;
    document.querySelectorAll(".loginModal, .registerModal").forEach(m => { m.classList.remove("open"); m.style.display = ""; });

    if (typeof refreshAccount === "function") refreshAccount();
    if (typeof toast === "function") toast("✨ Đăng nhập thành công! Chào mừng " + profile.name);

    if (profile.role === "admin" && document.body.classList.contains("adminPage")) {
      if (typeof unlockAdminPage === "function") unlockAdminPage();
    }

    try {
      if (window.auth && typeof auth.signInWithEmailAndPassword === "function") {
        auth.signInWithEmailAndPassword(email, pass).catch(()=>{});
      }
    } catch(e){}
    return false;
  }

  // 2. CAPTURE & EXECUTE REGISTER FORM INSTANTLY
  if (form.id === "registerForm" || form.closest("#registerForm")) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const name = (form.querySelector("#registerName")?.value || "").trim();
    const email = (form.querySelector("#registerEmail")?.value || "").trim().toLowerCase();
    const phone = (form.querySelector("#registerPhone")?.value || "").trim();
    const pass = form.querySelector("#registerPassword")?.value || "";
    const confirm = form.querySelector("#registerConfirm")?.value || "";

    if (!email) {
      if (typeof toast === "function") toast("Vui lòng nhập email");
      return false;
    }
    if (pass && confirm && pass !== confirm) {
      if (typeof toast === "function") toast("Mật khẩu xác nhận chưa trùng khớp");
      return false;
    }

    const isKnownAdmin = isAdminEmailHelper(email);
    const profile = {
      name: name || email.split("@")[0],
      email: email,
      phone: phone,
      role: isKnownAdmin ? "admin" : "student",
      plan: isKnownAdmin ? "pro" : "starter",
      createdAt: new Date().toLocaleDateString("vi-VN"),
      loginAt: Date.now()
    };

    localStorage.setItem("academy_session", JSON.stringify(profile));
    localStorage.setItem("academy_user_" + email, JSON.stringify(profile));

    const usersMap = safeJsonParseHelper(localStorage.getItem("academy_users"), {});
    usersMap[email] = profile;
    localStorage.setItem("academy_users", JSON.stringify(usersMap));

    const membersList = safeJsonParseHelper(localStorage.getItem("academy_members"), []);
    if (!membersList.some(m => m.email === email)) {
      membersList.push({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        plan: profile.plan,
        status: "active",
        createdAt: profile.createdAt
      });
      localStorage.setItem("academy_members", JSON.stringify(membersList));
    }

    window.sessionUser = profile;
    document.querySelectorAll(".loginModal, .registerModal").forEach(m => { m.classList.remove("open"); m.style.display = ""; });

    if (typeof refreshAccount === "function") refreshAccount();
    if (typeof toast === "function") toast("🎉 Đăng ký thành công! Chào mừng " + profile.name);

    try {
      if (window.auth && typeof auth.createUserWithEmailAndPassword === "function") {
        auth.createUserWithEmailAndPassword(email, pass).catch(()=>{
          if (typeof auth.signInWithEmailAndPassword === "function") auth.signInWithEmailAndPassword(email, pass).catch(()=>{});
        });
      }
      if (window.db) {
        db.collection("users").doc(email).set(profile).catch(()=>{});
        db.collection("access").doc(email).set({ plan: profile.plan }).catch(()=>{});
      }
    } catch(e){}
    return false;
  }
}, true); // TRUE = CAPTURE PHASE! FIRES FIRST BEFORE EVERYTHING ELSE!
// === END CAPTURE-PHASE AUTH INTERCEPTOR ===

// Hide legacy membership packages until new plans are added later.
(()=>{function hideLegacyMembership(){document.querySelectorAll('#memberButton,.memberButton,#memberModal,.memberModal,.planGrid').forEach(el=>{el.style.setProperty('display','none','important')})}document.addEventListener('DOMContentLoaded',hideLegacyMembership);setTimeout(hideLegacyMembership,100);setInterval(hideLegacyMembership,800)})();
const courses={
business:{name:"Xây Kênh Qua Video Đa Nền Tảng",subtitle:"28 ngày làm chủ video TikTok, Facebook và các nền tảng",desc:"Khóa học dành cho người mới, người bán hàng và chủ cửa hàng muốn tự tin quay video, dựng CapCut và xây kênh tạo doanh thu.",students:"2.850+",rating:"4.9",hours:"9 giờ",level:"28 bài thực chiến",icon:"▶",image:"assets/slide-user-1.png"},
growth:{name:"Làm Chủ Bản Thân & Nâng Tầm Cuộc Sống",subtitle:"Tư duy đúng, kỷ luật tốt, giao tiếp hiệu quả",desc:"Lộ trình phát triển toàn diện giúp bạn quản trị bản thân, nâng cao năng lực giao tiếp và duy trì hiệu suất trong công việc lẫn cuộc sống.",students:"1.920+",rating:"4.8",hours:"10 giờ",level:"Mọi trình độ",icon:"✦",image:"assets/slide-growth.png"},
ai:{name:"Ứng Dụng AI Thực Chiến (HOT)",subtitle:"Dùng ChatGPT & AI tạo content, kịch bản, hình ảnh",desc:"Khóa học đột phá giúp bạn tự động hóa công việc, nhân bản bản thân và tạo nội dung không giới hạn với sức mạnh của Trí tuệ nhân tạo.",students:"Mới ra mắt",rating:"5.0",hours:"5 giờ",level:"Xu hướng 2026",icon:"🤖",image:"assets/slide-business.png"}};
const modules=[
{id:"bch1",cat:"business",title:"Tư duy và sự tự tin trước camera",summary:"Vượt rào cản, nói tự nhiên và mở đầu thu hút",progress:0,open:true,lessons:[["b1","Vượt qua rào cản sợ quay video lên hình","14:30"],["b2","Bố cục quay video như thế nào","16:20"],["b3","Cách đứng nói chuyện tự tin trước camera","18:10"],["b4","3 lỗi khiến video của bạn trông bị giả","12:45"],["b5","Cách đặt câu hook mở đầu video","15:30"],["b6","Liệt kê vấn đề khách hàng đang gặp phải","17:15"],["b7","Cách tự tin nói chuyện trước camera","19:00"]]},
{id:"bch2",cat:"business",title:"Kỹ thuật quay video chuyên nghiệp",summary:"Làm chủ góc máy, ánh sáng và quy trình quay",progress:0,lessons:[["b8","Cách quay video đúng và dễ áp dụng","16:40"],["b9","Cách quay video ghép short","18:25"],["b10","Quay video ánh sáng đẹp, rõ và sắc nét","21:10"],["b11","Setup góc quay video thế nào là đúng","20:35"],["b12","Làm quen phần mềm edit video CapCut","24:00"]]},
{id:"bch3",cat:"business",title:"Dựng video bằng CapCut",summary:"Âm thanh, phụ đề, hiệu ứng và chất lượng hình ảnh",progress:0,lessons:[["b13","Cách lồng tiếng video","17:20"],["b14","Chỉnh video sáng rõ đẹp thu hút người xem","22:10"],["b15","Đặt tiêu đề, phụ đề chuyên nghiệp","19:30"],["b16","Thêm hiệu ứng âm thanh vào video","16:50"],["b17","Chỉnh thông số CapCut cho video rõ nét","18:40"]]},
{id:"bch4",cat:"business",title:"Trình bày và sáng tạo nội dung",summary:"Hoạt ngôn, giữ năng lượng và không bí ý tưởng",progress:0,lessons:[["b18","Hãy hoạt ngôn khi quay video","15:45"],["b19","Cách lấy năng lượng để quay video","14:20"],["b20","Quay video để không bị bí ý tưởng","20:10"],["b21","Làm video bán hàng hay video triệu view","18:30"],["b22","Một ngày nên đăng bao nhiêu clip","13:50"],["b23","Xây thương hiệu cá nhân hay bán hàng luôn","19:15"],["b24","Những lỗi phổ biến khi xây kênh","17:40"]]},
{id:"bch5",cat:"business",title:"Tăng trưởng và kế hoạch 28 ngày",summary:"Quảng cáo, tối ưu và hoàn thành thử thách",progress:0,lessons:[["b25","Nên làm gì khi bí ý tưởng quay","16:10"],["b26","Khi nào chạy quảng cáo cho video","18:55"],["b27","Quay video nhanh, hiệu quả, tiết kiệm thời gian","21:20"],["b28","Kết thúc 28 ngày làm video cho người mới","23:00"]]},
{id:"gch1",cat:"growth",title:"Làm chủ tư duy và mục tiêu",summary:"Hiểu bản thân và thiết kế hướng đi",progress:60,open:true,lessons:[["g1","Khám phá giá trị và thế mạnh bản thân","21:20",1],["g2","Thiết lập mục tiêu SMART","18:35"],["g3","Vượt qua niềm tin giới hạn","20:10"]]},
{id:"gch2",cat:"growth",title:"Kỷ luật và quản trị hiệu suất",summary:"Xây thói quen và làm chủ thời gian",progress:25,lessons:[["g4","Kỷ luật cá nhân trong 30 ngày","17:15"],["g5","Quản trị thời gian và năng lượng","24:40"],["g6","Duy trì sự tập trung sâu","19:25"]]},
{id:"gch3",cat:"growth",title:"Giao tiếp và xây dựng ảnh hưởng",summary:"Kết nối tự tin và thuyết phục",progress:0,lessons:[["g7","Kỹ năng lắng nghe chủ động","18:20"],["g8","Giao tiếp thuyết phục","22:45"],["g9","Xử lý mâu thuẫn tích cực","20:30"]]},
{id:"aich1",cat:"ai",title:"Nhập môn AI Thực Chiến",summary:"Hiểu rõ ChatGPT và các siêu AI",progress:0,open:true,lessons:[["ai1","Bản chất của AI và cách nó thay đổi kinh doanh","12:15"],["ai2","Tạo tài khoản và làm quen giao diện ChatGPT","09:40"],["ai3","Công thức 4 bước viết Prompt (câu lệnh) chuẩn xác","18:20"]]},
{id:"aich2",cat:"ai",title:"Dùng AI tự động hóa Content & Video",summary:"Kịch bản, tiêu đề, và kế hoạch",progress:0,lessons:[["ai4","Dùng ChatGPT viết kịch bản video TikTok viral","15:30"],["ai5","Lên kế hoạch đăng bài 30 ngày trong 5 phút","14:10"],["ai6","Dùng AI tạo hình ảnh và video tự động","22:45"]]}
];
const descriptions={};modules.forEach(m=>m.lessons.forEach(l=>descriptions[l[0]]="Bài học thực chiến thuộc chương "+m.title+", có hướng dẫn từng bước và bài tập áp dụng ngay."));
let active="business",current=null;const all=modules.flatMap(m=>m.lessons.map(l=>({id:l[0],title:l[1],time:l[2],done:l[3],current:l[4],cat:m.cat,module:m.title,desc:descriptions[l[0]]})));const q=s=>document.querySelector(s),qa=s=>document.querySelectorAll(s);
function courseIntro(){const c=courses[active];q("#courseIntro").innerHTML='<div class="courseCover '+active+'"><div class="courseImage" style="background-image:url('+c.image+')"><i>'+c.icon+'</i></div><div class="courseMain"><span class="commercialBadge">KHÓA HỌC NỔI BẬT</span><h2>'+c.name+'</h2><h3>'+c.subtitle+'</h3><p>'+c.desc+'</p><div class="courseFacts"><span><b>'+c.students+'</b><small>Học viên</small></span><span><b>★ '+c.rating+'</b><small>Đánh giá</small></span><span><b>'+c.hours+'</b><small>Thời lượng</small></span><span><b>'+c.level+'</b><small>Trình độ</small></span></div></div><div class="courseAction"><span>Đã hoàn thành</span><b>'+(active==="business"?"42%":"28%")+'</b><i><em style="width:'+(active==="business"?"42%":"28%")+'"></em></i><button data-play="'+(active==="business"?"b1":"g1")+'">▶ Tiếp tục học</button><small>Truy cập trọn đời · Cập nhật miễn phí</small></div></div>'}
function render(term=""){courseIntro();const data=modules.filter(m=>m.cat===active).map(m=>({...m,lessons:m.lessons.filter(l=>l[1].toLowerCase().includes(term.toLowerCase()))})).filter(m=>!term||m.lessons.length);q("#modules").innerHTML=data.map((m,mi)=>'<article class="module '+(m.open||term?"open":"")+'"><button class="chapterHead"><span class="chapterLabel">CHƯƠNG '+(mi+1)+'</span><span class="modTitle"><b>'+m.title+'</b><small>'+m.summary+'</small></span><span class="chapterMeta"><b>'+m.lessons.length+' bài học</b><small>'+m.progress+'% hoàn thành</small></span><span class="chev">⌄</span></button><div class="lessons">'+m.lessons.map((l,i)=>'<div class="lesson '+(l[4]?"current":"")+'"><div><span class="state '+(l[3]?"done":"")+'">'+(l[3]?"✓":String(i+1).padStart(2,"0"))+'</span><span class="lessonText"><small>BÀI TẬP '+(i+1)+'</small><b>'+l[1]+'</b><em>Video bài giảng · Có tài liệu đính kèm</em></span></div><span class="time"><b>◷ '+l[2]+'</b><small>phút</small></span><button data-play="'+l[0]+'">▶ Xem bài giảng</button></div>').join("")+'</div></article>').join("")||'<div class="empty">Không tìm thấy bài học.</div>';const vids=all.filter(l=>l.cat===active&&l.title.toLowerCase().includes(term.toLowerCase()));q("#videoGrid").innerHTML=vids.map((l,i)=>'<article class="videoCard"><button class="thumb" data-play="'+l.id+'"><span class="play">▶</span><span class="dur">'+l.time+'</span></button><div class="videoBody"><span class="tag">'+(l.cat==="business"?"Kinh doanh":"Phát triển bản thân")+'</span><h3>'+l.title+'</h3><footer><label>BÀI '+(i+1)+'</label><button data-play="'+l.id+'">Xem ngay →</button></footer></div></article>').join("")||'<div class="empty">Không tìm thấy video.</div>'}
function openVideo(id){current=all.find(l=>l.id===id);if(!current)return;q("#modName").textContent=current.module;q("#modTitle").textContent=current.title;q("#modDesc").textContent=current.desc;q("#modTime").textContent="◷ "+current.time+" phút";q("#frame").src="https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&rel=0";q("#modal").classList.add("open");document.body.style.overflow="hidden"}function closeVideo(){q("#modal").classList.remove("open");q("#frame").src="";document.body.style.overflow=""}function toast(s){q("#toast").textContent=s;q("#toast").classList.add("show");clearTimeout(window.t);window.t=setTimeout(()=>q("#toast").classList.remove("show"),2500)}
document.addEventListener("click",e=>{const p=e.target.closest("[data-play]");if(p)return openVideo(p.dataset.play);const h=e.target.closest(".chapterHead");if(h)h.parentElement.classList.toggle("open");if(e.target.closest("[data-close]"))closeVideo()});qa(".tab").forEach(b=>b.onclick=()=>{active=b.dataset.cat;qa(".tab").forEach(x=>x.classList.toggle("active",x===b));render(q("#search").value);q("#curriculum").scrollIntoView({behavior:"smooth"})});q("#search").oninput=e=>render(e.target.value);q("#complete").onclick=()=>{if(current){current.done=1;toast("Đã hoàn thành: "+current.title);closeVideo();render(q("#search").value)}};document.addEventListener("keydown",e=>e.key==="Escape"&&closeVideo());const note=q("#note");note.value=localStorage.getItem("masterclass-note")||"";q("#save").onclick=()=>{localStorage.setItem("masterclass-note",note.value);q("#noteStatus").textContent="Đã lưu lúc "+new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});toast("Đã lưu ghi chú")};q("#menu").onclick=()=>{const side=q("#side");const isOpen=side.classList.toggle("open");q("#menu").setAttribute("aria-expanded",isOpen)};q("#closeSide").onclick=()=>{q("#side").classList.remove("open");q("#menu").setAttribute("aria-expanded","false")};qa("#side nav a").forEach(a=>a.onclick=()=>{qa("#side nav a").forEach(x=>x.classList.remove("active"));a.classList.add("active");q("#side").classList.remove("open");q("#menu").setAttribute("aria-expanded","false")});q("#filter").onclick=()=>toast("Đang hiển thị tất cả bài giảng");render();

// Homepage slider and article reader
const articles=[
{category:"KINH DOANH",title:"5 bước xây dựng chiến lược kinh doanh bền vững",date:"01/07/2026",read:"8 phút đọc",image:"assets/slide-business.png",content:"<p>Một chiến lược tốt không bắt đầu bằng việc làm thật nhiều, mà bắt đầu từ việc lựa chọn đúng hướng đi. Dưới đây là năm bước giúp bạn xây nền tảng kinh doanh có thể phát triển lâu dài.</p><h3>1. Xác định vấn đề cần giải quyết</h3><p>Hãy bắt đầu từ một nhu cầu có thật của khách hàng. Nói chuyện trực tiếp với thị trường trước khi đầu tư lớn vào sản phẩm.</p><h3>2. Chọn đúng nhóm khách hàng</h3><p>Một thông điệp dành cho tất cả mọi người thường không thuyết phục được ai. Hãy tập trung vào nhóm bạn có khả năng phục vụ tốt nhất.</p><h3>3. Xây dựng lợi thế khác biệt</h3><p>Khác biệt có thể đến từ chuyên môn, trải nghiệm, tốc độ, dịch vụ hoặc cách bạn truyền tải giá trị.</p><h3>4. Thiết kế hệ thống bán hàng</h3><p>Tạo hành trình rõ ràng từ khi khách hàng biết đến bạn đến khi họ tin tưởng, mua hàng và quay lại.</p><h3>5. Đo lường và cải tiến</h3><p>Theo dõi doanh thu, chi phí, tỷ lệ chuyển đổi và phản hồi khách hàng mỗi tuần để điều chỉnh kịp thời.</p>"},
{category:"CONTENT & VIDEO",title:"Xây thương hiệu cá nhân bằng video ngắn",date:"30/06/2026",read:"6 phút đọc",image:"assets/slide-content.png",content:"<p>Video ngắn là cách nhanh nhất để khách hàng nhìn thấy năng lực, cá tính và quan điểm của bạn. Điều quan trọng không phải thiết bị đắt tiền, mà là một hệ thống nội dung nhất quán.</p><h3>Chọn ba trụ cột nội dung</h3><p>Một trụ cột về chuyên môn, một trụ cột về trải nghiệm thực tế và một trụ cột thể hiện góc nhìn cá nhân.</p><h3>Viết kịch bản đơn giản</h3><p>Mỗi video chỉ cần ba phần: câu mở đầu gây chú ý, một ý chính có giá trị và lời kêu gọi hành động rõ ràng.</p><h3>Ưu tiên sự đều đặn</h3><p>Đăng ba video tốt mỗi tuần hiệu quả hơn việc chờ đợi một video hoàn hảo. Sau mỗi tuần, xem lại dữ liệu để cải thiện.</p>"},
{category:"PHÁT TRIỂN BẢN THÂN",title:"Làm chủ thời gian, nâng tầm hiệu suất",date:"29/06/2026",read:"7 phút đọc",image:"assets/slide-growth.png",content:"<p>Quản trị thời gian thực chất là quản trị sự tập trung và năng lượng. Một ngày hiệu quả không cần quá nhiều đầu việc, chỉ cần những việc quan trọng được hoàn thành.</p><h3>Chọn ba ưu tiên mỗi ngày</h3><p>Trước khi bắt đầu, hãy viết ra ba kết quả quan trọng nhất. Hoàn thành chúng trước khi xử lý những công việc nhỏ.</p><h3>Làm việc theo khối tập trung</h3><p>Dành 60–90 phút không thông báo, không chuyển tác vụ cho công việc cần tư duy sâu.</p><h3>Tạo khoảng nghỉ có chủ đích</h3><p>Nghỉ ngắn giữa các phiên làm việc giúp não bộ phục hồi và giữ chất lượng quyết định trong cả ngày.</p>"}
];let slideIndex=0,slideTimer;
function showSlide(index){const slides=qa(".homeSlide"),dots=qa(".slideNav button");slideIndex=(index+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle("active",i===slideIndex));dots.forEach((d,i)=>d.classList.toggle("active",i===slideIndex));q("#slideNumber").textContent=String(slideIndex+1).padStart(2,"0")}
function startSlider(){clearInterval(slideTimer);slideTimer=setInterval(()=>showSlide(slideIndex+1),6000)}function openArticle(index){const a=articles[index];q("#articleImage").src=a.image;q("#articleImage").alt=a.title;q("#articleCategory").textContent=a.category;q("#articleTitle").textContent=a.title;q("#articleMeta").textContent="Nguyễn Ngọc Giàu · "+a.date+" · "+a.read;q("#articleContent").innerHTML=a.content;q("#articleModal").classList.add("open");document.body.style.overflow="hidden"}function closeArticle(){q("#articleModal").classList.remove("open");document.body.style.overflow=""}
q("#slidePrev").onclick=()=>{showSlide(slideIndex-1);startSlider()};q("#slideNext").onclick=()=>{showSlide(slideIndex+1);startSlider()};qa("[data-go-slide]").forEach(b=>b.onclick=()=>{showSlide(Number(b.dataset.goSlide));startSlider()});qa("[data-article]").forEach(b=>b.onclick=()=>openArticle(Number(b.dataset.article)));qa("[data-close-article]").forEach(b=>b.onclick=closeArticle);q(".homeSlider").addEventListener("mouseenter",()=>clearInterval(slideTimer));q(".homeSlider").addEventListener("mouseleave",startSlider);startSlider();
// Learner hub quick actions
const scheduleButton=document.querySelector("#scheduleButton"),supportButton=document.querySelector("#supportButton");
if(scheduleButton)scheduleButton.addEventListener("click",()=>toast("Lịch học tuần này: Thứ 3, Thứ 5 và Thứ 7 lúc 20:00"));
if(supportButton)supportButton.addEventListener("click",()=>toast("Đã mở kênh hỗ trợ học viên · Thời gian phản hồi khoảng 5 phút"));
// Account-based progress, lesson Q&A, and managed content
const accountButton=q("#accountButton"),loginModal=q("#loginModal"),loginForm=q("#loginForm");
let sessionUser=JSON.parse(localStorage.getItem("academy_session")||"null");
function userKey(suffix){return "academy_"+suffix+"_"+(sessionUser?sessionUser.email:"guest")}
function refreshAccount(){sessionUser = window.sessionUser || JSON.parse(localStorage.getItem("academy_session") || "null");window.sessionUser = sessionUser;document.querySelectorAll("#registerAccountBtn, #registerButton").forEach(b=>b.style.display=sessionUser?"none":"inline-block");if(sessionUser){const rawName=String(sessionUser.name||(sessionUser.email?sessionUser.email.split('@')[0]:"Học viên"));accountButton.textContent=rawName+" ⌄";const firstName=rawName.trim().split(' ').pop();if(q('.profile p b'))q('.profile p b').textContent='Chào bạn '+firstName+'! 🌟';const users=JSON.parse(localStorage.getItem('academy_users')||'{}');const u=users[sessionUser.email]||{};const members=JSON.parse(localStorage.getItem('academy_members')||'[]');const m=members.find(x=>x.email===sessionUser?.email)||members[members.length-1]||{};if(q(".profile p small"))q(".profile p small").textContent="Cùng chinh phục khóa học với Giàu nhé! 🚀";if(q(".profile span.avatar")){q(".profile span.avatar").textContent=rawName.split(' ').map(n=>n[0]).join('').slice(-2).toUpperCase()||'HV';q(".profile span.avatar").style.background="var(--gold)";q(".profile span.avatar").style.color="#07353b";}const hh=q(".hubHeading h2");if(hh)hh.textContent="Chào "+firstName+", tiếp tục hành trình hôm nay nhé!";}else{accountButton.textContent="Đăng nhập";if(q(".profile p b"))q(".profile p b").textContent="Chào bạn mới! 👋";if(q(".profile p small"))q(".profile p small").textContent="Đăng nhập để học cùng Nguyễn Ngọc Giau →";if(q(".profile span.avatar")){q(".profile span.avatar").textContent="HV";q(".profile span.avatar").style.background="linear-gradient(135deg, #e7b84f, #ef846f)";q(".profile span.avatar").style.color="#fff";}const hh=q(".hubHeading h2");if(hh)hh.textContent="Chào bạn, hãy đăng nhập để khám phá kho khóa học cùng Nguyễn Ngọc Giau!";}const profEl=document.querySelector('.profile');if(profEl&&!profEl._hasGuestClick){profEl._hasGuestClick=true;profEl.style.cursor='pointer';profEl.title='Bấm để đăng nhập hoặc tải ảnh đại diện';profEl.addEventListener('click',(e)=>{if(!window.sessionUser&&!e.target.closest('.avatar')){openLogin();toast('Vui lòng đăng nhập hoặc đăng ký tài khoản');}});}if(window.applyAvatar)window.applyAvatar();if(window.initAvatarUpload)window.initAvatarUpload();applyUserProgress()}
function openLogin(){const badge=document.querySelector('#notificationBadge');if(badge){badge.style.display='none';badge.remove();}loginModal.classList.add("open")}
window.closeAllModals=function(e){if(e){e.preventDefault();if(e.stopImmediatePropagation)e.stopImmediatePropagation();else e.stopPropagation();}document.querySelectorAll('.loginModal, .registerModal, .memberModal, .articleModal, .contentViewer, .modal, .quizModal, .certificateModal, .forgotModal, .contentEditor').forEach(m=>{m.classList.remove('open');m.style.display='';});document.body.style.overflow='';const frame=document.querySelector('#frame');if(frame)frame.src='';const viewerMedia=document.querySelector('#viewerMedia');if(viewerMedia)viewerMedia.innerHTML='';};
function closeLogin(){window.closeAllModals()}
accountButton.onclick=()=>{if(sessionUser){if(confirm("Bạn muốn đăng xuất khỏi tài khoản "+sessionUser.name+"?")){localStorage.removeItem("academy_session");sessionUser=null;refreshAccount();toast("Đã đăng xuất")}}else openLogin()};
document.addEventListener("click", e => { const closeBtn = e.target.closest("[data-close-login], [data-close-register], [data-close-member], .loginClose, .registerClose, .memberClose"); const shade = e.target.closest(".loginShade, .registerShade, .memberShade, .shade, .articleShade, .quizShade, .forgotShade, .modalShade"); if (closeBtn || (shade && e.target === shade)) { e.preventDefault(); e.stopPropagation(); window.closeAllModals(); } });
// Remove duplicate submit handler as it is properly defined at line 81
function applyUserProgress(){const completed=sessionUser?JSON.parse(localStorage.getItem(userKey("progress"))||"[]"):[];modules.forEach(m=>m.lessons.forEach(l=>l[3]=completed.includes(l[0])||l[0]==="b1"?1:0));const percent=Math.round((completed.length/all.length)*100);const ring=q(".ring b");if(ring)ring.textContent=(sessionUser?percent:68)+"%";render(q("#search").value)}
function saveCompletion(id){if(!sessionUser){openLogin();toast("Vui lòng đăng nhập để lưu tiến độ");return false}const key=userKey("progress"),completed=JSON.parse(localStorage.getItem(key)||"[]");if(!completed.includes(id))completed.push(id);localStorage.setItem(key,JSON.stringify(completed));return true}
q("#complete").onclick=()=>{if(current&&saveCompletion(current.id)){toast("Đã hoàn thành: "+current.title);closeVideo();applyUserProgress()}};
const oldOpenVideo=openVideo;openVideo=function(id){oldOpenVideo(id);renderQA(id)};
function qaKey(id){return "academy_qa_"+id}
function renderQA(id){const items=JSON.parse(localStorage.getItem(qaKey(id))||"[]");q("#qaCount").textContent=items.length+" câu hỏi";q("#qaList").innerHTML=items.length?items.map(item=>'<div class="qaItem"><i>'+item.name.split(" ").pop().slice(0,2).toUpperCase()+'</i><div><b>'+item.name+'</b><p>'+item.text.replace(/</g,"&lt;")+'</p><small>'+item.date+'</small></div></div>').join(""):'<div class="publishedEmpty">Chưa có câu hỏi. Hãy là người đầu tiên trao đổi về bài học này.</div>'}
q("#qaForm").onsubmit=e=>{e.preventDefault();if(!sessionUser){openLogin();toast("Vui lòng đăng nhập để gửi câu hỏi");return}if(!current)return;const input=q("#qaInput"),items=JSON.parse(localStorage.getItem(qaKey(current.id))||"[]");items.unshift({name:sessionUser.name,text:input.value.trim(),date:new Date().toLocaleString("vi-VN")});localStorage.setItem(qaKey(current.id),JSON.stringify(items));input.value="";renderQA(current.id);toast("Câu hỏi đã được gửi tới giảng viên")};
const defaultManaged=[{id:1,type:"Bài viết",title:"7 sai lầm người mới kinh doanh thường gặp",summary:"Những vấn đề cần tránh để tiết kiệm thời gian và nguồn lực.",date:"01/07/2026",image:"assets/slide-business.png",category:"Kinh doanh",accessPlan:"public"},{id:2,type:"Video",title:"Cách xây nội dung bán hàng không gây khó chịu",summary:"Bài giảng thực hành với ví dụ và công thức dễ áp dụng.",date:"30/06/2026",image:"assets/slide-content.png",category:"Content & Video",accessPlan:"public"}];
let storedContent=JSON.parse(localStorage.getItem("academy_content")||"[]");
if(localStorage.getItem("academy_content") === null){storedContent=defaultManaged;localStorage.setItem("academy_content",JSON.stringify(storedContent));}
function renderManaged(){const items=JSON.parse(localStorage.getItem("academy_content")||"[]").filter(x=>x.status!=="draft");q("#publishedGrid").innerHTML=items.length?items.slice().reverse().map(x=>{const thumb=x.image||(x.type==="Video"?"assets/slide-content.png":"assets/slide-business.png");return '<article class="managedCard"><div class="managedMedia" data-rich="'+x.id+'"><img src="'+thumb+'" alt="'+x.title+'"><span class="mediaType">'+x.type.toUpperCase()+'</span>'+(x.type==="Video"?'<span class="playOverlay">▶</span>':'')+'</div><div><div class="managedMeta"><span>'+((x.category||"Nội dung").toUpperCase())+'</span></div><h3>'+x.title+'</h3><p>'+x.summary+'</p><button data-rich="'+x.id+'">Xem chi tiết →</button></div></article>'}).join(""):'<div class="publishedEmpty">Nội dung mới từ giảng viên sẽ xuất hiện tại đây.</div>'}
document.addEventListener("click",e=>{const b=e.target.closest("[data-rich]");if(!b)return;const item=JSON.parse(localStorage.getItem("academy_content")||"[]").find(x=>String(x.id)===b.dataset.rich);if(!item)return;q("#articleImage").src=item.image||"assets/slide-business.png";q("#articleCategory").textContent=item.type;q("#articleTitle").textContent=item.title;q("#articleMeta").textContent="Giảng viên · "+item.date;q("#articleContent").innerHTML="<p>"+item.summary+"</p>"+(item.content||"<p>Nội dung chi tiết đang được giảng viên cập nhật.</p>");q("#articleModal").classList.add("open");document.body.style.overflow="hidden"});
renderManaged();refreshAccount();

// Functional notification, sharing, favorites and embedded player
(()=>{const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const svg={bell:'<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',heart:'<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',share:'<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"/></svg>'};
const nb=$('#notificationButton'),np=$('#notificationPanel');if(nb){nb.innerHTML=svg.bell+'<i id="notificationBadge"></i>';nb.onclick=e=>{e.stopPropagation();np.classList.toggle('open')}}document.addEventListener('click',e=>{if(np&&!np.contains(e.target)&&e.target!==nb)np.classList.remove('open')});$('#markRead')?.addEventListener('click',()=>{const b=$('#notificationBadge');if(b){b.style.display='none';b.remove();}np.classList.remove('open');toast('Đã đánh dấu thông báo là đã đọc')});
const fb=$('#favoriteLesson'),st=$('#shareToggle'),sm=$('#shareMenu');if(fb)fb.innerHTML=svg.heart+'<span>Lưu bài học</span>';if(st)st.innerHTML=svg.share+'<span>Chia sẻ</span>';st?.addEventListener('click',e=>{e.stopPropagation();sm.classList.toggle('open')});document.addEventListener('click',e=>{if(sm&&!sm.contains(e.target)&&e.target!==st)sm.classList.remove('open')});
let favorites=JSON.parse(localStorage.getItem('academy_favorites')||'[]');function favState(){if(!fb||!current)return;const on=favorites.includes(current.id);fb.classList.toggle('active',on);fb.querySelector('span').textContent=on?'Đã lưu':'Lưu bài học'}fb?.addEventListener('click',()=>{if(!current)return;favorites=favorites.includes(current.id)?favorites.filter(x=>x!==current.id):favorites.concat(current.id);localStorage.setItem('academy_favorites',JSON.stringify(favorites));favState();toast(favorites.includes(current.id)?'Đã lưu bài học':'Đã bỏ lưu bài học')});
$$('[data-share]').forEach(b=>b.addEventListener('click',()=>{const u=encodeURIComponent(location.href),t=encodeURIComponent($('#modTitle')?.textContent||document.title),type=b.dataset.share;let url=type==='facebook'?'https://www.facebook.com/sharer/sharer.php?u='+u:type==='zalo'?'https://zalo.me/share?url='+u:type==='gmail'?'https://mail.google.com/mail/?view=cm&fs=1&su='+t+'&body='+u:'';if(type==='copy'){const ta=document.createElement('textarea');ta.value=location.href;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Đã sao chép liên kết')}else window.open(url,'_blank','width=720,height=600,noopener');sm.classList.remove('open')}));
const originalOpen=openVideo;openVideo=function(id){originalOpen(id);const f=$('#frame'),fall=$('.videoFallback');if(f){f.hidden=false;f.removeAttribute('hidden');f.setAttribute('title','Video bài giảng YouTube');f.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');f.src='https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?autoplay=1&rel=0'}if(fall)fall.style.display='none';favState()};
const originalClose=closeVideo;closeVideo=function(){const f=$('#frame');if(f)f.src='';originalClose()};
})();

// Final author and Q&A identity polish.
(() => {
  const AUTHOR_NAME = 'Nguyễn Ngọc Giàu';
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  function readUser() {
    const session = (typeof sessionUser !== 'undefined' && sessionUser)
      || window.sessionUser
      || JSON.parse(localStorage.getItem('academy_session') || 'null');
    if (!session?.email) return session || null;
    const users = JSON.parse(localStorage.getItem('academy_users') || '{}');
    return { ...session, ...(users[session.email] || {}), email: session.email };
  }

  function initials(name) {
    const words = String(name || 'HV').trim().split(/\s+/).filter(Boolean);
    return words.map(word => word[0]).join('').slice(-2).toUpperCase() || 'HV';
  }

  function avatarFor(user) {
    const users = JSON.parse(localStorage.getItem('academy_users') || '{}');
    const email = user?.email || '';
    const uploaded = email ? (localStorage.getItem('academy_avatar_' + email) || users[email]?.avatar) : '';
    if (uploaded) return uploaded;
    const label = initials(user?.name);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7fd7ce"/><stop offset="1" stop-color="#105f68"/></linearGradient></defs><rect width="120" height="120" rx="26" fill="url(#g)"/><circle cx="92" cy="28" r="18" fill="rgba(255,255,255,.22)"/><text x="60" y="72" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#fff">' + label + '</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function syncAuthor() {
    document.querySelectorAll('.authorBlock b, .instructor b').forEach(el => {
      el.textContent = AUTHOR_NAME;
    });
    document.querySelectorAll('.lessonCommerce footer span, .modal section footer span').forEach(el => {
      if (el.textContent.includes('Nguyễn') || el.textContent.includes('Nguy')) {
        el.textContent = '👤 ' + AUTHOR_NAME;
      }
    });
    document.querySelectorAll('.authorPhoto img, .instructorAvatar img').forEach(img => {
      img.alt = AUTHOR_NAME;
    });
    const viewerMeta = document.querySelector('#viewerMeta');
    if (viewerMeta && viewerMeta.textContent.includes('Tác giả')) {
      viewerMeta.textContent = 'Tác giả: ' + AUTHOR_NAME + ' · Masterclass VN';
    }
  }

  function syncQaFormIdentity() {
    const form = document.querySelector('#qaForm');
    if (!form) return;
    const user = readUser();
    const name = user?.name || 'Khách học viên';
    const avatar = form.querySelector('.qaAvatar');
    if (avatar) {
      avatar.classList.add('qaStudentAvatar');
      avatar.innerHTML = '<img src="' + avatarFor(user) + '" alt="Avatar ' + esc(name) + '">';
    }
    let meta = form.querySelector('.qaStudentMeta');
    if (!meta) {
      meta = document.createElement('div');
      meta.className = 'qaStudentMeta';
      form.insertBefore(meta, form.querySelector('#qaInput'));
    }
    meta.innerHTML = '<b>' + esc(name) + '</b><small>' + (user?.email ? 'Đang hỏi bằng tài khoản học viên' : 'Đăng nhập để gửi câu hỏi') + '</small>';
  }

  document.addEventListener('submit', event => {
    if (event.target?.id !== 'qaForm') return;
    const user = readUser();
    if (!user?.email || !user?.name) return;
    setTimeout(() => {
      if (typeof current === 'undefined' || !current?.id) return;
      const key = 'academy_qa_' + current.id;
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      if (items[0]) {
        items[0].name = user.name;
        items[0].email = user.email;
        items[0].avatar = avatarFor(user);
        localStorage.setItem(key, JSON.stringify(items));
      }
    }, 0);
  }, true);

  const previousOpenVideoForAuthor = typeof openVideo === 'function' ? openVideo : null;
  if (previousOpenVideoForAuthor) {
    openVideo = function(id) {
      previousOpenVideoForAuthor(id);
      setTimeout(() => {
        syncAuthor();
        syncQaFormIdentity();
      }, 80);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    syncAuthor();
    syncQaFormIdentity();
  });
  document.addEventListener('click', () => setTimeout(() => {
    syncAuthor();
    syncQaFormIdentity();
  }, 80), true);
  setInterval(() => {
    syncAuthor();
    if (document.querySelector('#modal.open')) syncQaFormIdentity();
  }, 1200);
})();

// Show admin-managed videos in the learner video library.
(() => {
  function userCanView(required) {
    const users = JSON.parse(localStorage.getItem('academy_users') || '{}');
    const plans = JSON.parse(localStorage.getItem('academy_access') || '{}');
    const email = window.sessionUser?.email;
    const role = email ? users[email]?.role : 'guest';
    const plan = role === 'admin' ? 'admin' : email ? (plans[email] || 'starter') : 'starter';
    if (!required || required === 'public' || required === 'starter') return true;
    if (role === 'admin' || plan === 'mentoring') return true;
    if (plan === '999k') return required === '999k' || required === '699k';
    return plan === required;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function adminVideoCards(term) {
    const query = String(term || '').toLowerCase();
    return JSON.parse(localStorage.getItem('academy_content') || '[]')
      .filter(item => item.status !== 'draft')
      .filter(item => item.type === 'Video' || item.placement === 'video')
      .filter(item => userCanView(item.accessPlan || 'public'))
      .filter(item => !query || [item.title, item.summary, item.category].join(' ').toLowerCase().includes(query))
      .map((item, index) => {
        const thumb = item.image || 'assets/slide-content.png';
        const title = escapeHtml(item.title);
        const category = escapeHtml(item.category || 'Thư viện video');
        return '<article class="videoCard adminVideoCard"><button class="thumb adminVideoThumb" data-rich="' + item.id + '" style="background-image:linear-gradient(0deg,#063d4380,#063d4315),url(' + thumb + ')"><span class="play">▶</span><span class="dur">Video</span></button><div class="videoBody"><span class="tag">' + category + '</span><h3>' + title + '</h3><footer><label>QUẢN TRỊ ' + (index + 1) + '</label><button data-rich="' + item.id + '">Xem ngay →</button></footer></div></article>';
      });
  }

  function appendAdminVideos(term) {
    const grid = document.querySelector('#videoGrid');
    if (!grid || grid.dataset.adminVideosRendered === '1') return;
    const cards = adminVideoCards(term);
    if (!cards.length) return;
    const existingEmpty = grid.querySelector('.empty');
    if (existingEmpty && grid.children.length === 1) grid.innerHTML = '';
    grid.insertAdjacentHTML('beforeend', cards.join(''));
    grid.dataset.adminVideosRendered = '1';
  }

  if (typeof render === 'function') {
    const renderWithAdminVideos = render;
    render = function(term = '') {
      renderWithAdminVideos(term);
      const grid = document.querySelector('#videoGrid');
      if (grid) delete grid.dataset.adminVideosRendered;
      appendAdminVideos(term);
    };
  }

  document.addEventListener('DOMContentLoaded', () => appendAdminVideos(document.querySelector('#search')?.value || ''));
  setTimeout(() => appendAdminVideos(document.querySelector('#search')?.value || ''), 300);
})();

// Final smart article formatter: admin can paste plain text, homepage renders it as polished content.
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hasHtml = s => /<\/?[a-z][\s\S]*>/i.test(String(s || ''));
  const inline = s => esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\b(nguy hiem|quan trong|can nho|luu y|bi quyet|chien luoc|khach hang|doanh thu|noi dung|video|thuong hieu)\b/gi, '<strong>$1</strong>');

  function smartBlocks(raw, summary) {
    const text = String(raw || summary || '').replace(/\r/g, '').trim();
    if (!text) return '<div class="smartArticle"><p class="smartArticleLead">Noi dung chi tiet dang duoc cap nhat.</p></div>';
    if (hasHtml(text)) return '<div class="smartArticle">' + text + '</div>';

    const parts = text.split(/\n{2,}/).map(x => x.trim()).filter(Boolean);
    let html = '';
    let list = [];
    const flushList = () => {
      if (!list.length) return;
      html += '<ul>' + list.map(x => '<li>' + inline(x) + '</li>').join('') + '</ul>';
      list = [];
    };

    parts.forEach((part, index) => {
      const lines = part.split('\n').map(x => x.trim()).filter(Boolean);
      const allBullets = lines.length > 1 && lines.every(x => /^([-*+]|[0-9]+[.)])\s+/.test(x));
      if (allBullets) {
        flushList();
        html += '<ul>' + lines.map(x => '<li>' + inline(x.replace(/^([-*+]|[0-9]+[.)])\s+/, '')) + '</li>').join('') + '</ul>';
        return;
      }

      if (lines.length === 1 && /^>\s+/.test(lines[0])) {
        flushList();
        html += '<div class="smartArticleQuote">' + inline(lines[0].replace(/^>\s+/, '')) + '</div>';
        return;
      }

      if (lines.length === 1 && (/^#{1,3}\s+/.test(lines[0]) || /^(buoc|phan|muc|chuong|bai|cach|ly do|ket luan)\b/i.test(lines[0]) || (lines[0].length < 72 && /[:：]$/.test(lines[0])))) {
        flushList();
        html += '<h3>' + inline(lines[0].replace(/^#{1,3}\s+/, '').replace(/[:：]$/, '')) + '</h3>';
        return;
      }

      lines.forEach((line, lineIndex) => {
        const bullet = line.match(/^([-*+]|[0-9]+[.)])\s+(.+)/);
        if (bullet) {
          list.push(bullet[2]);
          return;
        }
        flushList();
        const cls = index === 0 && lineIndex === 0 ? ' class="smartArticleLead"' : '';
        html += '<p' + cls + '>' + inline(line) + '</p>';
      });
    });
    flushList();
    return '<div class="smartArticle">' + html + '</div>';
  }

  function renderSmartViewer(id) {
    const item = JSON.parse(localStorage.getItem('academy_content') || '[]').find(x => String(x.id) === String(id));
    const box = $('#viewerContent');
    if (!item || !box) return;
    box.innerHTML = smartBlocks(item.content, item.summary);
    const title = $('#viewerTitle');
    if (title) title.classList.add('smartViewerTitle');
  }

  document.addEventListener('click', e => {
    const button = e.target.closest('[data-rich]');
    if (!button) return;
    setTimeout(() => renderSmartViewer(button.dataset.rich), 0);
    setTimeout(() => renderSmartViewer(button.dataset.rich), 80);
  });
})();

// Professional lesson player and complete Q&A
(()=>{const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const previousOpen=openVideo;openVideo=function(id){previousOpen(id);const frame=$('#frame'),fallback=$('.videoFallback');if(location.protocol==='file:'){if(frame){frame.src='';frame.hidden=true}if(fallback){fallback.style.display='grid';fallback.querySelector('h3').textContent=current?.title||'Video bài giảng';const a=fallback.querySelector('a');a.href='https://www.youtube.com/watch?v=M7lc1UVf-VE';a.textContent='▶ Mở video trên YouTube'}}else{if(frame){frame.hidden=false;frame.src='https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?autoplay=1&rel=0'}if(fallback)fallback.style.display='none'}renderProQA(id)};
function key(id){return'academy_qa_'+id}function renderProQA(id){const list=$('#qaList'),items=JSON.parse(localStorage.getItem(key(id))||'[]');$('#qaCount').textContent=items.length+' câu hỏi';list.innerHTML=items.length?items.map((x,i)=>'<article class="commentCard"><div class="commentAvatar">'+esc((x.name||'HV').split(' ').pop().slice(0,2).toUpperCase())+'</div><div class="commentBody"><div class="commentTop"><b>'+esc(x.name||'Học viên')+'</b><time>'+esc(x.date||'Vừa xong')+'</time></div><p>'+esc(x.text)+'</p><div class="commentActions"><button data-like="'+i+'">♡ Hữu ích <span>'+(x.likes||0)+'</span></button><button data-reply-focus>↩ Trả lời</button></div>'+(x.reply?'<div class="instructorReply"><div class="instructorAvatar"><img src="assets/slide-business.png" alt="Nguyễn Ngọc Giàu"></div><div><span>PHẢN HỒI TỪ GIẢNG VIÊN</span><b>Nguyễn Ngọc Giàu <i>✓</i></b><p>'+esc(x.reply)+'</p><time>'+esc(x.replyDate||'Vừa phản hồi')+'</time></div></div>':'')+'</div></article>').join(''):'<div class="qaEmpty"><i>?</i><b>Chưa có câu hỏi</b><p>Hãy là người đầu tiên trao đổi về nội dung bài học này.</p></div>'}
renderQA=renderProQA;const form=$('#qaForm');if(form)form.onsubmit=e=>{e.preventDefault();if(!sessionUser){openLogin();toast('Vui lòng đăng nhập để gửi câu hỏi');return}if(!current)return;const input=$('#qaInput'),text=input.value.trim();if(text.length<3){toast('Vui lòng nhập câu hỏi rõ ràng hơn');return}const items=JSON.parse(localStorage.getItem(key(current.id))||'[]');items.unshift({id:Date.now(),name:sessionUser.name,text,date:new Date().toLocaleString('vi-VN'),likes:0});localStorage.setItem(key(current.id),JSON.stringify(items));input.value='';renderProQA(current.id);toast('Đã gửi câu hỏi tới giảng viên');setTimeout(()=>{const a=JSON.parse(localStorage.getItem(key(current.id))||'[]');if(a[0]&&!a[0].reply){a[0].reply='Cảm ơn câu hỏi của bạn. Hãy đối chiếu nội dung này với bài tập thực hành trong chương và áp dụng theo từng bước. Nếu cần, bạn gửi kết quả để tôi góp ý chi tiết hơn.';a[0].replyDate=new Date().toLocaleString('vi-VN');localStorage.setItem(key(current.id),JSON.stringify(a));renderProQA(current.id);const badge=$('#notificationBadge');if(badge)badge.textContent=String(Number(badge.textContent||0)+1);toast('Giảng viên vừa phản hồi câu hỏi của bạn')}},1600)};
document.addEventListener('click',e=>{const like=e.target.closest('[data-like]');if(like&&current){const items=JSON.parse(localStorage.getItem(key(current.id))||'[]'),i=Number(like.dataset.like);items[i].likes=(items[i].likes||0)+1;localStorage.setItem(key(current.id),JSON.stringify(items));renderProQA(current.id)}if(e.target.closest('[data-reply-focus]'))$('#qaInput')?.focus()});
})();

// Membership registration and local customer data
(()=>{const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),modal=$('#memberModal'),form=$('#memberForm');function step(n){$$('.memberStep').forEach(x=>x.classList.toggle('active',Number(x.dataset.step)===n));$$('.memberSteps i').forEach((x,i)=>x.classList.toggle('active',i<n))}$('#memberButton')?.addEventListener('click',()=>{modal.classList.add('open');step(1)});$$('[data-close-member]').forEach(x=>x.addEventListener('click',()=>modal.classList.remove('open')));$('[data-next-member]')?.addEventListener('click',()=>step(2));$('[data-prev-member]')?.addEventListener('click',()=>step(1));form?.addEventListener('submit',e=>{e.preventDefault();const email=$('#memberEmail').value.trim().toLowerCase(),members=JSON.parse(localStorage.getItem('academy_members')||'[]');if(members.some(x=>x.email===email)){toast('Email này đã đăng ký thành viên');return}const member={id:'MC-'+String(Date.now()).slice(-6),name:$('#memberName').value.trim(),email,phone:$('#memberPhone').value.trim(),birth:$('#memberBirth').value,plan:form.querySelector('[name=plan]:checked').value,goal:$('#memberGoal').value,source:$('#memberSource').value,registeredAt:new Date().toLocaleString('vi-VN'),dateKey:new Date().toLocaleDateString('vi-VN'),status:'active'};members.push(member);localStorage.setItem('academy_members',JSON.stringify(members));localStorage.setItem('academy_session',JSON.stringify({name:member.name,email:member.email}));sessionUser={name:member.name,email:member.email};$('#memberCode').textContent=member.id;const va=$('#vipAvatar');if(va)va.textContent=member.name.split(' ').map(n=>n[0]).join('').slice(-2).toUpperCase()||'HV';const vn=$('#vipName');if(vn)vn.textContent=member.name;const vp=$('#vipPlan');if(vp){const pn={'Starter':'Starter (Miễn phí)','Professional':'Professional (990.000đ)','Mentoring':'Mentoring (2.990.000đ)'};vp.textContent=pn[member.plan]||member.plan;}const vd=$('#vipDate');if(vd)vd.textContent=member.dateKey+' (Ngày mua thành công gói học)';step(3);refreshAccount();toast('Đăng ký thành viên thành công')})})();

// Separate login/registration and rich homepage publishing
(()=>{const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),login=$('#loginModal'),register=$('#registerModal');const account=$('#accountButton');  $('#registerButton')?.addEventListener('click',()=>{const badge=document.querySelector('#notificationBadge');if(badge){badge.style.display='none';badge.remove();}login.classList.remove('open');register.classList.add('open')});$$('[data-open-register]').forEach(x=>x.onclick=()=>{const badge=document.querySelector('#notificationBadge');if(badge){badge.style.display='none';badge.remove();}login.classList.remove('open');register.classList.add('open')});$$('[data-back-login]').forEach(x=>x.onclick=()=>{register.classList.remove('open');login.classList.add('open')});function hash(s){return btoa(unescape(encodeURIComponent(s)))}const rf=$('#registerForm');if(rf)rf.onsubmit=e=>{e.preventDefault();const name=$('#registerName').value.trim(),email=$('#registerEmail').value.trim().toLowerCase(),phone=$('#registerPhone').value.trim(),pass=$('#registerPassword').value,confirm=$('#registerConfirm').value;if(pass!==confirm){toast('Mật khẩu xác nhận chưa trùng khớp');return}const users=JSON.parse(localStorage.getItem('academy_users')||'{}');if(users[email]){toast('Email này đã có tài khoản');return}users[email]={name,email,phone,password:hash(pass),createdAt:new Date().toLocaleString('vi-VN'),role:'student'};localStorage.setItem('academy_users',JSON.stringify(users));window.closeAllModals();const lm=document.querySelector('#loginModal');if(lm)lm.classList.add('open');const le=document.querySelector('#loginEmail');if(le)le.value=email;const lp=document.querySelector('#loginPassword');if(lp)lp.value='';rf.reset();toast('Tạo tài khoản thành công. Hãy đăng nhập')};const lf=$('#loginForm');if(lf)lf.onsubmit=e=>{e.preventDefault();const email=$('#loginEmail').value.trim().toLowerCase(),pass=$('#loginPassword').value,users=JSON.parse(localStorage.getItem('academy_users')||'{}'),user=users[email];if(!user||user.password!==hash(pass)){toast('Email hoặc mật khẩu chưa chính xác');return}sessionUser={name:user.name,email};localStorage.setItem('academy_session',JSON.stringify(sessionUser));login.classList.remove('open');refreshAccount();toast('Đăng nhập thành công'); if(window.syncHeaderAuthButtons)window.syncHeaderAuthButtons();};
function embed(url){if(!url)return'';const m=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/);return m?'https://www.youtube-nocookie.com/embed/'+m[1]+'?rel=0':url}const viewer=$('#contentViewer');function richRender(){const items=JSON.parse(localStorage.getItem('academy_content')||'[]').filter(x=>x.status!=='draft'),grid=$('#publishedGrid');if(!grid)return;grid.innerHTML=items.length?items.slice().reverse().map(x=>{const thumb=x.image||(x.type==='Video'?'assets/slide-content.png':'assets/slide-business.png');return '<article class="managedCard"><div class="managedMedia"><img src="'+thumb+'" alt="'+x.title+'" onerror="this.src=\'assets/slide-business.png\'"><span class="mediaType">'+x.type+'</span>'+(x.type==='Video'?'<span class="playOverlay">▶</span>':'')+'</div><div><div class="managedMeta"><span>'+((x.category||'Nội dung').toUpperCase())+'</span><i class="placementBadge">'+(x.placement==='video'?'Thư viện video':x.placement==='featured'?'Nổi bật':'Trang chủ')+'</i></div><h3>'+x.title+'</h3><p>'+x.summary+'</p><button data-rich="'+x.id+'">Xem chi tiết →</button></div></article>'}).join(''):'<div class="publishedEmpty">Nội dung mới sẽ xuất hiện tại đây.</div>'}renderManaged=richRender;richRender();document.addEventListener('click',e=>{const b=e.target.closest('[data-rich]');if(!b)return;const x=JSON.parse(localStorage.getItem('academy_content')||'[]').find(i=>String(i.id)===b.dataset.rich);if(!x)return;$('#viewerCategory').textContent=(x.category||x.type)+' · '+(x.date||'');$('#viewerTitle').textContent=x.title;$('#viewerMeta').textContent='Tác giả: Nguyễn Ngọc Giàu · Masterclass VN';$('#viewerSummary').textContent=x.summary||'';$('#viewerContent').innerHTML=x.content||'';$('#viewerMedia').innerHTML=x.type==='Video'&&x.video?'<iframe class="viewerVideo" src="'+embed(x.video)+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>':x.image?'<img class="viewerImage" src="'+x.image+'" alt="'+x.title+'">':'';viewer.classList.add('open')});$$('[data-close-viewer]').forEach(x=>x.onclick=()=>{viewer.classList.remove('open');$('#viewerMedia').innerHTML=''})})();

// Student/admin authorization and package content gating
(()=>{const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);modules.forEach(m=>m.access=m.id==='bch1'?'starter':m.cat==='business'?'699k':'999k');function auth(){const users=JSON.parse(localStorage.getItem('academy_users')||'{}'),access=JSON.parse(localStorage.getItem('academy_access')||'{}'),email=sessionUser?.email,role=email?users[email]?.role||'student':'guest',plan=role==='admin'?'admin':email?access[email]||'starter':'starter';return{role,plan,email}}function can(required){const a=auth();if(required==='public'||a.role==='admin'||a.plan==='mentoring'||required==='starter')return true;if(a.plan==='999k')return required==='999k'||required==='699k'||required==='starter';if(a.plan==='699k')return required==='699k'||required==='starter';return required===a.plan}let syncing=false;function applyGate(){const a=auth(),businessTab=$('[data-cat="business"]'),growthTab=$('[data-cat="growth"]');if(businessTab)businessTab.style.display=(a.role==='admin'||a.plan==='mentoring'||a.plan==='999k'||a.plan==='699k'||a.plan==='starter')?'':'none';if(growthTab)growthTab.style.display=(a.role==='admin'||a.plan==='mentoring'||a.plan==='999k')?'':'none';$$('.module').forEach(el=>{const title=el.querySelector('.modTitle b')?.textContent||'',m=modules.find(x=>title.includes(x.title));if(m)el.classList.toggle('accessLocked',!can(m.access))});$$('.videoCard').forEach(card=>{const title=card.querySelector('h3')?.textContent||'',lesson=all.find(x=>x.title===title),m=lesson&&modules.find(x=>x.lessons.some(l=>l[0]===lesson.id));if(m)card.classList.toggle('accessLocked',!can(m.access))});const admin=$('.adminLink');if(admin)admin.style.display=a.role==='admin'?'':'none';const profile=$('.profile p small');const users=JSON.parse(localStorage.getItem('academy_users')||'{}');if(profile&&sessionUser){const u=users[a.email]||{};const members=JSON.parse(localStorage.getItem('academy_members')||'[]');const m=members.find(x=>x.email===a.email)||members[members.length-1]||{};const dateStr=u.createdAt||m.dateKey||m.createdAt||(a.role==='admin'?'01/01/2026':'01/07/2026');const fDate=dateStr.includes('·')?dateStr.split('·')[0].trim():dateStr.split(' ')[0];profile.textContent="Cùng chinh phục khóa học với Giàu nhé! 🚀"}const titleSpan = $('.curriculum .title > span');if (titleSpan) {const activeMods = modules.filter(m => m.cat === active);const totalL = activeMods.reduce((sum, m) => sum + m.lessons.length, 0);titleSpan.textContent = activeMods.length + ' chương · ' + totalL + ' bài học';}if(window.applyAvatar)window.applyAvatar();if(window.initAvatarUpload)window.initAvatarUpload();function setCategory(cat){active=cat;qa(".tab").forEach(x=>x.classList.toggle("active",x.dataset.cat===cat));render(q("#search").value)}if(!syncing&&a.plan==='999k'&&active!=='growth'){syncing=true;setCategory('growth');syncing=false}else if(!syncing&&(a.plan==='699k'||a.plan==='starter')&&active!=='business'){syncing=true;setCategory('business');syncing=false}}const oldRenderGate=render;render=function(...args){oldRenderGate(...args);queueMicrotask(applyGate)};const oldOpenGate=openVideo;openVideo=function(id){const lesson=all.find(x=>x.id===id),m=lesson&&modules.find(x=>x.lessons.some(l=>l[0]===id));if(m&&!can(m.access)){toast('Nội dung này không thuộc gói học của bạn');return}oldOpenGate(id)};const oldRefreshGate=refreshAccount;refreshAccount=function(){oldRefreshGate();queueMicrotask(applyGate)};
function gatedContent(){const items=JSON.parse(localStorage.getItem('academy_content')||'[]').filter(x=>x.status!=='draft'&&can(x.accessPlan||'public')),grid=$('#publishedGrid');if(!grid)return;grid.innerHTML=items.length?items.slice().reverse().map(x=>{const thumb=x.image||(x.type==='Video'?'assets/slide-content.png':'assets/slide-business.png');return '<article class="managedCard"><div class="managedMedia" data-rich="'+x.id+'"><img src="'+thumb+'" alt="'+x.title+'"><span class="mediaType">'+x.type+'</span>'+(x.type==='Video'?'<span class="playOverlay">▶</span>':'')+'</div><div><div class="managedMeta"><span>'+((x.category||'Nội dung').toUpperCase())+'</span><i class="placementBadge">'+(x.accessPlan==='public'?'Công khai':'Gói '+(x.accessPlan||'').toUpperCase())+'</i></div><h3>'+x.title+'</h3><p>'+x.summary+'</p><button data-rich="'+x.id+'">Xem chi tiết →</button></div></article>'}).join(''):'<div class="publishedEmpty">Chưa có nội dung mới dành cho gói học của bạn.</div>'}renderManaged=gatedContent;const memberForm=$('#memberForm');memberForm?.addEventListener('submit',()=>{setTimeout(()=>{const email=$('#memberEmail')?.value.trim().toLowerCase();if(!email)return;const selected=memberForm.querySelector('[name=plan]:checked')?.value,map={Starter:'starter',Professional:'999k',Mentoring:'mentoring'},a=JSON.parse(localStorage.getItem('academy_access')||'{}');a[email]=map[selected]||'starter';localStorage.setItem('academy_access',JSON.stringify(a));applyGate()},100)});render();gatedContent();applyGate()})();
// Avatar upload & registration date display (Request 1)
(()=>{window.applyAvatar=function(){const email=window.sessionUser?.email||'guest';const users=JSON.parse(localStorage.getItem('academy_users')||'{}');const dataUrl=localStorage.getItem('academy_avatar_'+email)||localStorage.getItem('academy_avatar_guest')||users[email]?.avatar;const allAvs=document.querySelectorAll('.profile span.avatar, .profile .avatar, .accountMenuIdentity span, .accountMenuIdentity .avatar, aside#side .avatar, #vipAvatar, .authorPhoto, .adminAvatar');allAvs.forEach(el=>{if(dataUrl){el.style.position='relative';el.style.overflow='hidden';el.innerHTML='<img src="'+dataUrl+'" class="customAvatarImg" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;position:absolute;inset:0;">';}else{const initials=window.sessionUser?.name?window.sessionUser.name.split(' ').map(n=>n[0]).join('').slice(-2).toUpperCase():'HV';if(!el.querySelector('img'))el.textContent=initials;}});};window.initAvatarUpload=function(){let fileInput=document.querySelector('#avatarFileInput');if(!fileInput){fileInput=document.createElement('input');fileInput.type='file';fileInput.id='avatarFileInput';fileInput.accept='image/*';fileInput.style.display='none';document.body.appendChild(fileInput);fileInput.addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{const dataUrl=ev.target.result;const email=window.sessionUser?.email||'guest';localStorage.setItem('academy_avatar_'+email,dataUrl);localStorage.setItem('academy_avatar_guest',dataUrl);const users=JSON.parse(localStorage.getItem('academy_users')||'{}');if(users[email]){users[email].avatar=dataUrl;localStorage.setItem('academy_users',JSON.stringify(users));}applyAvatar();if(typeof toast==='function')toast('Đã lưu ảnh đại diện thành công!');};reader.readAsDataURL(file);});}if(!window._avatarDelegated){window._avatarDelegated=true;document.addEventListener('click',e=>{const av=e.target.closest('.profile .avatar, .profile span.avatar, .accountMenuIdentity span, .accountMenuIdentity .avatar, aside#side .avatar, #vipAvatar, .adminAvatar, .authorPhoto');if(av){e.preventDefault();e.stopPropagation();fileInput.click();}});}};document.addEventListener('DOMContentLoaded',()=>{initAvatarUpload();applyAvatar();});setTimeout(()=>{initAvatarUpload();applyAvatar();},500);})();

// Final avatar ownership: guest gets generated avatar, logged users get their own avatar by email
(()=>{function currentUser(){return(typeof sessionUser!=='undefined'&&sessionUser)||window.sessionUser||null}function initials(name){return(name||'HV').trim().split(/\s+/).map(n=>n[0]).join('').slice(-2).toUpperCase()||'HV'}function hashSeed(text){let h=0;for(const ch of String(text||'guest'))h=(h*31+ch.charCodeAt(0))>>>0;return h}function generatedAvatar(user){let seed=user?.email||localStorage.getItem('academy_guest_avatar_seed');if(!seed){seed=String(Date.now())+'-'+Math.random().toString(16).slice(2);localStorage.setItem('academy_guest_avatar_seed',seed)}const colors=[['#f2bd4e','#0f6a72'],['#7d73d6','#39a9a6'],['#ef846f','#0d5962'],['#43a67f','#e7b84f'],['#2f8ca0','#f4d35e']],pair=colors[hashSeed(seed)%colors.length],label=user?initials(user.name):'HV';const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+pair[0]+'"/><stop offset="1" stop-color="'+pair[1]+'"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g)"/><circle cx="86" cy="28" r="18" fill="rgba(255,255,255,.22)"/><circle cx="28" cy="92" r="24" fill="rgba(255,255,255,.16)"/><text x="60" y="70" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#fff">'+label+'</text></svg>';return'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg)}function paintAvatar(){const user=currentUser(),email=user?.email,users=JSON.parse(localStorage.getItem('academy_users')||'{}'),avatar=email?(localStorage.getItem('academy_avatar_'+email)||users[email]?.avatar):'';const src=avatar||generatedAvatar(user);document.querySelectorAll('.profile span.avatar, .profile .avatar, .accountMenuIdentity span, .accountMenuIdentity .avatar, aside#side .avatar, #vipAvatar, .adminAvatar').forEach(el=>{el.style.position='relative';el.style.overflow='hidden';el.innerHTML='<img src="'+src+'" class="customAvatarImg" alt="Avatar" style="width:100%;height:100%;object-fit:cover;object-position:center;border-radius:50%;position:absolute;inset:0;">';});}const previousApplyAvatar=window.applyAvatar;window.applyAvatar=function(){if(typeof previousApplyAvatar==='function')previousApplyAvatar();paintAvatar()};document.addEventListener('click',e=>{const av=e.target.closest('.profile .avatar, .profile span.avatar, .accountMenuIdentity span, .accountMenuIdentity .avatar, aside#side .avatar, #vipAvatar, .adminAvatar');if(!av)return;const user=currentUser();if(user?.email){window.sessionUser=user;return}e.preventDefault();e.stopImmediatePropagation();openLogin();if(typeof toast==='function')toast('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ táº£i áº£nh Ä‘áº¡i diá»‡n');},true);document.addEventListener('DOMContentLoaded',paintAvatar);setTimeout(paintAvatar,80);setTimeout(paintAvatar,700);})();

(()=>{function restoreAuthorAvatar(){document.querySelectorAll('.authorPhoto').forEach(el=>{el.innerHTML='<img src="assets/slide-business.png" alt="TÃ¡c giáº£ Nguyễn Ngọc Giàu">';});}const applyAfterAvatar=window.applyAvatar;window.applyAvatar=function(){if(typeof applyAfterAvatar==='function')applyAfterAvatar();restoreAuthorAvatar()};document.addEventListener('DOMContentLoaded',restoreAuthorAvatar);setTimeout(restoreAuthorAvatar,500);})();

// Polished content thumbnails and compact video library
(()=>{const $=s=>document.querySelector(s);function accessAllowed(required){const users=JSON.parse(localStorage.getItem('academy_users')||'{}'),plans=JSON.parse(localStorage.getItem('academy_access')||'{}'),email=sessionUser?.email,role=email?users[email]?.role:'guest',plan=role==='admin'?'admin':email?(plans[email]||'starter'):'starter';return required==='public'||required==='starter'||role==='admin'||plan==='mentoring'||plan===required}function polishedContent(){const grid=$('#publishedGrid');if(!grid)return;const items=JSON.parse(localStorage.getItem('academy_content')||'[]').filter(x=>x.status!=='draft'&&accessAllowed(x.accessPlan||'public'));grid.innerHTML=items.length?items.slice().reverse().map(x=>{const fallback=x.type==='Video'?'assets/slide-content.png':'assets/slide-business.png',thumb=x.image||fallback;return '<article class="managedCard"><div class="managedMedia" data-rich="'+x.id+'"><img src="'+thumb+'" alt="Thumbnail '+x.title+'" onerror="this.src=\''+fallback+'\'"><span class="mediaType">'+(x.type==='Video'?'▶ Video':'✦ Bài viết')+'</span>'+(x.type==='Video'?'<span class="playOverlay">▶</span>':'')+'</div><div><div class="managedMeta"><span>'+((x.category||'Nội dung').toUpperCase())+'</span><i class="placementBadge">'+(x.accessPlan==='public'?'Công khai':'Gói '+(x.accessPlan||'').toUpperCase())+'</i></div><h3>'+x.title+'</h3><p>'+x.summary+'</p><button data-rich="'+x.id+'">Xem chi tiết <span>→</span></button></div></article>'}).join(''):'<div class="publishedEmpty">Chưa có nội dung mới dành cho gói học của bạn.</div>'}let expanded=false;function compactVideos(){const grid=$('#videoGrid');if(!grid)return;grid.classList.toggle('videoGridExpanded',expanded);let more=$('#videoLibraryMore');if(!more){more=document.createElement('button');more.id='videoLibraryMore';more.className='videoLibraryMore';grid.after(more);more.onclick=()=>{expanded=!expanded;compactVideos();if(!expanded)$('#videos')?.scrollIntoView({behavior:'smooth',block:'start'})}}const total=grid.querySelectorAll('.videoCard:not(.accessLocked)').length,hidden=Math.max(0,total-6);more.hidden=!expanded&&hidden===0;more.innerHTML=expanded?'⌃ <b>Thu gọn thư viện</b>':'▦ <b>Xem thêm '+hidden+' video</b><span>Khám phá toàn bộ bài giảng</span>'}renderManaged=polishedContent;const previousRender=render;render=function(...args){previousRender(...args);expanded=false;queueMicrotask(compactVideos)};polishedContent();compactVideos()})();

// Local password recovery
(()=>{const login=document.querySelector('#loginForm');if(!login||document.querySelector('#forgotPasswordButton'))return;const forgot=document.createElement('button');forgot.type='button';forgot.id='forgotPasswordButton';forgot.className='forgotPasswordButton';forgot.innerHTML='◇ Quên mật khẩu?';const primary=login.querySelector(':scope > .primary');primary?.before(forgot);const modal=document.createElement('div');modal.className='forgotModal';modal.id='forgotModal';modal.innerHTML='<div class="forgotShade" data-close-forgot></div><form class="forgotCard" id="forgotForm"><button type="button" class="forgotClose" data-close-forgot>×</button><div class="forgotIcon">◇</div><span>KHÔI PHỤC TÀI KHOẢN</span><h2>Đặt lại mật khẩu</h2><p>Nhập đúng email đã đăng ký và tạo mật khẩu mới.</p><label>Email tài khoản<input id="forgotEmail" type="email" required autocomplete="username" placeholder="hocvien@email.com"></label><label>Mật khẩu mới<div class="passwordField"><input id="forgotNewPassword" type="password" minlength="6" required placeholder="Tối thiểu 6 ký tự"><button type="button" id="showForgotPassword" class="showPasswordButton">◎</button></div></label><label>Xác nhận mật khẩu<input id="forgotConfirmPassword" type="password" minlength="6" required placeholder="Nhập lại mật khẩu"></label><button class="primary" type="submit">✓ Cập nhật mật khẩu</button><small>Dữ liệu được cập nhật trên thiết bị đang sử dụng.</small></form>';document.body.appendChild(modal);const close=()=>modal.classList.remove('open');forgot.onclick=()=>{document.querySelector('#loginModal')?.classList.remove('open');modal.classList.add('open');document.querySelector('#forgotEmail').focus()};modal.querySelectorAll('[data-close-forgot]').forEach(x=>x.onclick=close);document.querySelector('#showForgotPassword').onclick=()=>{const p=document.querySelector('#forgotNewPassword'),show=p.type==='password';p.type=show?'text':'password';document.querySelector('#showForgotPassword').textContent=show?'◉':'◎'};document.querySelector('#forgotForm').onsubmit=e=>{e.preventDefault();const email=document.querySelector('#forgotEmail').value.trim().toLowerCase(),pass=document.querySelector('#forgotNewPassword').value,confirm=document.querySelector('#forgotConfirmPassword').value,users=JSON.parse(localStorage.getItem('academy_users')||'{}');if(!users[email]){toast('Không tìm thấy tài khoản với email này');return}if(pass!==confirm){toast('Mật khẩu xác nhận chưa trùng khớp');return}users[email].password=btoa(unescape(encodeURIComponent(pass)));localStorage.setItem('academy_users',JSON.stringify(users));close();document.querySelector('#loginModal')?.classList.add('open');document.querySelector('#loginEmail').value=email;document.querySelector('#loginPassword').value='';toast('Đã cập nhật mật khẩu. Hãy đăng nhập lại')}})();

// Account dropdown and explicit sign-out
(()=>{const account=document.querySelector('#accountButton'),header=account?.parentElement;if(!account||!header)return;const area=document.createElement('div');area.className='accountArea';header.insertBefore(area,account);area.appendChild(account);const menu=document.createElement('div');menu.className='accountMenu';menu.innerHTML='<div class="accountMenuIdentity"><span>MT</span><p><b id="accountMenuName">Tài khoản</b><small id="accountMenuRole">Học viên</small></p></div><a href="admin.html" id="accountMenuAdmin">▦ Trang quản trị</a><button type="button" id="accountLogout">↪ Đăng xuất</button>';area.appendChild(menu);const standaloneAdmin=document.querySelector('.adminLink');if(standaloneAdmin)standaloneAdmin.classList.add('adminLinkMoved');function syncAccountMenu(){const users=JSON.parse(localStorage.getItem('academy_users')||'{}'),email=sessionUser?.email,user=email?users[email]:null,logged=!!sessionUser,admin=user?.role==='admin';area.classList.toggle('isLoggedIn',logged);document.querySelector('#accountMenuName').textContent=sessionUser?.name||'Tài khoản';document.querySelector('#accountMenuRole').textContent=admin?'Quản trị viên':'Học viên';document.querySelector('#accountMenuAdmin').style.display=admin?'flex':'none';document.querySelectorAll('#registerButton, #registerAccountBtn, #memberButton').forEach(btn => { if(btn) btn.style.display = logged ? 'none' : ''; });if(!logged)menu.classList.remove('open')}const priorRefresh=refreshAccount;refreshAccount=function(){priorRefresh();syncAccountMenu()};account.onclick=e=>{e.stopPropagation();if(!sessionUser){openLogin();return}menu.classList.toggle('open');account.setAttribute('aria-expanded',String(menu.classList.contains('open')))};document.querySelector('#accountLogout').onclick=()=>{localStorage.removeItem('academy_session');sessionUser=null;menu.classList.remove('open');refreshAccount();toast('Đã đăng xuất khỏi tài khoản'); if(window.syncHeaderAuthButtons)window.syncHeaderAuthButtons();};menu.onclick=e=>e.stopPropagation();document.addEventListener('click',()=>menu.classList.remove('open'));syncAccountMenu()})();

// Universal modal close capture handler (guarantees closing of loginModal, registerModal, articleModal, contentViewer, etc.)
(()=>{
  document.addEventListener('click', e => {
    const closeBtn = e.target.closest('[data-close-login], [data-close-register], [data-close-member], [data-close-article], [data-close-viewer], [data-close], [data-close-quiz], [data-close-cert], [data-close-forgot], .loginClose, .memberClose, .articleClose, .forgotClose, .x, .closeModal, button[data-close-article]');
    const shade = e.target.closest('.loginShade, .memberShade, .articleShade, .shade, .quizShade, .forgotShade, .modalShade, .editorShade');
    if (closeBtn || (shade && e.target === shade)) {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.loginModal, .registerModal, .memberModal, .articleModal, .contentViewer, .modal, .quizModal, .certificateModal, .forgotModal, .contentEditor').forEach(m => {
        m.classList.remove('open');
        m.style.display = '';
      });
      document.body.style.overflow = '';
      const frame = document.querySelector('#frame');
      if (frame) frame.src = '';
      const viewerMedia = document.querySelector('#viewerMedia');
      if (viewerMedia) viewerMedia.innerHTML = '';
    }
  }, true);
})();



// Sync scientific articles into academy_content for admin management
(()=>{
  const cur = JSON.parse(localStorage.getItem('academy_content') || '[]');
  const allEdu = [
    {id:101, type:"Bài viết khoa học", category:"KINH DOANH", title:"5 bước xây dựng chiến lược kinh doanh bền vững", date:"01/07/2026", summary:"Một chiến lược tốt không bắt đầu bằng việc làm thật nhiều, mà bắt đầu từ việc lựa chọn đúng hướng đi và xây nền tảng.", image:"assets/slide-business.png", accessPlan:"public", status:"published", views:"4.2k", likes:"890", content:"<p>Một chiến lược tốt không bắt đầu bằng việc làm thật nhiều, mà bắt đầu từ việc lựa chọn đúng hướng đi. Dưới đây là năm bước giúp bạn xây nền tảng kinh doanh có thể phát triển lâu dài.</p><h3>1. Xác định vấn đề cần giải quyết</h3><p>Hãy bắt đầu từ một nhu cầu có thật của khách hàng. Nói chuyện trực tiếp với thị trường trước khi đầu tư lớn vào sản phẩm.</p><h3>2. Chọn đúng nhóm khách hàng</h3><p>Một thông điệp dành cho tất cả mọi người thường không thuyết phục được ai. Hãy tập trung vào nhóm bạn có khả năng phục vụ tốt nhất.</p><h3>3. Xây dựng lợi thế khác biệt</h3><p>Khác biệt có thể đến từ chuyên môn, trải nghiệm, tốc độ, dịch vụ hoặc cách bạn truyền tải giá trị.</p><h3>4. Thiết kế hệ thống bán hàng</h3><p>Tạo hành trình rõ ràng từ khi khách hàng biết đến bạn đến khi họ tin tưởng, mua hàng và quay lại.</p><h3>5. Đo lường và cải tiến</h3><p>Theo dõi doanh thu, chi phí, tỷ lệ chuyển đổi và phản hồi khách hàng mỗi tuần để điều chỉnh kịp thời.</p>"},
    {id:102, type:"Bài viết khoa học", category:"CONTENT & VIDEO", title:"Xây thương hiệu cá nhân bằng video ngắn", date:"30/06/2026", summary:"Video ngắn là cách nhanh nhất để khách hàng nhìn thấy năng lực, cá tính và quan điểm của bạn trên đa nền tảng.", image:"assets/slide-content.png", accessPlan:"public", status:"published", views:"5.8k", likes:"1.4k", content:"<p>Video ngắn là cách nhanh nhất để khách hàng nhìn thấy năng lực, cá tính và quan điểm của bạn. Điều quan trọng không phải thiết bị đắt tiền, mà là một hệ thống nội dung nhất quán.</p><h3>Chọn ba trụ cột nội dung</h3><p>Một trụ cột về chuyên môn, một trụ cột về trải nghiệm thực tế và một trụ cột thể hiện góc nhìn cá nhân.</p><h3>Viết kịch bản đơn giản</h3><p>Mỗi video chỉ cần ba phần: câu mở đầu gây chú ý, một ý chính có giá trị và lời kêu gọi hành động rõ ràng.</p><h3>Ưu tiên sự đều đặn</h3><p>Đăng ba video tốt mỗi tuần hiệu quả hơn việc chờ đợi một video hoàn hảo. Sau mỗi tuần, xem lại dữ liệu để cải thiện.</p>"},
    {id:103, type:"Bài viết khoa học", category:"PHÁT TRIỂN BẢN THÂN", title:"Làm chủ thời gian, nâng tầm hiệu suất", date:"29/06/2026", summary:"Quản trị thời gian thực chất là quản trị sự tập trung và năng lượng. Một ngày hiệu quả không cần quá nhiều đầu việc.", image:"assets/slide-growth.png", accessPlan:"public", status:"published", views:"3.9k", likes:"760", content:"<p>Quản trị thời gian thực chất là quản trị sự tập trung và năng lượng. Một ngày hiệu quả không cần quá nhiều đầu việc, chỉ cần những việc quan trọng được hoàn thành.</p><h3>Chọn ba ưu tiên mỗi ngày</h3><p>Trước khi bắt đầu, hãy viết ra ba kết quả quan trọng nhất. Hoàn thành chúng trước khi xử lý những công việc nhỏ.</p><h3>Làm việc theo khối tập trung</h3><p>Dành 60–90 phút không thông báo, không chuyển tác vụ cho công việc cần tư duy sâu.</p><h3>Tạo khoảng nghỉ có chủ đích</h3><p>Nghỉ ngắn giữa các phiên làm việc giúp não bộ phục hồi và giữ chất lượng quyết định trong cả ngày.</p>"},
    {id:104, type:"Ghi chú học tập", category:"VIDEO & SALE", title:"Công thức 3 giây đầu video", date:"27/06/2026", summary:"Cách giữ chân người xem ngay trong 3 giây đầu tiên bằng câu hook thu hút và ấn tượng mạnh.", image:"assets/slide-content.png", accessPlan:"starter", status:"published", views:"2.1k", likes:"510", content:"<p>3 giây đầu tiên quyết định 80% sự thành bại của một video ngắn. Hãy tập trung vào vấn đề cốt lõi ngay lập tức.</p>"},
    {id:105, type:"Ghi chú học tập", category:"KINH DOANH", title:"Quy tắc định giá sản phẩm", date:"26/06/2026", summary:"Phương pháp tính giá bán dựa trên giá trị cảm nhận thay vì chi phí sản xuất thuần túy.", image:"assets/slide-business.png", accessPlan:"pro", status:"published", views:"1.9k", likes:"430", content:"<p>Đừng cạnh tranh bằng giá rẻ. Hãy nâng cao giá trị lời chào hàng (offer) để khách hàng cảm thấy họ đang nhận được món hời lớn.</p>"},
    {id:106, type:"Ghi chú học tập", category:"PHÁT TRIỂN BẢN THÂN", title:"Quản lý năng lượng cá nhân", date:"24/06/2026", summary:"Bí quyết duy trì năng lượng đỉnh cao trong suốt chuỗi ngày làm việc và sáng tạo liên tục.", image:"assets/slide-growth.png", accessPlan:"vip", status:"published", views:"3.1k", likes:"680", content:"<p>Ngủ đủ giấc, vận động nhẹ và thiền định 15 phút mỗi sáng là nền tảng cho hiệu suất làm việc vô địch.</p>"}
  ];
  let changed = false;
  allEdu.forEach(def => {
    if (!cur.some(x => x.title === def.title)) {
      cur.push(def);
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem('academy_content', JSON.stringify(cur));
    setTimeout(() => {
      if (typeof renderManaged === 'function') renderManaged();
      if (typeof render === 'function') render(document.querySelector('#search')?.value || '');
    }, 0);
  }
  if (typeof window !== 'undefined' && typeof articles !== 'undefined') {
    const pubArts = cur.filter(x => x.type === 'Bài viết khoa học' || x.type === 'Bài viết' || x.category === 'KINH DOANH');
    if (pubArts.length >= 3) {
      articles.forEach((a, idx) => {
        const found = cur.find(x => x.title === a.title) || pubArts[idx];
        if (found) {
          a.title = found.title;
          a.category = found.category || a.category;
          a.content = found.content || a.content;
          a.image = found.image || a.image;
        }
      });
    }
  }
})();


// ==========================================================================
// Universal Password & Register Handlers (Checkpoint 20)
// ==========================================================================
(() => {
  // 1. Universal Password Visibility Toggle (Buttons & Checkboxes)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.showPasswordButton, [data-toggle-pass]');
    if (btn) {
      e.preventDefault();
      const wrap = btn.closest('label, .passwordField, div');
      const input = wrap ? wrap.querySelector('input[type="password"], input[type="text"]') : null;
      if (input) {
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        btn.textContent = isPass ? '◎' : '◉';
        btn.style.color = isPass ? '#ef846f' : '';
      }
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'showLoginPassword' || e.target.id === 'showRegisterPassword') {
      const form = e.target.closest('form');
      if (form) {
        form.querySelectorAll('input[type="password"], input[type="text"]').forEach(inp => {
          if (inp.id.toLowerCase().includes('pass') || inp.id.toLowerCase().includes('confirm')) {
            inp.type = e.target.checked ? 'text' : 'password';
          }
        });
      }
    }
  });

  // 2. Remember Me (Lưu email) functionality
  const loginForm = document.querySelector('#loginForm');
  const remChk = document.querySelector('#rememberLogin');
  const emailInp = document.querySelector('#loginEmail');
  const passInp = document.querySelector('#loginPassword');

  const loadSaved = () => {
    const savedEmail = localStorage.getItem('masterclass_saved_email');
    const savedPass = localStorage.getItem('masterclass_saved_pass');
    if (savedEmail && emailInp) {
      emailInp.value = savedEmail;
      if (remChk) remChk.checked = true;
    }
    if (savedPass && passInp) {
      passInp.value = savedPass;
    }
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('#accountButton, .profile, [data-open-login]')) {
      setTimeout(loadSaved, 50);
    }
  });
  setTimeout(loadSaved, 500);

  if (loginForm) {
    loginForm.addEventListener('submit', () => {
      if (remChk && remChk.checked && emailInp && passInp) {
        localStorage.setItem('masterclass_saved_email', emailInp.value.trim());
        localStorage.setItem('masterclass_saved_pass', passInp.value);
        if (typeof toast === 'function') toast('Đã lưu thông tin đăng nhập');
      } else if (remChk && !remChk.checked) {
        localStorage.removeItem('masterclass_saved_email');
        localStorage.removeItem('masterclass_saved_pass');
      }
    });
  }

  // 3. Universal Register / Create Account Trigger for Mobile & PC
  document.addEventListener('click', (e) => {
    const regBtn = e.target.closest('#registerButton, [data-open-register], .secondaryAuth[data-open-register]');
    if (regBtn) {
      e.preventDefault();
      e.stopPropagation();
      const badge=document.querySelector('#notificationBadge');
      if(badge){badge.style.display='none';badge.remove();}
      const loginMod = document.querySelector('#loginModal');
      const regMod = document.querySelector('#registerModal') || document.querySelector('#memberModal');
      if (loginMod) loginMod.classList.remove('open');
      if (regMod) {
        regMod.classList.add('open');
        const firstInp = regMod.querySelector('input');
        if (firstInp) setTimeout(() => firstInp.focus(), 100);
      }
    }
  });
})();


// ==========================================================================
// Bulletproof Auth Button Sync (Hides Create Account / Member buttons when logged in)
// ==========================================================================
(() => {
  window.syncHeaderAuthButtons = function() {
    const session = JSON.parse(localStorage.getItem('academy_session') || 'null') || window.sessionUser || (typeof sessionUser !== 'undefined' ? sessionUser : null);
    const logged = !!(session && session.email);
    const compactHeader = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    const regBtns = document.querySelectorAll('#registerButton, .registerBtn, #registerAccountBtn, #memberButton, .memberButton');
    regBtns.forEach(btn => {
      if (btn) {
        const memberButton = btn.matches('#memberButton, .memberButton');
        btn.style.setProperty('display', logged || memberButton ? 'none' : 'inline-flex', 'important');
      }
    });
  };
  setInterval(window.syncHeaderAuthButtons, 500);
  document.addEventListener('DOMContentLoaded', window.syncHeaderAuthButtons);
  setTimeout(window.syncHeaderAuthButtons, 50);
  setTimeout(window.syncHeaderAuthButtons, 300);
})();

// Remove the notification dot that can float over login/register modals.
(() => {
  function removeNotificationDot() {
    document.querySelectorAll('#notificationBadge, #notificationButton > i, .notificationBtn > i, #codex-browser-sidebar-comments-root, .loginModal > .loginShade, .registerModal > .loginShade').forEach(dot => dot.remove());
  }
  removeNotificationDot();
  document.addEventListener('DOMContentLoaded', removeNotificationDot);
  document.addEventListener('click', removeNotificationDot, true);
})();

// Final profile greeting and joined-date display.
(() => {
  function currentUser() {
    return (typeof sessionUser !== 'undefined' && sessionUser) || JSON.parse(localStorage.getItem('academy_session') || 'null');
  }
  function joinDateFor(user) {
    if (!user?.email) return '';
    const users = JSON.parse(localStorage.getItem('academy_users') || '{}');
    const members = JSON.parse(localStorage.getItem('academy_members') || '[]');
    const member = members.find(x => x.email === user.email);
    const raw = users[user.email]?.createdAt || member?.registeredAt || member?.dateKey || '';
    if (!raw) return '';
    return String(raw).split('·')[0].trim();
  }
  function syncProfileGreeting() {
    const user = currentUser();
    const profile = document.querySelector('aside#side .profile');
    if (!profile) return;
    const title = profile.querySelector('p b');
    const subtitle = profile.querySelector('p small');
    let joined = profile.querySelector('.profileJoinDate');
    if (!joined) {
      joined = document.createElement('em');
      joined.className = 'profileJoinDate';
      profile.querySelector('p')?.appendChild(joined);
    }
    if (user?.email) {
      const firstName = (user.name || 'Masterclass').trim().split(/\s+/).pop();
      if (title) title.textContent = 'Chào bạn ' + firstName;
      if (subtitle) subtitle.textContent = 'Tiếp tục hành trình học tập hôm nay';
      const date = joinDateFor(user);
      joined.textContent = date ? 'Ngày tham gia: ' + date : '';
      joined.hidden = !date;
    } else {
      if (title) title.textContent = 'Chào bạn mới';
      if (subtitle) subtitle.textContent = 'Đăng nhập để lưu tiến độ và học tiếp';
      joined.textContent = '';
      joined.hidden = true;
    }
  }
  document.addEventListener('DOMContentLoaded', syncProfileGreeting);
  document.addEventListener('click', () => setTimeout(syncProfileGreeting, 80), true);
  setInterval(syncProfileGreeting, 1000);
})();

// Final Q&A identity: show full student avatar and name in comments/questions.
(() => {
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function currentUser() {
    return (typeof sessionUser !== 'undefined' && sessionUser) || JSON.parse(localStorage.getItem('academy_session') || 'null');
  }
  function initials(name) {
    return (name || 'HV').trim().split(/\s+/).map(n => n[0]).join('').slice(-2).toUpperCase() || 'HV';
  }
  function avatarFor(email, name) {
    const users = JSON.parse(localStorage.getItem('academy_users') || '{}');
    const uploaded = email ? (localStorage.getItem('academy_avatar_' + email) || users[email]?.avatar) : '';
    if (uploaded) return uploaded;
    const label = initials(name);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7fd7ce"/><stop offset="1" stop-color="#0d5962"/></linearGradient></defs><rect width="120" height="120" rx="26" fill="url(#g)"/><circle cx="92" cy="28" r="20" fill="rgba(255,255,255,.22)"/><text x="60" y="72" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#fff">'+label+'</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }
  function qaKeyFor(id) {
    return 'academy_qa_' + id;
  }
  function paintQaForm() {
    const form = document.querySelector('#qaForm');
    if (!form) return;
    form.dataset.finalIdentity = '1';
    const user = currentUser();
    const avatar = form.querySelector('.qaAvatar');
    if (avatar) {
      avatar.classList.add('qaStudentAvatar');
      avatar.innerHTML = '<img src="' + avatarFor(user?.email, user?.name) + '" alt="Avatar học viên">';
    }
    let meta = form.querySelector('.qaStudentMeta');
    if (!meta) {
      meta = document.createElement('div');
      meta.className = 'qaStudentMeta';
      form.insertBefore(meta, form.querySelector('#qaInput'));
    }
    meta.innerHTML = '<b>' + esc(user?.name || 'Khách học viên') + '</b><small>' + (user?.email ? 'Đang hỏi bằng tài khoản học viên' : 'Đăng nhập để gửi câu hỏi') + '</small>';
  }
  function renderFinalQA(id) {
    const list = document.querySelector('#qaList');
    const count = document.querySelector('#qaCount');
    if (!list || !id) return;
    const items = JSON.parse(localStorage.getItem(qaKeyFor(id)) || '[]');
    if (count) count.textContent = items.length + ' câu hỏi';
    list.innerHTML = items.length ? items.map((x, i) => {
      const name = x.name || 'Học viên';
      const src = avatarFor(x.email, name);
      return '<article class="commentCard finalCommentCard"><div class="commentAvatar"><img src="'+src+'" alt="Avatar '+esc(name)+'"></div><div class="commentBody"><div class="commentTop"><span><b>'+esc(name)+'</b><small>'+esc(x.email || 'Tài khoản học viên')+'</small></span><time>'+esc(x.date || 'Vừa xong')+'</time></div><p>'+esc(x.text)+'</p><div class="commentActions"><button data-like="'+i+'">♡ Hữu ích <span>'+(x.likes||0)+'</span></button><button data-reply-focus>↩ Trả lời</button></div>'+(x.reply?'<div class="instructorReply"><div class="instructorAvatar"><img src="assets/slide-business.png" alt="Nguyễn Ngọc Giàu"></div><div><span>PHẢN HỒI TỪ GIẢNG VIÊN</span><b>Nguyễn Ngọc Giàu <i>✓</i></b><p>'+esc(x.reply)+'</p><time>'+esc(x.replyDate||'Vừa phản hồi')+'</time></div></div>':'')+'</div></article>';
    }).join('') : '<div class="qaEmpty"><i>?</i><b>Chưa có câu hỏi</b><p>Hãy là người đầu tiên trao đổi về nội dung bài học này.</p></div>';
    paintQaForm();
  }
  const priorOpenVideo = typeof openVideo === 'function' ? openVideo : null;
  if (priorOpenVideo) {
    openVideo = function(id) {
      priorOpenVideo(id);
      setTimeout(() => renderFinalQA(id), 80);
    };
  }
  document.addEventListener('submit', e => {
    if (e.target?.id !== 'qaForm') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const user = currentUser();
    if (!user?.email) {
      openLogin();
      toast('Vui lòng đăng nhập để gửi câu hỏi');
      return;
    }
    if (!current) return;
    const input = document.querySelector('#qaInput');
    const text = input?.value.trim();
    if (!text || text.length < 3) {
      toast('Vui lòng nhập câu hỏi rõ ràng hơn');
      return;
    }
    const items = JSON.parse(localStorage.getItem(qaKeyFor(current.id)) || '[]');
    items.unshift({ id: Date.now(), name: user.name, email: user.email, text, date: new Date().toLocaleString('vi-VN'), likes: 0 });
    localStorage.setItem(qaKeyFor(current.id), JSON.stringify(items));
    input.value = '';
    renderFinalQA(current.id);
    toast('Đã gửi câu hỏi tới giảng viên');
  }, true);
  setInterval(() => {
    paintQaForm();
    if (typeof current !== 'undefined' && current?.id && document.querySelector('#modal.open')) renderFinalQA(current.id);
  }, 1200);
})();

// Final learner profile popup and avatar upload location.
(() => {
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function currentUser() {
    return (typeof sessionUser !== 'undefined' && sessionUser) || JSON.parse(localStorage.getItem('academy_session') || 'null');
  }
  function initials(name) {
    return (name || 'HV').trim().split(/\s+/).map(n => n[0]).join('').slice(-2).toUpperCase() || 'HV';
  }
  function dateOnly(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';
    const vn = s.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (vn) return vn[1];
    const iso = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) return iso[3].padStart(2, '0') + '/' + iso[2].padStart(2, '0') + '/' + iso[1];
    return s.replace(/\b\d{1,2}:\d{2}(:\d{2})?\b/g, '').split(/[·Â]/)[0].trim();
  }
  function dataFor(user) {
    const users = JSON.parse(localStorage.getItem('academy_users') || '{}');
    const access = JSON.parse(localStorage.getItem('academy_access') || '{}');
    const members = JSON.parse(localStorage.getItem('academy_members') || '[]');
    const member = members.find(x => x.email === user?.email) || {};
    const record = users[user?.email] || {};
    return { users, record, member, accessPlan: access[user?.email] || record.plan || member.plan || 'Chưa cấp quyền' };
  }
  function joinedDate(user) {
    const { record, member } = dataFor(user);
    return dateOnly(record.createdAt || member.registeredAt || member.dateKey || member.createdAt || '');
  }
  function avatarSrc(user) {
    const { record } = dataFor(user);
    return user?.email ? (localStorage.getItem('academy_avatar_' + user.email) || record.avatar || '') : '';
  }
  function syncSidebarProfile() {
    const user = currentUser();
    const profile = document.querySelector('aside#side .profile');
    if (!profile) return;
    let link = profile.querySelector('.profileOpenLink');
    if (!link) {
      link = document.createElement('button');
      link.type = 'button';
      link.className = 'profileOpenLink';
      link.textContent = 'Hồ sơ';
    }
    const avatar = profile.querySelector('.avatar');
    if (avatar && link.parentElement !== profile) avatar.after(link);
    const joined = profile.querySelector('.profileJoinDate');
    if (user?.email) {
      const date = joinedDate(user);
      if (joined) {
        joined.textContent = '';
        joined.hidden = true;
      }
      link.hidden = false;
      profile.title = 'Bấm Hồ sơ để xem thông tin thành viên';
    } else {
      if (joined) {
        joined.textContent = '';
        joined.hidden = true;
      }
      link.hidden = true;
      profile.title = 'Bấm để đăng nhập';
    }
  }
  function ensureModal() {
    let modal = document.querySelector('#learnerProfileModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'learnerProfileModal';
    modal.className = 'learnerProfileModal';
    modal.innerHTML = '<div class="learnerProfileShade" data-close-profile></div><article class="learnerProfileCard"><button type="button" class="learnerProfileClose" data-close-profile>×</button><div class="learnerProfileHero"><div class="learnerProfileAvatar" id="learnerProfileAvatar"></div><div class="learnerProfileTitle"><span>HỒ SƠ HỌC VIÊN</span><h2 id="learnerProfileName">Học viên</h2><p id="learnerProfileEmail"></p><button type="button" id="learnerAvatarUpload">Tải ảnh đại diện</button><input type="file" id="learnerAvatarFile" accept="image/*" hidden></div></div><div class="learnerProfileGrid" id="learnerProfileGrid"></div></article>';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
      if (e.target.closest('[data-close-profile]')) closeProfile();
    });
    modal.querySelector('#learnerAvatarUpload').addEventListener('click', () => modal.querySelector('#learnerAvatarFile').click());
    modal.querySelector('#learnerAvatarFile').addEventListener('change', e => {
      const file = e.target.files?.[0];
      const user = currentUser();
      if (!file || !user?.email) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target.result;
        localStorage.setItem('academy_avatar_' + user.email, dataUrl);
        const users = JSON.parse(localStorage.getItem('academy_users') || '{}');
        users[user.email] = { ...(users[user.email] || {}), avatar: dataUrl };
        localStorage.setItem('academy_users', JSON.stringify(users));
        if (typeof window.applyAvatar === 'function') window.applyAvatar();
        renderProfile();
        if (typeof toast === 'function') toast('Đã cập nhật ảnh đại diện');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
    return modal;
  }
  function renderProfile() {
    const user = currentUser();
    if (!user?.email) return;
    const modal = ensureModal();
    const { record, member, accessPlan } = dataFor(user);
    const date = joinedDate(user) || 'Chưa có dữ liệu';
    const src = avatarSrc(user);
    modal.querySelector('#learnerProfileAvatar').innerHTML = src ? '<img src="' + src + '" alt="Avatar">' : '<b>' + esc(initials(user.name || record.name || member.name)) + '</b>';
    modal.querySelector('#learnerProfileName').textContent = user.name || record.name || member.name || 'Học viên';
    modal.querySelector('#learnerProfileEmail').textContent = user.email;
    const code = 'MC-' + (date.replace(/\D/g, '').slice(-8) || String(Date.now()).slice(-8)).padStart(8, '0');
    const role = record.role === 'admin' ? 'Quản trị viên' : 'Thành viên';
    modal.querySelector('#learnerProfileGrid').innerHTML = [
      ['id', '▣', 'Mã học viên', code],
      ['phone', '☎', 'Số điện thoại', record.phone || member.phone || 'Chưa cập nhật'],
      ['email', '✉', 'Email', user.email],
      ['role', '♛', 'Vai trò', role],
      ['access', '▤', 'Quyền xem khóa học', accessPlan],
      ['status', '✓', 'Trạng thái', 'Đang hoạt động']
    ].map(row => '<div class="learnerProfileItem profileInfo-' + row[0] + '"><i>' + row[1] + '</i><span>' + row[2] + '</span><b>' + esc(row[3]) + '</b></div>').join('');
  }
  function openProfile() {
    const user = currentUser();
    if (!user?.email) {
      if (typeof openLogin === 'function') openLogin();
      if (typeof toast === 'function') toast('Vui lòng đăng nhập để xem hồ sơ');
      return;
    }
    renderProfile();
    ensureModal().classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeProfile() {
    document.querySelector('#learnerProfileModal')?.classList.remove('open');
    if (!document.querySelector('#modal.open, #loginModal.open, #registerModal.open')) document.body.style.overflow = '';
  }
  document.addEventListener('click', e => {
    const target = e.target.closest('aside#side .profile .avatar, aside#side .profile .profileOpenLink');
    if (!target) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openProfile();
  }, true);
  document.addEventListener('click', () => setTimeout(syncSidebarProfile, 80), true);
  document.addEventListener('DOMContentLoaded', syncSidebarProfile);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProfile();
  });
  setInterval(syncSidebarProfile, 1000);
})();

/* Final author normalization for lesson modal and managed content renders. */
(() => {
  const AUTHOR_NAME = 'Nguyễn Ngọc Giàu';
  const OLD_AUTHOR_PATTERNS = [
    /Nguyễn Minh Tuấn/g,
    /Nguyen Minh Tuan/g,
    /Nguyen Minh Tuấn/g,
    /Nguyễn Minh Tuan/g,
    /Nguy.{0,12}n Minh Tu.{0,8}n/g
  ];
  const rewrite = value => {
    if (!value || typeof value !== 'string') return value;
    return OLD_AUTHOR_PATTERNS.reduce((text, pattern) => text.replace(pattern, AUTHOR_NAME), value);
  };
  const normalizeAuthorNames = root => {
    const scope = root && root.nodeType === 1 ? root : document.body;
    if (!scope) return;
    [
      '.authorBlock b',
      '.lessonCommerce b',
      '.instructor b',
      '.instructorReply b',
      '#viewerMeta',
      '#articleMeta',
      '.articleMeta',
      '#modal footer span',
      '#modal section footer span',
      '.commentTop b'
    ].forEach(selector => {
      scope.querySelectorAll?.(selector).forEach(el => {
        el.textContent = rewrite(el.textContent);
      });
    });
    scope.querySelectorAll?.('[alt],[title],[aria-label]').forEach(el => {
      ['alt', 'title', 'aria-label'].forEach(attr => {
        if (el.hasAttribute(attr)) el.setAttribute(attr, rewrite(el.getAttribute(attr)));
      });
    });
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const next = rewrite(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  };
  window.MASTERCLASS_AUTHOR_NAME = AUTHOR_NAME;
  window.normalizeAuthorNames = normalizeAuthorNames;
  const previousOpenVideoForFinalAuthor = typeof openVideo === 'function' ? openVideo : null;
  if (previousOpenVideoForFinalAuthor && !window.__finalAuthorOpenVideoWrapped) {
    window.__finalAuthorOpenVideoWrapped = true;
    openVideo = function(...args) {
      const result = previousOpenVideoForFinalAuthor.apply(this, args);
      [0, 60, 180, 420].forEach(delay => setTimeout(() => normalizeAuthorNames(document.body), delay));
      return result;
    };
  }
  if (!window.__finalAuthorObserver) {
    window.__finalAuthorObserver = new MutationObserver(() => {
      clearTimeout(window.__finalAuthorTimer);
      window.__finalAuthorTimer = setTimeout(() => normalizeAuthorNames(document.body), 30);
    });
    if (document.body) {
      window.__finalAuthorObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }
  document.addEventListener('DOMContentLoaded', () => normalizeAuthorNames(document.body));
  normalizeAuthorNames(document.body);
  let passes = 0;
  const authorInterval = setInterval(() => {
    normalizeAuthorNames(document.body);
    passes += 1;
    if (passes >= 20) clearInterval(authorInterval);
  }, 250);
})();

/* Final avatar sync: the author avatar follows the active profile avatar. */
(() => {
  const PROFILE_AUTHOR_FALLBACK = 'assets/slide-business.png';
  function getCurrentProfileAvatar() {
    const user = (typeof sessionUser !== 'undefined' && sessionUser)
      || window.sessionUser
      || JSON.parse(localStorage.getItem('academy_session') || 'null');
    const email = user?.email || 'guest';
    const users = JSON.parse(localStorage.getItem('academy_users') || '{}');
    const stored = email
      ? (localStorage.getItem('academy_avatar_' + email) || users[email]?.avatar)
      : '';
    const visible = document.querySelector('aside#side .profile .avatar img, aside#side .avatar img')?.getAttribute('src');
    return stored || visible || PROFILE_AUTHOR_FALLBACK;
  }
  function syncAuthorAvatar() {
    const src = getCurrentProfileAvatar();
    document.querySelectorAll('.authorPhoto, .instructorAvatar').forEach(box => {
      box.innerHTML = '<img src="' + src + '" class="customAvatarImg authorAvatarImg" alt="Avatar tác giả Nguyễn Ngọc Giàu">';
    });
  }
  window.syncAuthorAvatar = syncAuthorAvatar;
  const previousApplyAvatarForAuthor = window.applyAvatar;
  window.applyAvatar = function(...args) {
    if (typeof previousApplyAvatarForAuthor === 'function') previousApplyAvatarForAuthor.apply(this, args);
    syncAuthorAvatar();
  };
  const previousOpenVideoForAvatar = typeof openVideo === 'function' ? openVideo : null;
  if (previousOpenVideoForAvatar && !window.__authorAvatarOpenVideoWrapped) {
    window.__authorAvatarOpenVideoWrapped = true;
    openVideo = function(...args) {
      const result = previousOpenVideoForAvatar.apply(this, args);
      [0, 80, 220, 500].forEach(delay => setTimeout(syncAuthorAvatar, delay));
      return result;
    };
  }
  document.addEventListener('click', e => {
    if (!e.target.closest('.authorPhoto, .instructorAvatar')) return;
    e.stopImmediatePropagation();
  }, true);
  document.addEventListener('DOMContentLoaded', syncAuthorAvatar);
  window.addEventListener('storage', syncAuthorAvatar);
  [60, 400, 1000].forEach(delay => setTimeout(syncAuthorAvatar, delay));
})();

/* Mobile drawer controls and clear auth actions. */
(() => {
  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }
  function sidebar() {
    return document.querySelector('#side');
  }
  function menuButton() {
    return document.querySelector('#menu');
  }
  function syncDrawerState(open) {
    const side = sidebar();
    const menu = menuButton();
    if (!side || !menu) return;
    side.classList.toggle('open', open);
    document.body.classList.toggle('mobileDrawerOpen', open);
    menu.classList.toggle('isOpen', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Đóng menu điều hướng' : 'Mở menu điều hướng');
  }
  function ensureMobileAuthPanel() {
    const side = sidebar();
    if (!side || side.querySelector('.mobileAuthPanel')) return;
    const panel = document.createElement('div');
    panel.className = 'mobileAuthPanel';
    panel.innerHTML = '<div class="mobileAuthBadge">TÀI KHOẢN HỌC VIÊN</div><h4 class="mobileAuthTitle">Đăng nhập để lưu tiến độ học</h4><p class="mobileAuthDesc">Hoặc tạo tài khoản mới nếu anh chưa có tài khoản.</p><div class="mobileAuthButtons"><button type="button" class="mobileLoginBtn" data-mobile-login>Đăng nhập</button><button type="button" class="mobileRegisterBtn" data-mobile-register>Đăng ký</button></div>';
    const nav = side.querySelector('nav');
    if (nav) nav.before(panel);
    else side.appendChild(panel);
    panel.querySelector('[data-mobile-login]').addEventListener('click', e => {
      e.preventDefault();
      syncDrawerState(false);
      if (typeof openLogin === 'function') openLogin();
    });
    panel.querySelector('[data-mobile-register]').addEventListener('click', e => {
      e.preventDefault();
      syncDrawerState(false);
      const login = document.querySelector('#loginModal');
      const register = document.querySelector('#registerModal');
      if (login) login.classList.remove('open');
      if (register) register.classList.add('open');
    });
  }
  function syncMobileDrawerContent() {
    const storedSession = JSON.parse(localStorage.getItem('academy_session') || 'null');
    const activeSession = (typeof sessionUser !== 'undefined' && sessionUser) || window.sessionUser || storedSession;
    const users = JSON.parse(localStorage.getItem('academy_users') || '{}');
    const members = JSON.parse(localStorage.getItem('academy_members') || '[]');
    const logged = !!(activeSession?.email && (users[activeSession.email] || members.some(m => m.email === activeSession.email)));
    if (activeSession?.email && !logged) {
      localStorage.removeItem('academy_session');
      if (typeof sessionUser !== 'undefined') sessionUser = null;
      window.sessionUser = null;
    }
    const side = sidebar();
    if (!side) return;
    side.classList.toggle('isLoggedIn', logged);
    side.classList.toggle('isGuest', !logged);
    const panel = side.querySelector('.mobileAuthPanel');
    if (panel) { panel.hidden = logged; panel.style.setProperty('display', logged ? 'none' : 'flex', 'important'); }
    const profile = side.querySelector('.profile');
    if (profile) {
      if (logged) {
        profile.style.removeProperty('display');
      } else {
        profile.style.setProperty('display', 'none', 'important');
      }
    }
    const overall = side.querySelector('.overall');
    if (overall) {
      if (logged) {
        overall.style.removeProperty('display');
      } else {
        overall.style.setProperty('display', 'none', 'important');
      }
    }
  }
  document.addEventListener('DOMContentLoaded', ensureMobileAuthPanel);
  document.addEventListener('DOMContentLoaded', syncMobileDrawerContent);
  setTimeout(() => {
    ensureMobileAuthPanel();
    syncMobileDrawerContent();
  }, 100);
  setInterval(syncMobileDrawerContent, 700);
  document.addEventListener('click', e => {
    const menu = menuButton();
    const side = sidebar();
    if (!menu || !side) return;
    if (e.target.closest('#menu')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      syncDrawerState(!side.classList.contains('open'));
      setTimeout(syncMobileDrawerContent, 20);
      return;
    }
    if (e.target.closest('#closeSide')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      syncDrawerState(false);
      setTimeout(syncMobileDrawerContent, 20);
      return;
    }
    if (isMobile() && side.classList.contains('open') && !e.target.closest('#side')) {
      syncDrawerState(false);
    }
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') syncDrawerState(false);
  });
  window.addEventListener('resize', () => {
    if (!isMobile()) syncDrawerState(false);
  });
})();


/* ==========================================================================
   CHECKPOINT 23: 3-TIER ACCESS CONTROL LOGIC (GUEST -> MEMBER -> VIP 999K)
   ========================================================================== */
(() => {
  function getUserTier() {
    const storedSession = JSON.parse(localStorage.getItem('academy_session') || 'null');
    const activeUser = (typeof sessionUser !== 'undefined' && sessionUser) || window.sessionUser || storedSession;
    if (!activeUser || !activeUser.email) return 'guest'; // I. KHÁCH
    const users = JSON.parse(localStorage.getItem('academy_users') || '{}');
    const plans = JSON.parse(localStorage.getItem('academy_access') || '{}');
    const email = activeUser.email;
    const role = users[email]?.role || 'member';
    if (role === 'admin') return 'vip'; // Admin has full VIP access
    const plan = plans[email] || users[email]?.plan || 'starter';
    if (plan === '999k' || plan === 'mentoring' || plan === 'premium' || plan === 'vip') {
      return 'vip'; // III. HỌC VIÊN PREMIUM 999K
    }
    return 'member'; // II. THÀNH VIÊN
  }

  function ensureUpgradeModal() {
    if (document.querySelector('#upgrade999Modal')) return;
    const modal = document.createElement('div');
    modal.className = 'upgrade999Modal';
    modal.id = 'upgrade999Modal';
    modal.innerHTML = `
      <div class="upgradeShade" data-close-upgrade></div>
      <div class="upgradeCard">
        <button type="button" class="upgradeClose" data-close-upgrade>×</button>
        <div class="upgradeIcon">♕</div>
        <span class="upgradeBadge">HỌC VIỆN THỰC CHIẾN MASTERCLASS</span>
        <h2>Khóa Học Premium 999.000đ</h2>
        <p>Nâng cấp tài khoản Học Viên Premium để mở khóa 100% các bài giảng thực chiến chuyên sâu (Chương 1 – Chương 5) & tải trọn bộ biểu mẫu kinh doanh VIP từ Giảng viên Nguyễn Ngọc Giàu.</p>
        <div class="upgradeBenefits">
          <div>✓ Xem không giới hạn toàn bộ video thực chiến Masterclass</div>
          <div>✓ Tải về bộ công cụ, checklist và biểu mẫu kinh doanh VIP</div>
          <div>✓ Hỗ trợ hỏi đáp Q&A ưu tiên 1-1 trực tiếp</div>
        </div>
        <button type="button" class="primary upgradeCta" id="upgrade999Action">🚀 Kích Hoạt Khóa Học Premium 999.000đ Ngay</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-close-upgrade]').forEach(el => {
      el.onclick = () => modal.classList.remove('open');
    });
    modal.querySelector('#upgrade999Action').onclick = () => {
      modal.classList.remove('open');
      const activeUser = (typeof sessionUser !== 'undefined' && sessionUser) || window.sessionUser;
      if (activeUser && activeUser.email) {
        // Automatically grant 999k demo/instant activation or guide user
        const plans = JSON.parse(localStorage.getItem('academy_access') || '{}');
        plans[activeUser.email] = '999k';
        localStorage.setItem('academy_access', JSON.stringify(plans));
        if (typeof toast === 'function') toast('🎉 Chúc mừng bạn đã kích hoạt Khóa Học Premium 999k thành công!');
        if (typeof refreshAccount === 'function') refreshAccount();
      } else {
        if (typeof openLogin === 'function') openLogin();
      }
    };
  }

  document.addEventListener('click', e => {
    const lessonBtn = e.target.closest('.lesson button, .videoCard button.thumb, .videoCard button');
    if (!lessonBtn) return;
    const tier = getUserTier();
    // I. KHÁCH -> Require login
    if (tier === 'guest') {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (typeof openLogin === 'function') openLogin();
      if (typeof toast === 'function') toast('Vui lòng đăng nhập hoặc tạo tài khoản để học tiếp');
      return;
    }
    // II. THÀNH VIÊN -> Can access Starter/Free lessons, prompt Upgrade 999k for VIP chapters
    if (tier === 'member') {
      const card = lessonBtn.closest('.lesson, .videoCard');
      const isLocked = card && (card.classList.contains('accessLocked') || card.getAttribute('data-plan') === '999k' || card.getAttribute('data-plan') === 'mentoring');
      if (isLocked) {
        e.preventDefault();
        e.stopImmediatePropagation();
        ensureUpgradeModal();
        document.querySelector('#upgrade999Modal')?.classList.add('open');
      }
    }
    // III. VIP 999K -> Full 100% unrestricted access
  }, true);

  document.addEventListener('DOMContentLoaded', ensureUpgradeModal);
  setTimeout(ensureUpgradeModal, 500);
})();


/* ==========================================================================
   CHECKPOINT 24: SYNC HERO BANNER FROM ADMIN CONTENT
   ========================================================================== */
(() => {
  function syncHeroBannerWithAdmin() {
    const stored = JSON.parse(localStorage.getItem('academy_content') || '[]');
    if (!stored || !stored.length) return;
    // Find article 101 or first Bài viết khoa học
    const item101 = stored.find(x => x.id === 101 || x.title?.includes('5 bước') || x.type === 'Bài viết khoa học');
    if (item101) {
      const slide1 = document.querySelector('.homeSlide:nth-child(1)');
      if (slide1) {
        const titleEl = slide1.querySelector('h1');
        const descEl = slide1.querySelector('p');
        const tagEl = slide1.querySelector('.slideTag');
        if (titleEl && item101.title) titleEl.textContent = item101.title;
        if (descEl && item101.summary) descEl.textContent = item101.summary;
        if (tagEl && item101.category) tagEl.textContent = '● BÀI VIẾT MỚI · ' + item101.category.toUpperCase();
      }
      // Also update articles array so modal displays edited content
      if (typeof articles !== 'undefined' && articles[0]) {
        articles[0].title = item101.title || articles[0].title;
        articles[0].category = item101.category || articles[0].category;
        articles[0].content = item101.content || articles[0].content;
      }
    }
  }
  document.addEventListener('DOMContentLoaded', syncHeroBannerWithAdmin);
  setTimeout(syncHeroBannerWithAdmin, 300);
})();


/* ==========================================================================
   CHECKPOINT 25: COMPLETE HERO BANNER & ARTICLE SYNC FROM ADMIN
   ========================================================================== */
(() => {
  function syncAllHeroSlidesAndArticles() {
    const stored = JSON.parse(localStorage.getItem('academy_content') || '[]');
    if (!stored || !stored.length) return;

    // Get all scientific articles or published items
    const slideItems = stored.filter(x => x.status !== 'draft' && (x.type === 'Bài viết khoa học' || x.type === 'Bài viết' || x.title?.includes('bước') || x.title?.includes('thương hiệu') || x.title?.includes('thời gian')));
    if (!slideItems.length) return;

    const slides = document.querySelectorAll('.homeSlide');
    slides.forEach((slideEl, idx) => {
      const item = slideItems[idx] || slideItems[0];
      if (!item) return;

      // Update background image
      if (item.image) {
        slideEl.style.backgroundImage = `linear-gradient(90deg, rgba(5,42,47,0.95) 0%, rgba(5,42,47,0.76) 38%, rgba(5,42,47,0.2) 100%), url('${item.image}')`;
      }
      // Update Category Tag
      const tagEl = slideEl.querySelector('.slideTag');
      if (tagEl && item.category) {
        tagEl.textContent = '● BÀI VIẾT MỚI · ' + item.category.toUpperCase();
      }
      // Update Title (h1)
      const h1El = slideEl.querySelector('h1');
      if (h1El && item.title) {
        h1El.textContent = item.title;
      }
      // Update Summary (p)
      const pEl = slideEl.querySelector('p');
      if (pEl && item.summary) {
        pEl.textContent = item.summary;
      }
      // Update Date / Read time
      const metaEl = slideEl.querySelector('.slideMeta');
      if (metaEl) {
        metaEl.textContent = '8 phút đọc · ' + (item.date || '08/07/2026');
      }

      // Sync into global articles array so modal opens edited content
      if (typeof articles !== 'undefined' && articles[idx]) {
        articles[idx].title = item.title || articles[idx].title;
        articles[idx].category = item.category || articles[idx].category;
        articles[idx].date = item.date || articles[idx].date;
        articles[idx].image = item.image || articles[idx].image;
        articles[idx].content = item.content || item.summary || articles[idx].content;
      }
    });

    // Also re-render published grid if function exists
    if (typeof renderManaged === 'function') {
      renderManaged();
    }
  }

  document.addEventListener('DOMContentLoaded', syncAllHeroSlidesAndArticles);
  window.addEventListener('storage', syncAllHeroSlidesAndArticles);
  setTimeout(syncAllHeroSlidesAndArticles, 100);
  setTimeout(syncAllHeroSlidesAndArticles, 600);
})();


/* ==========================================================================
   CHECKPOINT 26: BULLETPROOF EXACT ID SYNC FOR HERO BANNER & ARTICLES
   ========================================================================== */
(() => {
  function formatArticleHTML(text) {
    if (!text) return '<p>Nội dung đang được cập nhật...</p>';
    if (text.includes('<p>') || text.includes('<h3>') || text.includes('<div>') || text.includes('<br>')) return text;
    return text.split(/\n+/).map(p => '<p>' + p.trim() + '</p>').join('');
  }

  function syncExactAdminArticles() {
    const stored = JSON.parse(localStorage.getItem('academy_content') || '[]');
    if (!stored || !stored.length) return;

    const targetIds = [101, 102, 103];
    const slides = document.querySelectorAll('.homeSlide');

    targetIds.forEach((id, idx) => {
      // Find item exactly by ID or by matching title keywords, fallback to stored[idx]
      let item = stored.find(x => Number(x.id) === id);
      if (!item && idx === 0) item = stored.find(x => x.title?.includes('5 bước'));
      if (!item && idx === 1) item = stored.find(x => x.title?.includes('video'));
      if (!item && idx === 2) item = stored.find(x => x.title?.includes('thời gian') || x.title?.includes('hiệu suất'));
      if (!item) item = stored[idx];
      if (!item) return;

      // 1. Update Hero Banner Slide DOM
      const slideEl = slides[idx];
      if (slideEl) {
        if (item.image) {
          slideEl.style.backgroundImage = 'linear-gradient(90deg, rgba(5,42,47,0.95) 0%, rgba(5,42,47,0.76) 38%, rgba(5,42,47,0.2) 100%), url("' + item.image + '")';
        }
        const tagEl = slideEl.querySelector('.slideTag');
        if (tagEl && item.category) tagEl.textContent = '● BÀI VIẾT MỚI · ' + item.category.toUpperCase();

        const h1El = slideEl.querySelector('h1');
        if (h1El && item.title) h1El.textContent = item.title;

        const pEl = slideEl.querySelector('p');
        if (pEl && (item.summary || item.content)) {
          pEl.textContent = item.summary || item.content.replace(/<[^>]*>/g, '').slice(0, 140) + '...';
        }
      }

      // 2. Update Global articles array for modal reader
      if (typeof articles !== 'undefined' && articles[idx]) {
        articles[idx].title = item.title || articles[idx].title;
        articles[idx].category = item.category || articles[idx].category;
        articles[idx].date = item.date || articles[idx].date;
        articles[idx].image = item.image || articles[idx].image;
        articles[idx].content = formatArticleHTML(item.content || item.summary || articles[idx].content);
      }
    });

    if (typeof renderManaged === 'function') {
      renderManaged();
    }
  }

  // Run on load, on storage event, and on window focus
  document.addEventListener('DOMContentLoaded', syncExactAdminArticles);
  window.addEventListener('storage', syncExactAdminArticles);
  window.addEventListener('focus', syncExactAdminArticles);
  setTimeout(syncExactAdminArticles, 50);
  setTimeout(syncExactAdminArticles, 400);
})();





/* Codex stability pass: one clear mobile drawer/auth/profile controller.
   Keeps existing data and Firebase logic intact, but prevents older UI layers
   from showing logged-in progress/profile blocks to guests on phones. */
(() => {
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const isPhone = () => window.matchMedia('(max-width: 768px)').matches;

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function getSession() {
    return window.sessionUser || (typeof sessionUser !== 'undefined' ? sessionUser : null) || readJson('academy_session', null);
  }

  function knownUser(session) {
    if (!session || !session.email) return null;
    const users = readJson('academy_users', {});
    const members = readJson('academy_members', []);
    return users[session.email] || members.find(m => m.email === session.email) || null;
  }

  function isLoggedIn() {
    return !!knownUser(getSession());
  }

  function closeDrawer() {
    const side = qs('#side');
    const menu = qs('#menu');
    side?.classList.remove('open');
    document.body.classList.remove('mobileDrawerOpen');
    menu?.classList.remove('isOpen');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Mở menu điều hướng');
  }

  function openDrawer() {
    const side = qs('#side');
    const menu = qs('#menu');
    if (!side || !menu) return;
    side.classList.add('open');
    document.body.classList.add('mobileDrawerOpen');
    menu.classList.add('isOpen');
    menu.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-label', 'Đóng menu điều hướng');
    syncSidebar();
  }

  function ensureGuestCard(side) {
    let card = side.querySelector('.mobileAuthPanel');
    if (card) return card;
    card = document.createElement('section');
    card.className = 'mobileAuthPanel';
    card.innerHTML = [
      '<span class="mobileAuthBadge">TÀI KHOẢN HỌC VIÊN</span>',
      '<b class="mobileAuthTitle">Đăng nhập để lưu tiến độ học</b>',
      '<p class="mobileAuthDesc">Tạo tài khoản miễn phí nếu anh chưa có tài khoản.</p>',
      '<div class="mobileAuthButtons">',
      '<button type="button" data-mobile-login>Đăng nhập</button>',
      '<button type="button" data-mobile-register>Đăng ký</button>',
      '</div>'
    ].join('');
    const nav = side.querySelector('nav');
    (nav || side).before(card);
    return card;
  }

  function syncSidebar() {
    const side = qs('#side');
    if (!side) return;
    const logged = isLoggedIn();
    const mobile = isPhone();
    const guestCard = ensureGuestCard(side);
    side.classList.toggle('isMobileViewport', mobile);
    side.classList.toggle('isDesktopViewport', !mobile);
    side.classList.toggle('isLoggedIn', logged);
    side.classList.toggle('isGuest', !logged);
    guestCard.hidden = logged || !mobile;
    guestCard.style.setProperty('display', (!logged && mobile) ? 'block' : 'none', 'important');

    const profile = side.querySelector('.profile');
    const overall = side.querySelector('.overall');
    if (profile) profile.style.setProperty('display', logged ? 'grid' : 'none', 'important');
    if (overall) overall.style.setProperty('display', logged ? 'flex' : 'none', 'important');

    qsa('#registerButton,#memberButton,.memberButton').forEach(btn => {
      btn.style.display = logged ? 'none' : '';
    });
  }

  document.addEventListener('click', event => {
    const side = qs('#side');
    if (!side) return;

    if (event.target.closest('#menu')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      side.classList.contains('open') ? closeDrawer() : openDrawer();
      return;
    }

    if (event.target.closest('#closeSide')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeDrawer();
      return;
    }

    if (event.target.closest('[data-mobile-login]')) {
      event.preventDefault();
      closeDrawer();
      if (typeof openLogin === 'function') openLogin();
      return;
    }

    if (event.target.closest('[data-mobile-register]')) {
      event.preventDefault();
      closeDrawer();
      qs('#loginModal')?.classList.remove('open');
      qs('#registerModal')?.classList.add('open');
      return;
    }

    if (isPhone() && side.classList.contains('open') && !event.target.closest('#side')) {
      closeDrawer();
    }
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDrawer();
  });

  window.addEventListener('resize', () => {
    if (!isPhone()) closeDrawer();
    syncSidebar();
  });
  window.addEventListener('storage', syncSidebar);
  document.addEventListener('DOMContentLoaded', syncSidebar);
  [60, 250, 800, 1500].forEach(delay => setTimeout(syncSidebar, delay));
  setInterval(syncSidebar, 1200);
})();

// --- AI Chatbot Logic ---
(()=>{
  const btn = document.querySelector('#aiChatBtn');
  const panel = document.querySelector('#aiChatPanel');
  const close = document.querySelector('#closeAiChat');
  const form = document.querySelector('#aiChatForm');
  const input = document.querySelector('#aiInput');
  const msgs = document.querySelector('#aiChatMessages');
  if(!btn || !panel) return;
  
  btn.onclick = () => {
    panel.classList.toggle('open');
    if(panel.classList.contains('open')) input.focus();
  };
  close.onclick = () => panel.classList.remove('open');
  
  const replies = [
    "Dạ, phần này anh có thể xem chi tiết ở lộ trình khóa học Kinh Doanh & Xây Kênh nhé!",
    "Một câu hỏi rất hay! Để giải quyết vấn đề này, anh có thể áp dụng nguyên tắc 3 giây đầu tiên trong video.",
    "Anh cứ làm theo lộ trình từng bước trong khóa học, mọi thứ sẽ dễ dàng hơn nhiều.",
    "Tôi là Trợ giảng AI. Câu hỏi này tôi xin ghi nhận để báo cho giảng viên Nguyễn Ngọc Giàu giải đáp thêm nhé!",
    "Anh hãy thử kết hợp CapCut với một vài tính năng của TikTok để có hiệu ứng tốt nhất.",
    "Nếu gặp khó khăn, anh có thể đặt câu hỏi trong nhóm hỗ trợ học viên nhé!"
  ];
  
  function addMessage(text, isUser = false) {
    const msg = document.createElement('div');
    msg.className = 'aiMessage ' + (isUser ? 'user' : 'ai');
    msg.innerHTML = '<div class="aiAvatar">' + (isUser ? 'HV' : '✨') + '</div><div class="aiText">' + text + '</div>';
    msgs.appendChild(msg);
    msgs.scrollTop = msgs.scrollHeight;
  }
  
  form.onsubmit = e => {
    e.preventDefault();
    const val = input.value.trim();
    if(!val) return;
    addMessage(val, true);
    input.value = '';
    
    // Simulate AI thinking
    setTimeout(() => {
      const reply = replies[Math.floor(Math.random() * replies.length)];
      addMessage(reply, false);
    }, 800 + Math.random() * 1000);
  };
})();
