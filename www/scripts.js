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