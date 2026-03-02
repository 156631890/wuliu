(function () {
  const html = document.documentElement;
  const storedLang = localStorage.getItem('site_lang') || 'cn';

  function setLanguage(lang) {
    html.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
    document.querySelectorAll('[data-cn][data-en]').forEach((el) => {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.cn;
    });

    document.querySelectorAll('[data-placeholder-cn][data-placeholder-en]').forEach((el) => {
      el.placeholder = lang === 'en' ? el.dataset.placeholderEn : el.dataset.placeholderCn;
    });

    document.querySelectorAll('.lang-toggle button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    localStorage.setItem('site_lang', lang);
  }

  document.querySelectorAll('.lang-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  const page = document.body.dataset.page;
  document.querySelectorAll('nav a[data-page]').forEach((a) => {
    if (a.dataset.page === page) {
      a.classList.add('active');
    }
  });

  const revealTargets = document.querySelectorAll('.section, .hero-main, .hero-side, .card');
  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(i * 60, 360)}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((el) => observer.observe(el));

  const form = document.querySelector('#quote-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.querySelector('#form-status');
      const hpValue = form.querySelector('input[name="website"]').value.trim();
      if (hpValue) {
        if (status) {
          status.textContent = 'Blocked as spam.';
        }
        return;
      }

      const formData = new FormData(form);
      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        if (status) {
          status.textContent = html.lang === 'en' ? 'Submitted locally. Configure CRM endpoint to go live.' : '已本地提交演示。上线时请配置 CRM 接口地址。';
        }
        form.reset();
        return;
      }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });
        if (!res.ok) {
          throw new Error('Request failed');
        }
        if (status) {
          status.textContent = html.lang === 'en' ? 'Inquiry submitted successfully.' : '询盘提交成功。';
        }
        form.reset();
      } catch (err) {
        if (status) {
          status.textContent = html.lang === 'en' ? 'Submission failed. Please contact us by email.' : '提交失败，请通过邮箱联系。';
        }
      }
    });
  }

  setLanguage(storedLang);
})();
