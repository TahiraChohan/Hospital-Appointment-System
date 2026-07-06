const API = "http://localhost:8000/api";
let statsChart = null;

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
    showSection("dashboard");

    loadStats();
    loadDoctors();
    loadPatients();
    loadAppointments();
});

/* ================= SIDEBAR NAV ================= */
function showSection(sectionId){

    document.querySelectorAll(".section").forEach(sec=>{
        sec.classList.remove("active");
    });

    const section = document.getElementById(sectionId);
    if(section){
        section.classList.add("active");
    }

    const title = document.getElementById("title");
    if(title){
        title.innerText =
            sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    }
}

/* ================= DARK MODE ================= */
function toggleDark(){
    document.body.classList.toggle("dark");
}

/* ================= DASHBOARD STATS ================= */
async function loadStats(){
    try{
        const res = await fetch(API + "/stats");
        const data = await res.json();

        document.getElementById("doctorsCount").innerText = data.doctors;
        document.getElementById("patientsCount").innerText = data.patients;
        document.getElementById("appointmentsCount").innerText = data.appointments;
        document.getElementById("pendingCount").innerText = data.pending;

        updateChart(data);

    }catch(err){
        console.log("Stats error:", err);
    }
}

/* ================= PRO DASHBOARD GRAPH ================= */
function updateChart(data){

    const canvas =
    document.getElementById("statsChart");

    if(!canvas) return;

    const ctx = canvas.getContext("2d");

    if(statsChart){
        statsChart.destroy();
    }

    statsChart = new Chart(ctx,{

        type:"bar",

        data:{
            labels:[
                "Doctors",
                "Patients",
                "Appointments",
                "Pending"
            ],

            datasets:[{
                label:"Hospital Statistics",

                data:[
                    data.doctors,
                    data.patients,
                    data.appointments,
                    data.pending
                ]
            }]
        },

        options:{
            responsive:true,
            maintainAspectRatio:false
        }
    });
}

/* ================= DOCTORS ================= */
async function loadDoctors(){
    try{
        const res = await fetch(API + "/doctors");
        const data = await res.json();

        let html = `
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Specialty</th>
            <th>Phone</th>
            <th>Action</th>
        </tr>`;

        data.forEach(d=>{
            html += `
            <tr>
                <td>${d.id}</td>
                <td>${d.name}</td>
                <td>${d.specialty}</td>
                <td>${d.phone}</td>
                <td>
                    <button onclick="deleteDoctor(${d.id})">Delete</button>
                </td>
            </tr>`;
        });

        document.getElementById("doctorsTable").innerHTML = html;

    }catch(err){
        console.log("Doctors error:", err);
    }
}

async function addDoctor(){

    const payload = {
        name: document.getElementById("docName").value,
        specialty: document.getElementById("docSpecialty").value,
        phone: document.getElementById("docPhone").value,
        experience: document.getElementById("docExp").value,
        image: ""
    };

    await fetch(API + "/doctors", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload)
    });

    clearDoctorForm();
    loadDoctors();
    loadStats();
}

async function deleteDoctor(id){
    await fetch(API + "/doctors/" + id, { method:"DELETE" });

    loadDoctors();
    loadStats();
}

function clearDoctorForm(){
    const fields = ["docName","docSpecialty","docPhone","docExp"];
    fields.forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.value = "";
    });
}

/* ================= PATIENTS ================= */
async function loadPatients(){

    const res = await fetch(API + "/patients");
    const data = await res.json();

    let html = `
    <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Age</th>
        <th>Gender</th>
        <th>Phone</th>
        <th>Action</th>
    </tr>`;

    data.forEach(p=>{
        html += `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.age}</td>
            <td>${p.gender}</td>
            <td>${p.phone}</td>
            <td>
                <button onclick="deletePatient(${p.id})">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("patientsTable").innerHTML = html;
}

async function addPatient(){

    const payload = {
        name: document.getElementById("patName").value,
        age: document.getElementById("patAge").value,
        gender: document.getElementById("patGender").value,
        phone: document.getElementById("patPhone").value,
        address: document.getElementById("patAddress").value
    };

    await fetch(API + "/patients", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload)
    });

    clearPatientForm();
    loadPatients();
    loadStats();
}

async function deletePatient(id){
    await fetch(API + "/patients/" + id, { method:"DELETE" });

    loadPatients();
    loadStats();
}

function clearPatientForm(){
    const fields = ["patName","patAge","patGender","patPhone","patAddress"];
    fields.forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.value = "";
    });
}

/* ================= APPOINTMENTS ================= */
async function loadAppointments(){

    const res = await fetch(API + "/appointments");
    const data = await res.json();

    let html = `
    <tr>
        <th>ID</th>
        <th>Patient</th>
        <th>Doctor</th>
        <th>Date</th>
        <th>Time</th>
        <th>Status</th>
    </tr>`;

    data.forEach(a=>{
        html += `
        <tr>
            <td>${a.id}</td>
            <td>${a.patient_name}</td>
            <td>${a.doctor_name}</td>
            <td>${a.appointment_date}</td>
            <td>${a.appointment_time}</td>
            <td><td>
<select onchange="updateStatus(${a.id},this.value)">
    <option value="Pending"
        ${a.status==="Pending"?"selected":""}>
        Pending
    </option>

    <option value="Completed"
        ${a.status==="Completed"?"selected":""}>
        Completed
    </option>

    <option value="Cancelled"
        ${a.status==="Cancelled"?"selected":""}>
        Cancelled
    </option>
</select>
</td></td>
        </tr>`;
    });

    document.getElementById("appointmentsTable").innerHTML = html;
}

async function addAppointment(){

    const payload = {
        patient_name: document.getElementById("appName").value,
        doctor_id: document.getElementById("appDoctorId").value,
        appointment_date: document.getElementById("appDate").value,
        appointment_time: document.getElementById("appTime").value
    };

    await fetch(API + "/appointments", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload)
    });

    clearAppointmentForm();
    loadAppointments();
    loadStats();
}

function clearAppointmentForm(){
    const fields = ["appName","appDoctorId","appDate","appTime"];
    fields.forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.value = "";
    });
}
async function updateStatus(id,status){

    await fetch(
        API+"/appointments/"+id,
        {
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({status})
        }
    );

    loadAppointments();
    loadStats();
}
function searchDoctors(){

    const value =
    document.getElementById("doctorSearch")
    .value
    .toLowerCase();

    const rows =
    document.querySelectorAll(
        "#doctorsTable tr"
    );

    rows.forEach((row,index)=>{

        if(index===0) return;

        row.style.display =
        row.innerText.toLowerCase()
        .includes(value)
        ? ""
        : "none";
    });
}