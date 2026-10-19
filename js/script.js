/**
 * NUTRO Health & Nutrition Suite — Interactive Engine
 * High-performance, 60fps animations, glassmorphism spotlight, and view routing
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. Multi-View Routing System
  let activeViewId = null;
  window.switchView = function(targetViewId, pushToHistory = true) {
    if (activeViewId === targetViewId && !pushToHistory) return;

    const views = document.querySelectorAll('.page-view');
    views.forEach(v => v.classList.remove('active-view'));

    const targetView = document.getElementById(targetViewId);
    if (targetView) {
      targetView.classList.add('active-view');
      activeViewId = targetViewId;
    }

    // Update Nav buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
      if (btn.getAttribute('data-view') === targetViewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    const drawer = document.getElementById('mobileDrawer');
    if (drawer) drawer.classList.remove('open');

    // Update URL hash without breaking browser back/forward history
    const hashName = targetViewId.replace('view-', '');
    if (pushToHistory) {
      try {
        if (window.location.hash !== '#' + hashName) {
          history.pushState(null, '', '#' + hashName);
        }
      } catch (e) {
        window.location.hash = '#' + hashName;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) lucide.createIcons();

    // Trigger reveal animations inside the newly active view
    setTimeout(() => {
      revealInView(targetView);
    }, 60);
  };

  function handleHashRoute() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'free-app') switchView('view-free-app', false);
    else if (hash === 'pro-app') switchView('view-pro-app', false);
    else if (hash === 'compare') switchView('view-compare', false);
    else if (hash === 'privacy') switchView('view-privacy', false);
    else if (hash === 'terms') switchView('view-terms', false);
    else switchView('view-home', false);
  }

  window.addEventListener('hashchange', handleHashRoute);
  window.addEventListener('popstate', handleHashRoute);
  handleHashRoute();

  // 3. Download Dropdown Toggle
  window.toggleDownloadDropdown = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const dd = document.getElementById('downloadDropdown');
    if (dd) {
      dd.style.display = dd.style.display === 'flex' ? 'none' : 'flex';
    }
  };

  document.addEventListener('click', (e) => {
    const dd = document.getElementById('downloadDropdown');
    if (dd && !e.target.closest('#downloadDropdown') && !e.target.closest('button[onclick*="toggleDownloadDropdown"]')) {
      dd.style.display = 'none';
    }
    const drawer = document.getElementById('mobileDrawer');
    if (drawer && drawer.classList.contains('open') && !e.target.closest('#mobileDrawer') && !e.target.closest('.mobile-toggle')) {
      drawer.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dd = document.getElementById('downloadDropdown');
      if (dd) dd.style.display = 'none';
      const drawer = document.getElementById('mobileDrawer');
      if (drawer) drawer.classList.remove('open');
      if (window.closeLightbox) window.closeLightbox();
      const keyModal = document.getElementById('productKeyModal');
      if (keyModal) keyModal.classList.remove('open');
    }
  });

  // 4. Mobile Menu Drawer Toggle
  window.toggleMobileMenu = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const drawer = document.getElementById('mobileDrawer');
    if (drawer) drawer.classList.toggle('open');
  };

  // 5. Scroll Reveal Intersection Observer (Multi-directional)
  const revealSelector = '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale';
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  function initScrollReveal() {
    document.querySelectorAll(revealSelector).forEach(el => {
      revealObserver.observe(el);
    });
  }

  function revealInView(container) {
    if (!container) return;
    const elements = container.querySelectorAll(revealSelector);
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 80) {
        el.classList.add('is-visible');
      } else {
        revealObserver.observe(el);
      }
    });
  }

  initScrollReveal();

  // 5b. Scroll Dynamics: Top Progress Bar, Navbar Morph & Back-to-Top Button
  const progressBar = document.getElementById('scrollProgressBar');
  const navbar = document.querySelector('.navbar');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const glowTop = document.querySelector('.glow-top-emerald');
  const glowMid = document.querySelector('.glow-mid-cyan');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        // 1. Update top scroll progress bar
        if (progressBar) {
          progressBar.style.width = `${scrollPercent}%`;
        }

        // 2. Navbar glass morph on scroll
        if (navbar) {
          if (scrollTop > 35) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
        }

        // 3. Back to top button visibility
        if (backToTopBtn) {
          if (scrollTop > 420) {
            backToTopBtn.classList.add('is-active');
          } else {
            backToTopBtn.classList.remove('is-active');
          }
        }

        // 4. Subtle parallax depth on ambient orbs
        if (glowTop) {
          glowTop.style.transform = `translateY(${scrollTop * 0.12}px)`;
        }
        if (glowMid) {
          glowMid.style.transform = `translateY(${scrollTop * -0.08}px)`;
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 6. Interactive Cursor Spotlight on Glass Cards
  function initSpotlight() {
    const cards = document.querySelectorAll('.glass-card, .app-card, .glass-panel');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }
  initSpotlight();

  // 7. Subtle 3D Tilt Effect on App Cards
  const tiltCards = document.querySelectorAll('.app-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3.5;
      const rotateY = ((x - centerX) / centerX) * 3.5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // 8. Interactive Food Scanner Simulator
  const demoMeals = [
    {
      emoji: '🥗',
      name: 'Wild Salmon Quinoa Bowl',
      grams: 'Estimated Net Weight: 380g • Confidence 98.4%',
      cal: '620 kcal', calW: '72%',
      pro: '48g (31%)', proW: '80%',
      carb: '42g (27%)', carbW: '55%',
      fat: '24g (42%)', fatW: '45%'
    },
    {
      emoji: '🥑',
      name: 'Avocado Sourdough & Poached Eggs',
      grams: 'Estimated Net Weight: 260g • Confidence 97.2%',
      cal: '450 kcal', calW: '52%',
      pro: '22g (20%)', proW: '42%',
      carb: '34g (30%)', carbW: '48%',
      fat: '26g (50%)', fatW: '52%'
    },
    {
      emoji: '🍗',
      name: 'Grilled Chicken & Sweet Potato Thali',
      grams: 'Estimated Net Weight: 420g • Confidence 99.1%',
      cal: '510 kcal', calW: '60%',
      pro: '54g (42%)', proW: '90%',
      carb: '38g (30%)', carbW: '52%',
      fat: '12g (28%)', fatW: '24%'
    },
    {
      emoji: '🥣',
      name: 'Protein Berry Greek Oatmeal',
      grams: 'Estimated Net Weight: 310g • Confidence 96.8%',
      cal: '380 kcal', calW: '45%',
      pro: '28g (30%)', proW: '50%',
      carb: '52g (55%)', carbW: '68%',
      fat: '8g (15%)', fatW: '18%'
    }
  ];

  window.selectDemoMeal = function(idx, btn) {
    const m = demoMeals[idx];
    if (!m) return;

    // Laser Viewfinder surge
    const vf = document.querySelector('.scanner-viewfinder');
    if (vf) {
      vf.style.boxShadow = 'inset 0 0 35px rgba(6, 182, 212, 0.45), 0 0 25px rgba(6, 182, 212, 0.3)';
      setTimeout(() => {
        vf.style.boxShadow = 'inset 0 0 30px rgba(0,0,0,0.7)';
      }, 450);
    }

    const emojiEl = document.getElementById('demoMealEmoji');
    if (emojiEl) {
      emojiEl.style.transform = 'scale(0.85)';
      emojiEl.style.transition = 'transform 0.15s ease';
      setTimeout(() => {
        emojiEl.innerText = m.emoji;
        emojiEl.style.transform = 'scale(1)';
      }, 150);
    }

    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    const setW = (id, val) => { const el = document.getElementById(id); if (el) el.style.width = val; };

    setTxt('demoMealName', m.name);
    setTxt('demoMealGrams', m.grams);
    setTxt('demoCal', m.cal);
    setTxt('demoProtein', m.pro);
    setTxt('demoCarb', m.carb);
    setTxt('demoFat', m.fat);

    setW('barCal', m.calW);
    setW('barProtein', m.proW);
    setW('barCarb', m.carbW);
    setW('barFat', m.fatW);

    document.querySelectorAll('.demo-meal-btn').forEach(b => {
      b.className = 'btn btn-sm btn-glass demo-meal-btn';
    });
    if (btn) btn.className = 'btn btn-sm btn-primary demo-meal-btn';
  };

  // 9. Screenshots Gallery Selector
  const galleryItems = [
    { title: 'Normal Edition Dashboard', subtitle: '100% Offline Quick Macro Logging & Daily Rings' },
    { title: 'NUTRO+ AI Dashboard', subtitle: 'Real-time Calorie Rings & Cloud Sync Status' },
    { title: 'Gemini AI Vision Plate Scanner', subtitle: 'Multimodal Instant Plate Breakdown & Gram Estimation' },
    { title: 'Sree AI Voice Assistant', subtitle: 'Hands-Free Spoken Nutrition Coaching & Daily Audio Briefs' },
    { title: 'Weekly Macro Analytics', subtitle: 'In-Depth Protein, Carb & Fat Trend Analysis' },
    { title: 'Intake History & Timestamps', subtitle: 'Chronological Categorized Daily Meal Archive' },
    { title: 'Period & Menstrual Cycle Tracker', subtitle: 'Hormonal Phase Macro Calibration & Predictions' }
  ];

  window.selectScreenshot = function(idx, btn, src) {
    const item = galleryItems[idx];
    if (!item) return;

    const titleEl = document.getElementById('scrTitle');
    const subEl = document.getElementById('scrSubtitle');
    const imgEl = document.getElementById('scrMainImg');
    if (titleEl) titleEl.innerText = item.title;
    if (subEl) subEl.innerText = item.subtitle;
    if (src && imgEl) {
      imgEl.src = src;
    }

    document.querySelectorAll('.scr-btn').forEach(b => {
      b.className = 'btn btn-sm btn-glass scr-btn';
    });
    if (btn) btn.className = 'btn btn-sm btn-primary scr-btn';
  };

  // 10. Lightbox Modal
  window.openLightbox = function(customSrc) {
    const scrImg = document.getElementById('scrMainImg');
    const lbImg = document.getElementById('lightboxImg');
    const lbModal = document.getElementById('lightboxModal');
    if (lbImg && lbModal) {
      lbImg.src = (typeof customSrc === 'string' && customSrc) ? customSrc : (scrImg ? scrImg.src : '');
      lbModal.classList.add('open');
    }
  };

  window.closeLightbox = function() {
    const lbModal = document.getElementById('lightboxModal');
    if (lbModal) lbModal.classList.remove('open');
  };

  // 11. FAQ Accordion Toggle
  window.toggleFaq = function(el) {
    if (!el || !el.parentElement) return;
    const item = el.parentElement;
    item.classList.toggle('open');
  };

  // 12. Interactive Particle Constellation Canvas
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 140 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.min(Math.floor(window.innerWidth / 36), 22) : Math.min(Math.floor(window.innerWidth / 24), 48);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.45 + 0.2,
        color: i % 3 === 0 ? '#06B6D4' : (i % 3 === 1 ? '#10B981' : '#38BDF8')
      });
    }

    function drawParticles() {
      if (document.hidden) {
        requestAnimationFrame(drawParticles);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw constellation network lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 105) {
            const lineAlpha = (1 - dist / 105) * 0.12;
            ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Draw connections to mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const mdx = particles[i].x - mouse.x;
          const mdy = particles[i].y - mouse.y;
          const mDist = Math.hypot(mdx, mdy);
          if (mDist < mouse.radius) {
            const mAlpha = (1 - mDist / mouse.radius) * 0.2;
            ctx.strokeStyle = `rgba(56, 189, 248, ${mAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // 13. Sree AI Spoken Nutrition Companion Simulator
  const sreeResponses = [
    {
      query: "Sree, what can I eat for high-protein dinner under 500 kcal?",
      speech: "“I’ve analyzed your remaining macros. You have 42g of protein left for today. I recommend 200g of Grilled Lemon Herb Chicken Breast (330 kcal, 44g protein) paired with 150g of Steamed Broccoli Florets (52 kcal, 4g protein). Total: 382 kcal, 48g protein. It fits within your daily ring with 118 kcal to spare!”",
      badges: ["🍗 48g Protein", "⚡ 382 kcal", "🥦 High Fiber"]
    },
    {
      query: "How does my luteal cycle phase affect my carb craving today?",
      speech: "“Your body is currently in the late luteal phase, where basal metabolic rate naturally increases by 100–250 kcal/day while progesterone dips serotonin. I’ve automatically recalibrated your daily carb ceiling by +25g with complex low-glycemic options (like roasted sweet potato or rolled oats) to stabilize mood without metabolic crashes.”",
      badges: ["🩸 Luteal Phase Day 22", "🍠 +25g Slow Carbs", "🧠 Serotonin Support"]
    },
    {
      query: "Analyze my last 7 days of protein consistency.",
      speech: "“Over the past 7 days, your protein adherence score is 94.2%! You hit an average of 158g/day versus your 160g target. Your highest compliance was on post-workout Tuesday (174g). Local SQLite trend logs show zero missing meals, and your hydration averaged 3.1 liters daily.”",
      badges: ["📈 94.2% Adherence", "🔥 158g 7-Day Avg", "💧 3.1L Hydration"]
    },
    {
      query: "Sree, give me my morning audio briefing.",
      speech: "“Good morning! Today is Thursday. Yesterday you finished at 2,080 kcal with 162g of protein and hit your 10-glass water streak. Your resting metabolic recovery is primed. For breakfast, you have 650 kcal budgeted. Don't forget your morning hydration glass!”",
      badges: ["🌅 Thursday Briefing", "🎯 Day Streak: 14", "🥛 Target: 3.2L"]
    }
  ];

  window.askSreeAi = function(index, btn) {
    const item = sreeResponses[index];
    const waveBars = document.querySelectorAll('.soundwave-bar');
    const bubble = document.getElementById('sreeSpeechText');
    const badgeContainer = document.getElementById('sreeBadges');

    waveBars.forEach(b => {
      b.style.animationDuration = '0.5s';
      b.style.background = 'linear-gradient(180deg, #38BDF8, #34D399)';
    });

    document.querySelectorAll('.sree-prompt-btn').forEach(b => {
      b.className = 'btn btn-sm btn-glass sree-prompt-btn';
    });
    if (btn) btn.className = 'btn btn-sm btn-cyan sree-prompt-btn';

    if (bubble) {
      bubble.style.opacity = '0.3';
      bubble.style.transform = 'translateY(4px)';
      setTimeout(() => {
        bubble.innerText = item.speech;
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';
        bubble.style.transition = 'all 0.35s ease';

        if (badgeContainer) {
          badgeContainer.innerHTML = item.badges.map(bg => 
            `<span class="badge" style="background: rgba(167, 139, 250, 0.15); color: #C084FC; border: 1px solid rgba(167, 139, 250, 0.3); font-size: 11px;">${bg}</span>`
          ).join('');
        }

        setTimeout(() => {
          waveBars.forEach(b => {
            b.style.animationDuration = '1.2s';
            b.style.background = 'linear-gradient(180deg, #A78BFA, #06B6D4)';
          });
        }, 1200);
      }, 200);
    }
  };

  // 15. Tactile Toast Notification System
  window.showNutroToast = function(msg, icon = 'download') {
    let toast = document.getElementById('nutroToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'nutroToast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.2); padding: 8px; border-radius: 10px; color: #34D399; display: flex; align-items: center;">
        <i data-lucide="${icon}" style="width: 20px; height: 20px;"></i>
      </div>
      <div style="font-size: 13px; line-height: 1.4;">
        <div style="font-weight: 700; color: #FFFFFF;">NUTRO Sovereign Suite</div>
        <div style="color: #94A3B8;">${msg}</div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    toast.classList.add('show');

    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  };

  // 16. Product Key Verification Portal (AI Edition Gate)
  const productKeyModal = document.getElementById('productKeyModal');
  const productKeyInput = document.getElementById('productKeyInput');
  const keyStatusMsg = document.getElementById('keyStatusMsg');
  const keySubmitBtn = document.getElementById('keySubmitBtn');

  window.triggerAiDownload = function(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }

    // Dismiss any open dropdowns or drawers
    const dd = document.getElementById('downloadDropdown');
    if (dd) dd.style.display = 'none';
    const drawer = document.getElementById('mobileDrawer');
    if (drawer) drawer.classList.remove('open');

    if (productKeyModal) {
      productKeyModal.classList.add('open');
      if (productKeyInput) {
        productKeyInput.value = '';
        productKeyInput.classList.remove('is-invalid', 'is-valid');
        if (keyStatusMsg) {
          keyStatusMsg.textContent = '';
          keyStatusMsg.className = 'key-status-msg';
        }
        if (keySubmitBtn) {
          keySubmitBtn.innerHTML = '<i data-lucide="unlock" style="width:18px; height:18px;"></i> <span>Verify &amp; Download NUTRO+ (APK)</span>';
        }
        setTimeout(() => productKeyInput.focus(), 120);
      }
      if (window.lucide) lucide.createIcons();
    }
  };

  window.closeKeyModal = function(e) {
    if (e && e.target && e.target !== productKeyModal && !e.target.closest('.key-modal-close')) {
      return;
    }
    if (productKeyModal) {
      productKeyModal.classList.remove('open');
    }
  };

  window.handleKeySubmit = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!productKeyInput) return;

    const rawInput = productKeyInput.value.trim();
    const cleanKey = rawInput.toLowerCase().replace(/[\s-]/g, '_');

    // Validation: Canonical "security_key" (12 characters), variations, or 12-digit code
    const isCanonicalKey = cleanKey === 'security_key' || cleanKey === 'securitykey';
    const isTwelveDigit = /^\d{12}$/.test(rawInput.replace(/[\s-]/g, ''));

    if (isCanonicalKey || isTwelveDigit) {
      productKeyInput.classList.remove('is-invalid');
      productKeyInput.classList.add('is-valid');

      if (keyStatusMsg) {
        keyStatusMsg.textContent = '✓ 12-Digit Product Key Verified! Initiating NUTRO+ AI download...';
        keyStatusMsg.className = 'key-status-msg success';
      }

      if (keySubmitBtn) {
        keySubmitBtn.innerHTML = '<i data-lucide="check-circle" style="width:18px; height:18px;"></i> <span>Key Verified! Starting Download...</span>';
        if (window.lucide) lucide.createIcons();
      }

      // Trigger actual APK download
      const downloadLink = document.createElement('a');
      downloadLink.href = 'downloads/NUTRO_Plus.apk';
      downloadLink.download = 'NUTRO_Plus.apk';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      if (window.showNutroToast) {
        window.showNutroToast('Downloading NUTRO_Plus.apk... Gemini AI Flagship Ready!', 'sparkles');
      }

      // Automatically close modal after 1.5s
      setTimeout(() => {
        if (productKeyModal) productKeyModal.classList.remove('open');
        if (keySubmitBtn) {
          keySubmitBtn.innerHTML = '<i data-lucide="unlock" style="width:18px; height:18px;"></i> <span>Verify &amp; Download NUTRO+ (APK)</span>';
          if (window.lucide) lucide.createIcons();
        }
      }, 1500);
    } else {
      productKeyInput.classList.remove('is-valid');
      productKeyInput.classList.add('is-invalid');

      if (keyStatusMsg) {
        keyStatusMsg.textContent = '❌ Invalid product key. Please enter your valid 12-digit security key.';
        keyStatusMsg.className = 'key-status-msg error';
      }

      setTimeout(() => {
        productKeyInput.classList.remove('is-invalid');
      }, 500);
    }
  };

  // ========================================================
  // HERO WEB INTRO VIDEO CONTROLLER
  // ========================================================
  window.toggleHeroVideoPlay = function(e) {
    if (e) e.stopPropagation();
    const vid = document.getElementById('heroWebIntroVideo');
    const icon = document.getElementById('iconPlayPause');
    const text = document.getElementById('textPlayPause');
    if (!vid) return;

    if (vid.paused) {
      vid.play();
      if (text) text.textContent = 'Pause';
      if (icon) icon.setAttribute('data-lucide', 'pause');
    } else {
      vid.pause();
      if (text) text.textContent = 'Play';
      if (icon) icon.setAttribute('data-lucide', 'play');
    }
    if (window.lucide) lucide.createIcons();
  };

  window.toggleHeroVideoSound = function(e) {
    if (e) e.stopPropagation();
    const vid = document.getElementById('heroWebIntroVideo');
    const icon = document.getElementById('iconVideoSound');
    const text = document.getElementById('textVideoSound');
    if (!vid) return;

    if (vid.muted) {
      vid.muted = false;
      vid.volume = 1.0;
      if (text) text.textContent = 'Mute Sound';
      if (icon) icon.setAttribute('data-lucide', 'volume-2');
      if (window.showNutroToast) window.showNutroToast('Sound Enabled 🔊', 'volume-2');
    } else {
      vid.muted = true;
      if (text) text.textContent = 'Unmute Sound';
      if (icon) icon.setAttribute('data-lucide', 'volume-x');
      if (window.showNutroToast) window.showNutroToast('Sound Muted 🔇', 'volume-x');
    }
    if (window.lucide) lucide.createIcons();
  };

  window.openWebIntroCinemaModal = function(e) {
    if (e) e.stopPropagation();
    const modal = document.getElementById('webIntroCinemaModal');
    const cinemaVid = document.getElementById('cinemaWebIntroVideo');
    const heroVid = document.getElementById('heroWebIntroVideo');

    if (heroVid && !heroVid.paused) {
      heroVid.pause();
    }

    if (modal && cinemaVid) {
      modal.classList.add('active');
      cinemaVid.currentTime = 0;
      cinemaVid.muted = false;
      cinemaVid.volume = 1.0;
      const playPromise = cinemaVid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          cinemaVid.muted = true;
          cinemaVid.play();
        });
      }
    }
    if (window.lucide) lucide.createIcons();
  };

  window.closeWebIntroCinemaModal = function() {
    const modal = document.getElementById('webIntroCinemaModal');
    const cinemaVid = document.getElementById('cinemaWebIntroVideo');
    const heroVid = document.getElementById('heroWebIntroVideo');

    if (cinemaVid) {
      cinemaVid.pause();
    }
    if (modal) {
      modal.classList.remove('active');
    }
    if (heroVid) {
      heroVid.play();
    }
  };

  window.scrollToHeroVideo = function(e) {
    if (e) e.preventDefault();
    if (window.switchView) window.switchView('view-home');
    const sec = document.getElementById('hero-video');
    if (sec) {
      sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const frame = sec.querySelector('.video-showcase-frame');
      if (frame) {
        frame.style.borderColor = '#06B6D4';
        frame.style.boxShadow = '0 0 50px rgba(6, 182, 212, 0.5)';
        setTimeout(() => {
          frame.style.borderColor = '';
          frame.style.boxShadow = '';
        }, 1800);
      }
    }
  };
});
