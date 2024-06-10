loadFilters()
setFilters()
loadNews()
searchLoad()

async function loadNews() {
    const newsData = await getNews()
    const newsList = document.querySelector('#new-list')
    newsList.innerHTML = newsData?.items?.map(item => {
        const images = JSON.parse(item?.imagens == "" ? '{"image_intro": ""}' : item.imagens)
        return mountCard(images.image_intro, item.titulo, item.introducao, item.editorias, item.data_publicacao, item.link)
    })?.join('') ?? ''

    setPagination(parseInt(newsData?.totalPages))
}

async function getNews() {
    const queryParam = new URLSearchParams(window.location.search);

    let url = `https://servicodados.ibge.gov.br/api/v3/noticias${window.location.search}`

    return await fetch(url)
        .then(response => response.json())
        .then(data => {
            return data
        })
        .catch(error => console.error(error))
}

function searchLoad(){
    const searchInput = document.querySelector('#search-input')
    const queryParam = new URLSearchParams(window.location.search);
    const busca = queryParam.get('busca') ?? ''
    searchInput.value = busca

    const url = new URL(window.location);
    if(busca == ''){
        url.searchParams.delete('busca')
    }
    window.history.pushState({}, '', url);
}

function searchNews(event) {
    event.preventDefault()
    const url = new URL(window.location);
    const searchInput = document.querySelector('#search-input')

    if(searchInput.value == ''){
        url.searchParams.delete('busca')
        return
    }

    url.searchParams.set('busca', searchInput.value)
    window.history.pushState({}, '', url);
    loadNews()
}


function mountCard(img, title, intro, tags, time, link) {
    let cardHtmlString = `
        <li class="card">
        <img src="https://agenciadenoticias.ibge.gov.br/${img}"
            alt="imagem da noticia" class="card-image">
        <div class="card-content">
            <h2 class="card-title">${title}</h2>
            <p class="card-intro">
                ${intro}
            </p>
            <div class="card-tags">
                <div class="card-markups">
                    ${getTags(tags)}
                </div>

                <span class="card-time">
                    ${getTime(time)}
                </span>
            </div>
            <button class="card-button" onclick="window.location.href='${link}';">Leia Mais</button>
        </div>
        </li>
        <hr>
    `
    return cardHtmlString;
}

function getTime(time){
    const quantidadeDias = calculateTime(time)

    if(quantidadeDias == 0){
        return 'Publicado Hoje'
    }
     if(quantidadeDias == 1){
        return 'Publicado Ontem'
    }
    else{
        return `Publicado ${quantidadeDias} dias atrás`
    }
}

function calculateTime(time){
    time = time.split(' ')[0].split('/').reverse().join('-')
    let milissegundosTotal = new Date() - new Date(time)
    const milissegundosPorDia = 1000 * 60 * 60 * 24;
    return Math.floor(milissegundosTotal / milissegundosPorDia);
}

function getTags(tags) {
    return tags.split(';').map(tag => `<span><strong>#${tag}</strong></span>`).join('')
}


function openModal() {
    document.getElementById('modal').setAttribute('open', true);
    document.querySelector('body').style.overflowY = 'hidden'
}

function closeModal() {
    document.getElementById('modal').removeAttribute('open');
    document.querySelector('body').style.overflowY = 'auto'
}

function setFilterQuantity() {
    let filterQuantity = 0;

    const quantidadeOption = document.querySelector('#quantidade').value;
    if (quantidadeOption != '10') {
        filterQuantity++;
    }

    const tipoOption = document.querySelector('#tipo').value;
    if (tipoOption != 'none') {
        filterQuantity++;
    }

    if (document.querySelector("#de").value != '') {
        filterQuantity++;
    }


    if (document.querySelector("#ate").value != '') {
        filterQuantity++;
    }

    const counter = document.querySelector('#filtro-counter')
    if (filterQuantity > 0) {
        counter.textContent = filterQuantity;
        counter.style.display = 'block'
    }
    else {
        counter.textContent = '';
        counter.style.display = 'none'
    }
}

function setFilters(event = null) {
    event?.preventDefault();
    const url = new URL(window.location);
    const qtd = document.querySelector('#quantidade')
    const tipo = document.querySelector('#tipo')
    const dataInicial = document.querySelector("#de")
    const dataFinal = document.querySelector("#ate")

    url.searchParams.set('qtd', qtd.value);

    if (tipo.value != 'none') {
        url.searchParams.set('tipo', tipo.value);
    }
    else {
        url.searchParams.delete('tipo');
    }

    if (dataInicial.value != '') {
        url.searchParams.set('de', dataInicial.value);
    }
    else {
        url.searchParams.delete('de');
    }

    if (dataFinal.value != '') {
        url.searchParams.set('ate', dataFinal.value);
    }
    else {
        url.searchParams.delete('ate');
    }

    window.history.pushState({}, '', url);
    setFilterQuantity()
    loadNews()
    closeModal()
}

function loadFilters() {
    const queryParam = new URLSearchParams(window.location.search);
    const qtd = queryParam.get('qtd') ?? 0
    const tipo = queryParam.get('tipo') ?? ''
    const dataInicial = queryParam.get('de') ?? ''
    const dataFinal = queryParam.get('ate') ?? ''

    const quantidadeOption = Array.from(document.querySelector('#quantidade').options).find(p => p.value == qtd)
    if (quantidadeOption) {
        quantidadeOption.selected = true
    }
    const tipoOption = Array.from(document.querySelector('#tipo').options).find(p => p.value == tipo)
    if (tipoOption) {
        tipoOption.selected = true
    }

    document.querySelector("#de").value = dataInicial
    document.querySelector("#ate").value = dataFinal
    setFilterQuantity()
}

function setPagination(qtdTotalPages){
    const queryParam = new URLSearchParams(window.location.search);
    const page = queryParam.get('page') ?? 1
    const paginationList = document.querySelector('#pagination-list')

    let paginationItens = ''


    getPaginationList(page, qtdTotalPages).forEach(p => {
        paginationItens += getPaginationItemHTML(p, p == page)
    });

    paginationList.innerHTML = paginationItens
}

function getPaginationList(page, quantidadePages){
    page = parseInt(page)
    const pages = []
    if(quantidadePages <= 10){
        for(let i = 1; i <= quantidadePages; i++){
            pages.push(i)
        }
    }
    else if(page <= 5){
        for(let i = 1; i <= 10; i++){
            pages.push(i)
        }
    }
    else if(page+5 >= quantidadePages){
        for(let i = quantidadePages-10; i < quantidadePages; i++){
            pages.push(i)
        }
    }
    else{
        for(let i = page-5; i < page+5; i++){
            pages.push(i)
        }
    }
    return pages
}


function setPage(element){
    const url = new URL(window.location);
    url.searchParams.set('page', element.textContent)
    window.history.pushState({}, '', url);
    loadNews()
}

function getPaginationItemHTML(counter, isActive){
    return `<li><button onclick="setPage(this)" class="${isActive == true ? 'active' : 'inactive'}">${counter}</button></li>`
}