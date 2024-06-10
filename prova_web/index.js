const searchInput = document.getElementById("search-noticia");
const totalFilter = document.getElementById("circulo-filtro");
const filterType = document.getElementById("filtro-tipo");
const filterQuantity = document.getElementById("filtro-quantidade");
const filterFrom = document.getElementById("filtro-de");
const filterTo = document.getElementById("filtro-ate");

const filterIcon = document.getElementById("svg-filtro");
const filterDialog = document.getElementById("dialog-filtro");
const closeDialogButton = document.getElementById("close-dialog");

const pagination = document.getElementById("paginacao");

filterIcon.addEventListener('click', () => {
    filterDialog.showModal();
});

closeDialogButton.addEventListener('click', () => {
    filterDialog.close();
});

const newsList = document.getElementById("conteudo-principal");

fetchFilteredInformation();

//START FUNCTIONS------------------------------------------------------------------------------------------

function fetchFilteredInformation() {
    setFilters();
    updateFilterCount();
    getNews().then((news) => {
        while (newsList.lastChild) {
            newsList.removeChild(newsList.lastChild);
        }
        createNewsCards(news);
        createPagination(news.totalPages, news.page);
    });
}

async function getNews() {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v3/noticias/${window.location.search}`);
    return await response.json();
}

function createNewsCards(news) {
    news.items.forEach(n => appendChild(newsList, createCard(n)));
}

//---------------------------------------------------------------------------------------------------------


//FILTERS--------------------------------------------------------------------------------------------------

function setFilters() {
    const url = new URL(window.location);
    searchInput.value = url.searchParams.get('busca') ?? '';
    filterType.value = url.searchParams.get('tipo') ?? '';
    filterQuantity.value = url.searchParams.get('qtd') ?? '10';
    filterFrom.value = url.searchParams.get('de') ?? '';
    filterTo.value = url.searchParams.get('ate') ?? '';
    url.searchParams.set('qtd', filterQuantity.value);
    url.searchParams.set('page', url.searchParams.get('page') ?? '1');
    window.history.pushState({}, '', url);
}

function search(event) {
    event.preventDefault();
    const url = new URL(window.location);
    url.searchParams.set('busca', searchInput.value);
    if (searchInput.value === '') {
        url.searchParams.delete('busca');
    }
    url.searchParams.set('page', '1');
    window.history.pushState({}, '', url);
    fetchFilteredInformation();
}

function applyFilter(event) {
    event.preventDefault();
    const url = new URL(window.location);
    url.searchParams.set('qtd', filterQuantity.value);
    filterType.value ? url.searchParams.set('tipo', filterType.value) : url.searchParams.delete('tipo');
    filterFrom.value ? url.searchParams.set('de', filterFrom.value) : url.searchParams.delete('de');
    filterTo.value ? url.searchParams.set('ate', filterTo.value) : url.searchParams.delete('ate');
    filterDialog.close();
    url.searchParams.set('page', '1');
    window.history.pushState({}, '', url);
    fetchFilteredInformation();
}

function updateFilterCount() {
    const params = new URL(window.location).searchParams;
    let totalFilters = 0;
    params.forEach((value, key) => {
        if (key !== 'page' && key !== 'busca') {
            totalFilters++;
        }
    });
    totalFilter.innerText = totalFilters;
}

//---------------------------------------------------------------------------------------------------------

//CARD-----------------------------------------------------------------------------------------------------
function createCard(news) {
    const li = createHTMLElement('li');
    const img = createHTMLElement('img');
    const textDiv = createHTMLElement('div');
    const title = createHTMLElement('h2');
    const paragraph = createHTMLElement('p');
    const divSeparator = createHTMLElement('div');
    const categories = createHTMLElement('p');
    const published = createHTMLElement('p');
    const readMoreButton = createHTMLElement('button');

    img.src = getImage(news.imagens);
    img.alt = 'Imagem da notícia';

    title.textContent = news.titulo;
    paragraph.textContent = news.introducao;
    categories.textContent = getCategories(news.editorias);
    published.textContent = getPublishedDate(news.data_publicacao);

    textDiv.setAttribute('id', 'texto-listagem');

    readMoreButton.textContent = 'Ler Mais';
    readMoreButton.addEventListener('click', () => {
        window.open(news.link, '_blank');
    });

    addClasses(readMoreButton, ['width100', 'botao-noticia']);
    addClasses(divSeparator, ['flex', 'center-space-between']);
    addClasses(textDiv, ['width100', 'flex-column', 'gap-10']);
    addClasses(img, ['imagem-noticia']);
    addClasses(li, ['card-noticia']);

    appendChild(divSeparator, categories);
    appendChild(divSeparator, published);

    appendChild(textDiv, title);
    appendChild(textDiv, paragraph);
    appendChild(textDiv, divSeparator);
    appendChild(textDiv, readMoreButton);

    appendChild(li, img);
    appendChild(li, textDiv);

    return li;
}

function getImage(image) {
    return 'https://agenciadenoticias.ibge.gov.br/' + JSON.parse(image ? image : '{"image":{"image_intro": ""}}').image_intro;
}

function getCategories(categories) {
    return '#' + categories.replace(';', ' #');
}

function getPublishedDate(dateString) {
    const date = parseDate(dateString);
    const today = new Date();
    const differenceInDays = Math.round((today - date) / (24 * 60 * 60 * 1000));
    if (differenceInDays === 0) {
        return 'Publicado hoje';
    }
    if (differenceInDays === 1) {
        return 'Publicado ontem';
    }
    return `Publicado há ${differenceInDays} dias`;
}

function parseDate(dateString) {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month}-${day}T${timePart}Z`);
}

function createHTMLElement(tag) {
    return document.createElement(tag);
}

function addClasses(element, classes) {
    classes.forEach(c => {
        element.classList.add(c);
    });
}

function appendChild(parent, child) {
    parent.appendChild(child);
}

//---------------------------------------------------------------------------------------------------------

// PAGINATION------------------------------------------------------------------------------------------------
function createPagination(totalPages, currentPage) {
    let pages = '';
    let startPage = 1;
    if (currentPage >= 7 && totalPages > 10) {
        startPage = currentPage - 5;
    }
    if (currentPage >= totalPages - 4 && totalPages > 10) {
        startPage = totalPages - 9;
    }
    const endPage = startPage + 9;
    for (let i = startPage; i <= endPage && i <= totalPages; i++) {
        pages += createPageButton(i, currentPage);
    }
    pagination.innerHTML = pages;
}

function createPageButton(index, currentPage) {
    const url = new URL(window.location);
    const isActive = url.searchParams.get('page') === index.toString();
    return `
        <li>
            <button 
                class="${isActive ? 'pagina-ativa' : 'pagina'} width100 pointer" 
                type="button" 
                onclick="changePage(${index})">${index}</button>
        </li>
    `;
}

function changePage(page) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
    fetchFilteredInformation();
}
