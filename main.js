import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// ==========================================
// 1. Firebase 設定 (請填入你的真實資訊)
// ==========================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================================
// 2. 資料與設定 (I18N, Mock Data)
// ==========================================
const I18N = {
    zh: {
        home: '首頁', events: '近期活動', mailboxes: '信箱專區', clubs: '社團專區', 
        contact: '聯絡我們', org: '組織架構', finance: '財務明細', meetings: '會議紀錄', admin: '幹部登入',
        marquee: '歡迎來到北港高中學生會！ 12/24(三) 金勾盃活動 • 1/16-20 第三次段考 • 傳情活動熱烈進行中！',
        heroTitle: '北港高中學生會互動網站',
        heroSubtitle: '你的聲音，我們的行動。共創更美好的校園生活。',
        btnComplaint: '前往信箱專區',
        news: '最新公告',
        confession: '匿名告白牆',
        noResults: '沒有找到相關結果',
        searchPlaceholder: '輸入關鍵字搜尋公告或活動...',
        loginTitle: '學生會幹部登入',
        emailLabel: '電子郵件',
        pwdLabel: '密碼',
        loginBtn: '登入系統',
        logoutBtn: '登出',
        adminDashboard: '幹部後台管理',
        adminWelcome: '歡迎回來，',
        loginError: '登入失敗，請檢查帳號密碼。'
    },
    en: {
        home: 'Home', events: 'Events', mailboxes: 'Mailboxes', clubs: 'Clubs',
        contact: 'Contact Us', org: 'Organization', finance: 'Finance', meetings: 'Meeting Minutes', admin: 'Staff Login',
        marquee: 'Welcome to PKSH Student Council! 12/24 Xmas Event • 1/16-20 3rd Midterm Exam • Message Delivery Event Ongoing!',
        heroTitle: 'PKSH Student Council Interactive Site',
        heroSubtitle: 'Your Voice, Our Action. Creating a better campus life together.',
        btnComplaint: 'Go to Mailboxes',
        news: 'Latest News',
        confession: 'Confession Wall',
        noResults: 'No results found',
        searchPlaceholder: 'Search news or events...',
        loginTitle: 'Staff Login',
        emailLabel: 'Email',
        pwdLabel: 'Password',
        loginBtn: 'Login',
        logoutBtn: 'Logout',
        adminDashboard: 'Staff Dashboard',
        adminWelcome: 'Welcome back, ',
        loginError: 'Login failed. Please check your credentials.'
    }
};

const APP_STATE = {
    view: 'home',
    lang: 'zh',
    darkMode: false,
    user: null, // 存放登入使用者資訊
    confessionTimer: null,
    confessionIndex: 0,
    mockData: {
        announcements: [
            { id: 1, title_zh: '114學年度金勾盃歌唱比賽時程表', title_en: '114th Golden Hook Cup Schedule', tag_zh: '活動', tag_en: 'Event', date: '2025-12-24', content_zh: '詳情請見活動當日公告...' },
            { id: 2, title_zh: '校園設施報修流程更新', title_en: 'Facility Repair Process Update', tag_zh: '行政', tag_en: 'Admin', date: '2025-12-20', content_zh: '自下週起報修請至總務處...' }
        ],
        confessionWall: [
            { content: "傳情的巧克力真的很好吃，謝謝學姊！", author: "高一的小明" },
            { content: "金勾盃大家加油！期待神秘嘉賓！", author: "路過的同學" },
            { content: "天氣變冷了，大家要注意保暖喔～", author: "暖暖包" }
        ],
        events: [
            { date: '12/24', title_zh: '金勾盃歌唱大賽', title_en: 'Jingle Bell Singing Contest', time: '13:00' },
            { date: '01/16', title_zh: '第三次段考 Day1', title_en: '3rd Midterm Exam Day 1', time: '08:00' }
        ]
    }
};

// ==========================================
// 3. 工具函式 (Helpers)
// ==========================================
const t = (key) => I18N[APP_STATE.lang][key] || key;
const isEn = () => APP_STATE.lang === 'en';

// 導航切換
window.navigate = (viewName) => {
    APP_STATE.view = viewName;
    
    // 關閉手機版選單
    document.getElementById('mobile-menu').classList.add('hidden');
    
    // 更新 Active 狀態樣式
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.key === viewName) {
            btn.classList.add('text-theme', 'font-bold', 'bg-gray-50', 'dark:bg-gray-700');
        } else {
            btn.classList.remove('text-theme', 'font-bold', 'bg-gray-50', 'dark:bg-gray-700');
        }
    });

    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 語言切換
window.toggleLang = () => {
    APP_STATE.lang = APP_STATE.lang === 'zh' ? 'en' : 'zh';
    document.getElementById('lang-display').innerText = APP_STATE.lang.toUpperCase();
    updateStaticText();
    render();
};

// 深色模式切換
window.toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    document.getElementById('dark-icon').classList.toggle('hidden', isDark);
    document.getElementById('light-icon').classList.toggle('hidden', !isDark);
};

// 手機版選單切換
document.getElementById('menu-button').addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

// 更新靜態文字 (導航列、Footer等)
function updateStaticText() {
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (t(key)) el.innerText = t(key);
    });
    const marqueeText = document.getElementById('marquee-text');
    if(marqueeText) marqueeText.innerText = t('marquee');
}

// 告白牆輪播邏輯
function startConfessionCarousel() {
    if (APP_STATE.confessionTimer) clearInterval(APP_STATE.confessionTimer);
    
    const updateConfession = () => {
        const container = document.getElementById('confession-container');
        if (!container) return; // 如果不在首頁，停止執行

        const data = APP_STATE.mockData.confessionWall[APP_STATE.confessionIndex];
        
        // 簡單的淡入淡出效果
        container.style.opacity = '0';
        setTimeout(() => {
            container.innerHTML = `
                <p class="text-xl italic font-medium text-gray-700 dark:text-gray-300">"${data.content}"</p>
                <p class="text-right mt-4 text-theme font-bold">- ${data.author}</p>
            `;
            container.style.opacity = '1';
        }, 300);

        APP_STATE.confessionIndex = (APP_STATE.confessionIndex + 1) % APP_STATE.mockData.confessionWall.length;
    };

    updateConfession();
    APP_STATE.confessionTimer = setInterval(updateConfession, 5000);
}

// ==========================================
// 4. 登入邏輯 (Auth Logic)
// ==========================================

// 監聽登入狀態改變
onAuthStateChanged(auth, (user) => {
    APP_STATE.user = user;
    // 移除 Loading 動畫
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
    
    // 如果使用者在 Admin 頁面且狀態改變，重新渲染
    if (APP_STATE.view === 'admin' || APP_STATE.view === 'home') {
        render();
    }
});

window.handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const pwd = document.getElementById('admin-pwd').value;
    const errorMsg = document.getElementById('login-error');
    const btn = document.getElementById('btn-login-submit');

    try {
        btn.innerText = 'Loading...';
        btn.disabled = true;
        await signInWithEmailAndPassword(auth, email, pwd);
        // 登入成功，onAuthStateChanged 會觸發並重新渲染
    } catch (error) {
        console.error("Login failed", error);
        errorMsg.classList.remove('hidden');
        errorMsg.innerText = t('loginError');
        btn.innerText = t('loginBtn');
        btn.disabled = false;
    }
};

window.handleLogout = async () => {
    try {
        await signOut(auth);
        // 登出後自動跳轉回首頁或留在登入頁
        render(); 
    } catch (error) {
        console.error("Logout failed", error);
    }
};

// ==========================================
// 5. 渲染邏輯 (Render Functions)
// ==========================================

function render() {
    const container = document.getElementById('app-container');
    container.innerHTML = ''; // 清空內容

    switch (APP_STATE.view) {
        case 'home':
            container.innerHTML = renderHome();
            startConfessionCarousel();
            break;
        case 'events':
            container.innerHTML = renderEvents();
            break;
        case 'clubs':
            container.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-theme">${t('clubs')}</h2><p>社團內容建置中...</p>`;
            break;
        case 'mailboxes':
            container.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-theme">${t('mailboxes')}</h2><p>信箱表單建置中...</p>`;
            break;
        case 'finance':
            container.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-theme">${t('finance')}</h2><p>財務報表建置中...</p>`;
            break;
        case 'org':
            container.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-theme">${t('org')}</h2><p>組織架構圖建置中...</p>`;
            break;
        case 'meetings':
            container.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-theme">${t('meetings')}</h2><p>會議記錄建置中...</p>`;
            break;
        case 'contact':
            container.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-theme">${t('contact')}</h2><p>聯絡資訊建置中...</p>`;
            break;
        // 重要：幹部登入頁面
        case 'admin': // 這裡處理登入頁面
            if (APP_STATE.user) {
                container.innerHTML = renderAdminDashboard();
            } else {
                container.innerHTML = renderLoginForm();
            }
            break;
        default:
            container.innerHTML = renderHome();
    }
    
    // 初始化 Lucide 圖標
    if (window.lucide) window.lucide.createIcons();
}

// 渲染首頁
function renderHome() {
    const announcements = APP_STATE.mockData.announcements;
    const newsHtml = announcements.map(item => `
        <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-theme mb-4">
            <span class="text-xs font-bold text-theme uppercase">${isEn() ? item.tag_en : item.tag_zh}</span>
            <h3 class="text-lg font-bold mt-1 dark:text-white">${isEn() ? item.title_en : item.title_zh}</h3>
            <p class="text-sm text-gray-400 mt-1 mb-2">${item.date}</p>
        </div>
    `).join('');

    return `
        <div class="bg-theme text-white rounded-2xl p-8 mb-10 shadow-lg relative overflow-hidden">
            <div class="relative z-10">
                <h1 class="text-3xl sm:text-4xl font-extrabold mb-4">${t('heroTitle')}</h1>
                <p class="text-lg opacity-90">${t('heroSubtitle')}</p>
                <div class="flex gap-4 mt-6">
                    <button class="bg-white text-theme font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition" onclick="navigate('mailboxes')">
                        ${t('btnComplaint')}
                    </button>
                    ${!APP_STATE.user ? 
                        `<button class="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-full hover:bg-white/20 transition" onclick="navigate('admin')">
                            ${t('admin')}
                        </button>` : 
                        `<button class="bg-yellow-400 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-yellow-300 transition" onclick="navigate('admin')">
                            ${t('adminDashboard')}
                        </button>`
                    }
                </div>
            </div>
            <div class="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                <i data-lucide="school" class="w-64 h-64"></i>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <i data-lucide="newspaper" class="text-theme"></i> ${t('news')}
                    </h2>
                </div>
                ${newsHtml}
            </div>

            <div class="space-y-8">
                <div class="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl border border-pink-100 dark:border-pink-800 relative">
                    <h3 class="text-xl font-bold text-pink-500 mb-4 flex items-center gap-2">
                        <i data-lucide="heart"></i> ${t('confession')}
                    </h3>
                    <div id="confession-container" class="transition-opacity duration-300 min-h-[100px] flex flex-col justify-center">
                        </div>
                </div>
            </div>
        </div>
    `;
}

// 渲染近期活動 (簡單範例)
function renderEvents() {
    return `
        <h2 class="text-3xl font-bold mb-6 text-theme">${t('events')}</h2>
        <div class="grid gap-4 md:grid-cols-2">
            ${APP_STATE.mockData.events.map(e => `
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow flex items-center gap-4">
                    <div class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 p-4 rounded-lg text-center min-w-[80px]">
                        <div class="text-xl font-bold">${e.date}</div>
                        <div class="text-sm">${e.time}</div>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg dark:text-white">${isEn() ? e.title_en : e.title_zh}</h3>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 渲染登入表單
function renderLoginForm() {
    return `
        <div class="max-w-md mx-auto mt-10">
            <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div class="text-center mb-8">
                    <div class="bg-theme/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="lock" class="w-8 h-8 text-theme"></i>
                    </div>
                    <h2 class="text-2xl font-bold dark:text-white">${t('loginTitle')}</h2>
                </div>
                
                <form onsubmit="handleLogin(event)" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t('emailLabel')}</label>
                        <input type="email" id="admin-email" required class="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-theme focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t('pwdLabel')}</label>
                        <input type="password" id="admin-pwd" required class="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-theme focus:outline-none transition">
                    </div>
                    
                    <div id="login-error" class="text-red-500 text-sm text-center hidden"></div>

                    <button type="submit" id="btn-login-submit" class="w-full bg-theme text-white font-bold py-3 rounded-lg hover:bg-theme-dark transition transform active:scale-95">
                        ${t('loginBtn')}
                    </button>
                </form>
            </div>
        </div>
    `;
}

// 渲染後台管理介面 (登入成功後)
function renderAdminDashboard() {
    const userEmail = APP_STATE.user.email;
    return `
        <div class="max-w-4xl mx-auto">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-3xl font-bold dark:text-white">${t('adminDashboard')}</h2>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">${t('adminWelcome')} ${userEmail}</p>
                </div>
                <button onclick="handleLogout()" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2">
                    <i data-lucide="log-out" class="w-4 h-4"></i> ${t('logoutBtn')}
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-lg dark:text-white">發布公告</h3>
                        <i data-lucide="megaphone" class="text-blue-500"></i>
                    </div>
                    <p class="text-sm text-gray-400">新增或編輯首頁公告事項</p>
                </div>

                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-green-500 cursor-pointer hover:shadow-md transition">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-lg dark:text-white">財務管理</h3>
                        <i data-lucide="dollar-sign" class="text-green-500"></i>
                    </div>
                    <p class="text-sm text-gray-400">更新本月財務收支明細</p>
                </div>

                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-purple-500 cursor-pointer hover:shadow-md transition">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-lg dark:text-white">信箱回覆</h3>
                        <i data-lucide="mail" class="text-purple-500"></i>
                    </div>
                    <p class="text-sm text-gray-400">查看學生投遞的建議與問題</p>
                </div>
            </div>

            <div class="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <p class="text-yellow-800 dark:text-yellow-200 text-sm text-center">
                    🚧 注意：目前僅為前端介面展示，尚未連接後端資料庫寫入功能。
                </p>
            </div>
        </div>
    `;
}

// ==========================================
// 6. 初始化執行 (Init)
// ==========================================
(function init() {
    updateStaticText();
    updateMarquee();
    
    // 綁定全域搜尋事件
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', window.performSearch);
    }

    // 初始渲染
    render();
})();
