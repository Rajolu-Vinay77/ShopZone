const PRODUCTS = [
  { id: 1, name: "Wireless Noise-Cancelling Headphones", price: 89.99, rating: 4.5, reviews: 2341, category: "Electronics", emoji: "🎧" },
  { id: 2, name: "Smart Watch with Heart Rate Monitor", price: 129.0, rating: 4.2, reviews: 1180, category: "Electronics", emoji: "⌚" },
  { id: 3, name: "Portable Bluetooth Speaker", price: 39.5, rating: 4.4, reviews: 5320, category: "Electronics", emoji: "🔊" },
  { id: 4, name: "Mechanical Gaming Keyboard", price: 74.99, rating: 4.6, reviews: 987, category: "Electronics", emoji: "⌨️" },
  { id: 5, name: "Classic Cotton T-Shirt (3-pack)", price: 24.99, rating: 4.3, reviews: 8800, category: "Clothing", emoji: "👕" },
  { id: 6, name: "Running Shoes", price: 59.95, rating: 4.1, reviews: 3015, category: "Clothing", emoji: "👟" },
  { id: 7, name: "Waterproof Rain Jacket", price: 79.0, rating: 4.4, reviews: 640, category: "Clothing", emoji: "🧥" },
  { id: 8, name: "Stainless Steel Water Bottle", price: 18.75, rating: 4.7, reviews: 12450, category: "Home", emoji: "🍶" },
  { id: 9, name: "Programmable Coffee Maker", price: 49.99, rating: 4.3, reviews: 4120, category: "Home", emoji: "☕" },
  { id: 10, name: "LED Desk Lamp with USB Port", price: 27.49, rating: 4.5, reviews: 2210, category: "Home", emoji: "💡" },
  { id: 11, name: "Bestselling Mystery Novel", price: 12.99, rating: 4.6, reviews: 15600, category: "Books", emoji: "📕" },
  { id: 12, name: "Learn JavaScript: Beginner's Guide", price: 29.99, rating: 4.8, reviews: 3300, category: "Books", emoji: "📘" },
];

const money = (n) => "$" + n.toFixed(2);
const $ = (id) => document.getElementById(id);
let cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem("shopzone-cart")) || {}; } catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem("shopzone-cart", JSON.stringify(cart)); } catch {}
}

// ---------- Products ----------
function stars(r) {
  const full = Math.round(r);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function getVisible() {
  const q = $("searchInput").value.trim().toLowerCase();
  const cat = $("categoryFilter").value;
  let list = PRODUCTS.filter(
    (p) => (cat === "all" || p.category === cat) && p.name.toLowerCase().includes(q)
  );
  const sort = $("sortSelect").value;
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  return list;
}

function renderProducts() {
  const list = getVisible();
  $("resultCount").textContent = `${list.length} result${list.length === 1 ? "" : "s"}`;
  $("productGrid").innerHTML = list.length
    ? list.map((p) => `
      <article class="card">
        <div class="img">${p.emoji}</div>
        <h3>${p.name}</h3>
        <div class="stars">${stars(p.rating)}<small>${p.reviews.toLocaleString()}</small></div>
        <div class="price">${money(p.price)} <small>${p.category}</small></div>
        <button data-add="${p.id}">Add to Cart</button>
      </article>`).join("")
    : `<p class="empty">No products found.</p>`;
}

// ---------- Cart ----------
function cartEntries() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === Number(id)), qty }))
    .filter((e) => e.product);
}

function renderCart() {
  const entries = cartEntries();
  const count = entries.reduce((s, e) => s + e.qty, 0);
  const total = entries.reduce((s, e) => s + e.qty * e.product.price, 0);
  $("cartCount").textContent = count;
  $("cartTotal").textContent = money(total);
  $("cartItems").innerHTML = entries.length
    ? entries.map(({ product: p, qty }) => `
      <div class="cart-row">
        <div class="emoji">${p.emoji}</div>
        <div class="info">
          <div>${p.name}</div>
          <div><strong>${money(p.price)}</strong></div>
          <div class="qty">
            <button data-dec="${p.id}" aria-label="Decrease">−</button>
            <span>${qty}</span>
            <button data-inc="${p.id}" aria-label="Increase">+</button>
            <button class="remove" data-remove="${p.id}">Delete</button>
          </div>
        </div>
      </div>`).join("")
    : `<p class="empty">Your cart is empty.</p>`;
  saveCart();
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.add("hidden"), 1800);
}

function toggleCart(open) {
  $("cartPanel").classList.toggle("hidden", !open);
  $("overlay").classList.toggle("hidden", !open);
}

// ---------- Events ----------
$("productGrid").addEventListener("click", (e) => {
  const id = e.target.dataset.add;
  if (!id) return;
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  toast("Added to cart");
});

$("cartItems").addEventListener("click", (e) => {
  const d = e.target.dataset;
  if (d.inc) cart[d.inc]++;
  if (d.dec) { cart[d.dec]--; if (cart[d.dec] <= 0) delete cart[d.dec]; }
  if (d.remove) delete cart[d.remove];
  renderCart();
});

$("openCart").addEventListener("click", () => toggleCart(true));
$("closeCart").addEventListener("click", () => toggleCart(false));
$("overlay").addEventListener("click", () => toggleCart(false));
$("searchForm").addEventListener("submit", (e) => { e.preventDefault(); renderProducts(); });
$("searchInput").addEventListener("input", renderProducts);
$("categoryFilter").addEventListener("change", renderProducts);
$("sortSelect").addEventListener("change", renderProducts);

$("checkoutBtn").addEventListener("click", () => {
  if (!cartEntries().length) return toast("Your cart is empty");
  cart = {};
  renderCart();
  toggleCart(false);
  toast("Order placed! (demo only)");
});

// ---------- Init ----------
[...new Set(PRODUCTS.map((p) => p.category))].forEach((c) => {
  const o = document.createElement("option");
  o.value = c; o.textContent = c;
  $("categoryFilter").appendChild(o);
});
renderProducts();
renderCart();
