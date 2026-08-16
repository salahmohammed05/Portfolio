/* ========================================
   MAIN JAVASCRIPT — Portfolio Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initActiveNav();
  initProjectExpand();
  initContactForm();
  initBackToTop();
});

/* ----------------------------------------
   NAVBAR — Scroll Effect
   ---------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ----------------------------------------
   MOBILE MENU
   ---------------------------------------- */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ----------------------------------------
   SMOOTH SCROLL
   ---------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
      const padding = -10; // Aligns target top exactly with CSS scroll-margin-top (60px offset)
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - padding;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Update hash in address bar without jumping
      const href = anchor.getAttribute('href');
      history.pushState(null, null, href);
    });
  });
}

/* ----------------------------------------
   SCROLL REVEAL ANIMATIONS
   ---------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ----------------------------------------
   ACTIVE NAV HIGHLIGHTING
   ---------------------------------------- */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(section => observer.observe(section));
}

/* ----------------------------------------
   PROJECT CARD EXPAND/COLLAPSE
   ---------------------------------------- */
function initProjectExpand() {
  document.querySelectorAll('.btn-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      const details = card?.querySelector('.project-details');
      if (!details) return;

      const isOpen = details.classList.contains('open');
      details.classList.toggle('open');
      btn.classList.toggle('expanded');
      btn.querySelector('span').textContent = isOpen ? 'View Details' : 'Hide Details';
    });
  });
}

/* ----------------------------------------
   HACKATHON DROPDOWN
   ---------------------------------------- */
function toggleHackathonDropdown() {
  const dropdown = document.getElementById('hackathonDropdown');
  const btn = document.getElementById('hackathonDropdownBtn');
  if (!dropdown || !btn) return;

  const isOpen = dropdown.classList.contains('open');
  dropdown.classList.toggle('open');
  btn.classList.toggle('expanded');
  btn.setAttribute('aria-expanded', !isOpen);
}


/* ----------------------------------------
   CONTACT FORM
   ---------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const subject = form.querySelector('#subject').value.trim();
    const message = form.querySelector('#message').value.trim();

    // Validate
    if (!name || !email || !message) {
      showFormMessage('Please fill in all required fields.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showFormMessage('Please enter a valid email address.', 'error');
      return;
    }

    // Loading state
    const submitBtn = form.querySelector('.form-submit');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 0.8s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Sending…</span>';
    submitBtn.disabled = true;

    // Read credentials set in index.html
    const serviceId  = (typeof EMAILJS_SERVICE_ID  !== 'undefined') ? EMAILJS_SERVICE_ID  : '';
    const templateId = (typeof EMAILJS_TEMPLATE_ID !== 'undefined') ? EMAILJS_TEMPLATE_ID : '';

    const templateParams = {
      from_name:    name,
      from_email:   email,
      subject:      subject || '(No subject)',
      message:      message,
    };

    emailjs.send(serviceId, templateId, templateParams)
      .then(() => {
        showFormMessage('✅ Message sent! I\'ll get back to you soon.', 'success');
        form.reset();
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        // If credentials not yet configured, show a helpful hint
        if (!serviceId || serviceId === 'YOUR_SERVICE_ID') {
          showFormMessage('⚠️ Email service not configured yet. Please set up EmailJS credentials.', 'error');
        } else {
          showFormMessage('❌ Something went wrong. Please try again or email directly.', 'error');
        }
      })
      .finally(() => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormMessage(message, type) {
  // Remove existing message
  const existing = document.querySelector('.form-message');
  if (existing) existing.remove();

  const msg = document.createElement('div');
  msg.className = `form-message form-message-${type}`;
  msg.textContent = message;
  msg.style.cssText = `
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.88rem;
    margin-top: 12px;
    background: ${type === 'success' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
    color: ${type === 'success' ? '#34d399' : '#ef4444'};
    border: 1px solid ${type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  `;

  const form = document.getElementById('contactForm');
  form.appendChild(msg);

  setTimeout(() => msg.remove(), 5000);
}

/* ----------------------------------------
   BACK TO TOP
   ---------------------------------------- */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// CV Download Handling
// Works on both file:// (local) and http:// (hosted) environments.
(function () {
  const pdfPath = 'assets/Mohammed-Salahudeen-CV.pdf';
  const filename = 'Mohammed-Salahudeen-CV.pdf';

  const downloadBtns = [
    document.getElementById('cvDownload'),
    document.getElementById('cvDownloadResume')
  ].filter(Boolean);

  const viewBtns = [
    document.getElementById('cvViewResume')
  ].filter(Boolean);

  // Set correct href on all buttons
  downloadBtns.forEach(btn => {
    btn.setAttribute('href', pdfPath);
    btn.setAttribute('download', filename);
  });

  viewBtns.forEach(btn => {
    btn.setAttribute('href', pdfPath);
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');
    btn.removeAttribute('download');
  });

  // Force download via Blob (bypasses browser's "open in tab" behavior for PDFs)
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      fetch(pdfPath)
        .then(function (res) {
          if (!res.ok) throw new Error('Fetch failed');
          return res.blob();
        })
        .then(function (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
        })
        .catch(function () {
          // fetch() blocked (e.g. file:// protocol) — use native download attribute
          const a = document.createElement('a');
          a.href = pdfPath;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
    });
  });
})();
