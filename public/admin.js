
// ONE-TIME ONLY seeding of academy_content
(() => {
  if (localStorage.getItem('academy_content_seeded_v3') === 'true' || localStorage.getItem('academy_content') !== null) {
    return; // Already initialized, never resurrect deleted items on F5!
  }
  const allEdu = [
    {id:101, type:"Bài viết khoa học", category:"KINH DOANH", title:"5 bước xây dựng chiến lược kinh doanh bền vững", date:"01/07/2026", summary:"Một chiến lược tốt không bắt đầu bằng việc làm thật nhiều, mà bắt đầu từ việc lựa chọn đúng hướng đi.", image:"assets/slide-business.png", accessPlan:"public", status:"published", views:"4.2k", likes:"890", content:"<p>Một chiến lược tốt không bắt đầu bằng việc làm thật nhiều, mà bắt đầu từ việc lựa chọn đúng hướng đi...</p>"},
    {id:102, type:"Bài viết khoa học", category:"CONTENT & VIDEO", title:"Xây thương hiệu cá nhân bằng video ngắn", date:"30/06/2026", summary:"Video ngắn là cách nhanh nhất để khách hàng nhìn thấy năng lực, cá tính và quan điểm của bạn.", image:"assets/slide-content.png", accessPlan:"public", status:"published", views:"5.8k", likes:"1.4k", content:"<p>Video ngắn là cách nhanh nhất để khách hàng nhìn thấy năng lực...</p>"},
    {id:103, type:"Bài viết khoa học", category:"PHÁT TRIỂN BẢN THÂN", title:"Làm chủ thời gian, nâng tầm hiệu suất", date:"29/06/2026", summary:"Quản trị thời gian thực chất là quản trị sự tập trung và năng lượng.", image:"assets/slide-growth.png", accessPlan:"public", status:"published", views:"3.9k", likes:"760", content:"<p>Quản trị thời gian thực chất là quản trị sự tập trung và năng lượng...</p>"},
    {id:104, type:"Ghi chú học tập", category:"VIDEO & SALE", title:"Công thức 3 giây đầu video", date:"27/06/2026", summary:"Cách giữ chân người xem ngay trong 3 giây đầu tiên bằng câu hook thu hút.", image:"assets/slide-content.png", accessPlan:"starter", status:"published", views:"2.1k", likes:"510", content:"<p>3 giây đầu tiên quyết định 80%...</p>"},
    {id:105, type:"Ghi chú học tập", category:"KINH DOANH", title:"Quy tắc định giá sản phẩm", date:"26/06/2026", summary:"Phương pháp tính giá bán dựa trên giá trị cảm nhận thay vì chi phí sản xuất.", image:"assets/slide-business.png", accessPlan:"pro", status:"published", views:"1.9k", likes:"430", content:"<p>Đừng cạnh tranh bằng giá rẻ...</p>"},
    {id:106, type:"Ghi chú học tập", category:"PHÁT TRIỂN BẢN THÂN", title:"Quản lý năng lượng cá nhân", date:"24/06/2026", summary:"Bí quyết duy trì năng lượng đỉnh cao trong suốt chuỗi ngày làm việc.", image:"assets/slide-growth.png", accessPlan:"vip", status:"published", views:"3.1k", likes:"680", content:"<p>Ngủ đủ giấc, vận động nhẹ...</p>"}
  ];
  localStorage.setItem('academy_content', JSON.stringify(allEdu));
  localStorage.setItem('academy_content_seeded_v3', 'true');
})();

const $=s=>document.querySelector(s);let contents=JSON.parse(localStorage.getItem("academy_content")||"[]");const editor=$("#contentEditor"),form=$("#contentForm");function toast(s){$("#toast").textContent=s;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),2200)}function stats(){const users=Object.keys(JSON.parse(localStorage.getItem("academy_users")||"{}")).length;$("#studentStat").textContent=users;$("#contentStat").textContent=contents.filter(x=>x.status!=="draft").length;let questions=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("academy_qa_"))questions+=JSON.parse(localStorage.getItem(k)||"[]").length}$("#questionStat").textContent=questions}function render(term=""){const data=contents.filter(x=>x.title.toLowerCase().includes(term.toLowerCase()));$("#adminContentList").innerHTML=data.length?data.slice().reverse().map(x=>'<div class="adminRow"><span><b>'+x.title+'</b><small>'+x.summary+'</small></span><span><i>'+(x.type==="Video"?"▶":"✎")+'</i>'+x.type+'</span><span>'+x.date+'</span><span><em class="'+(x.status==="draft"?"draft":"published")+'">'+(x.status==="draft"?"Bản nháp":"Đã xuất bản")+'</em></span><span><button data-edit="'+x.id+'">Sửa</button><button class="danger" data-delete="'+x.id+'">Xóa</button></span></div>').join(""):'<div class="adminEmpty">Chưa có nội dung phù hợp.</div>';stats()}function openEditor(item){form.reset();$("#editId").value=item?item.id:"";$("#editType").value=item?item.type:"Bài viết";$("#editStatus").value=item?item.status||"published":"published";$("#editTitle").value=item?item.title:"";$("#editSummary").value=item?item.summary:"";$("#editContent").value=item?item.content||"":"";$("#editImage").value=item?item.image||"":"";$("#editVideo").value=item?item.video||"":"";editor.classList.add("open")}function closeEditor(){editor.classList.remove("open")}$("#newContent").onclick=()=>openEditor();document.querySelectorAll("[data-close-editor]").forEach(x=>x.onclick=closeEditor);form.onsubmit=e=>{e.preventDefault();const id=$("#editId").value||Date.now();const item={id:Number(id),type:$("#editType").value,status:$("#editStatus").value,title:$("#editTitle").value.trim(),summary:$("#editSummary").value.trim(),content:$("#editContent").value.trim(),image:$("#editImage").value.trim(),video:$("#editVideo").value.trim(),date:new Date().toLocaleDateString("vi-VN")};const at=contents.findIndex(x=>String(x.id)===String(id));if(at>=0)contents[at]=item;else contents.push(item);localStorage.setItem("academy_content",JSON.stringify(contents));closeEditor();render();toast("Đã lưu nội dung thành công")};document.addEventListener("click",e=>{const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");if(edit)openEditor(contents.find(x=>String(x.id)===edit.dataset.edit));if(del&&confirm("Xóa nội dung này?")){contents=contents.filter(x=>String(x.id)!==del.dataset.delete);localStorage.setItem("academy_content",JSON.stringify(contents));render();toast("Đã xóa nội dung")}});$("#adminSearch").oninput=e=>render(e.target.value);document.querySelectorAll(".adminSide nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".adminSide nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");toast("Đang mở: "+b.textContent.trim())});render();

// Customer database management
(()=>{const $=s=>document.querySelector(s);function members(){return JSON.parse(localStorage.getItem('academy_members')||'[]')}function renderMembers(term=''){const all=members(),data=all.filter(x=>(x.name+' '+x.email+' '+x.phone).toLowerCase().includes(term.toLowerCase()));$('#totalMembers').textContent=all.length;$('#proMembers').textContent=all.filter(x=>x.plan!=='Starter').length;const today=new Date().toLocaleDateString('vi-VN');$('#newMembers').textContent=all.filter(x=>x.dateKey===today).length;$('#memberList').innerHTML=data.length?data.slice().reverse().map(x=>'<div class="memberRow"><span><b>'+x.name+'</b><small>'+x.id+'</small></span><span><b>'+x.email+'</b><small>'+x.phone+'</small></span><span>'+x.plan+'</span><span>'+x.registeredAt+'</span><span><i class="statusActive">Đang hoạt động</i></span></div>').join(''):'<div class="adminEmpty">Chưa có khách hàng đăng ký.</div>'}$('#memberSearch')?.addEventListener('input',e=>renderMembers(e.target.value));$('#exportMembers')?.addEventListener('click',()=>{const rows=[['Mã','Họ tên','Email','Điện thoại','Gói','Mục tiêu','Nguồn','Ngày đăng ký'],...members().map(x=>[x.id,x.name,x.email,x.phone,x.plan,x.goal,x.source,x.registeredAt])],csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(',')).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='danh-sach-thanh-vien.csv';a.click();URL.revokeObjectURL(a.href)});renderMembers()})();

// Rich content routing and media preview
(()=>{const $=s=>document.querySelector(s);function preview(){const image=$('#editImage')?.value.trim(),video=$('#editVideo')?.value.trim(),box=$('#mediaPreview');if(!box)return;if(video){const m=video.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/);box.innerHTML=m?'<iframe src="https://www.youtube-nocookie.com/embed/'+m[1]+'"></iframe>':'<span>Link video đã được nhập</span>'}else if(image)box.innerHTML='<img src="'+image+'" onerror="this.parentElement.innerHTML=\'<span>Không tải được ảnh. Kiểm tra lại URL.</span>\'">';else box.innerHTML='<span>Xem trước ảnh/video sẽ hiển thị tại đây</span>'}$('#editImage')?.addEventListener('input',preview);$('#editVideo')?.addEventListener('input',preview);const oldOpen=openEditor;openEditor=function(item){oldOpen(item);$('#editCategory').value=item?.category||'Kinh doanh';$('#editPlacement').value=item?.placement||'homepage';preview()};const f=$('#contentForm');if(f)f.onsubmit=e=>{e.preventDefault();const id=$('#editId').value||Date.now(),item={id:Number(id),type:$('#editType').value,status:$('#editStatus').value,category:$('#editCategory').value,placement:$('#editPlacement').value,title:$('#editTitle').value.trim(),summary:$('#editSummary').value.trim(),content:$('#editContent').value.trim(),image:$('#editImage').value.trim(),video:$('#editVideo').value.trim(),date:new Date().toLocaleDateString('vi-VN')},at=contents.findIndex(x=>String(x.id)===String(id));if(at>=0)contents[at]=item;else contents.push(item);localStorage.setItem('academy_content',JSON.stringify(contents));closeEditor();render();toast('Đã xuất bản đúng vị trí trên trang chủ')};})();

// Upload processing, admin Q&A and role/package permissions
(()=>{const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);let imageData='';const file=$('#editImageFile');async function compressImage(f){if(f.size>5*1024*1024)throw Error('Ảnh vượt quá 5MB');const data=await new Promise((ok,no)=>{const r=new FileReader;r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f)}),img=await new Promise((ok,no)=>{const i=new Image;i.onload=()=>ok(i);i.onerror=no;i.src=data}),scale=Math.min(1,1600/img.width),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.82)}file?.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{imageData=await compressImage(f);$('#editImageData').value=imageData;$('#editImage').value='';$('#mediaPreview').innerHTML='<img src="'+imageData+'" alt="Xem trước ảnh tải lên">';toast('Đã tải và tối ưu ảnh')}catch(err){toast(err.message||'Không thể xử lý ảnh')}});$('#editImage')?.addEventListener('input',()=>{imageData='';const d=$('#editImageData');if(d)d.value=''});const oldOpen2=openEditor;openEditor=function(item){oldOpen2(item);imageData=item?.image?.startsWith('data:')?item.image:'';$('#editImageData').value=imageData;$('#editAccess').value=item?.accessPlan||'public'};const form2=$('#contentForm');if(form2)form2.onsubmit=e=>{e.preventDefault();const id=$('#editId').value||Date.now(),image=imageData||$('#editImage').value.trim(),item={id:Number(id),type:$('#editType').value,status:$('#editStatus').value,category:$('#editCategory').value,placement:$('#editPlacement').value,accessPlan:$('#editAccess').value,title:$('#editTitle').value.trim(),summary:$('#editSummary').value.trim(),content:$('#editContent').value.trim(),image,video:$('#editVideo').value.trim(),date:new Date().toLocaleDateString('vi-VN')},at=contents.findIndex(x=>String(x.id)===String(id));if(at>=0)contents[at]=item;else contents.push(item);try{localStorage.setItem('academy_content',JSON.stringify(contents))}catch{toast('Ảnh quá lớn. Hãy chọn ảnh nhỏ hơn');return}closeEditor();render();toast('Đã lưu nội dung và phân quyền hiển thị')};
let qFilter='all';function getQuestions(){const out=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('academy_qa_')){const lesson=k.replace('academy_qa_','');JSON.parse(localStorage.getItem(k)||'[]').forEach((q,index)=>out.push({...q,lesson,key:k,index}))}}return out.sort((a,b)=>(b.id||0)-(a.id||0))}function renderQuestions(){const all=getQuestions(),pending=all.filter(x=>!x.reply);$('#adminQuestionBadge').textContent=pending.length;const nav=$('[data-panel="questions"]');if(nav){let badge=nav.querySelector('.navQuestionBadge');if(!badge){badge=document.createElement('i');badge.className='navQuestionBadge';nav.appendChild(badge)}badge.textContent=pending.length;badge.style.display=pending.length?'inline-grid':'none'}const data=all.filter(x=>qFilter==='all'||(qFilter==='pending'?!x.reply:!!x.reply));$('#adminQuestionList').innerHTML=data.length?data.map(x=>'<article class="adminQuestion"><div class="adminQAvatar">'+(x.name||'HV').split(' ').pop().slice(0,2).toUpperCase()+'</div><div><h3>'+x.name+'</h3><div class="qMeta">Bài học: '+x.lesson+' · '+(x.date||'')+'</div><p>'+x.text+'</p>'+(x.reply?'<div class="instructorReply"><b>Phản hồi:</b> '+x.reply+'</div>':'<div class="adminReply"><textarea data-reply-text placeholder="Nhập phản hồi cho học viên..."></textarea><button data-admin-reply="'+x.key+'|'+x.index+'">Gửi phản hồi</button></div>')+'</div><span class="qStatus '+(x.reply?'answered':'pending')+'">'+(x.reply?'Đã phản hồi':'Chờ phản hồi')+'</span></article>').join(''):'<div class="adminEmpty">Không có câu hỏi trong mục này.</div>'}$$('[data-qfilter]').forEach(b=>b.onclick=()=>{$$('[data-qfilter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');qFilter=b.dataset.qfilter;renderQuestions()});document.addEventListener('click',e=>{const b=e.target.closest('[data-admin-reply]');if(!b)return;const text=b.parentElement.querySelector('[data-reply-text]').value.trim();if(!text){toast('Vui lòng nhập nội dung phản hồi');return}const [key,index]=b.dataset.adminReply.split('|'),arr=JSON.parse(localStorage.getItem(key)||'[]');arr[Number(index)].reply=text;arr[Number(index)].replyDate=new Date().toLocaleString('vi-VN');localStorage.setItem(key,JSON.stringify(arr));renderQuestions();toast('Đã gửi phản hồi tới học viên')});$('[data-panel="questions"]')?.addEventListener('click',()=>$('#questionWorkspace')?.scrollIntoView({behavior:'smooth'}));
function renderAccessMembers(){const members=JSON.parse(localStorage.getItem('academy_members')||'[]'),users=JSON.parse(localStorage.getItem('academy_users')||'{}'),access=JSON.parse(localStorage.getItem('academy_access')||'{}'),list=$('#memberList');if(!list)return;list.innerHTML=members.length?members.slice().reverse().map(x=>'<div class="memberRow"><span><b>'+x.name+'</b><small>'+x.id+'</small></span><span><b>'+x.email+'</b><small>'+x.phone+'</small></span><span>'+x.plan+'</span><span>'+x.registeredAt+'</span><span><i class="statusActive">Hoạt động</i></span><span class="roleControls"><select data-role="'+x.email+'"><option value="student" '+((users[x.email]?.role||'student')==='student'?'selected':'')+'>Học viên</option><option value="admin" '+(users[x.email]?.role==='admin'?'selected':'')+'>Quản trị viên</option></select><select data-access="'+x.email+'"><option value="starter" '+((access[x.email]||'starter')==='starter'?'selected':'')+'>Starter</option><option value="699k" '+(access[x.email]==='699k'?'selected':'')+'>Gói 699K</option><option value="999k" '+(access[x.email]==='999k'?'selected':'')+'>Gói 999K</option><option value="mentoring" '+(access[x.email]==='mentoring'?'selected':'')+'>Mentoring</option></select></span></div>').join(''):'<div class="adminEmpty">Chưa có thành viên.</div>'}document.addEventListener('change',e=>{if(e.target.matches('[data-role]')){const users=JSON.parse(localStorage.getItem('academy_users')||'{}'),email=e.target.dataset.role;users[email]=users[email]||{name:email,email};users[email].role=e.target.value;localStorage.setItem('academy_users',JSON.stringify(users));toast('Đã cập nhật vai trò')}if(e.target.matches('[data-access]')){const access=JSON.parse(localStorage.getItem('academy_access')||'{}');access[e.target.dataset.access]=e.target.value;localStorage.setItem('academy_access',JSON.stringify(access));toast('Đã cấp quyền gói học')}});renderQuestions();renderAccessMembers();setInterval(renderQuestions,5000)})();

// Admin notification bell
(()=>{const header=document.querySelector('.adminMain>header'),publish=document.querySelector('#newContent');if(!header||!publish||document.querySelector('#adminNotificationButton'))return;const actions=document.createElement('div');actions.className='adminHeaderActions';header.insertBefore(actions,publish);actions.appendChild(publish);const bell=document.createElement('button');bell.type='button';bell.id='adminNotificationButton';bell.className='adminNotificationButton';bell.innerHTML='<span>♢</span><i id="adminBellCount">0</i>';actions.insertBefore(bell,publish);const panel=document.createElement('div');panel.id='adminNotificationPanel';panel.className='adminNotificationPanel';panel.innerHTML='<header><div><small>TRUNG TÂM THÔNG BÁO</small><h3>Thông báo quản trị</h3></div><button type="button" id="adminMarkNotifications">Đánh dấu đã xem</button></header><div id="adminNotificationItems"></div><footer><button type="button" id="openAdminQuestions">Xem tất cả câu hỏi →</button></footer>';header.appendChild(panel);function collect(){const rows=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith('academy_qa_'))JSON.parse(localStorage.getItem(key)||'[]').forEach(q=>{if(!q.reply)rows.push({icon:'?',title:'Câu hỏi mới từ '+(q.name||'Học viên'),text:q.text||'',date:q.date||'',target:'questions'})})}const members=JSON.parse(localStorage.getItem('academy_members')||'[]');members.slice(-3).reverse().forEach(m=>rows.push({icon:'♙',title:'Thành viên mới: '+m.name,text:'Đăng ký gói '+m.plan,date:m.registeredAt||'',target:'students'}));const content=JSON.parse(localStorage.getItem('academy_content')||'[]');content.slice(-2).reverse().forEach(x=>rows.push({icon:'✦',title:'Nội dung: '+x.title,text:x.status==='draft'?'Bản nháp':'Đã xuất bản',date:x.date||'',target:'content'}));return rows}function renderBell(){const rows=collect(),seen=Number(localStorage.getItem('academy_admin_seen')||0),unread=Math.max(0,rows.length-seen),badge=document.querySelector('#adminBellCount');badge.textContent=unread;badge.style.display=unread?'grid':'none';document.querySelector('#adminNotificationItems').innerHTML=rows.length?rows.slice(0,8).map(x=>'<button type="button" data-admin-notice="'+x.target+'"><i>'+x.icon+'</i><span><b>'+x.title+'</b><small>'+x.text+'</small><em>'+x.date+'</em></span></button>').join(''):'<div class="adminNoticeEmpty">✓ Bạn đã xem hết thông báo</div>'}bell.onclick=e=>{e.stopPropagation();panel.classList.toggle('open');renderBell()};panel.onclick=e=>e.stopPropagation();document.addEventListener('click',()=>panel.classList.remove('open'));document.querySelector('#adminMarkNotifications').onclick=()=>{localStorage.setItem('academy_admin_seen',String(collect().length));renderBell();toast('Đã đánh dấu tất cả thông báo')};document.querySelector('#openAdminQuestions').onclick=()=>{panel.classList.remove('open');document.querySelector('[data-panel="questions"]')?.click()};panel.addEventListener('click',e=>{const b=e.target.closest('[data-admin-notice]');if(!b)return;panel.classList.remove('open');document.querySelector('[data-panel="'+b.dataset.adminNotice+'"]')?.click()});renderBell();setInterval(renderBell,5000)})();

// Quick-reply popup from admin notifications
(()=>{const panel=document.querySelector('#adminNotificationPanel');if(!panel||document.querySelector('#adminQuickReplyModal'))return;const modal=document.createElement('div');modal.id='adminQuickReplyModal';modal.className='adminQuickReplyModal';modal.innerHTML='<div class="adminReplyShade" data-close-quick-reply></div><form class="adminQuickReplyCard" id="adminQuickReplyForm"><button type="button" class="adminQuickReplyClose" data-close-quick-reply>×</button><div class="quickReplyHead"><div class="quickReplyIcon">?</div><div><span>PHẢN HỒI HỌC VIÊN</span><h2>Trả lời câu hỏi</h2></div></div><div class="quickStudent"><div id="quickStudentAvatar">HV</div><p><b id="quickStudentName">Học viên</b><small id="quickLessonName">Bài học</small><em id="quickQuestionDate"></em></p></div><blockquote id="quickQuestionText"></blockquote><label>Nội dung phản hồi<textarea id="quickReplyText" required placeholder="Nhập câu trả lời rõ ràng, hữu ích cho học viên..."></textarea></label><div class="quickReplyHint">✦ Học viên sẽ thấy phản hồi ngay bên dưới câu hỏi trong bài giảng.</div><footer><button type="button" data-close-quick-reply>Để sau</button><button type="submit">↗ Gửi phản hồi</button></footer><input type="hidden" id="quickReplyKey"><input type="hidden" id="quickReplyIndex"></form>';document.body.appendChild(modal);const close=()=>modal.classList.remove('open');modal.querySelectorAll('[data-close-quick-reply]').forEach(x=>x.onclick=close);function findQuestion(text){for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key?.startsWith('academy_qa_'))continue;const rows=JSON.parse(localStorage.getItem(key)||'[]'),index=rows.findIndex(q=>q.text===text&&!q.reply);if(index>=0)return{key,index,q:rows[index],lesson:key.replace('academy_qa_','')}}return null}function openReply(found){const {key,index,q,lesson}=found,name=q.name||'Học viên';document.querySelector('#quickStudentAvatar').textContent=name.split(' ').pop().slice(0,2).toUpperCase();document.querySelector('#quickStudentName').textContent=name;document.querySelector('#quickLessonName').textContent='Bài học: '+lesson;document.querySelector('#quickQuestionDate').textContent=q.date||'';document.querySelector('#quickQuestionText').textContent=q.text;document.querySelector('#quickReplyText').value='';document.querySelector('#quickReplyKey').value=key;document.querySelector('#quickReplyIndex').value=index;modal.classList.add('open');setTimeout(()=>document.querySelector('#quickReplyText').focus(),80)}panel.addEventListener('click',e=>{const b=e.target.closest('[data-admin-notice="questions"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const text=b.querySelector('small')?.textContent||'',found=findQuestion(text);if(found){panel.classList.remove('open');openReply(found)}else toast('Câu hỏi này đã được phản hồi')},true);document.querySelector('#adminQuickReplyForm').onsubmit=e=>{e.preventDefault();const key=document.querySelector('#quickReplyKey').value,index=Number(document.querySelector('#quickReplyIndex').value),text=document.querySelector('#quickReplyText').value.trim(),rows=JSON.parse(localStorage.getItem(key)||'[]');if(!rows[index]||!text){toast('Vui lòng nhập nội dung phản hồi');return}rows[index].reply=text;rows[index].replyDate=new Date().toLocaleString('vi-VN');localStorage.setItem(key,JSON.stringify(rows));close();if(typeof renderQuestions==='function')renderQuestions();document.querySelector('#adminMarkNotifications')?.click();toast('Đã gửi phản hồi tới học viên')}})();

// Unified account and membership role table
(()=>{const $=s=>document.querySelector(s);function unified(term=''){const users=JSON.parse(localStorage.getItem('academy_users')||'{}'),members=JSON.parse(localStorage.getItem('academy_members')||'[]'),access=JSON.parse(localStorage.getItem('academy_access')||'{}'),memberMap=Object.fromEntries(members.map(x=>[x.email,x])),emails=[...new Set([...Object.keys(users),...members.map(x=>x.email)])],rows=emails.map(email=>{const u=users[email]||{},m=memberMap[email]||{};return{email,name:u.name||m.name||email,phone:u.phone||m.phone||'',id:m.id||'Tài khoản',plan:m.plan||'Chưa mua gói',date:m.registeredAt||u.createdAt||'',role:u.role||'student',access:access[email]||'starter'}}).filter(x=>(x.name+' '+x.email+' '+x.phone).toLowerCase().includes(term.toLowerCase()));const list=$('#memberList');if(!list)return;$('#totalMembers').textContent=emails.length;$('#proMembers').textContent=rows.filter(x=>x.access!=='starter').length;list.innerHTML=rows.length?rows.reverse().map(x=>'<div class="memberRow"><span><b>'+x.name+'</b><small>'+x.id+'</small></span><span><b>'+x.email+'</b><small>'+x.phone+'</small></span><span>'+x.plan+'</span><span>'+x.date+'</span><span><i class="statusActive">Hoạt động</i></span><span class="roleControls"><select data-role="'+x.email+'"><option value="student" '+(x.role==='student'?'selected':'')+'>Học viên</option><option value="admin" '+(x.role==='admin'?'selected':'')+'>Quản trị viên</option></select><select data-access="'+x.email+'"><option value="starter" '+(x.access==='starter'?'selected':'')+'>Starter</option><option value="699k" '+(x.access==='699k'?'selected':'')+'>Gói 699K</option><option value="999k" '+(x.access==='999k'?'selected':'')+'>Gói 999K</option><option value="mentoring" '+(x.access==='mentoring'?'selected':'')+'>Mentoring</option></select></span></div>').join(''):'<div class="adminEmpty">Chưa có tài khoản học viên.</div>'}const search=$('#memberSearch');if(search)search.oninput=e=>unified(e.target.value);unified()})();
// Hard override for admin sidebar routing
(()=>{function applyAdminPanel(panel){const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),all=[$('.adminStats'),$('.adminWorkspace'),$('.questionWorkspace'),$('.memberWorkspace')];$$('.adminSide nav button').forEach(b=>b.classList.toggle('active',b.dataset.panel===panel));document.body.dataset.adminPanel=panel;all.forEach(el=>{if(el)el.hidden=true});({dashboard:all,content:[$('.adminWorkspace')],students:[$('.memberWorkspace')],questions:[$('.questionWorkspace')]}[panel]||all).forEach(el=>{if(el)el.hidden=false});const title=$('.adminMain>header h1');if(title)title.textContent=panel==='dashboard'?'Tổng quan quản trị':panel==='content'?'Quản lý bài viết & video':panel==='students'?'Học viên & phân quyền':'Câu hỏi học viên'}document.addEventListener('click',e=>{const btn=e.target.closest('.adminSide nav button[data-panel]');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();applyAdminPanel(btn.dataset.panel||'dashboard')},true);setTimeout(()=>applyAdminPanel('dashboard'),180);window.applyAdminPanel=applyAdminPanel})();
// Final admin UX controller: panels, editor, notifications, permission table
(()=>{const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),moneyPlans={public:'Công khai',none:'Chưa cấp quyền',course699:'699K - Khóa Kinh doanh',course999:'999K - Khóa Phát triển bản thân',all:'Toàn bộ khóa học'};function toUiAccess(v){return v==='699k'?'course699':v==='999k'?'course999':v==='mentoring'?'all':v==='starter'?'none':v||'public'}function toStoreAccess(v){return v==='course699'?'699k':v==='course999'?'999k':v==='all'?'mentoring':v==='none'?'starter':v}function contentStore(){return JSON.parse(localStorage.getItem('academy_content')||'[]').map(x=>({...x,accessPlan:toUiAccess(x.accessPlan),placement:x.placement||'homepage',category:x.category||'Kinh doanh'}))}function saveContentStore(rows){localStorage.setItem('academy_content',JSON.stringify(rows.map(x=>({...x,accessPlan:toStoreAccess(x.accessPlan)}))))}function normalizeContent(){const rows=contentStore();saveContentStore(rows);contents=JSON.parse(localStorage.getItem('academy_content')||'[]')}function setPanel(panel){$$('.adminSide nav button').forEach(b=>b.classList.toggle('active',b.dataset.panel===panel));document.body.dataset.adminPanel=panel;const all=[$('.adminStats'),$('.adminWorkspace'),$('.questionWorkspace'),$('.memberWorkspace')];all.forEach(el=>{if(el)el.hidden=true});({dashboard:all,content:[$('.adminWorkspace')],students:[$('.memberWorkspace')],questions:[$('.questionWorkspace')]}[panel]||all).forEach(el=>{if(el)el.hidden=false});const title=$('.adminMain>header h1');if(title)title.textContent=panel==='dashboard'?'Tổng quan quản trị':panel==='content'?'Quản lý bài viết & video':panel==='students'?'Học viên & phân quyền':'Câu hỏi học viên'}function setupPanels(){$$('.adminSide nav button').forEach(b=>{b.onclick=()=>setPanel(b.dataset.panel||'dashboard')});setPanel('dashboard')}function setupEditorOptions(){const access=$('#editAccess'),placement=$('#editPlacement'),category=$('#editCategory'),type=$('#editType');if(access)access.innerHTML='<option value="public">Công khai</option><option value="none">Chưa cấp quyền</option><option value="course699">699K - Khóa Kinh doanh</option><option value="course999">999K - Khóa Phát triển bản thân</option><option value="all">Toàn bộ khóa học</option>';if(placement)placement.innerHTML='<option value="homepage">Trang chủ - Nội dung mới</option><option value="curriculum">Chương trình học chi tiết</option><option value="video">Thư viện video</option><option value="featured">Nổi bật</option>';if(category)category.innerHTML='<option>Kinh doanh</option><option>Phát triển bản thân</option><option>Content & Video</option><option>Thông báo</option><option>Bài học</option>';if(type)type.innerHTML='<option>Bài viết</option><option>Video</option><option>Bài học</option><option>Thông báo</option>'}function renderContentFinal(term=''){normalizeContent();const rows=contentStore().filter(x=>(x.title+' '+(x.summary||'')+' '+(x.category||'')+' '+(x.placement||'')).toLowerCase().includes(term.toLowerCase())),list=$('#adminContentList');if(!list)return;const head=$('.adminTable .adminHead');if(head)head.innerHTML='<span>Nội dung</span><span>Loại</span><span>Phân quyền xem</span><span>Ngày đăng</span><span>Trạng thái</span><span>Thao tác</span>';list.innerHTML=rows.length?rows.slice().reverse().map(x=>'<div class="adminRow adminContentRow"><span><b>'+x.title+'</b><small>'+((x.summary||'').slice(0,120))+'</small><small class="adminRoute">'+(x.category||'Nội dung')+' · '+({homepage:'Trang chủ',curriculum:'Chương trình học',video:'Thư viện video',featured:'Nổi bật'}[x.placement]||x.placement)+'</small></span><span><i>'+(x.type==='Video'?'▶':'✎')+'</i>'+x.type+'</span><span>'+moneyPlans[x.accessPlan]+'</span><span>'+x.date+'</span><span><em class="'+(x.status==='draft'?'draft':'published')+'">'+(x.status==='draft'?'Bản nháp':'Đã xuất bản')+'</em></span><span><button data-edit="'+x.id+'">Sửa</button><button class="danger" data-delete="'+x.id+'">Xóa</button></span></div>').join(''):'<div class="adminEmpty">Chưa có nội dung phù hợp.</div>';stats()}function openEditorFinal(item){form.reset();const eid=$('#editImageData');if(eid)eid.value='';$('#editId').value=item?item.id:'';$('#editType').value=item?item.type:'Bài viết';$('#editStatus').value=item?item.status||'published':'published';$('#editCategory').value=item?item.category||'Kinh doanh':'Kinh doanh';$('#editPlacement').value=item?item.placement||'homepage':'homepage';$('#editAccess').value=item?toUiAccess(item.accessPlan):'public';$('#editTitle').value=item?item.title:'';$('#editSummary').value=item?item.summary:'';$('#editContent').value=item?item.content||'':'';$('#editImage').value=item?item.image||'':'';$('#editVideo').value=item?item.video||'':'';$('#editImageData').value=item?.image?.startsWith('data:')?item.image:'';editor.classList.add('open')}function closeEditorFinal(){editor.classList.remove('open')}function saveEditorFinal(e){e.preventDefault();const id=$('#editId').value||Date.now(),rows=contentStore(),item={id:Number(id),type:$('#editType').value,status:$('#editStatus').value,category:$('#editCategory').value,placement:$('#editPlacement').value,accessPlan:$('#editAccess').value,title:$('#editTitle').value.trim(),summary:$('#editSummary').value.trim(),content:$('#editContent').value.trim(),image: $('#editImage').value.trim() || $('#editImageData').value,video:$('#editVideo').value.trim(),date:new Date().toLocaleDateString('vi-VN')},at=rows.findIndex(x=>String(x.id)===String(id));if(at>=0)rows[at]=item;else rows.push(item);saveContentStore(rows);contents=JSON.parse(localStorage.getItem('academy_content')||'[]');closeEditorFinal();renderContentFinal($('#adminSearch')?.value||'');toast('Đã lưu nội dung và phân quyền hiển thị')}function bindEditor(){$('#newContent').onclick=()=>openEditorFinal();$$('[data-close-editor]').forEach(x=>x.onclick=closeEditorFinal);form.onsubmit=saveEditorFinal;document.addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit){const item=contentStore().find(x=>String(x.id)===edit.dataset.edit);if(item)openEditorFinal(item)}if(del&&confirm('Xóa nội dung này?')){saveContentStore(contentStore().filter(x=>String(x.id)!==del.dataset.delete));contents=JSON.parse(localStorage.getItem('academy_content')||'[]');renderContentFinal($('#adminSearch')?.value||'');toast('Đã xóa nội dung')}},true);$('#adminSearch').oninput=e=>renderContentFinal(e.target.value)}function renderMembersFinal(term=''){const users=JSON.parse(localStorage.getItem('academy_users')||'{}'),members=JSON.parse(localStorage.getItem('academy_members')||'[]'),access=JSON.parse(localStorage.getItem('academy_access')||'{}'),memberMap=Object.fromEntries(members.map(x=>[x.email,x])),emails=[...new Set([...Object.keys(users),...members.map(x=>x.email)])],rows=emails.map(email=>{const u=users[email]||{},m=memberMap[email]||{},perm=toUiAccess(access[email]||'starter');return{email,name:u.name||m.name||email,phone:u.phone||m.phone||'',date:m.registeredAt||u.createdAt||'',role:u.role||'student',perm}}).filter(x=>(x.name+' '+x.email+' '+x.phone).toLowerCase().includes(term.toLowerCase())),list=$('#memberList');if(!list)return;$('#totalMembers').textContent=rows.length;$('#proMembers').textContent=rows.filter(x=>x.perm!=='none').length;const head=$('.memberTable .memberHead');if(head)head.innerHTML='<span>Tài khoản</span><span>Liên hệ</span><span>Vai trò</span><span>Quyền xem khóa học</span><span>Ngày tạo</span><span>Trạng thái</span>';list.innerHTML=rows.length?rows.reverse().map(x=>'<div class="memberRow"><span><b>'+x.name+'</b><small>Tài khoản học viên</small></span><span><b>'+x.email+'</b><small>'+x.phone+'</small></span><span><select data-role="'+x.email+'"><option value="student" '+(x.role==='student'?'selected':'')+'>Học viên</option><option value="admin" '+(x.role==='admin'?'selected':'')+'>Quản trị viên</option></select></span><span><select data-access="'+x.email+'"><option value="none" '+(x.perm==='none'?'selected':'')+'>Chưa cấp quyền</option><option value="course699" '+(x.perm==='course699'?'selected':'')+'>699K - Khóa Kinh doanh</option><option value="course999" '+(x.perm==='course999'?'selected':'')+'>999K - Khóa Phát triển bản thân</option><option value="all" '+(x.perm==='all'?'selected':'')+'>Toàn bộ khóa học</option></select></span><span>'+x.date+'</span><span><i class="statusActive">Đang hoạt động</i></span></div>').join(''):'<div class="adminEmpty">Chưa có tài khoản học viên.</div>'}function bindMembers(){const search=$('#memberSearch');if(search)search.oninput=e=>renderMembersFinal(e.target.value);document.addEventListener('change',e=>{if(e.target.matches('[data-role]')){const users=JSON.parse(localStorage.getItem('academy_users')||'{}'),email=e.target.dataset.role;users[email]=users[email]||{name:email,email};users[email].role=e.target.value;localStorage.setItem('academy_users',JSON.stringify(users));toast('Đã cập nhật vai trò')}if(e.target.matches('[data-access]')){const access=JSON.parse(localStorage.getItem('academy_access')||'{}');access[e.target.dataset.access]=toStoreAccess(e.target.value);localStorage.setItem('academy_access',JSON.stringify(access));toast('Đã cấp quyền xem khóa học')}});renderMembersFinal()}function fixBell(){const b=$('#adminNotificationButton');if(b)b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><i id="adminBellCount">0</i>'}function hideMembershipSales(){document.querySelectorAll('#memberButton,.memberButton,#memberModal,.memberModal,.planGrid').forEach(el=>el.style.display='none')}setTimeout(()=>{normalizeContent();setupPanels();setupEditorOptions();bindEditor();bindMembers();renderContentFinal();fixBell();hideMembershipSales()},120)})();
// Final admin writing assistant hint.
(() => {
  function enhanceComposer() {
    const content = document.querySelector('#editContent');
    const section = content?.closest('label');
    if (!content || !section || document.querySelector('.smartComposerHint')) return;
    content.placeholder = 'Dán nội dung tự nhiên vào đây. Xuống dòng để tách đoạn, dùng dấu - cho danh sách, dùng > cho câu nhấn mạnh. Hệ thống sẽ tự làm đẹp khi hiển thị trên trang chủ.';
    const hint = document.createElement('div');
    hint.className = 'smartComposerHint';
    hint.innerHTML = '<i>AI</i><span><b>Tự làm đẹp bài viết khi hiển thị</b><small>Chỉ cần nhập nội dung. Trang chủ sẽ tự chọn cỡ chữ, đoạn nổi bật, danh sách, icon và nhấn mạnh ý chính.</small></span>';
    section.parentElement.insertBefore(hint, section);
  }
  document.addEventListener('DOMContentLoaded', enhanceComposer);
  document.addEventListener('click', () => setTimeout(enhanceComposer, 80), true);
  setTimeout(enhanceComposer, 500);
})();

// Final simplified publishing workflow: choose where it appears, then write.
(() => {
  const ROUTES = {
    homepage: {
      title: 'Bài viết ở Trang chủ',
      desc: 'Hiện trong mục Nội dung mới trên trang chủ. Phù hợp bài chia sẻ, thông báo, bài viết ngắn.',
      icon: '⌂',
      type: 'Bài viết',
      status: 'published',
      placement: 'homepage',
      category: 'Kinh doanh',
      access: 'public',
      image: 'assets/slide-business.png'
    },
    featured: {
      title: 'Bài nổi bật đầu trang',
      desc: 'Hiện nổi bật ở khu vực đầu trang/slider để người học nhìn thấy trước.',
      icon: '★',
      type: 'Bài viết',
      status: 'published',
      placement: 'featured',
      category: 'Phát triển bản thân',
      access: 'public',
      image: 'assets/slide-growth.png'
    },
    video: {
      title: 'Video trong thư viện',
      desc: 'Hiện ở Thư viện video và có ô nhập link YouTube/video.',
      icon: '▶',
      type: 'Video',
      status: 'published',
      placement: 'video',
      category: 'Content & Video',
      access: 'public',
      image: 'assets/slide-content.png'
    },
    curriculum: {
      title: 'Nội dung trong khóa học',
      desc: 'Hiện trong Chương trình học chi tiết. Dùng cho tài liệu, bài học hoặc nội dung theo gói.',
      icon: '▤',
      type: 'Bài học',
      status: 'published',
      placement: 'curriculum',
      category: 'Bài học',
      access: 'course699',
      image: 'assets/slide-business.png'
    }
  };

  const $ = s => document.querySelector(s);
  function field(id) {
    return document.querySelector(id);
  }
  function setValue(id, value) {
    const el = field(id);
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function currentRoute() {
    const placement = field('#editPlacement')?.value || 'homepage';
    const type = field('#editType')?.value || 'Bài viết';
    if (placement === 'video' || type === 'Video') return 'video';
    if (placement === 'curriculum') return 'curriculum';
    if (placement === 'featured') return 'featured';
    return 'homepage';
  }
  function updateRouteUi(routeKey) {
    const route = ROUTES[routeKey] || ROUTES.homepage;
    document.querySelectorAll('[data-publish-route]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.publishRoute === routeKey);
    });
    const preview = document.querySelector('#publishRoutePreview');
    if (preview) {
      preview.innerHTML = '<b>Sẽ hiển thị:</b> ' + route.title + '<small>' + route.desc + '</small>';
    }
  }
  function applyRoute(routeKey) {
    const route = ROUTES[routeKey] || ROUTES.homepage;
    setValue('#editType', route.type);
    setValue('#editStatus', route.status);
    setValue('#editPlacement', route.placement);
    setValue('#editCategory', route.category);
    setValue('#editAccess', route.access);
    const image = field('#editImage');
    const imageData = field('#editImageData');
    if (image && !image.value.trim() && !(imageData && imageData.value.trim())) image.value = route.image;
    updateRouteUi(routeKey);
  }
  function ensurePublishingPack() {
    const form = $('#contentForm');
    const firstTitle = form?.querySelector('.formSectionTitle');
    if (!form || !firstTitle || form.querySelector('.publishingRoutePack')) return;

    const pack = document.createElement('section');
    pack.className = 'publishingRoutePack';
    pack.innerHTML = '<div class="publishPackHead"><span>CHỌN NƠI HIỂN THỊ</span><h3>Anh muốn bài này xuất hiện ở đâu?</h3><p>Chọn một mục bên dưới, hệ thống sẽ tự điền loại nội dung, danh mục, phân quyền và vị trí hiển thị.</p></div><div class="publishRouteGrid">' +
      Object.entries(ROUTES).map(([key, route]) =>
        '<button type="button" data-publish-route="' + key + '"><i>' + route.icon + '</i><b>' + route.title + '</b><small>' + route.desc + '</small></button>'
      ).join('') +
      '</div><div id="publishRoutePreview" class="publishRoutePreview"></div><details class="publishingAdvanced"><summary>Tùy chỉnh nâng cao</summary><div class="publishingAdvancedInner"></div></details>';
    firstTitle.replaceWith(pack);

    const advanced = pack.querySelector('.publishingAdvancedInner');
    const grids = Array.from(form.children).filter(el => el.classList?.contains('formGrid')).slice(0, 2);
    grids.forEach(grid => advanced.appendChild(grid));

    pack.querySelectorAll('[data-publish-route]').forEach(btn => {
      btn.addEventListener('click', () => applyRoute(btn.dataset.publishRoute));
    });
    ['#editType', '#editPlacement', '#editCategory', '#editAccess'].forEach(id => {
      field(id)?.addEventListener('change', () => updateRouteUi(currentRoute()));
    });
    updateRouteUi(currentRoute());
  }
  function syncOnEditorOpen() {
    ensurePublishingPack();
    setTimeout(() => updateRouteUi(currentRoute()), 50);
  }
  document.addEventListener('DOMContentLoaded', ensurePublishingPack);
  document.addEventListener('click', e => {
    if (e.target.closest('#newContent,[data-edit]')) setTimeout(syncOnEditorOpen, 140);
  }, true);
  const editor = $('#contentEditor');
  if (editor) {
    new MutationObserver(() => {
      if (editor.classList.contains('open')) syncOnEditorOpen();
    }).observe(editor, { attributes: true, attributeFilter: ['class'] });
  }
  setTimeout(ensurePublishingPack, 600);
})();





/* Codex stability pass: simplified publishing assistant.
   This keeps the existing content schema, but makes the admin choose the
   destination first so title/content entry is not confusing. */
(() => {
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const routes = {
    homepage: {
      title: 'Bài viết ở Trang chủ',
      desc: 'Hiển thị trong mục nội dung mới trên trang chủ.',
      icon: '⌂',
      type: 'Bài viết',
      placement: 'homepage',
      category: 'Kinh doanh',
      access: 'public',
      image: 'assets/slide-business.png'
    },
    featured: {
      title: 'Bài nổi bật đầu trang',
      desc: 'Hiển thị nổi bật trong khu vực slider đầu trang.',
      icon: '★',
      type: 'Bài viết',
      placement: 'featured',
      category: 'Phát triển bản thân',
      access: 'public',
      image: 'assets/slide-growth.png'
    },
    video: {
      title: 'Video trong thư viện',
      desc: 'Hiển thị trong thư viện video, phù hợp bài có link YouTube/video.',
      icon: '▶',
      type: 'Video',
      placement: 'video',
      category: 'Content & Video',
      access: 'public',
      image: 'assets/slide-content.png'
    },
    curriculum: {
      title: 'Bài trong khóa học',
      desc: 'Hiển thị trong chương trình học chi tiết và có thể gắn quyền xem.',
      icon: '▦',
      type: 'Bài học',
      placement: 'curriculum',
      category: 'Bài học',
      access: 'course699',
      image: 'assets/slide-business.png'
    }
  };

  function setValue(id, value) {
    const el = qs(id);
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function currentRoute() {
    const placement = qs('#editPlacement')?.value || 'homepage';
    const type = qs('#editType')?.value || '';
    if (placement === 'video' || type === 'Video') return 'video';
    if (placement === 'curriculum') return 'curriculum';
    if (placement === 'featured') return 'featured';
    return 'homepage';
  }

  function paintActive(routeKey) {
    qsa('[data-codex-route]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.codexRoute === routeKey);
    });
    const preview = qs('#codexRoutePreview');
    const route = routes[routeKey] || routes.homepage;
    if (preview) {
      preview.innerHTML = '<b>Bài này sẽ hiển thị tại: ' + route.title + '</b><small>' + route.desc + '</small>';
    }
  }

  function applyRoute(routeKey) {
    const route = routes[routeKey] || routes.homepage;
    setValue('#editType', route.type);
    setValue('#editStatus', 'published');
    setValue('#editPlacement', route.placement);
    setValue('#editCategory', route.category);
    setValue('#editAccess', route.access);
    const image = qs('#editImage');
    const imageData = qs('#editImageData');
    if (image && !image.value.trim() && !(imageData && imageData.value.trim())) image.value = route.image;
    paintActive(routeKey);
  }

  function ensureAssistant() {
    const form = qs('#contentForm');
    if (!form || form.querySelector('.codexPublishAssistant')) return;
    const anchor = form.querySelector('.formSectionTitle') || form.firstElementChild;
    if (!anchor) return;

    const assistant = document.createElement('section');
    assistant.className = 'codexPublishAssistant';
    assistant.innerHTML = [
      '<div class="codexPublishHead">',
      '<span>ĐĂNG NỘI DUNG</span>',
      '<h3>Chọn nơi bài viết sẽ hiển thị</h3>',
      '<p>Anh chọn một mục, hệ thống tự điền loại nội dung, danh mục, vị trí hiển thị và quyền xem. Sau đó chỉ cần nhập tiêu đề, mô tả và nội dung.</p>',
      '</div>',
      '<div class="codexRouteGrid">',
      Object.entries(routes).map(([key, route]) => (
        '<button type="button" data-codex-route="' + key + '">' +
        '<i>' + route.icon + '</i><b>' + route.title + '</b><small>' + route.desc + '</small>' +
        '</button>'
      )).join(''),
      '</div>',
      '<div id="codexRoutePreview" class="codexRoutePreview"></div>',
      '<details class="codexAdvancedFields"><summary>Tùy chỉnh nâng cao</summary><div class="codexAdvancedInner"></div></details>'
    ].join('');

    anchor.replaceWith(assistant);
    const advanced = assistant.querySelector('.codexAdvancedInner');
    qsa('#editType,#editStatus,#editCategory,#editAccess,#editPlacement').forEach(field => {
      const label = field.closest('label');
      if (label) advanced.appendChild(label);
    });
    qsa('[data-codex-route]').forEach(btn => {
      btn.addEventListener('click', () => applyRoute(btn.dataset.codexRoute));
    });
    qsa('#editType,#editPlacement,#editCategory,#editAccess').forEach(field => {
      field.addEventListener('change', () => paintActive(currentRoute()));
    });
    paintActive(currentRoute());
  }

  document.addEventListener('DOMContentLoaded', ensureAssistant);
  document.addEventListener('click', event => {
    if (event.target.closest('#newContent,[data-edit]')) setTimeout(ensureAssistant, 80);
  }, true);
  setTimeout(ensureAssistant, 300);
  setTimeout(ensureAssistant, 900);
})();

// Sidebar Toggle Logic
(()=>{
  const toggleBtn = document.getElementById('toggleAdminSide');
  const adminSide = document.getElementById('adminSide');
  if(toggleBtn && adminSide) {
    toggleBtn.onclick = () => {
      adminSide.classList.toggle('collapsed');
    };
  }
})();
