(function () {
  "use strict";
  const html = document.documentElement;
  const language = html.lang === "en" ? "en" : "cn";
  const translated = (cn, en) => (language === "en" ? en : cn);
  document.querySelectorAll(".lang-toggle a").forEach((link) => {
    const target = new URL(link.href);
    target.search = location.search;
    target.hash = location.hash;
    link.href = target.href;
  });
  document.querySelectorAll("nav a[data-page]").forEach((a) => {
    if (a.dataset.page === document.body.dataset.page) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".main-nav");
  function closeMenu() {
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const opened = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(opened));
    });
    menu
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-header")) closeMenu();
    });
    window
      .matchMedia("(min-width: 901px)")
      .addEventListener("change", closeMenu);
  }

  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    function activate(tab) {
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
        document.getElementById(item.getAttribute("aria-controls")).hidden =
          !active;
      });
      if (tab.dataset.region) {
        document
          .querySelectorAll(".map-route")
          .forEach((path) =>
            path.classList.toggle(
              "is-active",
              path.dataset.region === tab.dataset.region,
            ),
          );
      }
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (e) => {
        let next;
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") next = (i + tabs.length - 1) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next !== undefined) {
          e.preventDefault();
          activate(tabs[next]);
          tabs[next].focus();
        }
      });
    });
  });
  document.querySelector("[data-back-top]")?.addEventListener("click", () =>
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    }),
  );

  const quoteForm = document.querySelector("#quote-form");
  function prepareMail() {
    if (!quoteForm) return;
    const fields = new FormData(quoteForm);
    const subject =
      translated("物流询价", "Shipping inquiry") + " — " + fields.get("route");
    const labels =
      language === "en"
        ? {
            name: "Name",
            company: "Company",
            email: "Email",
            phone: "Phone / WhatsApp / WeChat",
            route: "Route",
            cargo: "Cargo details",
          }
        : {
            name: "姓名",
            company: "公司",
            email: "邮箱",
            phone: "电话 / WhatsApp / 微信",
            route: "运输线路",
            cargo: "货物详情",
          };
    const body = Object.entries(labels)
      .map(([key, label]) => label + ": " + (fields.get(key) || ""))
      .join("\n\n");
    document.querySelector("#open-mail").href =
      "mailto:elosungvip@163.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    document.querySelector("#mail-preview").value = subject + "\n\n" + body;
    document.querySelector("#mail-result").hidden = false;
    document.querySelector("#form-status").textContent = translated(
      "询价邮件已准备好，尚未发送。请打开邮箱发送，或复制内容后发至 elosungvip@163.com。",
      "Your inquiry is ready but has not been sent. Open your email app to send it, or copy the text and email elosungvip@163.com.",
    );
  }
  if (quoteForm) {
    const allowedRoutes = {
      us: "中国 → 美国 / China → United States",
      eu: "中国 → 欧洲 / China → Europe",
      sea: "中国 → 东南亚 / China → Southeast Asia",
      me: "中国 → 中东 / China → Middle East",
      latam: "中国 → 拉美 / China → Latin America",
    };
    const route = new URLSearchParams(location.search).get("destination");
    if (allowedRoutes[route])
      document.querySelector("#route").value = allowedRoutes[route];
    const draftKey = "fugia-language-inquiry";
    const draftFields = ["name", "company", "email", "phone", "route", "cargo"];
    try {
      const draft = JSON.parse(sessionStorage.getItem(draftKey));
      sessionStorage.removeItem(draftKey);
      if (draft) {
        draftFields.forEach((key) => {
          if (typeof draft[key] === "string") quoteForm.elements[key].value = draft[key];
        });
        if (draft.prepared) prepareMail();
      }
    } catch (_) {
      /* Language navigation also works when browser storage is unavailable. */
    }
    document.querySelectorAll(".lang-toggle a").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const draft = Object.fromEntries(draftFields.map((key) => [key, quoteForm.elements[key].value]));
        draft.prepared = !document.querySelector("#mail-result").hidden;
        try {
          sessionStorage.setItem(draftKey, JSON.stringify(draft));
        } catch (_) {
          /* The destination remains accessible without browser storage. */
        }
      });
    });
    quoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (
        !quoteForm.reportValidity() ||
        quoteForm.elements.website.value.trim()
      )
        return;
      const endpoint = quoteForm.dataset.endpoint;
      const status = document.querySelector("#form-status");
      if (!endpoint) {
        prepareMail();
        status.textContent = translated(
          "询价邮件已准备好，尚未发送。请打开邮箱发送，或复制内容后发至 elosungvip@163.com。",
          "Your inquiry is ready but has not been sent. Open your email app to send it, or copy the text and email elosungvip@163.com.",
        );
        document
          .querySelector("#mail-result")
          .scrollIntoView({ block: "nearest" });
        return;
      }
      const submit = quoteForm.querySelector('[type="submit"]');
      submit.disabled = true;
      status.textContent = translated("正在提交…", "Submitting…");
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(quoteForm),
        });
        if (!response.ok) throw new Error("Request failed");
        status.textContent = translated(
          "询盘已提交，我们将通过您填写的联系方式回复。",
          "Inquiry received. We will reply using the contact details provided.",
        );
        quoteForm.reset();
      } catch (_) {
        status.textContent = translated(
          "提交失败，您的内容已保留。请通过邮箱联系。",
          "Submission failed. Your details have been kept. Please contact us by email.",
        );
      } finally {
        submit.disabled = false;
      }
    });
    quoteForm.addEventListener("input", () => {
      if (!document.querySelector("#mail-result").hidden) prepareMail();
    });
    document
      .querySelector("#copy-inquiry")
      ?.addEventListener("click", async () => {
        const preview = document.querySelector("#mail-preview");
        const status = document.querySelector("#form-status");
        try {
          await navigator.clipboard.writeText(preview.value);
          status.textContent = translated(
            "已复制询价内容。请粘贴至邮件并发送给 elosungvip@163.com。",
            "Inquiry copied. Paste it into an email to elosungvip@163.com.",
          );
        } catch (_) {
          preview.focus();
          preview.select();
          status.textContent = translated(
            "请复制下方已选中的内容，再粘贴至邮件发送。",
            "Copy the selected text below, then paste it into your email.",
          );
        }
      });
  }
})();
