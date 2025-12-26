window.handleAdminLoginClick = () => {
  document.getElementById('admin-login-modal').classList.remove('hidden');
};
import { signInWithEmailAndPassword } from "firebase/auth";
window.adminLogin = async () => {
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    alert('登入成功');
    document.getElementById('admin-login-modal').classList.add('hidden');
  } catch (err) {
    alert('登入失敗：' + err.message);
  }
};
onAuthStateChanged(auth, (user) => {
  if (user && !user.isAnonymous && user.email === ADMIN_EMAIL) {
    APP_STATE.isAdmin = true;
  } else {
    APP_STATE.isAdmin = false;
  }
});
if (APP_STATE.isAdmin) {
  html += `<button class="bg-red-500 text-white px-4 py-2 rounded">新增資料</button>`;
}



