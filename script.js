const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

let activeWorkerFilter = "All";
let activeMarketFilter = "All";
let authMode = "login";
let toastTimer;

function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Page navigation
function openPage(id) {
  if (!$("#" + id)) return;

  $$(".page").forEach(page => {
    page.classList.toggle("active", page.id === id);
  });

  $$(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === id);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    event.preventDefault();
    openPage(pageButton.dataset.page);
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (actionButton) handleAction(actionButton.dataset.action);
});


const API_URL = "https://skill-service-backend-1-cfl3.onrender.com";

let workers = [];

function getWorkerRole(title = "") {
  if (/design/i.test(title)) return "Designer";
  if (/video|editor/i.test(title)) return "Video";
  return "Developer";
}

function createWorkerCard(worker) {
  const card = document.createElement("article");
  card.className = "worker-card";

  const top = document.createElement("div");
  top.className = "worker-top";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = (worker.fullName || "W")
    .split(/\s+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const info = document.createElement("div");
  info.className = "worker-info";

  const name = document.createElement("h3");
  name.textContent = worker.fullName || "Worker";

  const title = document.createElement("p");
  title.textContent = worker.title || "Professional Worker";

  info.append(name, title);
  top.append(avatar, info);

  const role = document.createElement("div");
  role.className = "rating";
  role.textContent = getWorkerRole(worker.title);

  const skills = document.createElement("p");
  skills.className = "skills";
  skills.textContent = Array.isArray(worker.skills)
    ? worker.skills.join(" · ")
    : "Skills not added yet";

  const bio = document.createElement("p");
  bio.className = "muted";
  bio.textContent = worker.bio || "No bio added yet.";

  const bottom = document.createElement("div");
  bottom.className = "worker-bottom";

  const price = document.createElement("div");
  price.className = "price";
  price.textContent = `₹${Number(worker.hourlyRate) || 0}/hr`;

  const view = document.createElement("button");
  view.type = "button";
  view.className = "primary-btn";
  view.textContent = "View profile →";

  view.addEventListener("click", () => {
    notify(`${worker.fullName} · ${worker.title || "Worker"}`);
  });

  bottom.append(price, view);
  card.append(top, role, skills, bio, bottom);

  return card;
}

function renderWorkers() {
  const searchInput = document.getElementById("workerSearch");
  const list = document.getElementById("workerList");
  const count = document.getElementById("workerCount");

  if (!searchInput || !list || !count) return;

  const query = searchInput.value.trim().toLowerCase();

  const filtered = workers.filter(worker => {
    const matchesCategory =
      activeWorkerFilter === "All" ||
      getWorkerRole(worker.title) === activeWorkerFilter;

    const searchable = [
      worker.fullName,
      worker.title,
      worker.bio,
      ...(Array.isArray(worker.skills) ? worker.skills : [])
    ].join(" ").toLowerCase();

    return matchesCategory && searchable.includes(query);
  });

  list.replaceChildren();

  filtered.forEach(worker => {
    list.append(createWorkerCard(worker));
  });

  count.textContent = `${filtered.length} workers`;

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No matching workers found.";
    list.append(empty);
  }
}

async function loadWorkers() {
  const list = document.getElementById("workerList");
  if (!list) return;

  list.textContent = "Loading workers...";

  try {
    const response = await fetch(`${API_URL}/api/workers`);
    const data = await response.json();
    console.log("API status:", response.status);
    console.log("API response:", data);
    console.log("Workers array:", data.workers);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not load workers");
    }

    workers = data.workers || [];
    renderWorkers();
    renderFeaturedWorkers();
  } catch (error) {
    list.textContent =
      "Workers load nahi hue. Backend check karke page refresh karein.";
    console.error("Worker loading error:", error);
  }
}

function renderFeaturedWorkers() {
  const featured = document.getElementById("featuredWorkers");
  if (!featured) return;

  featured.replaceChildren();

  workers.slice(0, 3).forEach(worker => {
    featured.append(createWorkerCard(worker));
  });
}

document.getElementById("workerSearch")
  ?.addEventListener("input", renderWorkers);

document.querySelectorAll("[data-worker-filter]")
  .forEach(button => {
    button.addEventListener("click", () => {
      activeWorkerFilter = button.dataset.workerFilter;

      document.querySelectorAll("[data-worker-filter]")
        .forEach(item => {
          item.classList.toggle("active", item === button);
        });

      renderWorkers();
    });
  });

loadWorkers();


// Sample digital products
const products = [
  {
    name: "Portfolio Website Template",
    category: "Website",
    price: 1499,
    description: "Responsive portfolio template for professionals.",
    symbol: "⌘"
  },
  {
    name: "Mobile App UI Kit",
    category: "App",
    price: 799,
    description: "A clean starter UI kit for mobile app projects.",
    symbol: "▣"
  },
  {
    name: "Social Media Template Pack",
    category: "Template",
    price: 299,
    description: "Reusable layouts for digital content creators.",
    symbol: "✦"
  }
];

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const visual = document.createElement("div");
  visual.className = "product-visual";
  visual.textContent = product.symbol;

  const category = document.createElement("p");
  category.className = "product-category";
  category.textContent = product.category;

  const title = document.createElement("h3");
  title.textContent = product.name;

  const desc = document.createElement("p");
  desc.className = "product-desc";
  desc.textContent = product.description;

  const bottom = document.createElement("div");
  bottom.className = "product-bottom";

  const price = document.createElement("span");
  price.className = "product-price";
  price.textContent = '₹${product.price}';

  const button = document.createElement("button");
  button.className = "secondary-btn";
  button.textContent = "View product";
  button.addEventListener("click", () => {
    'notify(${product.name} · Sample listing)';
  });

  bottom.append(price, button);
  card.append(visual, category, title, desc, bottom);
  return card;
}

function renderProducts() {
  const list = $("#productList");
  list.replaceChildren();

  const filtered = products.filter(product =>
    activeMarketFilter === "All" ||
    product.category === activeMarketFilter
  );

  filtered.forEach(product => list.append(createProductCard(product)));

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No products in this category yet.";
    list.append(empty);
  }
}

$$("[data-market-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeMarketFilter = button.dataset.marketFilter;

    $$("[data-market-filter]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderProducts();
  });
});

// AI Studio demo
$("#generateBtn").addEventListener("click", () => {
  const prompt = $("#prompt").value.trim();

  if (!prompt) {
    notify("Please describe your idea first.");
    $("#prompt").focus();
    return;
  }

  const result = $("#aiResult");
  result.hidden = false;
  result.textContent =
    "Demo request received!\n\n" +
    "Idea: " + prompt + "\n" +
    "Technology: " + $("#technology").value + "\n" +
    "Type: " + $("#creationType").value + "\n\n" +
    "This is a preview, not AI-generated output. Connect a secure backend and AI API to generate real content.";
});

// Profile settings demo
function handleAction(action) {
  const messages = {
    edit: "Profile editing will be added in the next step.",
    projects: "Your projects will appear here once project storage is connected.",
    notifications: "You have no new demo notifications.",
    privacy: "Secure account settings require backend integration.",
    help: "Help and support will be added in the next step.",
    "list-product": "The product listing form will be added next."
  };

  if (action === "edit") {
    const name = prompt("Enter a display name:", $("#profileName").textContent);
    if (name && name.trim()) {
      $("#profileName").textContent = name.trim();
      notify("Display name updated for this session.");
    }
    return;
  }

  notify(messages[action] || "This feature is coming soon.");
}


function setAuthMode(mode) {
  authMode = mode;

  const signup = mode === "signup";

  document.querySelectorAll("[data-auth]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.auth === mode
    );
  });

  document.getElementById("authTitle").textContent =
    signup ? "Create your account" : "Welcome back!";

  document.getElementById("authSubtitle").textContent =
    signup
      ? "Join L-Earn and start exploring."
      : "Log in to continue to L-Earn.";

  const fullName = document.getElementById("fullName");
  const fullNameLabel = document.getElementById("fullNameLabel");
  const accountType = document.getElementById("accountType");
  const accountTypeLabel = document.getElementById("accountTypeLabel");
  const password = document.getElementById("password");

  fullName.hidden = !signup;
  fullNameLabel.hidden = !signup;
  fullName.required = signup;

  accountType.hidden = !signup;
  accountTypeLabel.hidden = !signup;
  accountType.required = signup;

  password.autocomplete = signup
    ? "new-password"
    : "current-password";

  document.getElementById("authSubmit").textContent =
    signup ? "Create account →" : "Login →";

  document.getElementById("authMessage").textContent =
  signup
    ? "Create your L-Earn account."
    : "Log in to your L-Earn account.";
}



const APIURL = "https://skill-service-backend-1-cfl3.onrender.com";

let authToken = localStorage.getItem("lEarnToken");
let currentUser = null;

// Login aur signup tabs
document.querySelectorAll("[data-auth]").forEach(button => {
  button.addEventListener("click", () => {
    setAuthMode(button.dataset.auth);
  });
});

// Navbar Login / Sign Up
document.querySelectorAll(".nav-auth [data-page='login']").forEach(button => {
  button.addEventListener("click", () => {
    setAuthMode(button.dataset.authMode || "login");
    openPage("auth");
  });
});

// Backend request helper
async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Login / Sign Up form
document.getElementById("authForm").addEventListener("submit", async event => {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const accountType = document.getElementById("accountType").value;
  const message = document.getElementById("authMessage");
  const submitButton = document.getElementById("authSubmit");

  const isSignup = authMode === "signup";

  if (isSignup && !fullName) {
    message.textContent = "Please enter your full name.";
    return;
  }

  submitButton.disabled = true;
  message.textContent = "Please wait...";

  try {
    const result = await apiRequest(
      isSignup ? "/api/auth/register" : "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(
          isSignup
            ? { fullName, email, password, accountType }
            : { email, password }
        )
      }
    );

    authToken = result.token;
    currentUser = result.user;

    localStorage.setItem("lEarnToken", authToken);

    updateProfile(currentUser);
    message.textContent = result.message;

    notify(result.message);
    openPage("profile");
  } catch (error) {
    message.textContent = error.message;
    notify(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

// Profile ko real user data se update karein
function updateProfile(user) {
  if (!user) return;

  const nameElement = document.getElementById("profileName");

  if (nameElement) {
    nameElement.textContent = user.fullName || "User";
  }

  const profileSubtitle = document.querySelector(".profile-main .muted");

  if (profileSubtitle) {
    profileSubtitle.textContent =
      `${user.accountType || "user"} · ${user.email || ""}`;
  }

  const avatar = document.querySelector(".profile-card .avatar");

  if (avatar) {
    avatar.textContent = (user.fullName || "U").charAt(0).toUpperCase();
  }
}

// Page reload hone par existing login check karein
async function loadCurrentUser() {
  if (!authToken) return;

  try {
    const result = await apiRequest("/api/auth/me");
    currentUser = result.user;
    updateProfile(currentUser);
  } catch (error) {
    authToken = null;
    currentUser = null;
    localStorage.removeItem("lEarnToken");
  }
}

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  authToken = null;
  currentUser = null;

  localStorage.removeItem("lEarnToken");

  setAuthMode("login");
  openPage("home");
  notify("You have logged out successfully.");
});

loadCurrentUser();

