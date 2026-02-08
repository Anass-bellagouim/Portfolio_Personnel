(function () {
  function setMarqueeSpeed(track, pixelsPerSecond) {
    if (!track) return;
    var distance = track.scrollWidth / 2;
    var duration = Math.max(distance / pixelsPerSecond, 10);
    track.style.setProperty('--marquee-duration', duration + 's');
  }

  function initMarquees() {
    var skillsTrack = document.getElementById('skills-track');
    if (skillsTrack && !skillsTrack.dataset.duplicated) {
      skillsTrack.innerHTML += skillsTrack.innerHTML;
      skillsTrack.dataset.duplicated = 'true';
    }

    var softSkillsTrack = document.getElementById('soft-skills-track');
    if (softSkillsTrack && !softSkillsTrack.dataset.duplicated) {
      softSkillsTrack.innerHTML += softSkillsTrack.innerHTML;
      softSkillsTrack.dataset.duplicated = 'true';
    }

    var speed = 60;
    setMarqueeSpeed(skillsTrack, speed);
    setMarqueeSpeed(softSkillsTrack, speed);

    initMarqueeDrag(skillsTrack);
    initMarqueeDrag(softSkillsTrack);
  }

  function initStagger(container) {
    var children = Array.prototype.slice.call(container.children);
    children.forEach(function (child, idx) {
      child.style.setProperty('--stagger-delay', idx * 80 + 'ms');
    });
  }

  function initReveals() {
    var revealTargets = new Set();

    document.querySelectorAll('.text-center').forEach(function (el) {
      revealTargets.add(el);
    });
    document.querySelectorAll('.skills-marquee').forEach(function (el) {
      revealTargets.add(el);
    });
    document.querySelectorAll('.card').forEach(function (el) {
      revealTargets.add(el);
    });
    document.querySelectorAll('.section-padding .container-max > .grid').forEach(function (el) {
      revealTargets.add(el);
    });
    document.querySelectorAll('.reveal').forEach(function (el) {
      revealTargets.add(el);
    });

    document.querySelectorAll('.stagger').forEach(function (el) {
      initStagger(el);
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    revealTargets.forEach(function (el) {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
      }
      observer.observe(el);
    });
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    initMarquees();
    initReveals();
    initHeroStack();
    window.addEventListener('resize', initMarquees);
  });

  function initMarqueeDrag(track) {
    if (!track) return;
    if (track.dataset.dragReady) return;
    track.dataset.dragReady = 'true';

    var marquee = track.parentElement;
    if (!marquee) return;

    var dragging = false;
    var startX = 0;
    var startTranslate = 0;

    function getCurrentTranslateX() {
      var style = window.getComputedStyle(track);
      var matrix = style.transform;
      if (matrix && matrix !== 'none') {
        var values = matrix.match(/matrix\\(([^)]+)\\)/);
        if (values && values[1]) {
          var parts = values[1].split(',');
          return parseFloat(parts[4]) || 0;
        }
      }
      return 0;
    }

    function getDurationSeconds() {
      var style = window.getComputedStyle(track);
      var dur = style.animationDuration || '0s';
      return parseFloat(dur) || 0;
    }

    function onPointerDown(e) {
      e.preventDefault();
      dragging = true;
      marquee.classList.add('is-dragging');
      track.style.animationPlayState = 'paused';
      track.style.animationDelay = '0s';
      startX = e.clientX;
      startTranslate = getCurrentTranslateX();
      if (track.setPointerCapture) {
        track.setPointerCapture(e.pointerId);
      }
    }

    function onPointerMove(e) {
      if (!dragging) return;
      e.preventDefault();
      var delta = e.clientX - startX;
      track.style.transform = 'translateX(' + (startTranslate + delta) + 'px)';
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      marquee.classList.remove('is-dragging');

      var current = getCurrentTranslateX();
      var distance = track.scrollWidth / 2;
      var duration = getDurationSeconds();
      if (distance > 0 && duration > 0) {
        var progress = Math.abs(current) / distance;
        var delay = -(progress * duration);
        track.style.animationDelay = delay + 's';
      }

      track.style.transform = '';
      track.style.animationPlayState = 'running';
      if (track.releasePointerCapture) {
        track.releasePointerCapture(e.pointerId);
      }
    }

    track.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function initHeroStack() {
    var stacks = document.querySelectorAll('.hero-card-stack');
    if (!stacks.length) return;

    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    stacks.forEach(function (stack) {
      if (stack.dataset.running) return;

      var cards = Array.prototype.slice.call(stack.querySelectorAll('.hero-card'));
      if (cards.length < 2) return;

      stack.dataset.running = 'true';

      var interval = parseInt(stack.dataset.interval || '2600', 10);

      function swapCards() {
        var front = stack.querySelector('.hero-card--front');
        var back = stack.querySelector('.hero-card--back');
        if (!front || !back) return;

        front.classList.remove('hero-card--front');
        front.classList.add('hero-card--back');

        back.classList.remove('hero-card--back');
        back.classList.add('hero-card--front');
      }

      var timer = null;
      var isAlt = stack.classList.contains('hero-card-stack--alt');
      var autoplay = !isAlt;
      if (stack.dataset.autoplay === 'true') autoplay = true;
      if (stack.dataset.autoplay === 'false') autoplay = false;

      if (autoplay) {
        timer = setInterval(swapCards, interval);
      }

      if (isAlt && stack.dataset.hoverSwap !== 'css') {
        var flipped = false;

        function handleEnter() {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
          if (!flipped) {
            swapCards();
            flipped = true;
          }
        }

        function handleLeave() {
          if (flipped) {
            swapCards();
            flipped = false;
          }
          if (autoplay && !timer) {
            timer = setInterval(swapCards, interval);
          }
        }

        stack.addEventListener('mouseenter', handleEnter);
        stack.addEventListener('mouseleave', handleLeave);
        stack.addEventListener('pointerenter', handleEnter);
        stack.addEventListener('pointerleave', handleLeave);
      }

      if (isAlt && stack.dataset.hoverSwap === 'css') {
        stack.addEventListener('touchstart', function (e) {
          e.preventDefault();
          stack.classList.toggle('is-tapped');
        });
      }
    });
  }
})();
