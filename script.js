const weddingDetails = {
  date: "2027-01-26T16:00:00-03:00",
  weekday: "Sábado",
  month: "Jan",
  day: "26",
  year: "2027",
  timeLabel: "16 horas",
  place: "Basílica Nossa Senhora da Conceição, Tatuí",
  ceremony: "26 de janeiro de 2027, às 16h, na Basílica Nossa Senhora da Conceição. Praça da Matriz, 105 - Centro, Tatuí - SP.",
  reception: "Após a cerimônia, celebraremos juntos em um ambiente especial.",
  whatsappNumber: ""
};

const weddingWeekday = document.querySelector("#wedding-weekday");
const weddingMonth = document.querySelector("#wedding-month");
const weddingDateNumber = document.querySelector("#wedding-date-number");
const weddingYear = document.querySelector("#wedding-year");
const weddingTimeLabel = document.querySelector("#wedding-time");
const ceremonyInfo = document.querySelector("#ceremony-info");
const receptionInfo = document.querySelector("#reception-info");
const countdown = document.querySelector("#countdown");
const rsvpSection = document.querySelector("#presenca");
const rsvpForm = document.querySelector("#rsvp-form");
const formFeedback = document.querySelector("#form-feedback");
const envelopeGate = document.querySelector("#envelope");
const envelopeButton = document.querySelector(".envelope-button");
const envelopeSeal = document.querySelector(".envelope-seal");
const cloudTransition = document.querySelector(".cloud-transition");
const photoCarouselTrack = document.querySelector(".photo-carousel-track");
const photoSlides = Array.from(document.querySelectorAll(".photo-slide"));
const churchSection = document.querySelector(".church-section");

function applyWeddingDetails() {
  weddingWeekday.textContent = weddingDetails.weekday;
  weddingMonth.textContent = weddingDetails.month;
  weddingDateNumber.textContent = weddingDetails.day;
  weddingYear.textContent = weddingDetails.year;
  weddingTimeLabel.textContent = weddingDetails.timeLabel;
  ceremonyInfo.textContent = weddingDetails.ceremony;
  receptionInfo.textContent = weddingDetails.reception;
}

function updateCountdown() {
  if (!weddingDetails.date) {
    return;
  }

  const weddingTime = new Date(weddingDetails.date).getTime();
  const now = Date.now();
  const distance = weddingTime - now;
  const values = countdown.querySelectorAll("strong");

  if (Number.isNaN(weddingTime) || distance <= 0) {
    values.forEach((item) => {
      item.textContent = "00";
    });
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  [days, hours, minutes, seconds].forEach((value, index) => {
    values[index].textContent = String(value).padStart(2, "0");
  });
}

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function hideFloatingButtonAtRsvp() {
  if (!rsvpSection) {
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    const hasReachedRsvp = entry.isIntersecting || entry.boundingClientRect.top < 0;
    document.body.classList.toggle("rsvp-reached", hasReachedRsvp);
  });

  observer.observe(rsvpSection);
}

function setupPhotoCarousel() {
  if (!photoCarouselTrack || photoSlides.length === 0) {
    return;
  }

  let activeIndex = 0;
  let autoplayId;
  let resumeId;
  let animationId;
  let scrollFrameId;

  function updateSlideFocus() {
    const trackCenter = photoCarouselTrack.scrollLeft + photoCarouselTrack.clientWidth / 2;
    const focusRange = photoSlides[0].offsetWidth * 0.9;
    let closestIndex = 0;
    let closestDistance = Infinity;

    photoSlides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(trackCenter - slideCenter);
      const focus = Math.max(0, 1 - distance / focusRange);
      slide.style.setProperty("--focus", focus.toFixed(3));

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    activeIndex = closestIndex;
  }

  function goToSlide(index) {
    const nextIndex = (index + photoSlides.length) % photoSlides.length;
    const targetSlide = photoSlides[nextIndex];
    const targetLeft = targetSlide.offsetLeft + targetSlide.offsetWidth / 2 - photoCarouselTrack.clientWidth / 2;
    const startLeft = photoCarouselTrack.scrollLeft;
    const distance = targetLeft - startLeft;
    const duration = 1900;
    const startTime = performance.now();

    window.cancelAnimationFrame(animationId);
    photoCarouselTrack.classList.add("is-animating");

    function animateScroll(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      photoCarouselTrack.scrollLeft = startLeft + distance * eased;
      updateSlideFocus();

      if (progress < 1) {
        animationId = window.requestAnimationFrame(animateScroll);
      } else {
        photoCarouselTrack.classList.remove("is-animating");
        updateSlideFocus();
      }
    }

    animationId = window.requestAnimationFrame(animateScroll);
  }

  function startAutoplay() {
    window.clearInterval(autoplayId);
    autoplayId = window.setInterval(() => {
      goToSlide(activeIndex + 1);
    }, 3600);
  }

  function pauseAutoplay() {
    window.clearInterval(autoplayId);
    window.clearTimeout(resumeId);
    window.cancelAnimationFrame(animationId);
    photoCarouselTrack.classList.remove("is-animating");
    resumeId = window.setTimeout(startAutoplay, 5200);
  }

  photoCarouselTrack.addEventListener("scroll", () => {
    window.cancelAnimationFrame(scrollFrameId);
    scrollFrameId = window.requestAnimationFrame(updateSlideFocus);
  });
  photoCarouselTrack.addEventListener("pointerdown", pauseAutoplay);
  photoCarouselTrack.addEventListener("touchstart", pauseAutoplay, { passive: true });
  photoCarouselTrack.addEventListener("wheel", pauseAutoplay, { passive: true });

  updateSlideFocus();
  startAutoplay();
}

function setupChurchParallax() {
  if (!churchSection) {
    return;
  }

  let frameId;

  function updateParallax() {
    const rect = churchSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const total = viewportHeight + rect.height;
    const progress = (viewportHeight - rect.top) / total;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const offset = (clampedProgress - 0.5) * -150;

    churchSection.style.setProperty("--church-parallax", `${offset.toFixed(1)}px`);
  }

  function requestUpdate() {
    window.cancelAnimationFrame(frameId);
    frameId = window.requestAnimationFrame(updateParallax);
  }

  updateParallax();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function openInvitation() {
  if (envelopeGate.classList.contains("is-opening")) {
    return;
  }

  envelopeGate.classList.add("is-opening");
  cloudTransition.classList.remove("is-clearing", "is-covering");
  cloudTransition.classList.add("is-visible");

  requestAnimationFrame(() => {
    cloudTransition.classList.add("is-covering");
  });

  setTimeout(() => {
    envelopeGate.classList.add("is-hidden");
    document.documentElement.classList.remove("envelope-locked");
    document.body.classList.remove("envelope-locked");
    document.body.classList.add("invite-opened");
    document.querySelector("#inicio").scrollIntoView({ behavior: "auto" });
    cloudTransition.classList.remove("is-covering");
    cloudTransition.classList.add("is-clearing");
  }, 950);

  setTimeout(() => {
    cloudTransition.classList.remove("is-visible", "is-clearing");
  }, 3700);
}

function handleRsvp(event) {
  event.preventDefault();

  const formData = new FormData(rsvpForm);
  const confirmation = {
    name: formData.get("name").trim(),
    guests: formData.get("guests"),
    message: formData.get("message").trim(),
    sentAt: new Date().toISOString()
  };

  localStorage.setItem("cbWeddingRsvp", JSON.stringify(confirmation));
  formFeedback.textContent = `Presença confirmada, ${confirmation.name}. Obrigado pelo carinho!`;

  if (weddingDetails.whatsappNumber) {
    const text = `Oi! Confirmo minha presença no casamento de Crysthian e Bruna.%0A%0ANome: ${confirmation.name}%0AConvidados: ${confirmation.guests}%0ARecado: ${confirmation.message || "-"}`;
    window.open(`https://wa.me/${weddingDetails.whatsappNumber}?text=${text}`, "_blank");
  }

  rsvpForm.reset();
}

applyWeddingDetails();
updateCountdown();
document.documentElement.classList.add("envelope-locked");
document.body.classList.add("envelope-locked");
revealOnScroll();
hideFloatingButtonAtRsvp();
setupPhotoCarousel();
setupChurchParallax();
setInterval(updateCountdown, 1000);

envelopeButton.addEventListener("click", (event) => {
  if (event.target === envelopeSeal) {
    openInvitation();
  }
});
rsvpForm.addEventListener("submit", handleRsvp);
