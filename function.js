let listaProductos = [];
let carrito = JSON.parse(localStorage.getItem("carritoHuerto")) || [];

const comunasPorRegion = {
    metropolitana: ["Santiago", "Puente Alto", "Maipú", "Ñuñoa", "La Florida"],
    valparaiso: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana"],
    biobio: ["Concepción", "Nacimiento", "Talcahuano", "San Pedro de la Paz"]
};

document.addEventListener("DOMContentLoaded", function () {
    cargarProductos();
    actualizarCarritoUI();
    iniciarSelectComunas();
    iniciarValidaciones();
});

function cargarProductos() {
    fetch("productos.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el JSON");
            }
            return response.json();
        })
        .then(data => {
            listaProductos = data;
            mostrarProductos(listaProductos);
        })
        .catch(() => {
            listaProductos = [
                { codigo: "FR001", nombre: "Manzanas Fuji", precio: 1200, unidad: "kilo", descripcion: "Manzanas Fuji crujientes y dulces del Valle del Maule.", imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
                { codigo: "FR002", nombre: "Naranjas Valencia", precio: 1000, unidad: "kilo", descripcion: "Jugosas y ricas en vitamina C para zumos frescos.", imagen: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400" },
                { codigo: "FR003", nombre: "Plátanos Cavendish", precio: 800, unidad: "kilo", descripcion: "Plátanos maduros y dulces ricos en potasio.", imagen: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400" },
                { codigo: "VR001", nombre: "Zanahorias Orgánicas", precio: 900, unidad: "kilo", descripcion: "Zanahorias crujientes cultivadas en O'Higgins.", imagen: "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=400" },
                { codigo: "VR002", nombre: "Espinacas Frescas", precio: 700, unidad: "bolsa 500g", descripcion: "Espinacas frescas y nutritivas para ensaladas.", imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400" },
                { codigo: "VR003", nombre: "Pimientos Tricolores", precio: 1500, unidad: "kilo", descripcion: "Pimientos rojos, amarillos y verdes para salteados.", imagen: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400" },
                { codigo: "PO001", nombre: "Miel Orgánica", precio: 5000, unidad: "frasco 500g", descripcion: "Miel pura y natural de apicultores locales.", imagen: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400" }
            ];
            mostrarProductos(listaProductos);
        });
}

function mostrarProductos(productos) {
    const contenedor = document.getElementById("contenedorProductos");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    productos.forEach(prod => {
        const col = document.createElement("div");
        col.className = "col-md-4 col-sm-6 mb-4";
        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0">
                <img src="${prod.imagen}" class="card-img-top" style="height: 190px; object-fit: cover;" alt="${prod.nombre}">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-success-subtle text-success w-auto mb-2 align-self-start">${prod.codigo}</span>
                    <h5 class="card-title fw-bold">${prod.nombre}</h5>
                    <p class="card-text text-muted small flex-grow-1">${prod.descripcion}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="fs-5 fw-bold text-success">$${prod.precio.toLocaleString("es-CL")} <small class="text-muted fs-6 fw-normal">/ ${prod.unidad}</small></span>
                    </div>
                    <button class="btn btn-success mt-3 w-100" onclick="agregarAlCarrito('${prod.codigo}')">
                        Añadir al carrito
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
    });
}

function agregarAlCarrito(codigo) {
    const item = listaProductos.find(p => p.codigo === codigo);
    if (!item) return;

    const existe = carrito.find(p => p.codigo === codigo);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            codigo: item.codigo,
            nombre: item.nombre,
            precio: item.precio,
            unidad: item.unidad,
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarCarritoUI();
}

function cambiarCantidad(codigo, delta) {
    const producto = carrito.find(p => p.codigo === codigo);
    if (!producto) return;

    producto.cantidad += delta;
    if (producto.cantidad <= 0) {
        carrito = carrito.filter(p => p.codigo !== codigo);
    }

    guardarCarrito();
    actualizarCarritoUI();
}

function eliminarDelCarrito(codigo) {
    carrito = carrito.filter(p => p.codigo !== codigo);
    guardarCarrito();
    actualizarCarritoUI();
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    actualizarCarritoUI();
}

function guardarCarrito() {
    localStorage.setItem("carritoHuerto", JSON.stringify(carrito));
}

function actualizarCarritoUI() {
    const contadorBadge = document.getElementById("cartCount");
    const listaCarrito = document.getElementById("listaCarrito");
    const totalCarrito = document.getElementById("totalCarrito");

    const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    if (contadorBadge) contadorBadge.textContent = totalUnidades;

    if (!listaCarrito) return;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = `<p class="text-muted text-center my-3">El carrito está vacío.</p>`;
        if (totalCarrito) totalCarrito.textContent = "$0";
        return;
    }

    let html = '<div class="list-group list-group-flush">';
    let totalPagar = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalPagar += subtotal;
        html += `
            <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                    <h6 class="mb-0 fw-bold">${item.nombre}</h6>
                    <small class="text-muted">$${item.precio.toLocaleString("es-CL")} c/u</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="cambiarCantidad('${item.codigo}', -1)">-</button>
                    <span class="fw-bold">${item.cantidad}</span>
                    <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="cambiarCantidad('${item.codigo}', 1)">+</button>
                    <span class="ms-2 fw-bold text-success">$${subtotal.toLocaleString("es-CL")}</span>
                    <button class="btn btn-sm text-danger ms-1" onclick="eliminarDelCarrito('${item.codigo}')">&times;</button>
                </div>
            </div>
        `;
    });
    html += '</div>';

    listaCarrito.innerHTML = html;
    if (totalCarrito) {
        totalCarrito.textContent = "$" + totalPagar.toLocaleString("es-CL");
    }
}

function iniciarSelectComunas() {
    const selectRegion = document.getElementById("regRegion");
    const selectComuna = document.getElementById("regComuna");
    if (!selectRegion || !selectComuna) return;

    selectRegion.addEventListener("change", function () {
        const seleccion = this.value;
        selectComuna.innerHTML = '<option value="">Seleccione una comuna...</option>';

        if (comunasPorRegion[seleccion]) {
            comunasPorRegion[seleccion].forEach(comuna => {
                const opt = document.createElement("option");
                opt.value = comuna.toLowerCase();
                opt.textContent = comuna;
                selectComuna.appendChild(opt);
            });
        }
    });
}

function validarCorreoPermitido(correo) {
    const val = correo.trim().toLowerCase();
    return val.endsWith("@duoc.cl") || val.endsWith("@profesor.duoc.cl") || val.endsWith("@gmail.com");
}

function iniciarValidaciones() {
    const formRegistro = document.getElementById("formRegistro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", function (e) {
            e.preventDefault();
            const nombre = document.getElementById("regNombre").value.trim();
            const correo = document.getElementById("regCorreo").value.trim();
            const pass = document.getElementById("regPassword").value;
            const confirmPass = document.getElementById("regConfirmPassword").value;
            const region = document.getElementById("regRegion").value;
            const comuna = document.getElementById("regComuna").value;

            if (!nombre || nombre.length > 100) {
                alert("El nombre es requerido y no debe superar 100 caracteres.");
                return;
            }
            if (!validarCorreoPermitido(correo)) {
                alert("El correo debe terminar en @duoc.cl, @profesor.duoc.cl o @gmail.com");
                return;
            }
            if (pass.length < 4 || pass.length > 10) {
                alert("La contraseña debe tener entre 4 y 10 caracteres.");
                return;
            }
            if (pass !== confirmPass) {
                alert("Las contraseñas no coinciden.");
                return;
            }
            if (!region || !comuna) {
                alert("Debe seleccionar una región y una comuna.");
                return;
            }

            alert("¡Usuario registrado exitosamente en HuertoHogar!");
            formRegistro.reset();
        });
    }

    const formContacto = document.getElementById("formContacto");
    if (formContacto) {
        formContacto.addEventListener("submit", function (e) {
            e.preventDefault();
            const nombre = document.getElementById("contactoNombre").value.trim();
            const correo = document.getElementById("contactoCorreo").value.trim();
            const mensaje = document.getElementById("contactoMensaje").value.trim();

            if (!nombre || nombre.length > 100) {
                alert("El nombre es requerido (máx 100 caracteres).");
                return;
            }
            if (!validarCorreoPermitido(correo)) {
                alert("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com");
                return;
            }
            if (!mensaje || mensaje.length > 500) {
                alert("El comentario es requerido y no debe superar los 500 caracteres.");
                return;
            }

            alert("Mensaje enviado con éxito. Nos pondremos en contacto.");
            formContacto.reset();
        });
    }
}