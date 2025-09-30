const USER_KEY = "gh_user_v2";
const LOGGED_IN = "gh_logged_in_v2";
const CART_KEY = "gh_cart_v2";
const REV_KEY = "gh_reviews_v2";

document.addEventListener("DOMContentLoaded", () => {
  // SIGNUP
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim().toLowerCase();
      const pass = document.getElementById("signupPassword").value;
      if (!name || !email || !pass) { alert("Please fill all fields"); return; }
      localStorage.setItem(USER_KEY, JSON.stringify({ name, email, pass }));
      alert("Account created. Please login.");
      window.location.href = "login.html";
    });
  }

  // LOGIN
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const pass = document.getElementById("loginPassword").value;
      const saved = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      if (!saved) { alert("No account found. Please signup."); window.location.href = "signup.html"; return; }
      if (saved.email === email && saved.pass === pass) {
        localStorage.setItem(LOGGED_IN, email); // persist login until explicit logout
        window.location.href = "home.html";
      } else {
        alert("Invalid credentials");
      }
    });
  }

  // HOME PAGE CHECKS
  if (location.pathname.endsWith("home.html") || location.pathname === "/") {
    const logged = localStorage.getItem(LOGGED_IN);
    if (!logged) { window.location.href = "login.html"; return; }
    const saved = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    if (saved) {
      // optional: show username in brand text (if existed)
      const nameNode = document.querySelector(".brand-name");
      if (nameNode) nameNode.innerText = saved.name || "Green House";
    }
    renderCartCount();
    renderCartDrawer();
    loadReviews();
    const y = document.getElementById("year"); if (y) y.innerText = new Date().getFullYear();
  }
});

// LOGOUT
function doLogout(){ localStorage.removeItem(LOGGED_IN); window.location.href = "login.html"; }

// CART
function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function addToCart(title, price, img){
  const cart = getCart();
  cart.push({ title, price, img });
  saveCart(cart);
  renderCartCount();
  renderCartDrawer();
  // small mobile-friendly toast
  setTimeout(()=> alert(`${title} added to cart`), 50);
}
function clearCart(){ if(!confirm("Clear cart?")) return; saveCart([]); renderCartCount(); renderCartDrawer(); }
function renderCartCount(){ const c = getCart().length; const el = document.getElementById("cartCount"); if (el) el.innerText = c; }
function renderCartDrawer(){
  const body = document.getElementById("cartBody");
  const totalEl = document.getElementById("cartTotal");
  if (!body || !totalEl) return;
  const cart = getCart();
  body.innerHTML = "";
  let total = 0;
  cart.forEach((it, idx) => {
    total += Number(it.price||0);
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `<img src="${it.img||'oil.png'}" alt="">
      <div style="flex:1">
        <div style="font-weight:700">${escapeHtml(it.title)}</div>
        <div class="muted">₹${it.price}</div>
      </div>
      <div><button class="btn ghost" onclick="removeCart(${idx})">Remove</button></div>`;
    body.appendChild(div);
  });
  totalEl.innerText = `₹${total}`;
}
function removeCart(i){ const cart = getCart(); cart.splice(i,1); saveCart(cart); renderCartCount(); renderCartDrawer(); }
function toggleCart(){ const drawer = document.getElementById("cartDrawer"); if (!drawer) return; drawer.style.display = drawer.style.display === "block" ? "none" : "block"; renderCartDrawer(); }

// CHECKOUT (demo)
function goCheckout(){
  const cart = getCart();
  if (cart.length === 0) { alert("Your cart is empty"); return; }
  const orders = JSON.parse(localStorage.getItem("gh_orders") || "[]");
  const user = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
  orders.push({ user: user.email||'guest', items: cart, date: new Date().toLocaleString() });
  localStorage.setItem("gh_orders", JSON.stringify(orders));
  alert("Order placed. We will contact you soon.");
  saveCart([]);
  renderCartCount();
  renderCartDrawer();
  toggleCart();
}

// REVIEWS
function submitReview(){
  const txt = document.getElementById("reviewText");
  if (!txt || !txt.value.trim()) { alert("Write a short review"); return; }
  const saved = JSON.parse(localStorage.getItem(REV_KEY) || "[]");
  const user = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
  saved.unshift({ name: user.name||'Customer', text: txt.value.trim(), date: new Date().toLocaleString() });
  localStorage.setItem(REV_KEY, JSON.stringify(saved));
  txt.value = "";
  loadReviews();
  alert("Thanks for your review!");
}
function loadReviews(){
  const reviewsGrid = document.querySelector(".reviews-grid");
  const saved = JSON.parse(localStorage.getItem(REV_KEY) || "[]");
  if (!reviewsGrid) return;
  reviewsGrid.innerHTML = "";
  for (let r of (saved.length? saved : [{name:'Anita', text:'Works great', date:''},{name:'Suresh', text:'Lovely oil', date:''}]).slice(0,6)) {
    const d = document.createElement("div");
    d.className = "review card";
    d.innerHTML = `<strong>${escapeHtml(r.name)}</strong><p>${escapeHtml(r.text)}</p>`;
    reviewsGrid.appendChild(d);
  }
}

// utilities
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function openQuick(title){ alert(`${title}\n\nHandmade hair oil.\nNatural ingredients: Amla, Rosemary, Fenugreek.`); }
function scrollTo(selector){ const el = document.querySelector(selector); if (el) el.scrollIntoView({behavior:'smooth'}); }
