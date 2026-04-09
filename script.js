// 1. CONFIGURACIÓN INICIAL
const miTelefonoNegocio = "573204309105"; 
let isAdmin = false;       
let ventasTotales = 0;     
let dineroGanado = 0;      

// 2. LA LISTA DE PRODUCTOS (Cambiamos const por LET para poder borrar)
// --- LISTA DE PRODUCTOS QUE TODOS LOS CLIENTES VERÁN ---
let productos = [
    { 
        id: 1, 
        nombre: "Carcasa Antigolpes", 
        precio: 25000, 
        imagen: "https://i.postimg.cc/m2tY0YfN/carcasa.jpg" 
    },
    { 
        id: 2, 
        nombre: "Cargador Carga Rápida", 
        precio: 45000, 
        imagen: "https://i.postimg.cc/3R8X8X8x/cargador.jpg" 
    },
    { 
        id: 3, 
        nombre: "Vidrio Templado 9D", 
        precio: 15000, 
        imagen: "https://i.postimg.cc/7Z9Z9Z9z/vidrio.jpg" 
    },
    { 
        id: 4, 
        nombre: "Audífonos Bluetooth Pro", 
        precio: 85000, 
        imagen: "https://i.postimg.cc/L5L5L5L5/audifonos.jpg" 
    }
];

// Mantenemos la conexión con la memoria local por si quieres agregar algo solo en tu celular
if (localStorage.getItem('productos_tienda')) {
    const productosGuardados = JSON.parse(localStorage.getItem('productos_tienda'));
    // Unimos los fijos con los que tú agregues manualmente
    productos = [...productos, ...productosGuardados.filter(pg => !productos.some(p => p.id === pg.id))];
}
let carrito = [];

// 3. FUNCIÓN PARA DIBUJAR LA TIENDA (Muestra u oculta el botón de borrar)
function cargarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;
    
    contenedor.innerHTML = ""; 

    productos.forEach(p => {
        let botonEliminar = "";
        
        // Si eres admin, fabricamos el botón rojo
        if (isAdmin === true) {
            botonEliminar = `
                <button onclick="eliminarProducto(${p.id})" 
                        style="background:red; color:white; border:none; padding:8px; width:100%; cursor:pointer; margin-top:10px; border-radius:5px;">
                    BORRAR PRODUCTO
                </button>`;
        }

        contenedor.innerHTML += `
            <div class="card" style="border:1px solid #ddd; padding:15px; border-radius:10px; text-align:center; margin:10px; display:inline-block; width:200px;">
                <img src="${p.imagen}" style="width:100px; height:100px; object-fit:cover;">
                <h3>${p.nombre}</h3>
                <p>$${p.precio.toLocaleString()}</p>
                <button onclick="agregarAlCarrito(${p.id})" style="background:green; color:white; border:none; padding:5px; width:100%; cursor:pointer;">Comprar</button>
                ${botonEliminar} 
            </div>
        `;
    });
}

// 4. FUNCIONES DE ADMINISTRADOR (Entrar y Salir)
function iniciarSesion() {
    const pass = document.getElementById('pass-admin').value;
    if (pass === "admin123") {
        isAdmin = true;
        document.getElementById('panel-admin').style.display = "block";
        document.getElementById('btn-cerrar-sesion').style.display = "block"; 
        
        cargarProductos(); // Refresca para mostrar botones rojos
        alert("Modo Administrador Activo");
    } else {
        alert("Clave incorrecta");
    }
}

function cerrarSesion() {
    isAdmin = false;
    document.getElementById('panel-admin').style.display = "none";
    document.getElementById('btn-cerrar-sesion').style.display = "none";
    document.getElementById('pass-admin').value = ""; 
    
    cargarProductos(); // <--- ESTO ES LO QUE TE FALTABA: Refresca para QUITAR botones rojos
    alert("Has salido del modo administrador");
}

// 5. FUNCIÓN PARA ELIMINAR (Ahora sí funcionará porque usamos LET arriba)
function eliminarProducto(idABorrar) {
    if (confirm("¿Deseas quitar este producto de la tienda?")) {
        // Filtramos la lista
        productos = productos.filter(producto => producto.id !== idABorrar);

        // Guardamos en la memoria
        localStorage.setItem('productos_tienda', JSON.stringify(productos));

        // Actualizamos la vista
        cargarProductos();
        alert("Producto eliminado.");
    }
}

// 6. FUNCIÓN PARA SUBIR PRODUCTOS NUEVOS
function subirAInventario() {
    const nombreVal = document.getElementById('nombre-pro').value;
    const precioVal = document.getElementById('precio-pro').value;
    const imagenInput = document.getElementById('imagen-pro'); // El selector de archivos

    if (nombreVal === "" || precioVal === "") {
        alert("Escribe nombre y precio.");
        return;
    }

    // Si el usuario seleccionó una foto
    if (imagenInput.files && imagenInput.files[0]) {
        const lector = new FileReader();

        // Esta parte se ejecuta cuando la foto termina de "leerse"
        lector.onload = function(e) {
            const fotoBase64 = e.target.result; // Aquí está la imagen convertida

            const nuevo = {
                id: Date.now(),
                nombre: nombreVal,
                precio: parseInt(precioVal),
                imagen: fotoBase64 // Guardamos la foto real
            };

            productos.push(nuevo);
            localStorage.setItem('productos_tienda', JSON.stringify(productos));

            // Limpiar y actualizar
            document.getElementById('nombre-pro').value = "";
            document.getElementById('precio-pro').value = "";
            document.getElementById('imagen-pro').value = "";
            
            cargarProductos();
            alert("¡Producto con foto de galería subido!");
        };

        // Leer el archivo de la galería
        lector.readAsDataURL(imagenInput.files[0]);

    } else {
        // Si no eligió foto, ponemos una por defecto
        const nuevo = {
            id: Date.now(),
            nombre: nombreVal,
            precio: parseInt(precioVal),
            imagen: "https://via.placeholder.com/150"
        };
        productos.push(nuevo);
        localStorage.setItem('productos_tienda', JSON.stringify(productos));
        cargarProductos();
        alert("Subido sin foto personalizada.");
    }
}

// 7. LÓGICA DEL CARRITO (Mantén tus funciones actuales)
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    carrito.push(producto);
    actualizarInterfazCarrito();
}

function actualizarInterfazCarrito() {
    const cuentaCarrito = document.getElementById('cuenta-carrito');
    if(cuentaCarrito) cuentaCarrito.innerText = carrito.length;
    
    const listaUL = document.getElementById('lista-carrito');
    const totalSpan = document.getElementById('total-precio');
    
    if(listaUL) {
        listaUL.innerHTML = ""; 
        let total = 0;
        carrito.forEach((p) => {
            total += p.precio;
            const li = document.createElement('li');
            li.innerText = `${p.nombre} - $${p.precio.toLocaleString()}`;
            listaUL.appendChild(li);
        });
        if(totalSpan) totalSpan.innerText = total.toLocaleString();
    }
}

function vaciarCarrito() {
    carrito = [];
    actualizarInterfazCarrito();
}

// 8. ENVIAR A WHATSAPP
function enviarPedido() {
    if (carrito.length === 0) {
        alert("Carrito vacío.");
        return;
    }

    const nombre = document.getElementById('nombre-cliente').value;
    const direccion = document.getElementById('direccion-cliente').value;
    const metodo = document.getElementById('metodo-pago').value;

    if (nombre === "" || direccion === "") {
        alert("Faltan datos de envío.");
        return;
    }

    let mensaje = `*NUEVO PEDIDO*\n*Cliente:* ${nombre}\n*Dirección:* ${direccion}\n*Pago:* ${metodo}\n----------\n`;
    let total = 0;
    carrito.forEach(p => {
        mensaje += `- ${p.nombre}: $${p.precio}\n`;
        total += p.precio;
    });
    mensaje += `----------\n*TOTAL: $${total}*`;

    const url = `https://api.whatsapp.com/send?phone=${miTelefonoNegocio}&text=${encodeURIComponent(mensaje)}`;
    
    // Guardar estadísticas
    ventasTotales++;
    dineroGanado += total;
    localStorage.setItem('ventasGuardadas', ventasTotales);
    localStorage.setItem('dineroGuardado', dineroGanado);

    vaciarCarrito();
    window.open(url, '_blank');
}

// 9. CARGA INICIAL AL ABRIR LA PÁGINA
window.onload = function() {
    if (localStorage.getItem('ventasGuardadas')) {
        ventasTotales = parseInt(localStorage.getItem('ventasGuardadas'));
        dineroGanado = parseInt(localStorage.getItem('dineroGanado'));
        
        // Actualizar el panel si existe
        if(document.getElementById('contador-ventas')) {
            document.getElementById('contador-ventas').innerText = ventasTotales;
            document.getElementById('dinero-ventas').innerText = dineroGanado.toLocaleString();
        }
    }
    cargarProductos(); // Dibujar la tienda al abrir
};
