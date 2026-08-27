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

    // 点击导航链接后收起菜单
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
})();
