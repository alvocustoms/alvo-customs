import { db } from "./firebase.js";
import {
  collection, getDocs, query, where, limit
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { productCard } from "./common.js";
import "./common.js";

/* Hide the intro from DOM readiness, not from the window load event.
   This prevents slow media/network requests from holding the visitor at the intro. */
const intro = document.querySelector("#intro");
if (intro) {
  const revealHome = () => window.setTimeout(() => intro.classList.add("hide"), 1550);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revealHome, { once: true });
  } else {
    revealHome();
  }
}

const productsTarget = document.querySelector("#featuredProducts");
const videosTarget = document.querySelector("#homeVideos");

async function loadProducts() {
  if (!productsTarget) return;
  try {
    const snapshot = await getDocs(
      query(collection(db, "products"), where("active", "==", true), limit(6))
    );
    productsTarget.innerHTML = snapshot.empty
      ? "<p class='muted'>Our collection is being updated. Contact us for current options.</p>"
      : snapshot.docs.map(doc => productCard({ id: doc.id, ...doc.data() })).join("");
  } catch (error) {
    console.error("ALVO products could not be loaded:", error);
    productsTarget.innerHTML = "<p class='muted'>Contact ALVO for the current catalogue.</p>";
  }
}

async function loadVideos() {
  if (!videosTarget) return;
  try {
    const snapshot = await getDocs(
      query(collection(db, "media"), where("active", "==", true), limit(3))
    );
    if (!snapshot.empty) {
      videosTarget.innerHTML = snapshot.docs.map(doc => {
        const item = doc.data();
        const safeTitle = String(item.title || "ALVO CUSTOMS")
          .replace(/[&<>"']/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
          }[char]));
        return `<div class="video-card">
          <video src="${item.url || ""}" poster="${item.thumbnail || ""}"
            muted loop playsinline controls preload="metadata"></video>
          <b>${safeTitle}</b>
        </div>`;
      }).join("");
    }
  } catch (error) {
    console.warn("ALVO videos are currently unavailable:", error);
  }
}

/* Run independent Firestore reads in parallel instead of waiting for each in turn. */
Promise.allSettled([loadProducts(), loadVideos()]);
