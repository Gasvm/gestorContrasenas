//Variables globales
let currentCategoryId = null;

//Función para cargar categorías
function loadCategories() {
    fetch("http://localhost:3000/categories")
        .then(res => res.json())
        .then(data => drawData(data))
        .catch(error => {
            console.error('Error al cargar categorías:', error);
        });
}

//Carga Inicial
loadCategories();

//Dibujar categorías
let drawData = (data) => {
    let parent = document.getElementById('categoryList');
    parent.innerHTML = '';

    data.forEach(category => {
        let li = document.createElement('li');
        li.setAttribute('data-id', category.id);

        // Todo en una línea con innerHTML
        li.innerHTML = `
            ${category.name}
            <button class="btn-delete-category" data-id="${category.id}">
                <i class="fa fa-trash"></i>
            </button>
        `;

        parent.appendChild(li);
    });
}

//Dibujar Sitios
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
        tdDate.innerText = site.createdAt;

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

//Cargar Sitios
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

//Recargar categoría actual
function reloadCurrentCategory() {
    if (currentCategoryId !== null) {
        loadSites(currentCategoryId);
    }
}

//Event listener de categorías
let categoryList = document.getElementById('categoryList');

categoryList.addEventListener('click', (event) => {
    // Si es el botón de eliminar, salir
    if (event.target.classList.contains('btn-delete-category')) {
        return;
    }

    // Si clickeaste cualquier LI (o sus hijos), cargar sites
    let li = event.target.closest('li');
    if (li) {
        let categoryId = li.getAttribute('data-id');
        currentCategoryId = categoryId;
        loadSites(categoryId);
        console.log('Clickeaste la categoría con ID:', categoryId);
    }
});

//Event listener global de botones
document.addEventListener('click', (event) => {
    // Botón "Add Category"
    if (event.target.id === 'buttonAddCategory') {
        showAddCategory();
    }
    // Botón "Add Sites"
    if (event.target.id === 'buttonAddSite') {
        window.location.href = 'site-form.html';
    }
    // Botón "Ir a URL"
    if (event.target.classList.contains('btn-goto')) {
        let url = event.target.getAttribute('data-url');
        console.log('Abriendo URL:', url);
        window.open(url, '_blank');
    }

    // Botón "Eliminar site"
    if (event.target.classList.contains('btn-delete')) {
        let siteId = event.target.getAttribute('data-id');
        console.log('Eliminar site con ID:', siteId);
        deleteSite(siteId);
    }

    // Botón "Eliminar categoría"
    if (event.target.classList.contains('btn-delete-category')) {
        let categoryId = event.target.getAttribute('data-id');
        console.log('Eliminar categoría con ID:', categoryId);
        deleteCategory(categoryId);
    }

    
});

//Eliminar Site
function deleteSite(siteId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            let url = `http://localhost:3000/sites/${siteId}`;

            fetch(url, {
                method: 'DELETE'
            })
                .then(res => {
                    if (!res.ok) throw new Error('Error al eliminar');
                    return res;
                })
                .then(() => {
                    Swal.fire({
                        title: '¡ELIMINADO!',
                        text: 'El site ha sido eliminado correctamente',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    reloadCurrentCategory();
                })
                .catch(error => {
                    console.error('Error al eliminar site:', error);

                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el site',
                        icon: 'error'
                    });
                });
        } else {
            console.log('Eliminación cancelada');
        }
    });
}

//Eliminar Categoría
function deleteCategory(categoryId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Se eliminarán también todos los sites de esta categoría",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            let url = `http://localhost:3000/categories/${categoryId}`;

            fetch(url, {
                method: 'DELETE'
            })
                .then(res => {
                    if (!res.ok) throw new Error('Error al eliminar categoría');
                    return res;
                })
                .then(() => {
                    Swal.fire({
                        title: '¡ELIMINADA!',
                        text: 'La categoría ha sido eliminada correctamente',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Limpiar la tabla de sites
                    document.getElementById('sitesTableBody').innerHTML = '';

                    // Limpiar la categoría actual
                    currentCategoryId = null;

                    // Recargar las categorías
                    loadCategories();
                })
                .catch(error => {
                    console.error('Error al eliminar categoría:', error);

                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar la categoría',
                        icon: 'error'
                    });
                });
        } else {
            console.log('Eliminación cancelada');
        }
    });
}

//Mostrar formulario para añadir categoría
function showAddCategory() {
    Swal.fire({
        title: 'Nueva Categoría',
        html: `
            <input id="categoryName" class="swal2-input" placeholder="Nombre de la categoría">
        `,
        showCancelButton: true,
        confirmButtonText: 'Crear',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        preConfirm: () => {
            const name = document.getElementById('categoryName').value;

            // Validar que no esté vacío
            if (!name || name.trim() === '') {
                Swal.showValidationMessage('El nombre es obligatorio');
                return false;
            }

            return { name: name.trim() };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            addCategory(result.value.name);
        }
    });
}

//Añadir categoría
function addCategory(name) {
    let url = 'http://localhost:3000/categories';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    })
        .then(res => {
            if (!res.ok) throw new Error('Error al crear categoría');
            return res.json();
        })
        .then(data => {
            console.log('Categoría creada:', data);

            Swal.fire({
                title: '¡Creada!',
                text: 'La categoría ha sido creada correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            // Recargar las categorías
            loadCategories();
        })
        .catch(error => {
            console.error('Error al crear categoría:', error);

            Swal.fire({
                title: 'Error',
                text: 'No se pudo crear la categoría',
                icon: 'error'
            });
        });
}