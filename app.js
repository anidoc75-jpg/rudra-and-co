const SB_URL="https://nbwurbaukbulcgddbxsl.supabase.co",SB_KEY="sb_publishable_DY8rQblNJTQ5-AyLqLgkYg_rkpYiJ3h";
const db=supabase.createClient(SB_URL,SB_KEY);
let products=[],cart=JSON.parse(localStorage.getItem("rudra_cart")||"[]");
const $=s=>document.querySelector(s);
async function loadProducts(){
 const {data,error}=await db.from("products").select("*").eq("active",true).order("created_at",{ascending:false});
 if(error){console.error(error); products=[];} else products=data||[];
 renderProducts();renderCart();
}
function saveCart(){localStorage.setItem("rudra_cart",JSON.stringify(cart));}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function renderProducts(){
 let q=($("#search")?.value||"").toLowerCase(),cat=document.querySelector(".chip.active")?.dataset.cat||"all";
 let list=products.filter(p=>(cat==="all"||p.category===cat)&&p.name.toLowerCase().includes(q));
 $("#products").innerHTML=list.map(p=>`<article class="card"><div class="pic" style="${p.image_url?`background-image:url('${p.image_url}');background-size:cover;background-position:center;color:transparent`:''}">${p.image_url?"":"R&C"}</div><div class="info"><h3>${esc(p.name)}</h3><div class="meta">${esc(p.category)} · Stock ${p.stock}</div><div class="price">₹${Number(p.price).toFixed(0)} <del class="meta">₹${Number(p.mrp||p.price).toFixed(0)}</del></div><button class="add" onclick="add('${p.id}')" ${p.stock<1?"disabled":""}>${p.stock<1?"Out of stock":"Add to cart"}</button></div></article>`).join("")||'<div class="empty">No products found.</div>';
}
function add(id){let p=products.find(x=>x.id===id);if(!p||p.stock<1)return;let x=cart.find(i=>i.id===id);if(x&&x.qty<p.stock)x.qty++;else if(!x)cart.push({id,qty:1});saveCart();renderCart();location.hash="cart";}
function renderCart(){
 let total=0,count=0; cart=cart.filter(i=>products.some(p=>p.id===i.id));
 cart.forEach(i=>{let p=products.find(x=>x.id===i.id);if(p){total+=Number(p.price)*i.qty;count+=i.qty;}});
 $("#cartCount").textContent=count;
 if(!cart.length){$("#cartBox").innerHTML='<div class="empty">Your cart is empty. <a href="#shop">Shop now</a></div>';return;}
 $("#cartBox").innerHTML=cart.map(i=>{let p=products.find(x=>x.id===i.id);return p?`<div class="cart-row"><span>${esc(p.name)} × ${i.qty}</span><b>₹${Number(p.price)*i.qty}</b></div>`:"";}).join("")+
 `<div class="cart-row"><b>Total</b><b>₹${total}</b></div><div class="checkout"><input id="cname" placeholder="Your name"><input id="phone" placeholder="Mobile number"><input id="address" placeholder="Full delivery address"><textarea id="note" placeholder="Order note"></textarea><button class="btn" onclick="placeOrder()">Place order</button></div>`;
}
async function placeOrder(){
 let name=$("#cname").value.trim(),phone=$("#phone").value.trim(),address=$("#address").value.trim(),note=$("#note").value.trim();
 if(!name||!phone||!address)return alert("Name, mobile and address are required.");
 let items=cart.map(i=>{let p=products.find(x=>x.id===i.id);return p?{product_id:p.id,name:p.name,qty:i.qty,price:Number(p.price)}:null}).filter(Boolean);
 let total=items.reduce((s,i)=>s+i.price*i.qty,0);
 let {error}=await db.from("orders").insert({customer_name:name,phone,address,items,total,payment_method:"UPI",status:"Pending"});
 if(error){alert("Order save nahi hua. Please try again.");console.error(error);return;}
 let lines=items.map(i=>`${i.name} × ${i.qty} = ₹${i.price*i.qty}`);
 let msg=`RUDRA & CO. Order\nName: ${name}\nMobile: ${phone}\nAddress: ${address}\nItems: ${lines.join(" | ")}\nTotal: ₹${total}\nPayment: UPI\n${note?"Note: "+note:""}`;
 window.open("https://wa.me/918178487402?text="+encodeURIComponent(msg),"_blank");
 cart=[];saveCart();renderCart();alert("Order received! WhatsApp bhi open ho gaya.");
}
document.addEventListener("DOMContentLoaded",()=>{
 $("#search").addEventListener("input",renderProducts);
 document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderProducts();});
 loadProducts();
});