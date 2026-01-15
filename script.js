// ==========================================================================
// script.js
// --------------------------------------------------------------------------
// このファイルは、ポートフォリオサイト全体のインタラクティブな動作を制御します。
// 主な機能：
// 1. スクロールに応じたアニメーション
// 2. スクロール位置に合わせたナビゲーションのハイライト
// 3. モーダルウィンドウの表示・非表示
// 4. モーダル内の画像カルーセル
// 5. 背景のパーティクルエフェクト
// ==========================================================================

/**
 * DOM要素が完全に読み込まれた後に、すべての初期化処理を実行します。
 * これにより、スクリプトがDOM要素を確実に操作できるようになります。
 */
document.addEventListener("DOMContentLoaded", () => {
  // 各機能の初期化関数を呼び出します。
  initScrollAnimations();
  initNavigation();
  initScrollIndicator();
  initParticles();
  initModal();
  initCarousel();
  initReducedMotionSupport();
  initCleanup();

  // ページ読み込み直後に実行するアニメーション
  playInitialAnimations();
});

// ==========================================================================
// 機能別 初期化関数
// ==========================================================================

/**
 * スクロール連動のアニメーションに関する初期化を行います。
 * - Intersection Observer を使って、要素が画面内に入ったらアニメーションを開始します。
 * - スクロール位置に応じてプログレスバーを更新します。
 */
function initScrollAnimations() {
  // --- Intersection Observer の設定 ---
  // threshold: 0.1  -> 要素が10%表示されたらコールバックを実行
  // rootMargin: "0px" -> ビューポートの境界を調整しない
  const sectionObserverOptions = {
    threshold: 0.1,
    rootMargin: "0px",
  };

  // アニメーションの再実行を防ぐため、一度アニメーションしたセクションを記録します。
  const animatedSections = new Set();

  // --- セクション用 Observer ---
  // セクションが画面に入ったときに、一度だけアニメーションを実行します。
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // isIntersecting: 要素がビューポート内にあるかどうかの真偽値
      if (entry.isIntersecting && !animatedSections.has(entry.target.id)) {
        animatedSections.add(entry.target.id); // アニメーション済みとして記録
        animateSection(entry.target);
      }
    });
  }, sectionObserverOptions);

  // --- タイムライン用 Observer ---
  // タイムラインの各項目を個別にアニメーションさせます。
  const timelineItemObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          timelineItemObserver.unobserve(entry.target); // 一度アニメーションしたら監視を解除
        }
      });
    },
    { threshold: 0.5 } // 要素が50%見えたら発火
  );

  // --- 監視の開始 ---
  // すべての<section>要素を監視対象に追加します。
  document.querySelectorAll("section").forEach((section) => {
    sectionObserver.observe(section);
  });

  // すべての.timeline-item要素を監視対象に追加します。
  document.querySelectorAll(".timeline-item").forEach((item) => {
    timelineItemObserver.observe(item);
  });

  // --- スクロールイベントの最適化 ---
  // スクロールイベントは頻繁に発生するため、requestAnimationFrameを使って
  // ブラウザの描画タイミングに合わせて処理を行い、パフォーマンス低下を防ぎます。
  let ticking = false;
  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgressBar();
        ticking = false;
      });
      ticking = true;
    }
  }

  // スクロールイベントリスナーを追加します。
  // { passive: true } は、スクロール処理を妨げないことをブラウザに伝え、パフォーマンスを向上させます。
  window.addEventListener("scroll", handleScroll, { passive: true });

  // グローバルにObserverを公開して、クリーンアップできるようにします。
  // （より高度な設計では、イベントバスや専用の管理オブジェクトを使うこともあります）
  window.sectionObserver = sectionObserver;
}

/**
 * ページ内ナビゲーション（ヘッダー、フローティング）の初期化を行います。
 * - クリック時のスムーズスクロール
 * - スクロール位置に応じたアクティブ状態の更新
 */
function initNavigation() {
  // --- ナビゲーション用 Observer ---
  // 現在表示されているセクションに応じて、ナビゲーションのリンクをハイライトします。
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // 対応するナビゲーションリンクを取得
        const navDot = document.querySelector(
          `.floating-nav [href="#${entry.target.id}"]`
        );
        const headerNavLink = document.querySelector(
          `.header-nav [href="#${entry.target.id}"]`
        );

        if (entry.isIntersecting) {
          // すべてのリンクから 'active' クラスを削除
          document
            .querySelectorAll(".header-nav a, .nav-dot")
            .forEach((link) => link.classList.remove("active"));

          // 現在のセクションに対応するリンクに 'active' クラスを追加
          if (headerNavLink) headerNavLink.classList.add("active");
          if (navDot) navDot.classList.add("active");
        }
      });
    },
    { threshold: 0.15 } // セクションが15%見えたら発火
  );

  // すべてのセクションを監視対象に追加します。
  document.querySelectorAll("section").forEach((section) => {
    navObserver.observe(section);
  });

  // --- クリックイベントの処理 ---
  /**
   * ナビゲーションリンクがクリックされたときに、指定されたセクションへスムーズにスクロールします。
   * @param {MouseEvent} e - クリックイベントオブジェクト
   */
  function handleNavClick(e) {
    e.preventDefault(); // デフォルトのアンカー動作（瞬時にジャンプ）をキャンセル
    const targetId = e.currentTarget.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth", // スムーズスクロールを実行
        block: "start", // ターゲット要素の上端をビューポートの上端に合わせる
      });
    }
  }

  // ヘッダーとフローティングナビゲーションのすべてのリンクにクリックイベントリスナーを追加します。
  document.querySelectorAll(".header-nav a, .nav-dot").forEach((link) => {
    link.addEventListener("click", handleNavClick);
  });

  // グローバルにObserverを公開
  window.navObserver = navObserver;
}

/**
 * スクロールインジケーター（下向き矢印）の初期化を行います。
 */
function initScrollIndicator() {
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      // クリックされたら #about セクションへスムーズスクロール
      document.getElementById("about").scrollIntoView({
        behavior: "smooth",
      });
    });
  }
}

/**
 * 背景に表示されるパーティクル（キラキラした要素）の生成を初期化します。
 */
function initParticles() {
  // 2秒ごとに新しいパーティクルを生成します。
  setInterval(createParticle, 2000);
}

/**
 * モーダルウィンドウ機能の初期化を行います。
 */
function initModal() {
  const openModalButtons = document.querySelectorAll("[data-modal-target]");
  const closeModalButtons = document.querySelectorAll(".modal-close");
  const overlays = document.querySelectorAll(".modal-overlay");

  // モーダルを開くボタンにイベントリスナーを設定
  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.querySelector(button.dataset.modalTarget);
      openModal(modal);
    });
  });

  // オーバーレイ（背景）クリックでモーダルを閉じる
  overlays.forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      // e.targetがoverlay自身の場合のみ閉じる（モーダルの中身クリックでは閉じない）
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // 閉じるボタンにイベントリスナーを設定
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal-overlay");
      closeModal(modal);
    });
  });
}

/**
 * モーダル内の画像カルーセル機能の初期化を行います。
 */
function initCarousel() {
  // すべてのカルーセルコンテナに対して処理を実行
  document.querySelectorAll(".modal-img-container").forEach((container) => {
    const prevButton = container.querySelector(".modal-img-prev");
    const nextButton = container.querySelector(".modal-img-next");
    const images = Array.from(container.querySelectorAll(".carousel-img"));
    let currentIndex = 0;

    // 画像が1枚以下の場合は、ボタンを非表示にして処理を終了
    if (images.length <= 1) {
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
      return;
    }

    /**
     * 現在のインデックスに基づいて、表示する画像を切り替えます。
     */
    function updateImages() {
      images.forEach((img, index) => {
        // currentIndexと一致する画像にだけ 'active' クラスを付与
        img.classList.toggle("active", index === currentIndex);
      });
    }

    // 初期状態でアクティブな画像を探し、そのインデックスを設定
    const initialActiveIndex = images.findIndex((img) =>
      img.classList.contains("active")
    );
    if (initialActiveIndex !== -1) {
      currentIndex = initialActiveIndex;
    }

    // 初期表示
    updateImages();

    // 「前へ」ボタンのクリック処理
    prevButton.addEventListener("click", (e) => {
      e.stopPropagation(); // 親要素（オーバーレイ）へのクリックイベント伝播を停止
      // インデックスをデクリメント。0より小さくなったら最後のインデックスに移動
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateImages();
    });

    // 「次へ」ボタンのクリック処理
    nextButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // インデックスをインクリメント。最後のインデックスを超えたら0に戻る
      currentIndex = (currentIndex + 1) % images.length;
      updateImages();
    });
  });
}

/**
 * ユーザーのOS設定で「動きを減らす」が有効になっている場合、
 * アニメーションを無効化（または最小限に）します。アクセシビリティ向上のためです。
 */
function initReducedMotionSupport() {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mediaQuery.matches) {
    // CSSカスタムプロパティを上書きして、アニメーション時間をほぼゼロにする
    document.documentElement.style.setProperty(
      "--animation-duration",
      "0.01ms"
    );
  }
}

/**
 * ページを離れる際のクリーンアップ処理を初期化します。
 * Intersection Observerなどの監視を停止し、メモリリークを防ぎます。
 */
function initCleanup() {
  window.addEventListener("beforeunload", () => {
    if (window.sectionObserver) window.sectionObserver.disconnect();
    if (window.navObserver) window.navObserver.disconnect();
    // 他のObserverも同様にdisconnectする
  });
}

// ==========================================================================
// ヘルパー関数（初期化関数から呼ばれる具体的な処理）
// ==========================================================================

/**
 * ページ読み込み時に実行される初期アニメーションを再生します。
 */
function playInitialAnimations() {
  // Heroセクションをすぐにアニメーションさせる
  const heroSection = document.getElementById("hero");
  if (heroSection) {
    heroSection.classList.add("animate");
  }

  // Hero背景画像の読み込み完了後にクラスを追加してフェードインさせる
  window.addEventListener("load", () => {
    if (heroSection) {
      heroSection.classList.add("hero-loaded");
    }
  });

  // プログレスバーを初回更新
  updateProgressBar();
}

/**
 * セクション全体に段階的なアニメーションを適用します。
 * @param {HTMLElement} section - アニメーション対象のセクション要素
 */
function animateSection(section) {
  // requestAnimationFrameを使い、ブラウザの次の描画フレームでアニメーションを開始します。
  requestAnimationFrame(() => {
    section.classList.add("animate");

    const header = section.querySelector(".section-header");
    if (header) {
      // 少し遅れてヘッダーをアニメーション
      setTimeout(() => header.classList.add("animate"), 200);
    }

    const cards = section.querySelectorAll(".content-card");
    cards.forEach((card, index) => {
      // さらに遅れて、カードを順番にアニメーション
      setTimeout(() => {
        card.classList.add("animate");
      }, 400 + index * 150); // indexに応じて開始時間をずらす
    });
  });
}

/**
 * 背景用のパーティクル要素を1つ作成し、DOMに追加します。
 */
function createParticle() {
  const particle = document.createElement("div");
  particle.className = "particle";
  // 画面のランダムな水平位置から開始
  particle.style.left = Math.random() * 100 + "vw";
  // アニメーションの長さをランダムにして、動きにばらつきを出す
  particle.style.animationDuration = Math.random() * 3 + 5 + "s";
  // 透明度をランダムにする
  particle.style.opacity = Math.random() * 0.5 + 0.3;

  document.body.appendChild(particle);

  // アニメーション終了後にDOMから要素を削除し、メモリを解放します。
  setTimeout(() => {
    particle.remove();
  }, 8000); // animation-durationの最大値より少し長く設定
}

/**
 * スクロール位置に基づいて、ページ上部のプログレスバーの幅を更新します。
 */
function updateProgressBar() {
  // window.pageYOffset: 現在のスクロール位置(Y座標)
  const scrollTop = window.pageYOffset;
  // ドキュメント全体の高さから表示領域の高さを引いた、スクロール可能な範囲
  const scrollableHeight = document.body.scrollHeight - window.innerHeight;
  // スクロール進捗率を計算 (0-100)
  const scrollPercent = (scrollTop / scrollableHeight) * 100;

  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    progressBar.style.width = scrollPercent + "%";
  }
}

/**
 * モーダルウィンドウを表示します。
 * @param {HTMLElement} modal - 表示するモーダル要素
 */
function openModal(modal) {
  if (modal == null) return; // 対象モーダルがなければ何もしない
  modal.classList.add("active"); // 'active'クラスを追加してCSSで表示
}

/**
 * モーダルウィンドウを非表示にします。
 * @param {HTMLElement} modal - 非表示にするモーダル要素
 */
function closeModal(modal) {
  if (modal == null) return;
  modal.classList.remove("active"); // 'active'クラスを削除してCSSで非表示
}

// ========================================
// スキルデータ設定（ここを変更してください）
// ========================================
const skillData = {
  labels: ["HTML", "CSS", "VSCode", "Git/GitHub", "JavaScript", "React"],
  values: [60, 60, 50, 30, 30, 10], // 各スキルの習熟度（%）
};

// ========================================
// カラー設定（ここでデザインを調整できます）
// ========================================
const colors = {
  primary: "rgba(100, 200, 220, 0.4)", // シアン系の塗り
  border: "rgba(10, 100, 130, 0.6)", // シアン系の線（濃いめ）
  grid: "rgba(1, 1, 1, 0.6)", // グリッド線（薄く）
  angleLines: "rgba(1, 1, 1, 0.6)", // 放射線（薄く）
  text: "#86868b", // ラベル文字色
};

// ========================================
// Chart.js設定
// ========================================
const ctx = document.getElementById("skillRadarChart").getContext("2d");

const skillRadarChart = new Chart(ctx, {
  type: "radar",
  data: {
    labels: skillData.labels,
    datasets: [
      {
        label: "習熟度",
        data: skillData.values,
        backgroundColor: colors.primary,
        borderColor: colors.border,
        borderWidth: 2.5,
        pointBackgroundColor: colors.border,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: colors.border,
        pointHoverBorderColor: "#fff",
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          font: {
            size: 12,
            family: "-apple-system, BlinkMacSystemFont, sans-serif",
          },
          color: colors.text,
          backdropColor: "transparent",
          callback: function (value) {
            return value + "%";
          },
        },
        grid: {
          color: colors.grid,
          lineWidth: 1,
        },
        angleLines: {
          color: colors.angleLines,
          lineWidth: 1,
        },
        pointLabels: {
          font: {
            size: 14,
            family: "-apple-system, BlinkMacSystemFont, sans-serif",
            weight: "500",
          },
          color: "#1d1d1f",
          padding: 12,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
          family: "-apple-system, BlinkMacSystemFont, sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "-apple-system, BlinkMacSystemFont, sans-serif",
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            return "習熟度: " + context.parsed.r + "%";
          },
        },
      },
    },
  },
});
