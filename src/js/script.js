const overlay = document.getElementById('overlay');
const toggleBtn = document.querySelector('.mobile-logo-group');
const mobileMenu = document.querySelector('.mobile-menu');
const closeBtn = document.querySelector('.mobile-menu-close');
const mobile_nav = document.querySelectorAll('.nav-button');

toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    overlay.style.display = "block"
});

closeBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    overlay.style.display = "none"
});
overlay.addEventListener('click', () => {
    overlay.style.display = "none"
    mobileMenu.classList.remove('active');
})
mobile_nav.forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();
        overlay.style.display = "none";
        mobileMenu.classList.remove('active');
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) target.scrollIntoView();
    });
});


const swiper = new Swiper('.swiper', {
    loop: true,
    slidesPerView: 4,
    spaceBetween: 15,

    pagination: {
        el: '.swiper-pagination',
        type: 'progressbar'
    },

    navigation: {
        nextEl: '.swiper-next',
    },


    breakpoints: {
        0: {
            slidesPerView: 1.1,
            spaceBetween: 15
        },
        640: {
            slidesPerView: 2
        },
        1024: {
            slidesPerView: 4,
            spaceBetween: 20
        }
    },
});

const dropdown = document.getElementById('dropdown');
const selectedValueEl = document.getElementById('selectedValue');
const dropdownMenu = document.getElementById('dropdownMenu');
const productContainer = document.getElementById('product-container');
const loadingIndicator = document.getElementById('loading');

const allOptions = [14, 24, 36];
let selected = 14;

let pageNumber = 1;
let pageSize = selected;
let loading = false;

let totalRenderedProducts = 0;
let hasInsertedBanner = false;

// DROPDOWN
function toggleDropdown() {
    dropdown.classList.toggle('open');
    if (dropdown.classList.contains('open')) {
        renderOptions();
    }
}

function getBannerInsertIndex() {
    if (window.innerWidth >= 768) {
        return 5;  // desktop — po 5 kafelkach
    } else {
        return 2;  // mobile — po 2 kafelkach
    }
}

function renderOptions() {
    dropdownMenu.innerHTML = '';
    const optionsToShow = allOptions.filter(opt => opt !== selected);
    optionsToShow.forEach((value, index) => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        if (index === 0) div.style.borderTop = '1px solid black';
        div.textContent = value;
        div.onclick = function (event) {
            event.stopPropagation();
            selected = value;
            selectedValueEl.textContent = value;
            dropdown.classList.remove('open');

            // Reset
            pageSize = selected;
            pageNumber = 1;
            totalRenderedProducts = 0;
            hasInsertedBanner = false;
            loadInitialProducts();
        };
        dropdownMenu.appendChild(div);
    });
}

document.addEventListener('click', function (event) {
    if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('open');
    }
});

// POBIERANIE
async function fetchProducts(page, size) {
    loading = true;
    loadingIndicator.style.display = 'block';
    try {
        const response = await fetch(`https://brandstestowy.smallhost.pl/api/random?pageNumber=${page}&pageSize=${size}`);
        const data = await response.json();
        return data.data || [];
    } catch (e) {
        console.error('Błąd:', e);
        return [];
    } finally {
        loading = false;
        loadingIndicator.style.display = 'none';
    }
}

function renderProducts(products, append = true) {
    if (!append) {
        productContainer.innerHTML = '';
        totalRenderedProducts = 0;
        hasInsertedBanner = false;
    }

    const bannerInsertIndex = getBannerInsertIndex();

    products.forEach((prod) => {
        if (!hasInsertedBanner && totalRenderedProducts === bannerInsertIndex) {
            const banner = document.createElement('div');
            banner.className = 'banner';

            banner.innerHTML = `
  <div class="banner-text">Forma’sint.</div>
  <button class="banner-button">CHECK THIS OUT</button>
`;

            banner.style.backgroundImage = "url('/src/img/banner.jpg')";
            banner.style.backgroundSize = "cover";
            banner.style.backgroundPosition = "center";

            banner.onerror = function () {
                // jeśli chcesz obsłużyć błąd w tle, trzeba inaczej, bo to div, nie img
            };

            productContainer.appendChild(banner);
            hasInsertedBanner = true;
        }

        const tile = document.createElement('div');
        tile.className = 'product-tile';
        tile.innerHTML = `
    <h4>${prod.text}</h4>
    <img src="${prod.image}" alt="${prod.text}" />
  `;
        productContainer.appendChild(tile);
        totalRenderedProducts++;
    });

}

async function loadInitialProducts() {
    const products = await fetchProducts(pageNumber, pageSize);
    renderProducts(products, false);
}

window.addEventListener('scroll', async () => {
    if (loading) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    if (scrollHeight - scrollTop - clientHeight < 100) {
        pageNumber++;
        const moreProducts = await fetchProducts(pageNumber, pageSize);
        if (moreProducts.length > 0) {
            renderProducts(moreProducts, true);
        }
    }
});
let isDesktop = window.innerWidth >= 768;

window.addEventListener('resize', () => {
    const currentlyDesktop = window.innerWidth >= 768;
    if (currentlyDesktop !== isDesktop) {
        isDesktop = currentlyDesktop;

        pageNumber = 1;
        totalRenderedProducts = 0;
        hasInsertedBanner = false;

        productContainer.innerHTML = '';

        loadInitialProducts();
    }
});