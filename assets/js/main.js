/*
Sparky Energies - main.js
Alle selectors verwijzen naar vaste HTML-ID's of data-attributen.
*/
(function () {
  const body = document.body;
  const navButton = document.getElementById('navigatieMenuKnop');
  const navList = document.getElementById('primaireNavigatieLijst');
  const accessPanel = document.getElementById('toegankelijkheidPaneel');

  if (navButton && navList) {
    navButton.addEventListener('click', () => {
      const isOpen = navButton.getAttribute('aria-expanded') === 'true';
      navButton.setAttribute('aria-expanded', String(!isOpen));
      navList.classList.toggle('isOpen', !isOpen);
      if (isOpen) closeDienstenSubmenu(navList);
    });

    navList.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        navButton.setAttribute('aria-expanded', 'false');
        navList.classList.remove('isOpen');
        closeDienstenSubmenu(navList);
      }
    });

    buildDienstenDropdown(navList);
  }

  if (accessPanel) {
    buildAccessibilityDropdown(accessPanel);
  }

  // Globale back-to-topknop voor alle openbare pagina's.
  const backToTopButton = document.createElement('button');
  backToTopButton.id = 'siteBackToTopKnop';
  backToTopButton.className = 'backNaarBovenKnop';
  backToTopButton.type = 'button';
  backToTopButton.setAttribute('aria-label', 'Terug naar het begin van de pagina');
  backToTopButton.setAttribute('aria-hidden', 'true');
  backToTopButton.setAttribute('tabindex', '-1');
  backToTopButton.title = 'Terug naar boven';
  backToTopButton.innerHTML = '<span class="backNaarBovenIcoon" aria-hidden="true">&uarr;</span><span class="backNaarBovenTekst">Terug naar boven</span>';
  body.appendChild(backToTopButton);

  let backToTopFrame = 0;

  function updateBackToTopButton() {
    backToTopFrame = 0;
    const isVisible = window.scrollY > 360;
    backToTopButton.classList.toggle('isZichtbaar', isVisible);
    backToTopButton.setAttribute('aria-hidden', String(!isVisible));
    backToTopButton.setAttribute('tabindex', isVisible ? '0' : '-1');
  }

  function scheduleBackToTopUpdate() {
    if (backToTopFrame) return;
    backToTopFrame = window.requestAnimationFrame(updateBackToTopButton);
  }

  backToTopButton.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  window.addEventListener('scroll', scheduleBackToTopUpdate, { passive: true });
  updateBackToTopButton();

  function buildAccessibilityDropdown(panel) {
    const buttons = Array.from(panel.querySelectorAll('button[data-accessibility-action]'));
    if (!buttons.length) return;

    const details = document.createElement('details');
    details.className = 'toegankelijkheidDetails';

    const summary = document.createElement('summary');
    summary.className = 'toegankelijkheidToggle';
    summary.setAttribute('aria-label', 'Instellingen');
    summary.innerHTML = '<span class="toegankelijkheidToggleIcoon" aria-hidden="true">⚙</span><span class="srOnly">Instellingen</span>';

    const submenu = document.createElement('ul');
    submenu.id = 'toegankelijkheidSubmenu';
    submenu.className = 'toegankelijkheidSubmenu';
    submenu.setAttribute('role', 'menu');

    buttons.forEach((button) => {
      const item = document.createElement('li');
      item.appendChild(button);
      submenu.appendChild(item);
    });

    details.appendChild(summary);
    details.appendChild(submenu);

    panel.innerHTML = '';
    panel.appendChild(details);

    document.addEventListener('click', (event) => {
      if (!panel.contains(event.target)) {
        details.open = false;
      }
    });
  }

  function buildDienstenDropdown(navList) {
    const dienstLabels = ['Thuisbatterijen', 'Zonnepanelen', 'Laadpalen', 'Elektrotechnische renovaties'];
    const itemNodes = Array.from(navList.querySelectorAll('li'));
    const dienstItems = itemNodes.filter((item) => {
      const link = item.querySelector('a');
      return link && dienstLabels.includes(link.textContent.trim());
    });

    if (dienstItems.length !== dienstLabels.length) return;

    const submenu = document.createElement('ul');
    submenu.id = 'dienstenSubmenu';
    submenu.className = 'primaireNavigatieSubmenu';
    submenu.setAttribute('role', 'list');

    dienstItems.forEach((item) => submenu.appendChild(item));

    const toggleButton = document.createElement('button');
    toggleButton.className = 'primaireNavigatieLink primaireNavigatieSubmenuToggle';
    toggleButton.type = 'button';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', 'dienstenSubmenu');
    toggleButton.textContent = 'Diensten';

    const wrapper = document.createElement('li');
    wrapper.className = 'primaireNavigatieItem hasSubmenu';
    wrapper.appendChild(toggleButton);
    wrapper.appendChild(submenu);

    const firstServiceIndex = itemNodes.indexOf(dienstItems[0]);
    if (firstServiceIndex >= 0) {
      navList.insertBefore(wrapper, navList.children[firstServiceIndex]);
    } else {
      navList.appendChild(wrapper);
    }

    const desktopHoverQuery = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const setSubmenuOpen = (isOpen) => {
      toggleButton.setAttribute('aria-expanded', String(isOpen));
      submenu.classList.toggle('isOpen', isOpen);
    };

    toggleButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
      setSubmenuOpen(!isOpen);
    });

    wrapper.addEventListener('mouseenter', () => {
      if (desktopHoverQuery.matches) setSubmenuOpen(true);
    });

    Array.from(navList.children).forEach((item) => {
      if (item === wrapper) return;

      item.addEventListener('mouseenter', () => {
        if (desktopHoverQuery.matches) setSubmenuOpen(false);
      });

      item.addEventListener('focusin', () => {
        setSubmenuOpen(false);
      });
    });

    document.addEventListener('click', (event) => {
      if (!wrapper.contains(event.target)) {
        setSubmenuOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || toggleButton.getAttribute('aria-expanded') !== 'true') return;
      setSubmenuOpen(false);
      toggleButton.focus();
    });
  }

  function closeDienstenSubmenu(navList) {
    const submenu = navList.querySelector('.primaireNavigatieSubmenu');
    const toggleButton = navList.querySelector('.primaireNavigatieSubmenuToggle');
    if (submenu) submenu.classList.remove('isOpen');
    if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
  }

  function setPressed(id, state) {
    const button = document.getElementById(id);
    if (button) button.setAttribute('aria-pressed', String(state));
  }

  function restoreAccessibilitySettings() {
    const textLarge = localStorage.getItem('sparkyTekstGroot') === 'true';
    const highContrast = localStorage.getItem('sparkyHoogContrast') === 'true';
    body.classList.toggle('tekstGroot', textLarge);
    body.classList.toggle('hoogContrast', highContrast);
    setPressed('knopGrotereTekst', textLarge);
    setPressed('knopHoogContrast', highContrast);
  }

  restoreAccessibilitySettings();

  document.querySelectorAll('[data-accessibility-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.accessibilityAction;
      if (action === 'toggle-text-size') {
        const state = !body.classList.contains('tekstGroot');
        body.classList.toggle('tekstGroot', state);
        localStorage.setItem('sparkyTekstGroot', String(state));
        button.setAttribute('aria-pressed', String(state));
      }
      if (action === 'toggle-contrast') {
        const state = !body.classList.contains('hoogContrast');
        body.classList.toggle('hoogContrast', state);
        localStorage.setItem('sparkyHoogContrast', String(state));
        button.setAttribute('aria-pressed', String(state));
      }
      if (action === 'read-page') readCurrentPageText();
      if (action === 'stop-reading') stopReading();
    });
  });

  function getReadableText() {
    const main = document.getElementById('mainContent');
    if (!main) return '';
    const clone = main.cloneNode(true);
    clone.querySelectorAll('form, button, nav, .mediaNotitie, .formulierNotitie').forEach((el) => el.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function readCurrentPageText() {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      alert('Voorlezen wordt niet ondersteund in deze browser.');
      return;
    }
    stopReading();
    const utterance = new SpeechSynthesisUtterance(getReadableText());
    utterance.lang = 'nl-NL';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function stopReading() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  // Scrollknoppen: HTML gebruikt data-scroll-area, data-scroll-prev en data-scroll-next.
  const carouselReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const carouselScrollBehavior = carouselReducedMotion ? 'auto' : 'smooth';

  document.querySelectorAll('[data-scroll-prev], [data-scroll-next]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.scrollPrev || button.dataset.scrollNext;
      const section = document.getElementById(targetId);
      const scrollArea = section ? section.querySelector('[data-scroll-area]') : null;
      if (!scrollArea) return;
      const direction = button.dataset.scrollPrev ? -1 : 1;
      const paginationPositions = scrollArea.sparkyScrollPositions;

      if (Array.isArray(paginationPositions) && paginationPositions.length > 1) {
        const currentIndex = paginationPositions.reduce((closestIndex, position, index) => (
          Math.abs(position - scrollArea.scrollLeft) < Math.abs(paginationPositions[closestIndex] - scrollArea.scrollLeft)
            ? index
            : closestIndex
        ), 0);
        const targetIndex = Math.min(paginationPositions.length - 1, Math.max(0, currentIndex + direction));
        scrollArea.scrollTo({ left: paginationPositions[targetIndex], behavior: carouselScrollBehavior });
        return;
      }

      const amount = Math.max(280, scrollArea.clientWidth * 0.85);
      scrollArea.scrollBy({ left: direction * amount, behavior: carouselScrollBehavior });
    });
  });

  // Paginatiebolletjes: worden opnieuw berekend als de carrousel van formaat verandert.
  document.querySelectorAll('[data-scroll-pagination]').forEach((pagination) => {
    const targetId = pagination.dataset.scrollPagination;
    const section = document.getElementById(targetId);
    const scrollArea = section ? section.querySelector('[data-scroll-area]') : null;
    if (!scrollArea) return;

    const items = Array.from(scrollArea.children);
    const autoplayDelay = Number(pagination.dataset.scrollAutoplay || 0);
    let positions = [];
    let dots = [];
    let scrollFrame = 0;
    let autoplayTimer = 0;
    let isPointerOver = false;
    let isFocusWithin = false;
    let isPointerDown = false;

    function getActivePositionIndex() {
      return positions.reduce((closestIndex, position, index) => (
        Math.abs(position - scrollArea.scrollLeft) < Math.abs(positions[closestIndex] - scrollArea.scrollLeft)
          ? index
          : closestIndex
      ), 0);
    }

    function stopAutoplay() {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = 0;
    }

    function scheduleAutoplay() {
      stopAutoplay();
      const interactionPaused = isPointerOver || isFocusWithin || isPointerDown;
      if (!autoplayDelay || carouselReducedMotion || positions.length <= 1 || interactionPaused || document.hidden) return;

      autoplayTimer = window.setTimeout(() => {
        const nextIndex = (getActivePositionIndex() + 1) % positions.length;
        scrollArea.scrollTo({ left: positions[nextIndex], behavior: carouselScrollBehavior });
        scheduleAutoplay();
      }, autoplayDelay);
    }

    function updateActiveDot() {
      if (!positions.length) return;
      const activeIndex = getActivePositionIndex();

      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle('isActief', isActive);
        if (isActive) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    function rebuildPagination() {
      const scrollAreaRect = scrollArea.getBoundingClientRect();
      const maxScroll = Math.max(0, scrollArea.scrollWidth - scrollArea.clientWidth);
      const calculatedPositions = items.map((item) => {
        const itemPosition = item.getBoundingClientRect().left - scrollAreaRect.left + scrollArea.scrollLeft;
        return Math.min(maxScroll, Math.max(0, itemPosition));
      });

      positions = calculatedPositions.filter((position, index, allPositions) => (
        index === 0 || Math.abs(position - allPositions[index - 1]) > 2
      ));
      if (!positions.length) positions = [0];
      scrollArea.sparkyScrollPositions = positions;

      pagination.replaceChildren();
      dots = positions.map((position, index) => {
        const dot = document.createElement('button');
        dot.className = 'scrollPagineringBolletje';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Ga naar projectpositie ${index + 1} van ${positions.length}`);
        dot.addEventListener('click', () => {
          stopAutoplay();
          scrollArea.scrollTo({ left: position, behavior: carouselScrollBehavior });
          scheduleAutoplay();
        });
        pagination.appendChild(dot);
        return dot;
      });

      pagination.hidden = positions.length <= 1;
      updateActiveDot();
      scheduleAutoplay();
    }

    scrollArea.addEventListener('scroll', () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(updateActiveDot);
    }, { passive: true });

    section.addEventListener('mouseenter', () => {
      isPointerOver = true;
      stopAutoplay();
    });
    section.addEventListener('mouseleave', () => {
      isPointerOver = false;
      scheduleAutoplay();
    });
    section.addEventListener('focusin', () => {
      isFocusWithin = true;
      stopAutoplay();
    });
    section.addEventListener('focusout', () => {
      window.requestAnimationFrame(() => {
        isFocusWithin = section.contains(document.activeElement);
        scheduleAutoplay();
      });
    });
    scrollArea.addEventListener('pointerdown', () => {
      isPointerDown = true;
      stopAutoplay();
    });
    window.addEventListener('pointerup', () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      scheduleAutoplay();
    });
    window.addEventListener('pointercancel', () => {
      isPointerDown = false;
      scheduleAutoplay();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else scheduleAutoplay();
    });

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(rebuildPagination);
      resizeObserver.observe(scrollArea);
      scrollArea.sparkyResizeObserver = resizeObserver;
    } else {
      window.addEventListener('resize', rebuildPagination);
    }

    rebuildPagination();
  });

  // Sticky split-kaarten: maak alle kaarten even hoog en schaal de vorige tijdens het scrollen.
  document.querySelectorAll('[data-sticky-stack]').forEach((stack) => {
    const items = Array.from(stack.querySelectorAll('[data-sticky-card]'));
    const panels = items.map((item) => item.querySelector('[data-sticky-panel], .thuisbatterijEmsKaart'));
    if (items.length < 2 || panels.some((panel) => !panel)) return;

    let stackFrame = 0;
    let equalHeightFrame = 0;

    function updateStickyStack() {
      stackFrame = 0;
      const stickyLayoutActive = !carouselReducedMotion && !body.classList.contains('tekstGroot');

      panels.forEach((panel, index) => {
        if (!stickyLayoutActive || index === panels.length - 1) {
          panel.style.setProperty('--ems-kaart-schaal', '1');
          return;
        }

        const stickyTop = Number.parseFloat(window.getComputedStyle(items[index]).top) || 96;
        const nextTop = items[index + 1].getBoundingClientRect().top;
        const scrollDistance = Math.max(1, window.innerHeight - stickyTop);
        const progress = Math.min(1, Math.max(0, (window.innerHeight - nextTop) / scrollDistance));
        panel.style.setProperty('--ems-kaart-schaal', (1 - (progress * 0.2)).toFixed(3));
      });
    }

    function scheduleStickyStackUpdate() {
      if (stackFrame) return;
      stackFrame = window.requestAnimationFrame(updateStickyStack);
    }

    function equalizePanelHeights() {
      equalHeightFrame = 0;
      panels.forEach((panel) => panel.style.removeProperty('min-height'));
      const largestPanelHeight = Math.max(...panels.map((panel) => panel.offsetHeight));
      panels.forEach((panel) => panel.style.setProperty('min-height', `${largestPanelHeight}px`));
      scheduleStickyStackUpdate();
    }

    function scheduleEqualHeightUpdate() {
      if (equalHeightFrame) return;
      equalHeightFrame = window.requestAnimationFrame(equalizePanelHeights);
    }

    window.addEventListener('scroll', scheduleStickyStackUpdate, { passive: true });
    window.addEventListener('resize', scheduleEqualHeightUpdate);

    if (document.readyState === 'complete') scheduleEqualHeightUpdate();
    else window.addEventListener('load', scheduleEqualHeightUpdate, { once: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleEqualHeightUpdate);
    }

    const bodyClassObserver = new MutationObserver(scheduleEqualHeightUpdate);
    bodyClassObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
    stack.sparkyBodyClassObserver = bodyClassObserver;

    equalizePanelHeights();
    updateStickyStack();
  });

  // Scrollafbeeldingen: vergroot het beeld vanaf het ingestelde triggerpunt (standaard 80%).
  document.querySelectorAll('[data-scroll-expand-image]').forEach((card) => {
    const media = card.querySelector('[data-scroll-expand-media], .laadpalenSplitKaartMedia');
    if (!media) return;

    const section = card.closest('.siteSectie') || card;
    const fullBleed = card.hasAttribute('data-scroll-expand-full-bleed');
    const configuredStartRatio = Number.parseFloat(card.dataset.scrollExpandStart || '0.8');
    const startRatio = Number.isFinite(configuredStartRatio)
      ? Math.min(1, Math.max(0, configuredStartRatio))
      : 0.8;
    const configuredDistanceRatio = Number.parseFloat(card.dataset.scrollExpandDistance || '0.5');
    const distanceRatio = Number.isFinite(configuredDistanceRatio)
      ? Math.min(2, Math.max(0.1, configuredDistanceRatio))
      : 0.5;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const clipPathSupported = window.CSS && window.CSS.supports('clip-path', 'inset(0 50% 0 0)');
    let imageFrame = 0;
    let focusWithin = false;
    let fullBleedBounds = null;

    function resetScrollImage() {
      card.classList.remove('isScrollAfbeeldingActief');
      card.style.removeProperty('--scroll-afbeelding-inset');
      card.style.removeProperty('--scroll-volledige-breedte-offset-links');
      card.style.removeProperty('--scroll-volledige-breedte');
      card.style.removeProperty('--scroll-afbeelding-inset-links');
      card.style.removeProperty('--scroll-afbeelding-inset-rechts');
      card.style.removeProperty('--scroll-afbeelding-radius');
      fullBleedBounds = null;
    }

    function updateScrollImage() {
      imageFrame = 0;
      const animationActive = clipPathSupported
        && !reducedMotionQuery.matches
        && !body.classList.contains('tekstGroot')
        && !body.classList.contains('hoogContrast')
        && window.innerWidth >= 1024;

      if (!animationActive) {
        resetScrollImage();
        return;
      }

      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      if (fullBleed && (!fullBleedBounds || fullBleedBounds.viewportWidth !== viewportWidth)) {
        const wasActive = card.classList.contains('isScrollAfbeeldingActief');
        card.classList.remove('isScrollAfbeeldingActief');
        const baseCardRect = card.getBoundingClientRect();
        const baseMediaRect = media.getBoundingClientRect();
        fullBleedBounds = {
          viewportWidth,
          offsetLeft: -baseCardRect.left,
          insetLeft: Math.max(0, baseMediaRect.left),
          insetRight: Math.max(0, viewportWidth - baseMediaRect.right),
        };
        card.classList.toggle('isScrollAfbeeldingActief', wasActive);
      }

      card.classList.add('isScrollAfbeeldingActief');
      const sectionRect = section.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const animationStartPoint = sectionRect.top + (sectionRect.height * startRatio);
      const animationDistance = Math.max(1, Math.min(sectionRect.height * distanceRatio, window.innerHeight * 0.75));
      const scrollProgress = Math.min(1, Math.max(0, (viewportCenter - animationStartPoint) / animationDistance));
      const progress = focusWithin ? 0 : scrollProgress;
      const imageInset = (1 - progress) * 50;

      if (fullBleed) {
        const hiddenPart = 1 - progress;
        card.style.setProperty('--scroll-volledige-breedte-offset-links', `${fullBleedBounds.offsetLeft.toFixed(2)}px`);
        card.style.setProperty('--scroll-volledige-breedte', `${viewportWidth.toFixed(2)}px`);
        card.style.setProperty('--scroll-afbeelding-inset-links', `${(fullBleedBounds.insetLeft * hiddenPart).toFixed(2)}px`);
        card.style.setProperty('--scroll-afbeelding-inset-rechts', `${(fullBleedBounds.insetRight * hiddenPart).toFixed(2)}px`);
        card.style.setProperty('--scroll-afbeelding-radius', `${(10 * hiddenPart).toFixed(2)}px`);
      } else {
        card.style.setProperty('--scroll-afbeelding-inset', `${imageInset.toFixed(2)}%`);
      }
    }

    function scheduleScrollImageUpdate() {
      if (imageFrame) return;
      imageFrame = window.requestAnimationFrame(updateScrollImage);
    }

    window.addEventListener('scroll', scheduleScrollImageUpdate, { passive: true });
    window.addEventListener('resize', scheduleScrollImageUpdate);
    if ('addEventListener' in reducedMotionQuery) {
      reducedMotionQuery.addEventListener('change', scheduleScrollImageUpdate);
    } else {
      reducedMotionQuery.addListener(scheduleScrollImageUpdate);
    }

    card.addEventListener('focusin', () => {
      focusWithin = true;
      scheduleScrollImageUpdate();
    });
    card.addEventListener('focusout', () => {
      window.requestAnimationFrame(() => {
        focusWithin = card.contains(document.activeElement);
        scheduleScrollImageUpdate();
      });
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleScrollImageUpdate);
    }

    if ('ResizeObserver' in window) {
      const imageResizeObserver = new ResizeObserver(scheduleScrollImageUpdate);
      imageResizeObserver.observe(section);
      card.sparkyResizeObserver = imageResizeObserver;
    }

    const imageBodyClassObserver = new MutationObserver(scheduleScrollImageUpdate);
    imageBodyClassObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
    card.sparkyBodyClassObserver = imageBodyClassObserver;

    updateScrollImage();
  });

  // Proces-tijdlijn: vul de verticale lijn op basis van de zichtbare scrollvoortgang.
  document.querySelectorAll('[data-process-timeline]').forEach((timeline) => {
    const progressBar = timeline.querySelector('[data-process-progress]');
    if (!progressBar) return;

    if (carouselReducedMotion) {
      progressBar.style.height = '100%';
      return;
    }

    let timelineFrame = 0;

    function updateProcessTimeline() {
      timelineFrame = 0;
      const timelineRect = timeline.getBoundingClientRect();
      const startOffset = window.innerHeight * 0.7;
      const endOffset = window.innerHeight * 0.3;
      const scrollDistance = Math.max(1, timelineRect.height + startOffset - endOffset);
      const progress = Math.min(1, Math.max(0, (startOffset - timelineRect.top) / scrollDistance));
      progressBar.style.height = `${(progress * 100).toFixed(2)}%`;
    }

    function scheduleProcessTimelineUpdate() {
      if (timelineFrame) return;
      timelineFrame = window.requestAnimationFrame(updateProcessTimeline);
    }

    window.addEventListener('scroll', scheduleProcessTimelineUpdate, { passive: true });
    window.addEventListener('resize', scheduleProcessTimelineUpdate);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleProcessTimelineUpdate);
    }

    const timelineBodyClassObserver = new MutationObserver(scheduleProcessTimelineUpdate);
    timelineBodyClassObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
    timeline.sparkyBodyClassObserver = timelineBodyClassObserver;

    updateProcessTimeline();
  });

  // Voorkom dat TODO-links de gebruiker naar een lege plek sturen.
  document.querySelectorAll('a[data-link-status="todo"], a[aria-disabled="true"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const note = link.dataset.linkNote || 'Deze link moet later nog worden gekoppeld.';
      alert(note);
    });
  });

  // Algemene formulier-validatie. Backend/e-mailservice later koppelen.
  document.querySelectorAll('form[data-validate-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const note = form.querySelector('.formulierNotitie');
      if (!form.checkValidity()) {
        form.reportValidity();
        if (note) {
          note.hidden = false;
          note.textContent = 'Controleer de verplichte velden.';
        }
        return;
      }
      if (note) {
        note.hidden = false;
        note.textContent = 'Formulier gevalideerd. Koppel hier later backend, e-mailservice of CRM aan.';
      }
    });
  });

  // Open rekenmodule: de HTML-velden staan klaar. Vul de definitieve formules hieronder later in.
  document.querySelectorAll('form[data-calculation-form="sparky-advies"]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const output = form.querySelector('output');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const waarden = new FormData(form);
      const jaarverbruik = Number(waarden.get('jaarverbruikKwh') || 0);
      const teruglevering = Number(waarden.get('terugleveringKwh') || 0);
      const afstand = Number(waarden.get('afstandMeterkastMeter') || 0);

      // TODO DEFINITIEVE REKENMODULE:
      // 1. Voeg prijsdatabase of staffeltabel toe voor thuisbatterij, zonnepanelen, laadpaal en renovaties.
      // 2. Voeg business rules toe voor hoofdzekering, kabelafstand, meterkastuitbreiding en btw/KOR.
      // 3. Voeg besparingsformule toe voor dynamisch contract, salderen, zelfverbruik en teruglevering.
      // 4. Vervang onderstaande tekst door echte output.
      if (output) {
        output.textContent = `Voorlopige invoer ontvangen: jaarverbruik ${jaarverbruik || 'onbekend'} kWh, teruglevering ${teruglevering || 'onbekend'} kWh, afstand meterkast ${afstand || 'onbekend'} meter. De definitieve besparings- en kostencalculatie moet nog worden gekoppeld.`;
      }
    });
  });
}());
