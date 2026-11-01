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

  // 4b. Nav Download Dropdown Menu Toggle
  window.toggleNavDownloadMenu = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const menu = document.getElementById('navDownloadMenu');
    if (menu) {
      menu.classList.toggle('open');
      const btn = document.querySelector('.nav-download-btn');
      if (btn) btn.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
    }
  };

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('navDownloadMenu');
    if (menu && menu.classList.contains('open') && !e.target.closest('.nav-download-wrapper')) {
      menu.classList.remove('open');
      const btn = document.querySelector('.nav-download-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

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
      b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
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
      imgEl.style.opacity = '0.4';
      imgEl.style.transform = 'scale(0.98)';
      imgEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      setTimeout(() => {
        imgEl.src = src;
        imgEl.style.opacity = '1';
        imgEl.style.transform = 'scale(1)';
      }, 150);
    }

    document.querySelectorAll('.scr-btn').forEach(b => {
      b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
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

  // 13. Sree AI Spoken & Conversational Nutrition Companion Simulator
  const sreeResponses = [
    {
      query: "💧 Sree, I drank 250ml water",
      speech: "“✨ SREE: Logged 250ml of water to your daily tracker! You're now at 2,250ml / 3,000ml (75% completed). That's 9 glasses so far — keep up the fantastic hydration streak!”",
      badges: ["💧 +250ml Logged", "🥛 75% Goal Reached", "⚡ Water Tracker Sync"]
    },
    {
      query: "🥗 Sree, I ate 2 dosas and coconut chutney for lunch",
      speech: "“✨ SREE: Recorded 2 crispy dosas with coconut chutney! That's ~380 kcal, 8g protein, 52g carbs, and 16g healthy fats. Your remaining balance for today is 720 kcal and 36g protein.”",
      badges: ["🥗 380 kcal Logged", "🍗 8g Protein", "📊 Daily Rings Updated"]
    },
    {
      query: "💊 Add Paracetamol 500mg with timing at 8:00 AM daily",
      speech: "“✨ SREE: Added Paracetamol 500mg to your Medicine Tracker with daily 8:00 AM timing! I've scheduled your morning reminder with interactive 'Take' and 'Snooze' notification buttons.”",
      badges: ["💊 Paracetamol 500mg", "⏰ 8:00 AM Daily Alarm", "🔔 Push Reminder Scheduled"]
    },
    {
      query: "🔔 Turn on hydration notifications and reminders",
      speech: "“✨ SREE: Hydration notifications and daily coaching alerts are now enabled! You'll receive gentle background reminders to drink water during your active hours (8:00 AM – 10:00 PM).”",
      badges: ["🔔 Notifications Enabled", "💧 Hourly Reminders", "📱 System Alarm Set"]
    },
    {
      query: "🍗 High-protein dinner recommendation under 500 kcal",
      speech: "“✨ SREE: Based on your remaining macros (42g protein needed), I recommend 200g Grilled Lemon Herb Chicken Breast (330 kcal, 44g protein) with 150g Steamed Broccoli (52 kcal, 4g protein). Total: 382 kcal, 48g protein!”",
      badges: ["🍗 48g Protein", "⚡ 382 kcal", "🥦 High Fiber"]
    }
  ];

  window.askSreeAi = function(index, btn) {
    if (window.sreeLottieAnim) {
      try { window.sreeLottieAnim.goToAndPlay(0, true); } catch(_) {}
    }
    const item = sreeResponses[index];
    const waveBars = document.querySelectorAll('.soundwave-bar');
    const bubble = document.getElementById('sreeSpeechText');
    const badgeContainer = document.getElementById('sreeBadges');

    waveBars.forEach(b => {
      b.style.animationDuration = '0.5s';
      b.style.background = 'linear-gradient(180deg, #38BDF8, #34D399)';
    });

    document.querySelectorAll('.sree-prompt-btn').forEach(b => {
      b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    if (bubble) {
      bubble.style.opacity = '0.3';
      bubble.style.transform = 'translateY(4px)';
      setTimeout(() => {
        bubble.innerText = item.speech;
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';
        bubble.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        bubble.classList.remove('speech-animated');
        void bubble.offsetWidth;
        bubble.classList.add('speech-animated');

        if (badgeContainer) {
          badgeContainer.innerHTML = item.badges.map(bg => 
            `<span class="nav-tag nav-tag-blue">${bg}</span>`
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

  window.scrollToSection = function(id) {
    if (window.switchView) window.switchView('view-home');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // ========================================================
  // 17. INTERACTIVE MACRO & CALORIE TARGET CALCULATOR ENGINE
  // ========================================================
  let calcGender = 'male';
  let calcGoal = 'maintain'; // 'cut', 'maintain', 'bulk'

  window.setCalcGender = function(gender, btn) {
    calcGender = gender;
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    updateMacroCalc();
  };

  window.setCalcGoal = function(goal, btn) {
    calcGoal = goal;
    document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    updateMacroCalc();
  };

  window.updateMacroCalc = function() {
    const ageEl = document.getElementById('calcAge');
    const heightEl = document.getElementById('calcHeight');
    const weightEl = document.getElementById('calcWeight');
    const activityEl = document.getElementById('calcActivity');

    const age = parseFloat(ageEl ? ageEl.value : 25) || 25;
    const height = parseFloat(heightEl ? heightEl.value : 175) || 175;
    const weight = parseFloat(weightEl ? weightEl.value : 72) || 72;
    const activityMult = parseFloat(activityEl ? activityEl.value : 1.375) || 1.375;

    // 1. BMI Calculation
    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    const bmiValEl = document.getElementById('calcBmiVal');
    const bmiBadgeEl = document.getElementById('calcBmiBadge');
    const gaugePinEl = document.getElementById('calcGaugePin');

    if (bmiValEl) bmiValEl.textContent = bmi;

    let bmiStatus = 'Normal';
    let bmiColor = '#10B981';
    let pinPct = 50;

    if (bmi < 18.5) {
      bmiStatus = 'Underweight';
      bmiColor = '#38BDF8';
      pinPct = Math.max(5, (bmi / 18.5) * 25);
    } else if (bmi < 25) {
      bmiStatus = 'Normal';
      bmiColor = '#10B981';
      pinPct = 25 + ((bmi - 18.5) / 6.5) * 25;
    } else if (bmi < 30) {
      bmiStatus = 'Overweight';
      bmiColor = '#F59E0B';
      pinPct = 50 + ((bmi - 25) / 5) * 25;
    } else {
      bmiStatus = 'Obese';
      bmiColor = '#EF4444';
      pinPct = Math.min(95, 75 + ((bmi - 30) / 10) * 20);
    }

    if (bmiBadgeEl) {
      bmiBadgeEl.textContent = bmiStatus;
      bmiBadgeEl.style.backgroundColor = bmiColor + '25';
      bmiBadgeEl.style.color = bmiColor;
      bmiBadgeEl.style.borderColor = bmiColor + '50';
    }

    if (gaugePinEl) {
      gaugePinEl.style.left = pinPct + '%';
    }

    // 2. BMR & TDEE (Mifflin-St Jeor formula)
    let bmr = 0;
    if (calcGender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    let tdee = bmr * activityMult;
    let targetCalories = tdee;

    if (calcGoal === 'cut') {
      targetCalories -= 450;
    } else if (calcGoal === 'bulk') {
      targetCalories += 350;
    }
    targetCalories = Math.round(targetCalories);

    // 3. Macro Splits
    // Protein: 2.0g/kg for cut/bulk, 1.8g/kg for maintain
    const proteinFactor = (calcGoal === 'maintain') ? 1.8 : 2.0;
    const proteinG = Math.round(weight * proteinFactor);
    const fatG = Math.round((targetCalories * 0.25) / 9);
    const carbG = Math.max(50, Math.round((targetCalories - (proteinG * 4) - (fatG * 9)) / 4));

    // Water target: 35ml per kg
    const waterL = (weight * 0.035).toFixed(1);
    const waterGlasses = Math.round((weight * 35) / 250);

    const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setT('calcCaloriesTarget', targetCalories.toLocaleString() + ' kcal');
    setT('calcProteinTarget', proteinG + 'g');
    setT('calcCarbTarget', carbG + 'g');
    setT('calcFatTarget', fatG + 'g');
    setT('calcWaterTarget', waterL + 'L (' + waterGlasses + ' glasses)');
  };

  // Initialize Calculator on load
  setTimeout(updateMacroCalc, 100);

  // ========================================================
  // 18. INTERACTIVE WIDGET STUDIO SWITCHER
  // ========================================================
  let studioWaterMl = 2250;

  window.switchStudioWidget = function(idx, btn) {
    document.querySelectorAll('.studio-tab-btn').forEach(b => {
      b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    for (let i = 0; i < 4; i++) {
      const wEl = document.getElementById('studioWidget' + i);
      if (wEl) {
        if (i === idx) {
          wEl.style.display = 'block';
          wEl.style.opacity = '0';
          wEl.style.transform = 'translateY(6px) scale(0.99)';
          wEl.style.transition = 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
          requestAnimationFrame(() => {
            wEl.style.opacity = '1';
            wEl.style.transform = 'translateY(0) scale(1)';
          });
        } else {
          wEl.style.display = 'none';
        }
      }
    }
    if (window.lucide) lucide.createIcons();
  };

  window.studioAddWater = function() {
    studioWaterMl += 250;
    const waterTextEls = document.querySelectorAll('.studio-water-val');
    waterTextEls.forEach(el => {
      el.textContent = (studioWaterMl >= 1000 ? (studioWaterMl / 1000).toFixed(2) + 'L' : studioWaterMl + 'ml');
    });

    const barEl = document.getElementById('studioWaterBar');
    if (barEl) {
      const pct = Math.min(100, Math.round((studioWaterMl / 3000) * 100));
      barEl.style.width = pct + '%';
    }

    if (window.showNutroToast) {
      window.showNutroToast('+250ml Logged in Live Widget! Total: ' + (studioWaterMl / 1000).toFixed(2) + 'L', 'droplet');
    }
  };

  // ========================================================
  // 19. INTERACTIVE MEDICINE NOTIFICATION ACTION HANDLER
  // ========================================================
  window.handleNotifTake = function(btn) {
    const card = btn.closest('.medicine-notif-preview');
    if (card) {
      card.style.borderColor = '#10B981';
      card.style.background = 'rgba(16, 185, 129, 0.12)';
      const body = card.querySelector('.medicine-notif-body');
      if (body) {
        body.innerHTML = `
          <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(16, 185, 129, 0.25); display: flex; align-items: center; justify-content: center; color: #34D399;">
            <i data-lucide="check-circle-2" style="width: 20px; height: 20px;"></i>
          </div>
          <div>
            <div style="font-weight: 700; color: #FFF; font-size: 13.5px;">✓ Paracetamol 500mg Taken</div>
            <div style="font-size: 11.5px; color: #34D399;">Logged at 08:02 AM • 100% Adherence Streak</div>
          </div>
        `;
      }
      const actions = card.querySelector('.medicine-notif-actions');
      if (actions) {
        actions.innerHTML = `<span style="font-size: 12px; color: #34D399; font-weight: 600; text-align: center; width: 100%;">Saved to local SQLite database</span>`;
      }
      if (window.lucide) lucide.createIcons();
      if (window.showNutroToast) {
        window.showNutroToast('Medicine adherence logged! Push notification action completed.', 'check-circle-2');
      }
    }
  };

  window.handleNotifSnooze = function(btn) {
    const card = btn.closest('.medicine-notif-preview');
    if (card) {
      const headerTime = card.querySelector('.medicine-notif-header span:last-child');
      if (headerTime) headerTime.textContent = '08:15 AM (Snoozed)';
      if (window.showNutroToast) {
        window.showNutroToast('Alarm snoozed for 15 minutes (AlarmManager scheduled).', 'clock');
      }
    }
  };

  // ========================================================
  // 20. SREE AI CUSTOM QUERY INPUT HANDLER
  // ========================================================
  window.handleSreeCustomSend = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (window.sreeLottieAnim) {
      try { window.sreeLottieAnim.goToAndPlay(0, true); } catch(_) {}
    }
    const input = document.getElementById('sreeCustomInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    const waveBars = document.querySelectorAll('.soundwave-bar');
    const bubble = document.getElementById('sreeSpeechText');
    const badgeContainer = document.getElementById('sreeBadges');

    waveBars.forEach(b => {
      b.style.animationDuration = '0.4s';
      b.style.background = 'linear-gradient(180deg, #38BDF8, #34D399)';
    });

    let simulatedReply = '';
    let badges = [];

    const qLower = query.toLowerCase();
    if (qLower.includes('water') || qLower.includes('drank') || qLower.includes('glass')) {
      simulatedReply = `“✨ SREE: I've logged your water intake to your daily hydration streak! You are maintaining an optimal hydration curve today. Keep your fluids steady!”`;
      badges = ['💧 Hydration Logged', '🥛 SQLite Sync', '⚡ Daily Streak'];
    } else if (qLower.includes('medicine') || qLower.includes('pill') || qLower.includes('tab') || qLower.includes('timing')) {
      simulatedReply = `“✨ SREE: I've registered your medicine dosage schedule into your private Medicine Tracker. You'll receive high-priority alarms with interactive 'Take' and 'Snooze' notification triggers!”`;
      badges = ['💊 Medicine Scheduled', '⏰ Alarm Configured', '🔔 Push Active'];
    } else if (qLower.includes('protein') || qLower.includes('chicken') || qLower.includes('egg') || qLower.includes('paneer')) {
      simulatedReply = `“✨ SREE: Excellent protein choice! Protein is essential for preserving lean muscle mass during metabolic recovery. I’ve logged your intake and recalculated your remaining daily macro split.”`;
      badges = ['🍗 High Protein', '💪 Muscle Recovery', '📊 Macro Recalibrated'];
    } else {
      simulatedReply = `“✨ SREE: I analyzed your query: '${query}'. As your sovereign nutrition companion, I've checked your local SQLite profile trends. Keep fueling consistently with whole foods and hydration!”`;
      badges = ['🧠 Gemini Intelligence', '🛡️ Local On-Device', '✨ SREE Active'];
    }

    if (bubble) {
      bubble.style.opacity = '0.3';
      setTimeout(() => {
        bubble.innerText = simulatedReply;
        bubble.style.opacity = '1';
        bubble.classList.remove('speech-animated');
        void bubble.offsetWidth;
        bubble.classList.add('speech-animated');
        if (badgeContainer) {
          badgeContainer.innerHTML = badges.map(bg => 
            `<span class="nav-tag nav-tag-blue">${bg}</span>`
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

    input.value = '';
  };

  // 21. INTERACTIVE 3D PERSPECTIVE TILT & SPECULAR SPOTLIGHT
  function initCard3DTilt() {
    const cards = document.querySelectorAll('.bento-card, .hero-device-frame, .step-card');
    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3.5;
        const rotateY = ((x - centerX) / centerX) * 3.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  setTimeout(initCard3DTilt, 150);

  // Sync aria-invalid with CSS :user-invalid state per modern-web-guidance
  const syncAria = (el) => {
    if (el && el.matches) {
      el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    }
  };
  document.addEventListener('blur', (e) => syncAria(e.target), true);
  document.addEventListener('input', (e) => {
    if (e.target && e.target.hasAttribute && e.target.hasAttribute('aria-invalid')) syncAria(e.target);
  });

  // ========================================================
  // 21. SREE AI LOTTIE RUNTIME (ORIGINAL JSON ANIMATED ROBOT)
  // ========================================================
  const sreeBotContainer = document.getElementById('sreeAiLottieBot');
  if (sreeBotContainer && window.lottie) {
    try {
      window.sreeLottieAnim = lottie.loadAnimation({
        container: sreeBotContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/ai_chatbot.json'
      });
    } catch (err) {
      console.warn('Sree Lottie initialization error:', err);
    }
  }

});
