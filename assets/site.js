(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* The bar retracts on the way down and returns on the way up. */
  var head = document.querySelector(".site-head");
  if (head) {
    var lastY = window.scrollY;
    var ticking = false;
    var updateHead = function () {
      var y = window.scrollY;
      if (y < 8) {
        head.classList.remove("is-tucked");
      } else if (y > lastY + 6) {
        head.classList.add("is-tucked");
      } else if (y < lastY - 6) {
        head.classList.remove("is-tucked");
      }
      lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateHead);
      }
    }, { passive: true });
    head.addEventListener("focusin", function () {
      head.classList.remove("is-tucked");
    });
  }

  /* The race board: a demonstration of the engine, replayed when it scrolls in. */
  var board = document.querySelector(".race-board");
  var lanes = Array.prototype.slice.call(document.querySelectorAll(".lane"));
  var raceFrame = 0;

  var paintLane = function (lane, progress, status) {
    var value = Math.round(progress * 100);
    var fill = lane.querySelector(".lane-fill");
    var pct = lane.querySelector("[data-pct]");
    var label = lane.querySelector("[data-status]");
    var track = lane.querySelector(".lane-track");
    var text = value + "%";

    fill.style.transform = "scaleX(" + progress + ")";
    if (pct.textContent !== text) pct.textContent = text;
    if (label.textContent !== status) label.textContent = status;
    if (track.getAttribute("aria-valuenow") !== String(value)) {
      track.setAttribute("aria-valuenow", String(value));
    }
    lane.classList.toggle("is-winner", status === "circuit up");
    lane.classList.toggle("is-stopped", status === "stopped");
  };

  var endOf = function (lane) {
    var raw = parseFloat(lane.getAttribute("data-end"));
    return isNaN(raw) ? 1 : Math.max(0, Math.min(1, raw));
  };

  var settleRace = function () {
    window.cancelAnimationFrame(raceFrame);
    lanes.forEach(function (lane) {
      var end = endOf(lane);
      paintLane(lane, end, end === 1 ? "circuit up" : "stopped");
    });
  };

  var runRace = function () {
    if (!lanes.length) return;
    window.cancelAnimationFrame(raceFrame);

    var plans = lanes.map(function (lane, index) {
      var end = endOf(lane);
      var wins = end === 1;
      return {
        end: end,
        at: wins ? 0.76 + Math.random() * 0.16 : 0.4 + index * 0.08 + Math.random() * 0.12
      };
    });

    lanes.forEach(function (lane) {
      paintLane(lane, 0, "connecting");
    });

    var started = performance.now();
    var total = 3600;

    var frame = function (now) {
      var t = Math.min(1, (now - started) / total);
      lanes.forEach(function (lane, index) {
        var plan = plans[index];
        var local = Math.min(1, t / plan.at);
        var eased = 1 - Math.pow(1 - local, 3);
        var done = t >= plan.at;
        paintLane(
          lane,
          plan.end * eased,
          done ? (plan.end === 1 ? "circuit up" : "stopped") : "connecting"
        );
      });
      if (t < 1) {
        raceFrame = window.requestAnimationFrame(frame);
      } else {
        lanes.forEach(function (lane) {
          paintLane(lane, endOf(lane), endOf(lane) === 1 ? "circuit up" : "stopped");
        });
      }
    };
    raceFrame = window.requestAnimationFrame(frame);
  };

  if (board && lanes.length && "IntersectionObserver" in window) {
    var seen = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen) return;
        seen = true;
        observer.disconnect();
        if (reduce.matches) settleRace();
        else runRace();
      });
    }, { threshold: 0.35 });
    observer.observe(board);
  }

  /* Keep the download links on the newest release, with the static links as fallback. */
  var bySize = function (bytes) {
    var mb = bytes / 1048576;
    return mb.toFixed(1).replace(/\.0$/, "") + " MB";
  };

  var applyLatest = function (release) {
    var assets = release.assets || [];
    var find = function (pattern) {
      return assets.find(function (asset) { return pattern.test(asset.name); });
    };
    var links = {
      android: find(/-universal\.apk$/i),
      "android-arm64": find(/-arm64-v8a\.apk$/i),
      "android-v7a": find(/-armeabi-v7a\.apk$/i),
      windows: find(/win64.*\.zip$/i) || find(/\.zip$/i)
    };

    Object.keys(links).forEach(function (key) {
      var asset = links[key];
      if (!asset) return;
      document.querySelectorAll('[data-dl="' + key + '"]').forEach(function (link) {
        link.href = asset.browser_download_url;
      });
      document.querySelectorAll('[data-size="' + key + '"]').forEach(function (el) {
        el.textContent = bySize(asset.size);
      });
    });

    document.querySelectorAll("[data-release-version]").forEach(function (el) {
      el.textContent = release.tag_name;
    });

    var published = new Date(release.published_at);
    if (!isNaN(published)) {
      var label = published.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
      document.querySelectorAll("[data-release-date]").forEach(function (el) {
        el.textContent = label;
        if (el.tagName === "TIME") el.setAttribute("datetime", release.published_at.slice(0, 10));
      });
    }

    document.querySelectorAll("[data-release-url]").forEach(function (link) {
      link.href = release.html_url;
    });
  };

  if ("fetch" in window) {
    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, 6000) : 0;
    fetch("https://api.github.com/repos/Delta-Kronecker/Delta-Tor/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        if (!response.ok) throw new Error("release check failed");
        return response.json();
      })
      .then(function (release) {
        if (release && release.tag_name) applyLatest(release);
      })
      .catch(function () {
        /* The static links remain in place. */
      })
      .finally(function () {
        if (timer) window.clearTimeout(timer);
      });
  }
})();