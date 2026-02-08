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
    window.addEventListener('resize', initMarquees);
  });
})();