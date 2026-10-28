// js/ui.js
import { db, collection, getDocs, addDoc, query, where } from './firebase.js';

let servicioSeleccionado = {}; 

async function cargarServicios() {
    const listaServicios = document.getElementById('lista-servicios');
    listaServicios.innerHTML = '<p class="text-center text-gray-500 font-bold">Cargando turnos disponibles...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "servicios"));
        listaServicios.innerHTML = ''; 

        if (querySnapshot.empty) {
            listaServicios.innerHTML = '<p class="text-center text-red-500">Todavía no hay servicios cargados.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const servicio = doc.data();
            // Si el dueño olvida poner los cupos en Firebase, por defecto será 1
            const cupos = servicio.cupos_por_turno || 1; 

            const tarjeta = `
                <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex justify-between items-center hover:shadow-md transition">
                    <div>
                        <h3 class="font-bold text-lg text-gray-800">${servicio.nombre}</h3>
                        <p class="text-sm text-gray-500">Total: $${servicio.precio_total}</p>
                        <p class="text-sm font-semibold text-green-600">Seña: $${servicio.monto_sena}</p>
                    </div>
                    <button onclick="mostrarFormulario('${doc.id}', '${servicio.nombre}', ${servicio.monto_sena}, ${cupos})" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700 transition">
                        Elegir
                    </button>
                </div>
            `;
            listaServicios.innerHTML += tarjeta;
        });
    } catch (error) {
        console.error("Error de Firebase:", error);
        listaServicios.innerHTML = '<p class="text-center text-red-500">Error de conexión.</p>';
    }
}

// Muestra el formulario y ahora también recuerda los cupos disponibles
window.mostrarFormulario = function(servicioId, nombre, sena, cupos) {
    document.getElementById('form-reserva').classList.remove('hidden');
    document.getElementById('btn-pagar-sena').innerText = `Pagar seña de $${sena} y Reservar`;
    
    servicioSeleccionado = { id: servicioId, nombre: nombre, sena: sena, cupos: cupos };
}

// Función que se ejecuta al hacer clic en el botón verde
async function confirmarReserva() {
    const nombreCliente = document.getElementById('nombre-cliente').value;
    const whatsappCliente = document.getElementById('whatsapp-cliente').value;
    const fechaReserva = document.getElementById('fecha-reserva').value;
    const horaReserva = document.getElementById('hora-reserva').value;

    if (!nombreCliente || !whatsappCliente || !fechaReserva || !horaReserva) {
        alert("Por favor, completá tu nombre, WhatsApp, y elegí un día y horario para el turno.");
        return;
    }

    const btnPagar = document.getElementById('btn-pagar-sena');
    btnPagar.innerText = "Verificando disponibilidad...";
    btnPagar.disabled = true;

    try {
        const [anio, mes, dia] = fechaReserva.split('-');
        const fechaFormateada = `${dia}/${mes}/${anio}`;

        // PASO CLAVE: Buscamos cuántas reservas existen ya para ese mismo día, hora y servicio
        const q = query(
            collection(db, "reservas"), 
            where("fecha_turno", "==", fechaFormateada), 
            where("hora_turno", "==", horaReserva),
            where("servicio", "==", servicioSeleccionado.nombre)
        );
        
        const reservasExistentes = await getDocs(q);

        // Si la cantidad de reservas encontradas es igual o mayor a los cupos del local, frenamos todo
        if (reservasExistentes.size >= servicioSeleccionado.cupos) {
            alert(`¡Lo sentimos! Ya se agotaron los ${servicioSeleccionado.cupos} lugares disponibles para el ${fechaFormateada} a las ${horaReserva} hs. Por favor, elegí otro horario.`);
            btnPagar.innerText = `Pagar seña de $${servicioSeleccionado.sena} y Reservar`;
            btnPagar.disabled = false;
            return; // Cortamos la ejecución aquí, no se guarda nada
        }

        // Si hay lugar, el código continúa y guarda la reserva
        btnPagar.innerText = "Procesando...";

        await addDoc(collection(db, "reservas"), {
            servicio: servicioSeleccionado.nombre,
            seña: servicioSeleccionado.sena,
            cliente_nombre: nombreCliente,
            cliente_whatsapp: whatsappCliente,
            fecha_turno: fechaFormateada,
            hora_turno: horaReserva,
            fecha_registro: new Date()
        });

        // REEMPLAZA ESTE NÚMERO POR TU WHATSAPP REAL
        const numeroNegocio = "5493425242532"; 
        const mensaje = `Hola! Quiero reservar el servicio de *${servicioSeleccionado.nombre}* para el día *${fechaFormateada}* a las *${horaReserva}*.\nMi nombre es ${nombreCliente} y quiero coordinar el pago de la seña de $${servicioSeleccionado.sena}.`;
        
        const urlWhatsapp = `https://wa.me/${numeroNegocio}?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsapp, '_blank');

        document.getElementById('nombre-cliente').value = '';
        document.getElementById('whatsapp-cliente').value = '';
        document.getElementById('fecha-reserva').value = '';
        document.getElementById('hora-reserva').value = '';
        document.getElementById('form-reserva').classList.add('hidden');
        btnPagar.innerText = "Pagar Seña y Reservar";
        btnPagar.disabled = false;

    } catch (error) {
        console.error("Error al guardar reserva: ", error);
        alert("Hubo un error al procesar tu reserva. Intentá de nuevo.");
        btnPagar.innerText = `Pagar seña de $${servicioSeleccionado.sena} y Reservar`;
        btnPagar.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarServicios();
    document.getElementById('btn-pagar-sena').addEventListener('click', confirmarReserva);
});