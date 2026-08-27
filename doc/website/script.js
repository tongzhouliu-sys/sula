(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");

  // 滚动时给导航加背景
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 移动端菜单展开
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 入场动画：IntersectionObserver
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  // FAQ 手风琴
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var wasOpen = item.classList.contains("open");
      // 关闭同组其他项
      var group = btn.closest(".faq");
      if (group) {
        group.querySelectorAll(".faq-item.open").forEach(function (it) {
          it.classList.remove("open");
        });
      }
      if (!wasOpen) item.classList.add("open");
    });
  });

  // 预约演示表单（本地演示提交，不发送数据）
  var form = document.getElementById("demoForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var valid = true;
      var required = form.querySelectorAll("[required]");
      required.forEach(function (el) {
        var ok = el.type === "checkbox" ? el.checked : el.value.trim() !== "";
        el.classList.toggle("error", !ok);
        if (!ok) valid = false;
      });

      if (!valid) return;

      var btn = form.querySelector("button[type='submit']");
      var success = document.getElementById("formSuccess");
      var original = btn.textContent;

      btn.disabled = true;
      btn.textContent = "正在安全提交，请稍候……";

      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = original;
        if (success) success.classList.add("show");
        form.reset();
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 900);
    });

    // 输入时清除错误态
    form.querySelectorAll("[required]").forEach(function (el) {
      el.addEventListener("input", function () {
        el.classList.remove("error");
      });
      el.addEventListener("change", function () {
        el.classList.remove("error");
      });
    });
  }
})();
