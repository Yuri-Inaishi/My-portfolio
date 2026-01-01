// スクロールで発火するアニメーションのためのIntersection Observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px",
};

// アニメーションの再実行を防ぐためにセクションを追跡
const animatedSections = new Set();

// セクション用のObserver
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !animatedSections.has(entry.target.id)) {
      animatedSections.add(entry.target.id);
      animateSection(entry.target);
    }
  });
}, observerOptions);

// ナビゲーション用のObserver
const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const navDot = document.querySelector(
        `.floating-nav [href="#${entry.target.id}"]`
      );
      const headerNavLink = document.querySelector(
        `.header-nav [href="#${entry.target.id}"]`
      );

      if (entry.isIntersecting) {
        // フローティングナビゲーションの更新
        document
          .querySelectorAll(".nav-dot")
          .forEach((dot) => dot.classList.remove("active"));
        if (navDot) navDot.classList.add("active");

        // ヘッダーナビゲーションの更新
        document
          .querySelectorAll(".header-nav a")
          .forEach((link) => link.classList.remove("active"));
        if (headerNavLink) headerNavLink.classList.add("active");
      }
    });
  },
  { threshold: 0.15 }
);

// セクションをアニメーションさせる関数
function animateSection(section) {
  requestAnimationFrame(() => {
    section.classList.add("animate");

    const header = section.querySelector(".section-header");
    if (header) {
      setTimeout(() => header.classList.add("animate"), 200);
    }

    const cards = section.querySelectorAll(".content-card");
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("animate");
      }, 400 + index * 150);
    });
  });
}

// プログレスバーの更新
function updateProgressBar() {
  const scrollTop = window.pageYOffset;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  document.querySelector(".progress-bar").style.width = scrollPercent + "%";
}

// パーティクルシステム
function createParticle() {
  const particle = document.createElement("div");
  particle.className = "particle";
  particle.style.left = Math.random() * 100 + "vw";
  particle.style.animationDuration = Math.random() * 3 + 5 + "s";
  particle.style.opacity = Math.random() * 0.5 + 0.3;
  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 8000);
}

// requestAnimationFrameを使った最適化されたスクロールハンドラ
let ticking = false;
function handleScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateProgressBar();
      // updateParallax(); // パフォーマンステストのため無効化
      ticking = false;
    });
    ticking = true;
  }
}

// ナビゲーションクリック時のハンドラ
function handleNavClick(e) {
  e.preventDefault();
  const target = document.querySelector(e.target.getAttribute("href"));
  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// ヘッダーナビゲーションクリック時のハンドラ
function handleHeaderNavClick(e) {
  e.preventDefault();
  const targetId = e.target.getAttribute("href");
  const target = document.querySelector(targetId);
  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Observerとイベントリスナーの初期化
document.addEventListener("DOMContentLoaded", () => {
  // 全てのセクションを監視
  document.querySelectorAll("section").forEach((section) => {
    sectionObserver.observe(section);
    navObserver.observe(section);
  });

  // タイムラインアイテムを個別にアニメーションさせるためのObserver
  const timelineItemObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          timelineItemObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll(".timeline-item").forEach((item) => {
    timelineItemObserver.observe(item);
  });

  // スクロールイベントリスナーを追加（パフォーマンスのためpassive指定）
  window.addEventListener("scroll", handleScroll, { passive: true });

  // ナビゲーションのクリックハンドラを追加
  document.querySelectorAll(".nav-dot").forEach((dot) => {
    dot.addEventListener("click", handleNavClick);
  });

  // ヘッダーナビゲーションのクリックハンドラを追加
  document.querySelectorAll(".header-nav a").forEach((link) => {
    link.addEventListener("click", handleHeaderNavClick);
  });

  // スクロールインジケーターのクリックハンドラ
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      document.getElementById("about").scrollIntoView({
        behavior: "smooth",
      });
    });
  }

  // パーティクルを定期的に生成
  setInterval(createParticle, 2000);

  // プログレスバーの初回更新
  updateProgressBar();

  // ヒーローセクションをすぐにアニメーションさせる
  const heroSection = document.getElementById("hero");
  if (heroSection) {
    heroSection.classList.add("animate");
  }

  // ===============================
  // Projectsセクション：モーダル機能
  // ===============================

  // モーダルを開くボタン（data-modal-target属性を持つ要素）を全取得
  const openModalButtons = document.querySelectorAll("[data-modal-target]");

  // モーダルを閉じる「×」ボタンを全取得
  const closeModalButtons = document.querySelectorAll(".modal-close");

  // モーダルの背景（オーバーレイ）を全取得
  const overlays = document.querySelectorAll(".modal-overlay");

  // ---------- モーダルを開く処理 ----------
  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // data-modal-targetの値（#modal-〇〇など）から対象のモーダルを取得
      const modal = document.querySelector(button.dataset.modalTarget);
      openModal(modal);
    });
  });

  // ---------- オーバーレイクリックで閉じる処理 ----------
  overlays.forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      // 背景そのものをクリックした時だけ閉じる
      // （中のコンテンツクリックでは閉じない）
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // ---------- 「×」ボタンで閉じる処理 ----------
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 一番近い親の.modal-overlay（＝今開いているモーダル）を取得
      const modal = button.closest(".modal-overlay");
      closeModal(modal);
    });
  });

  // ---------- モーダルを開く関数 ----------
  function openModal(modal) {
    if (modal == null) return; // 念のためnullチェック
    modal.classList.add("active"); // CSSで表示される
  }

  // ---------- モーダルを閉じる関数 ----------
  function closeModal(modal) {
    if (modal == null) return;
    modal.classList.remove("active"); // CSSで非表示に戻す
  }

  // ===============================
  // モーダル内：画像カルーセル機能
  // ===============================
  document.querySelectorAll(".modal-img-container").forEach((container) => {
    // 前へ・次へボタン取得
    const prevButton = container.querySelector(".modal-img-prev");
    const nextButton = container.querySelector(".modal-img-next");

    // 表示対象となる画像を配列で取得
    const images = Array.from(container.querySelectorAll(".carousel-img"));

    // 現在表示中の画像インデックス
    let currentIndex = 0;

    // ---------- 表示画像を切り替える処理 ----------
    function updateImages() {
      if (images.length === 0) return;

      images.forEach((img, index) => {
        // currentIndexと一致する画像だけactiveを付与
        img.classList.toggle("active", index === currentIndex);
      });
    }

    // ---------- ボタンがあり、画像が2枚以上ある場合のみ実行 ----------
    if (prevButton && nextButton && images.length > 1) {
      // 最初からactiveが付いている画像を探す
      const initialActiveIndex = images.findIndex((img) =>
        img.classList.contains("active")
      );

      // 見つかればそれを初期インデックスに設定
      if (initialActiveIndex !== -1) {
        currentIndex = initialActiveIndex;
      }

      // 初期状態で正しい画像を表示
      updateImages();

      // ---------- 前へボタン ----------
      prevButton.addEventListener("click", (e) => {
        e.stopPropagation(); // モーダル外クリック判定を防ぐ
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImages();
      });

      // ---------- 次へボタン ----------
      nextButton.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % images.length;
        updateImages();
      });
    }
  });
});

// 動きを減らす設定への対応
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.style.setProperty("--animation-duration", "0.01ms");
}

// ページ離脱時のクリーンアップ
window.addEventListener("beforeunload", () => {
  sectionObserver.disconnect();
  navObserver.disconnect();
});

// ヒーロー背景画像の読み込み
window.addEventListener("load", () => {
  const heroSection = document.getElementById("hero");
  if (heroSection) {
    heroSection.classList.add("hero-loaded");
  }
});