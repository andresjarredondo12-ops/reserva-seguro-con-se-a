// js/admin.js
import { auth, db, signInWithEmailAndPassword, signOut, onAuthStateChanged, collection, getDocs } from './firebase.js';

const loginPanel = document.getElementById('login-panel');
const dashboardPanel = document.getElementById('dashboard-panel');
const listaReservas = document.getElementById('lista-reservas');

// 1. Escuchar si el usuario tiene sesión iniciada
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginPanel.classList.add('hidden');
        dashboardPanel.classList.remove('hidden');
        cargarReservas();
    } else {
        loginPanel.classList.remove('hidden');
        dashboardPanel.classList.add('hidden');
        listaReservas.innerHTML = '';
    }
});

// 2. Función para iniciar sesión
document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');
    const btn = document.getElementById('btn-login');

    if(!email || !password) return;

    btn.innerText = "Ingresando...";
    try {
        await signInWithEmailAndPassword(auth, email, password);
        errorMsg.classList.add('hidden');
    } catch (error) {
        console.error("Error de login:", error);
        errorMsg.classList.remove('hidden');
    } finally {
        btn.innerText = "Ingresar";
    }
});

// 3. Función para cerrar sesión
document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth);
});

// 4. Buscar los turnos en Firestore y dibujarlos
async function cargarReservas() {
    listaReservas.innerHTML = '<p class="text-gray-500">Cargando turnos...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "reservas"));
        listaReservas.innerHTML = '';

        if (querySnapshot.empty) {
            listaReservas.innerHTML = '<p class="text-gray-500">No hay turnos registrados todavía.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const reserva = doc.data();
            const tarjeta = `
                <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                    <div>
                        <h3 class="font-bold text-lg text-gray-800">${reserva.servicio}</h3>
                        <p class="text-sm text-gray-600 mt-1">👤 ${reserva.cliente_nombre} - 📞 ${reserva.cliente_whatsapp}</p>
                        <p class="text-sm font-semibold text-green-600 mt-1">Seña: $${reserva.seña}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-gray-800 text-xl">${reserva.fecha_turno}</p>
                        <p class="text-gray-500">${reserva.hora_turno} hs</p>
                    </div>
                </div>
            `;
            listaReservas.innerHTML += tarjeta;
        });

    } catch (error) {
        console.error("Error al cargar reservas:", error);
        listaReservas.innerHTML = '<p class="text-red-500">Error al cargar los datos.</p>';
    }
}