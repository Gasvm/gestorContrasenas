// Cargar categorías al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadCategoriesIntoSelect();
});

// Cargar categorías en el select
function loadCategoriesIntoSelect() {
    fetch('http://localhost:3000/categories')
        .then(res => res.json())
        .then(categories => {
            let select = document.getElementById('categorySelect');
            
            categories.forEach(category => {
                let option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar categorías:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las categorías',
                icon: 'error'
            });
        });
}

// Event listener del formulario
let form = document.getElementById('siteForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Obtener valores del formulario
    let categoryId = document.getElementById('categorySelect').value;
    let name = document.getElementById('siteName').value.trim();
    let url = document.getElementById('siteUrl').value.trim();
    let user = document.getElementById('siteUser').value.trim();
    let password = document.getElementById('sitePassword').value;
    
    // Validar que los campos obligatorios no estén vacíos
    if (!categoryId || !name || !user || !password) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor completa todos los campos obligatorios',
            icon: 'error'
        });
        return;
    }
    
    // Crear objeto con los datos
    let siteData = {
        categoryId: parseInt(categoryId),
        name: name,
        url: url || '',
        user: user,
        password: password
    };
    
    // Enviar a la API
    createSite(siteData);
});

// Crear site en la API
function createSite(siteData) {
    fetch('http://localhost:3000/sites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(siteData)
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al crear site');
        return res.json();
    })
    .then(data => {
        console.log('Site creado:', data);
        
        Swal.fire({
            title: '¡Creado!',
            text: 'El site ha sido creado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Redirigir a index después de 2 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    })
    .catch(error => {
        console.error('Error al crear site:', error);
        
        Swal.fire({
            title: 'Error',
            text: 'No se pudo crear el site',
            icon: 'error'
        });
    });
}

// Botón cancelar
let btnCancel = document.getElementById('btnCancel');

btnCancel.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Botón generar contraseña
let btnGeneratePassword = document.getElementById('btnGeneratePassword');

btnGeneratePassword.addEventListener('click', () => {
    let password = generatePassword();
    document.getElementById('sitePassword').value = password;
    
    console.log('Contraseña generada:', password);
});

// Función para generar contraseña aleatoria
function generatePassword() {
    // Caracteres disponibles
    let mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let minusculas = 'abcdefghijklmnopqrstuvwxyz';
    let numeros = '0123456789';
    let simbolos = '!@#$%&*-_+=';
    
    // Juntar todos los caracteres
    let todosLosCaracteres = mayusculas + minusculas + numeros + simbolos;
    
    // Longitud de la contraseña (entre 10 y 12 caracteres)
    let longitud = 12;
    
    let password = '';
    
    // Generar caracteres aleatorios
    for (let i = 0; i < longitud; i++) {
        let indiceAleatorio = Math.floor(Math.random() * todosLosCaracteres.length);
        password += todosLosCaracteres[indiceAleatorio];
    }
    
    return password;
}

// ========================================
// VALIDACIONES DINÁMICAS (evento blur)
// ========================================

// Validar campo de nombre
let inputName = document.getElementById('siteName');

inputName.addEventListener('blur', () => {
    validarCampo(inputName, validarNoVacio, 'El nombre es obligatorio');
});

// Validar campo de usuario
let inputUser = document.getElementById('siteUser');

inputUser.addEventListener('blur', () => {
    validarCampo(inputUser, validarLongitudMinima(3), 'El usuario debe tener al menos 3 caracteres');
});

// Validar campo de contraseña
let inputPassword = document.getElementById('sitePassword');

inputPassword.addEventListener('blur', () => {
    validarCampo(inputPassword, validarLongitudMinima(6), 'La contraseña debe tener al menos 6 caracteres');
});

// Validar campo de URL (solo si tiene algo escrito)
let inputUrl = document.getElementById('siteUrl');

inputUrl.addEventListener('blur', () => {
    if (inputUrl.value.trim() !== '') {
        validarCampo(inputUrl, validarURL, 'La URL no es válida (debe empezar con http:// o https://)');
    } else {
        limpiarValidacion(inputUrl);
    }
});

// ========================================
// FUNCIONES DE VALIDACIÓN
// ========================================

// Función principal de validación
function validarCampo(input, funcionValidacion, mensajeError) {
    // Quitar validaciones anteriores
    limpiarValidacion(input);
    
    // Ejecutar validación
    if (funcionValidacion(input.value)) {
        // VÁLIDO → Borde verde
        input.classList.add('input-valid');
    } else {
        // INVÁLIDO → Borde rojo + mensaje
        input.classList.add('input-error');
        mostrarError(input, mensajeError);
    }
}

// Limpiar validaciones
function limpiarValidacion(input) {
    input.classList.remove('input-error');
    input.classList.remove('input-valid');
    
    // Quitar mensaje de error si existe
    let errorMsg = input.parentElement.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// Mostrar mensaje de error
function mostrarError(input, mensaje) {
    let span = document.createElement('span');
    span.classList.add('error-message');
    span.textContent = mensaje;
    input.parentElement.appendChild(span);
}

// ========================================
// VALIDADORES ESPECÍFICOS
// ========================================

// Validar que no esté vacío
function validarNoVacio(valor) {
    return valor.trim() !== '';
}

// Validar longitud mínima
function validarLongitudMinima(longitudMinima) {
    return function(valor) {
        return valor.trim().length >= longitudMinima;
    };
}

// Validar formato de URL
function validarURL(valor) {
    return valor.startsWith('http://') || valor.startsWith('https://');
}

// Botón ver/ocultar contraseña
let btnTogglePassword = document.getElementById('btnTogglePassword');
let passwordInput = document.getElementById('sitePassword');

btnTogglePassword.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        btnTogglePassword.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        btnTogglePassword.textContent = '👁️';
    }
});
