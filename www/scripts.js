async function getCategories() {
    try {
        const response = await fetch('http://localhost:3000/categories');
        if (response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fetch("http://localhost:3000/categories")
    .then(res => res.json())
    .then(data => drawData(data))

let drawData = (data) => {
    let parent = document.getElementById('categoryList');
    parent.innerHTML = '';

    data.forEach(category => {
        let li = document.createElement('li');
        li.innerText = category.name;
        li.setAttribute('data-id', category.id);
        parent.appendChild(li);
    });
}

function drawSites(sites) {
    let tbody = document.getElementById('sitesTableBody');
    tbody.innerHTML = '';
    
    if (sites.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay sites en esta categoría</td></tr>';
        return;
    }
    
    sites.forEach(site => {
        let tr = document.createElement('tr');
        
        let tdURL = document.createElement('td');
        tdURL.innerText = site.url;
        
        let tdUser = document.createElement('td');
        tdUser.innerText = site.user;
        
        let tdDate = document.createElement('td');
        tdDate.innerText = site.createdAt;  // ← CAMBIO AQUÍ
        
        let tdActions = document.createElement('td');
        tdActions.innerHTML = `
            <button class="btn-goto" data-url="${site.url}">
                <i class="fa fa-home"></i>
            </button>
            <button class="btn-edit" data-id="${site.id}">
                <i class="fa fa-edit"></i>
            </button>
            <button class="btn-delete" data-id="${site.id}">
                <i class="fa fa-trash"></i>
            </button>
        `;
        
        tr.appendChild(tdURL);
        tr.appendChild(tdUser);
        tr.appendChild(tdDate);
        tr.appendChild(tdActions);
        
        tbody.appendChild(tr);
    });
}

function loadSites(categoryId) {
    let url = `http://localhost:3000/categories/${categoryId}`;

    console.log('Pidiendo sites de categoría:', categoryId);
    console.log('URL:', url);

    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log('Datos recibidos:', data);
            drawSites(data.sites);
        })
        .catch(error => {
            console.error('Error al cargar sites:', error);
        });
}

let categoryList = document.getElementById('categoryList');

categoryList.addEventListener('click', (event) => {
    let clickedElement = event.target;

    if (clickedElement.tagName === 'LI') {
        let categoryId = clickedElement.getAttribute('data-id');

        loadSites(categoryId);

        console.log('Clickeaste la categoría con ID:', categoryId);
    }
});