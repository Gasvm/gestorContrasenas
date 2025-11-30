let currentCategoryId = null;

//Fetch genérico reutilizable
async function apiFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        
        if (options.method === 'DELETE') return true;
        return await res.json();
    } catch (error) {
        console.error('Error en API:', error);
        throw error;
    }
}

//Confirmación genérica
function confirmAction(title, text) {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
}

//Mensaje de éxito
function showSuccess(text) {
    Swal.fire({
        title: '¡Hecho!',
        text: text,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

//Mensaje de error
function showError(text = 'Ocurrió un error') {
    Swal.fire({
        title: 'Error',
        text: text,
        icon: 'error'
    });
}

//Buscador genérico
function setupSearch(inputId, selector) {
    document.getElementById(inputId).addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = el.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
    });
}

//Cargar categorías
function loadCategories() {
    apiFetch('http://localhost:3000/categories')
        .then(drawData)
        .catch(() => showError('No se pudieron cargar las categorías'));
}

//Dibujar categorías
function drawData(data) {
    const parent = document.getElementById('categoryList');
    parent.innerHTML = data.map(cat => `
        <li data-id="${cat.id}">
            ${cat.icon ? cat.icon + ' ' : ''}${cat.name}
            <button class="btn-delete-category" data-id="${cat.id}">
                <i class="fa fa-trash"></i>
            </button>
        </li>
    `).join('');
}

//Mostrar formulario añadir categoría
function showAddCategory() {
    Swal.fire({
        title: 'Nueva Categoría',
        html: `
            <input id="categoryName" class="swal2-input" placeholder="Nombre de la categoría">
            <div style="margin-top: 15px;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #555;">
                    Icono (opcional):
                </label>
                <select id="categoryIcon" class="swal2-input" style="width: 100%;">
                    <option value="">Sin icono</option>
                    <option value="📱">📱 Móvil</option>
                    <option value="💼">💼 Trabajo</option>
                    <option value="🎮">🎮 Juegos</option>
                    <option value="🎬">🎬 Películas</option>
                    <option value="🛒">🛒 Compras</option>
                    <option value="❤️">❤️ Favoritos</option>
                    <option value="✉️">✉️ Email</option>
                    <option value="☁️">☁️ Cloud</option>
                    <option value="⚙️">⚙️ Configuración</option>
                    <option value="🏠">🏠 Casa</option>
                    <option value="👥">👥 Social</option>
                    <option value="🎵">🎵 Música</option>
                    <option value="🏦">🏦 Banco</option>
                    <option value="🎓">🎓 Educación</option>
                    <option value="🏥">🏥 Salud</option>
                    <option value="✈️">✈️ Viajes</option>
                    <option value="🍔">🍔 Comida</option>
                </select>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Crear',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        preConfirm: () => {
            const name = document.getElementById('categoryName').value.trim();
            const icon = document.getElementById('categoryIcon').value;
            
            if (!name) {
                Swal.showValidationMessage('El nombre es obligatorio');
                return false;
            }
            return { name, icon: icon || null };
        }
    }).then(result => {
        if (result.isConfirmed) addCategory(result.value);
    });
}

//Añadir categoría
async function addCategory(data) {
    try {
        await apiFetch('http://localhost:3000/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        showSuccess('Categoría creada correctamente');
        loadCategories();
    } catch {
        showError('No se pudo crear la categoría');
    }
}

//Eliminar categoría
async function deleteCategory(id) {
    const result = await confirmAction('¿Estás seguro?', 'Se eliminarán todos los sites de esta categoría');
    if (!result.isConfirmed) return;
    
    try {
        await apiFetch(`http://localhost:3000/categories/${id}`, { method: 'DELETE' });
        showSuccess('Categoría eliminada correctamente');
        document.getElementById('sitesTableBody').innerHTML = '';
        currentCategoryId = null;
        loadCategories();
    } catch {
        showError('No se pudo eliminar la categoría');
    }
}

//Cargar sites
function loadSites(categoryId) {
    apiFetch(`http://localhost:3000/categories/${categoryId}`)
        .then(data => drawSites(data.sites))
        .catch(() => showError('No se pudieron cargar los sites'));
}

//Dibujar sites
function drawSites(sites) {
    const tbody = document.getElementById('sitesTableBody');
    
    if (sites.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay sites en esta categoría</td></tr>';
        return;
    }
    
    tbody.innerHTML = sites.map(site => `
        <tr>
            <td>${site.url}</td>
            <td>${site.user}</td>
            <td>${site.createdAt}</td>
            <td>
                <button class="btn-goto" data-url="${site.url}">
                    <i class="fa fa-home"></i>
                </button>
                <button class="btn-edit" data-id="${site.id}">
                    <i class="fa fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${site.id}">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

//Recargar categoría actual
function reloadCurrentCategory() {
    if (currentCategoryId) loadSites(currentCategoryId);
}

//Eliminar site
async function deleteSite(id) {
    const result = await confirmAction('¿Estás seguro?', 'No podrás revertir esta acción');
    if (!result.isConfirmed) return;
    
    try {
        await apiFetch(`http://localhost:3000/sites/${id}`, { method: 'DELETE' });
        showSuccess('Site eliminado correctamente');
        reloadCurrentCategory();
    } catch {
        showError('No se pudo eliminar el site');
    }
}

//Carga inicial
loadCategories();

//Event listener categorías
document.getElementById('categoryList').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete-category')) return;
    
    const li = e.target.closest('li');
    if (li) {
        currentCategoryId = li.getAttribute('data-id');
        loadSites(currentCategoryId);
    }
});

//Event listener global
document.addEventListener('click', (e) => {
    if (e.target.id === 'buttonAddCategory') showAddCategory();
    if (e.target.id === 'buttonAddSite') window.location.href = 'site-form.html';
    if (e.target.classList.contains('btn-goto')) window.open(e.target.getAttribute('data-url'), '_blank');
    if (e.target.classList.contains('btn-delete')) deleteSite(e.target.getAttribute('data-id'));
    if (e.target.classList.contains('btn-delete-category')) deleteCategory(e.target.getAttribute('data-id'));
});

//Buscadores
setupSearch('searchCategories', '#categoryList li');
setupSearch('searchSites', '#tableSites tbody tr');