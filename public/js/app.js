
// ==========================================
// REGISTRATION
// ==========================================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    const roleSelect =
        document.getElementById("role");

    const donorDetails =
        document.getElementById("donorDetails");

    const recipientDetails =
        document.getElementById("recipientDetails");


    // Show role-specific fields

    roleSelect.addEventListener(
        "change",
        function () {

            donorDetails.style.display =
                "none";

            recipientDetails.style.display =
                "none";


            if (roleSelect.value === "donor") {

                donorDetails.style.display =
                    "block";

            }


            if (roleSelect.value === "recipient") {

                recipientDetails.style.display =
                    "block";

            }

        }
    );


    // Submit registration

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const role =
                roleSelect.value;


            const message =
                document.getElementById(
                    "registerMessage"
                );


            // Donor details

            const bloodGroup =
                document.getElementById(
                    "bloodGroup"
                ).value;


            const age =
                document.getElementById(
                    "age"
                ).value;


            const gender =
                document.getElementById(
                    "gender"
                ).value;


            const address =
                document.getElementById(
                    "address"
                ).value;


            // Recipient details

            const requiredBloodGroup =
                document.getElementById(
                    "requiredBloodGroup"
                ).value;


            const recipientAge =
                document.getElementById(
                    "recipientAge"
                ).value;


            const hospital =
                document.getElementById(
                    "hospital"
                ).value;


            const recipientAddress =
                document.getElementById(
                    "recipientAddress"
                ).value;


            try {

                const response =
                    await fetch(
                        "/api/auth/register",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name,
                                email,
                                phone,
                                password,
                                role,

                                bloodGroup,
                                age,
                                gender,
                                address,

                                requiredBloodGroup,
                                recipientAge,
                                hospital,
                                recipientAddress

                            })

                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    message.textContent =
                        data.message;

                    message.style.color =
                        "green";


                    registerForm.reset();

                    donorDetails.style.display =
                        "none";

                    recipientDetails.style.display =
                        "none";


                } else {

                    message.textContent =
                        data.message;

                    message.style.color =
                        "red";

                }


            } catch (error) {

                console.log(
                    "Registration Error:",
                    error
                );


                message.textContent =
                    "Unable to connect to server";

                message.style.color =
                    "red";

            }

        }
    );

}

// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                .getElementById("loginEmail")
                .value
                .trim();


            const password =
                document
                .getElementById("loginPassword")
                .value;


            const message =
                document
                .getElementById("loginMessage");


            try {

                const response =
                    await fetch(
                        "/api/auth/login",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })

                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    // Save login information

                    localStorage.setItem(
                        "token",
                        data.token
                    );


                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );


                    message.textContent =
                        "Login successful!";

                    message.style.color =
                        "green";


                    // =====================================
                    // REDIRECT ACCORDING TO USER ROLE
                    // =====================================

                    setTimeout(
                        function () {

                            if (data.user.role === "admin") {

                                window.location.href =
                                    "admin.html";

                            } else if (
                                data.user.role === "recipient"
                            ) {

                                window.location.href =
                                    "recipient.html";

                            } else {

                                // Donor
                                window.location.href =
                                    "dashboard.html";

                            }

                        },
                        500
                    );


                } else {

                    message.textContent =
                        data.message;

                    message.style.color =
                        "red";

                }


            } catch (error) {

                console.log(
                    "Login Error:",
                    error
                );


                message.textContent =
                    "Unable to connect to server";

                message.style.color =
                    "red";

            }

        }
    );

}

// ==========================================
// DASHBOARD
// ==========================================

const dashboardPage =
    document.getElementById("welcomeMessage");


if (dashboardPage) {

    const token =
        localStorage.getItem("token");

    const userData =
        localStorage.getItem("user");


    // Check login

    if (!token || !userData) {

        window.location.href =
            "login.html";

    } else {

        const user =
            JSON.parse(userData);


        // Display user information

        document.getElementById(
            "welcomeMessage"
        ).textContent =
            `Welcome, ${user.name}!`;


        document.getElementById(
            "roleMessage"
        ).textContent =
            `You are logged in as ${user.role}.`;


        document.getElementById(
            "userName"
        ).textContent =
            user.name;


        document.getElementById(
            "userEmail"
        ).textContent =
            user.email;


        document.getElementById(
            "userPhone"
        ).textContent =
            user.phone || "Not provided";


        document.getElementById(
            "userRole"
        ).textContent =
            user.role;


        // Get feature cards

        const donorFeature =
            document.getElementById(
                "donorFeature"
            );

        const recipientFeature =
            document.getElementById(
                "recipientFeature"
            );

        const adminFeature =
            document.getElementById(
                "adminFeature"
            );


        // Hide all role-specific cards

        donorFeature.style.display =
            "none";

        recipientFeature.style.display =
            "none";

        adminFeature.style.display =
            "none";


        // Show according to role

        if (user.role === "donor") {

            donorFeature.style.display =
                "block";

        }


        if (user.role === "recipient") {

            recipientFeature.style.display =
                "block";

        }


        if (user.role === "admin") {

            adminFeature.style.display =
                "block";

        }

    }

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "login.html";
}


// ==========================================
// COMING SOON MESSAGE
// ==========================================

function showComingSoon(feature) {

    const message =
        document.getElementById(
            "dashboardMessage"
        );


    message.textContent =
        `${feature} will be available in the next module.`;

    message.style.color =
        "#b30000";

}


// ==========================================
// DONOR DASHBOARD
// ==========================================

if (dashboardPage) {

    const userData =
        localStorage.getItem("user");

    const token =
        localStorage.getItem("token");


    if (userData && token) {

        const user =
            JSON.parse(userData);


        // Show donor sections

        if (user.role === "donor") {

            const donationSection =
                document.getElementById(
                    "donationSection"
                );

            const donationHistorySection =
                document.getElementById(
                    "donationHistorySection"
                );


            donationSection.style.display =
                "block";

            donationHistorySection.style.display =
                "block";


            // Load donation history

            loadDonationHistory();

        }

    }

}


// ==========================================
// SUBMIT DONATION
// ==========================================

const donationForm =
    document.getElementById(
        "donationForm"
    );
    // ==========================================
// DONATION DATE - PREVENT PAST DATES
// ==========================================

const donationDateInput =
    document.getElementById("donationDate");

if (donationDateInput) {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    const todayDate =
        `${year}-${month}-${day}`;

    donationDateInput.min =
        todayDate;
}


if (donationForm) {

    donationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const quantity =
                document.getElementById(
                    "donationQuantity"
                ).value;


            const donationDate =
                document.getElementById(
                    "donationDate"
                ).value;


            const message =
                document.getElementById(
                    "donationMessage"
                );


            const token =
                localStorage.getItem("token");


            try {

                const response =
                    await fetch(
                        "/api/donors/donate",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body: JSON.stringify({

                                quantity,
                                donationDate

                            })

                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    message.textContent =
                        data.message;

                    message.style.color =
                        "green";


                    donationForm.reset();


                    // Refresh history

                    loadDonationHistory();


                } else {

                    message.textContent =
                        data.message;

                    message.style.color =
                        "red";

                }


            } catch (error) {

                console.log(
                    "Donation Error:",
                    error
                );


                message.textContent =
                    "Unable to connect to server";

                message.style.color =
                    "red";

            }

        }
    );

}


// ==========================================
// LOAD DONATION HISTORY
// ==========================================

async function loadDonationHistory() {

    const token =
        localStorage.getItem("token");


    const history =
        document.getElementById(
            "donationHistory"
        );


    if (!history || !token) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/donors/donations",
                {

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const donations =
            await response.json();


        if (!response.ok) {

            history.innerHTML =
                `<p>${donations.message}</p>`;

            return;

        }


        if (donations.length === 0) {

            history.innerHTML =
                "<p>No donations recorded yet.</p>";

            return;

        }


        let tableHTML = `

            <table class="donation-table">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Blood Group</th>

                        <th>Quantity</th>

                        <th>Date</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

        `;


        donations.forEach(
            function (donation) {

                tableHTML += `

                    <tr>

                        <td>
                            ${donation.donation_id}
                        </td>

                        <td>
                            ${donation.blood_group}
                        </td>

                        <td>
                            ${donation.quantity}
                        </td>

                        <td>
                            ${donation.donation_date}
                        </td>

                        <td>
                            ${donation.status}
                        </td>

                    </tr>

                `;

            }
        );


        tableHTML += `

                </tbody>

            </table>

        `;


        history.innerHTML =
            tableHTML;


    } catch (error) {

        console.log(
            "History Error:",
            error
        );


        history.innerHTML =
            "<p>Unable to load donation history.</p>";

    }

}

// ==========================================
// BLOOD STOCK
// ==========================================

async function loadBloodStock() {

    const stockContainer =
        document.getElementById(
            "bloodStock"
        );


    if (!stockContainer) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/blood/stock"
            );


        const stock =
            await response.json();


        if (!response.ok) {

            stockContainer.innerHTML =
                `<p>${stock.message}</p>`;

            return;

        }


        let stockHTML = "";


        stock.forEach(
            function (item) {

                stockHTML += `

                    <div class="blood-stock-card">

                        <div class="blood-drop">
                            🩸
                        </div>

                        <h3>
                            ${item.blood_group}
                        </h3>

                        <p>
                            ${item.quantity} units
                        </p>

                    </div>

                `;

            }
        );


        stockContainer.innerHTML =
            stockHTML;


    } catch (error) {

        console.log(
            "Blood Stock Error:",
            error
        );


        stockContainer.innerHTML =
            "<p>Unable to load blood stock.</p>";

    }

}


// Load stock

loadBloodStock();

// =====================================
// ADMIN DASHBOARD
// =====================================

async function loadAdminDashboard() {

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
        window.location.href = "login.html";
        return;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        localStorage.removeItem("user");
        window.location.href = "login.html";
        return;
    }

    // Allow only admin users
    if (user.role !== "admin") {
        window.location.href = "dashboard.html";
        return;
    }

    // Show admin name
    const welcome = document.getElementById("adminWelcome");

    if (welcome) {
        welcome.textContent =
            "Welcome, " + user.name;
    }


    // =====================================
    // LOAD ADMIN STATISTICS
    // =====================================

    try {

        const response = await fetch(
            "/api/admin/stats",
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to load statistics"
            );
        }


        document.getElementById("totalUsers")
            .textContent = data.totalUsers;

        document.getElementById("totalDonors")
            .textContent = data.totalDonors;

        document.getElementById("totalRecipients")
            .textContent = data.totalRecipients;

        document.getElementById("pendingRequests")
            .textContent = data.pendingRequests;
            
        document.getElementById("totalBloodStock")
            .textContent = data.totalBloodStock;

        document.getElementById("approvedDonations")
            .textContent = data.approvedDonations; 


    } catch (error) {

        console.log(
            "Admin Statistics Error:",
            error
        );

        const message =
            document.getElementById(
                "adminMessage"
            );

        if (message) {
            message.textContent =
                "Unable to load admin statistics.";
        }

    }


    // =====================================
    // LOAD BLOOD STOCK
    // =====================================

    try {

        const response = await fetch(
            "/api/blood/stock"
        );

        const stock = await response.json();

        const container =
            document.getElementById(
                "adminBloodStock"
            );

        if (!response.ok) {
            throw new Error(
                stock.message ||
                "Unable to load blood stock"
            );
        }


        let stockHTML = "";


        stock.forEach(function (item) {

            stockHTML += `
                <div class="blood-stock-card">

                    <div class="blood-drop">
                        🩸
                    </div>

                    <h3>
                        ${item.blood_group}
                    </h3>

                    <p>
                        ${item.quantity} units
                    </p>

                </div>
            `;

        });


        container.innerHTML = stockHTML;


    } catch (error) {

        console.log(
            "Admin Blood Stock Error:",
            error
        );

        const container =
            document.getElementById(
                "adminBloodStock"
            );

        if (container) {
            container.innerHTML =
                "<p>Unable to load blood stock.</p>";
        }

    }

}


// =====================================
// RUN ADMIN DASHBOARD ONLY ON ADMIN PAGE
// =====================================

if (
    window.location.pathname.endsWith(
        "admin.html"
    )
) {

    loadAdminDashboard();
    loadPendingDonations();
    loadScheduledDonations();
    loadAdminDonationHistory();
    loadPendingBloodRequests();

}

// =====================================
// LOAD PENDING DONATIONS
// =====================================

async function loadPendingDonations() {

    const token =
        localStorage.getItem("token");

    const userData =
        localStorage.getItem("user");


    if (!token || !userData) {
        return;
    }


    let user;

    try {

        user = JSON.parse(userData);

    } catch (error) {

        return;

    }


    // Only admin can see pending donations

    if (user.role !== "admin") {
        return;
    }


    const container =
        document.getElementById(
            "pendingDonations"
        );


    if (!container) {
        return;
    }


    try {

        const response = await fetch(
            "/api/admin/donations",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const donations =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                `<p>${donations.message}</p>`;

            return;
        }


        // No pending donations

        if (donations.length === 0) {

            container.innerHTML =
                "<p>No pending donations.</p>";

            return;
        }


        // Create table

        let tableHTML = `

            <table class="donation-table">

                <thead>

                    <tr>

                        <th>Donor Name</th>

                        <th>Email</th>

                        <th>Blood Group</th>

                        <th>Quantity</th>

                        <th>Donation Date</th>

                        <th>Status</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

        `;


        donations.forEach(function (donation) {

            tableHTML += `

                <tr>

                    <td>
                        ${donation.name}
                    </td>

                    <td>
                        ${donation.email}
                    </td>

                    <td>
                        ${donation.blood_group}
                    </td>

                    <td>
                        ${donation.quantity}
                    </td>

                    <td>
                        ${donation.donation_date}
                    </td>

                    <td>
                        ${donation.status}
                    </td>

                    <td>

                        <button
                            onclick="updateDonationStatus(
                                ${donation.donation_id},
                                'Approved'
                            )">

                            Approve

                        </button>


                        <button
                            onclick="updateDonationStatus(
                                ${donation.donation_id},
                                'Rejected'
                            )">

                            Reject

                        </button>

                    </td>

                </tr>

            `;

        });


        tableHTML += `

                </tbody>

            </table>

        `;


        container.innerHTML =
            tableHTML;


    } catch (error) {

        console.log(
            "Pending Donations Error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load pending donations.</p>";

    }

}

// =====================================
// LOAD SCHEDULED DONATIONS
// =====================================

async function loadScheduledDonations() {

    const token =
        localStorage.getItem("token");

    const userData =
        localStorage.getItem("user");


    if (!token || !userData) {
        return;
    }


    let user;

    try {

        user = JSON.parse(userData);

    } catch (error) {

        return;

    }


    // Only admin can see scheduled donations

    if (user.role !== "admin") {
        return;
    }


    const container =
        document.getElementById(
            "scheduledDonations"
        );


    if (!container) {
        return;
    }


    try {

        const response = await fetch(
            "/api/admin/donations/scheduled",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const donations =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                `<p>${donations.message}</p>`;

            return;
        }


        // No scheduled donations

        if (donations.length === 0) {

            container.innerHTML =
                "<p>No scheduled donations.</p>";

            return;
        }


        // Create table

        let tableHTML = `

            <table class="donation-table">

                <thead>

                    <tr>

                        <th>Donor Name</th>

                        <th>Email</th>

                        <th>Blood Group</th>

                        <th>Quantity</th>

                        <th>Donation Date</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

        `;


        donations.forEach(function (donation) {

            tableHTML += `

                <tr>

                    <td>
                        ${donation.name}
                    </td>

                    <td>
                        ${donation.email}
                    </td>

                    <td>
                        ${donation.blood_group}
                    </td>

                    <td>
                        ${donation.quantity}
                    </td>

                    <td>
                        ${donation.donation_date}
                    </td>

                    <td>
                        ${donation.status}
                    </td>

                </tr>

            `;

        });


        tableHTML += `

                </tbody>

            </table>

        `;


        container.innerHTML =
            tableHTML;


    } catch (error) {

        console.log(
            "Scheduled Donations Error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load scheduled donations.</p>";

    }

}

// =====================================
// ADMIN DONATION HISTORY
// =====================================

async function loadAdminDonationHistory() {

    const container =
        document.getElementById("donationHistory");

    if (!container) {
        return;
    }

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(
            "/api/admin/donations/history",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        const donations = await response.json();

        if (!response.ok) {
            throw new Error(
                donations.message ||
                "Unable to load donation history"
            );
        }

        if (donations.length === 0) {

            container.innerHTML =
                "<p>No donation history found.</p>";

            return;
        }

        container.innerHTML = `
            <table border="1">
                <thead>
                    <tr>
                        <th>Donation ID</th>
                        <th>Donor Name</th>
                        <th>Email</th>
                        <th>Blood Group</th>
                        <th>Quantity</th>
                        <th>Donation Date</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>

                    ${donations.map(donation => {

                        return `
                            <tr>

                                <td>
                                    ${donation.donation_id}
                                </td>

                                <td>
                                    ${donation.name}
                                </td>

                                <td>
                                    ${donation.email}
                                </td>

                                <td>
                                    ${donation.blood_group}
                                </td>

                                <td>
                                    ${donation.quantity}
                                </td>

                                <td>
                                    ${donation.donation_date}
                                </td>

                                <td>
                                    ${donation.status}
                                </td>

                            </tr>
                        `;

                    }).join("")}

                </tbody>
            </table>
        `;

    } catch (error) {

        console.log(
            "Donation History Error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load donation history.</p>";
    }
}



// =====================================
// APPROVE OR REJECT DONATION
// =====================================

async function updateDonationStatus(
    donationId,
    status
) {

    const token =
        localStorage.getItem("token");


    try {

        const response = await fetch(
            `/api/admin/donations/${donationId}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(data.message);


        // Reload dashboard information

        loadPendingDonations();
        loadAdminDonationHistory();
        loadBloodStock();


    } catch (error) {

        console.log(
            "Donation Status Error:",
            error
        );

        alert(
            "Unable to update donation status."
        );

    }

}


// =====================================
// RUN PENDING DONATIONS ON ADMIN PAGE
// =====================================

if (
    window.location.pathname.endsWith(
        "admin.html"
    )
) {

    loadPendingDonations();

}


// =====================================
// RECIPIENT DASHBOARD
// =====================================

async function loadRecipientDashboard() {

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
        window.location.href = "login.html";
        return;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        localStorage.removeItem("user");
        window.location.href = "login.html";
        return;
    }

    // Only recipient can access this page
    if (user.role !== "recipient") {
        window.location.href = "dashboard.html";
        return;
    }

    // Welcome message
    const welcome =
        document.getElementById("recipientWelcome");

    if (welcome) {
        welcome.textContent =
            "Welcome, " + user.name;
    }


    // =====================================
    // LOAD RECIPIENT PROFILE
    // =====================================

    try {

        const response = await fetch(
            "/api/recipients/profile",
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const profile = await response.json();

        const profileContainer =
            document.getElementById(
                "recipientProfile"
            );

        if (!response.ok) {
            profileContainer.innerHTML =
                `<p>${profile.message}</p>`;
            return;
        }

        profileContainer.innerHTML = `
            <p><strong>Name:</strong>
                ${profile.name}
            </p>

            <p><strong>Email:</strong>
                ${profile.email}
            </p>

            <p><strong>Phone:</strong>
                ${profile.phone || "Not provided"}
            </p>

            <p><strong>Blood Group Required:</strong>
                ${profile.blood_group_required}
            </p>

            <p><strong>Age:</strong>
                ${profile.age || "Not provided"}
            </p>

            <p><strong>Hospital:</strong>
                ${profile.hospital || "Not provided"}
            </p>

            <p><strong>Address:</strong>
                ${profile.address || "Not provided"}
            </p>
        `;

    } catch (error) {

        console.log(
            "Recipient Profile Error:",
            error
        );

    }


    // =====================================
    // LOAD MY BLOOD REQUESTS
    // =====================================

    loadMyBloodRequests();


    // =====================================
    // LOAD BLOOD STOCK
    // =====================================

    loadRecipientBloodStock();

}


// =====================================
// SUBMIT BLOOD REQUEST
// =====================================

const bloodRequestForm =
    document.getElementById(
        "bloodRequestForm"
    );

if (bloodRequestForm) {

    bloodRequestForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const token =
                localStorage.getItem("token");

            const bloodGroup =
                document.getElementById(
                    "requestBloodGroup"
                ).value;

            const quantity =
                document.getElementById(
                    "requestQuantity"
                ).value;

            const message =
                document.getElementById(
                    "requestMessage"
                );


            try {

                const response = await fetch(
                    "/api/recipients/requests",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            bloodGroup:
                                bloodGroup,

                            quantity:
                                Number(quantity)
                        })
                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message;

                    return;
                }


                message.textContent =
                    data.message;


                bloodRequestForm.reset();


                // Reload request history
                loadMyBloodRequests();


            } catch (error) {

                console.log(
                    "Blood Request Error:",
                    error
                );

                message.textContent =
                    "Unable to submit blood request.";

            }

        }
    );

}


// =====================================
// LOAD MY BLOOD REQUESTS
// =====================================

async function loadMyBloodRequests() {

    const token =
        localStorage.getItem("token");

    const container =
        document.getElementById(
            "myBloodRequests"
        );


    if (!container || !token) {
        return;
    }


    try {

        const response = await fetch(
            "/api/recipients/requests",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const requests =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                `<p>${requests.message}</p>`;

            return;
        }


        if (requests.length === 0) {

            container.innerHTML =
                "<p>No blood requests yet.</p>";

            return;
        }


        let tableHTML = `

            <table class="donation-table">

                <thead>

                    <tr>

                        <th>Request ID</th>

                        <th>Blood Group</th>

                        <th>Quantity</th>

                        <th>Request Date</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

        `;


        requests.forEach(function (request) {

            tableHTML += `

                <tr>

                    <td>
                        ${request.request_id}
                    </td>

                    <td>
                        ${request.blood_group}
                    </td>

                    <td>
                        ${request.quantity}
                    </td>

                    <td>
                        ${request.request_date}
                    </td>

                    <td>
                        ${request.status}
                    </td>

                </tr>

            `;

        });


        tableHTML += `

                </tbody>

            </table>

        `;


        container.innerHTML =
            tableHTML;


    } catch (error) {

        console.log(
            "Request History Error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load blood requests.</p>";

    }

}


// =====================================
// LOAD RECIPIENT BLOOD STOCK
// =====================================

async function loadRecipientBloodStock() {

    const container =
        document.getElementById(
            "recipientBloodStock"
        );


    if (!container) {
        return;
    }


    try {

        const response = await fetch(
            "/api/blood/stock"
        );

        const stock =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                `<p>${stock.message}</p>`;

            return;
        }


        let stockHTML = "";


        stock.forEach(function (item) {

            stockHTML += `

                <div class="blood-stock-card">

                    <div class="blood-drop">
                        🩸
                    </div>

                    <h3>
                        ${item.blood_group}
                    </h3>

                    <p>
                        ${item.quantity} units
                    </p>

                </div>

            `;

        });


        container.innerHTML =
            stockHTML;


    } catch (error) {

        console.log(
            "Recipient Blood Stock Error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load blood stock.</p>";

    }

}


// =====================================
// RUN RECIPIENT DASHBOARD
// =====================================

if (
    window.location.pathname.endsWith(
        "recipient.html"
    )
) {

    loadRecipientDashboard();

}

// =====================================
// LOAD PENDING BLOOD REQUESTS
// =====================================

async function loadPendingBloodRequests() {

    const token =
        localStorage.getItem("token");

    const userData =
        localStorage.getItem("user");


    if (!token || !userData) {
        return;
    }


    let user;

    try {

        user = JSON.parse(userData);

    } catch (error) {

        return;

    }


    // Only admin can see pending requests

    if (user.role !== "admin") {
        return;
    }


    const container =
        document.getElementById(
            "pendingBloodRequests"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/admin/requests",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const requests =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                `<p>${requests.message}</p>`;

            return;
        }


        // No pending requests

        if (requests.length === 0) {

            container.innerHTML =
                "<p>No pending blood requests.</p>";

            return;
        }


        // Create table

        let tableHTML = `

            <table class="donation-table">

                <thead>

                    <tr>

                        <th>Request ID</th>

                        <th>Recipient Name</th>

                        <th>Email</th>

                        <th>Blood Group</th>

                        <th>Quantity</th>

                        <th>Hospital</th>

                        <th>Request Date</th>

                        <th>Status</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

        `;


        requests.forEach(function (request) {

            tableHTML += `

                <tr>

                    <td>
                        ${request.request_id}
                    </td>

                    <td>
                        ${request.name}
                    </td>

                    <td>
                        ${request.email}
                    </td>

                    <td>
                        ${request.blood_group}
                    </td>

                    <td>
                        ${request.quantity}
                    </td>

                    <td>
                        ${request.hospital || "Not provided"}
                    </td>

                    <td>
                        ${request.request_date}
                    </td>

                    <td>
                        ${request.status}
                    </td>

                    <td>

                        <button
                            onclick="updateBloodRequestStatus(
                                ${request.request_id},
                                'Approved'
                            )">

                            Approve

                        </button>


                        <button
                            onclick="updateBloodRequestStatus(
                                ${request.request_id},
                                'Rejected'
                            )">

                            Reject

                        </button>

                    </td>

                </tr>

            `;

        });


        tableHTML += `

                </tbody>

            </table>

        `;


        container.innerHTML =
            tableHTML;


    } catch (error) {

        console.log(
            "Pending Blood Requests Error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load pending blood requests.</p>";

    }

}


// =====================================
// APPROVE OR REJECT BLOOD REQUEST
// =====================================

async function updateBloodRequestStatus(
    requestId,
    status
) {

    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                `/api/admin/requests/${requestId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(data.message);


        // Reload pending requests

        loadPendingBloodRequests();


        // Reload blood stock

        loadAdminDashboard();

    } catch (error) {

        console.log(
            "Blood Request Status Error:",
            error
        );

        alert(
            "Unable to update blood request."
        );

    }

}


// =====================================
// RUN PENDING BLOOD REQUESTS ON ADMIN PAGE
// =====================================

if (
    window.location.pathname.endsWith(
        "admin.html"
    )
) {

    loadPendingBloodRequests();

}

// =====================================
// BLOOD STOCK SEARCH
// =====================================

const searchBloodButton =
    document.getElementById("searchBloodButton");

if (searchBloodButton) {

    searchBloodButton.addEventListener(
        "click",
        async function () {

            const selectedGroup =
                document.getElementById(
                    "searchBloodGroup"
                ).value;

            const message =
                document.getElementById(
                    "bloodSearchMessage"
                );

            const stockContainer =
                document.getElementById(
                    "recipientBloodStock"
                );

            try {

                const response = await fetch(
                    "/api/blood/stock"
                );

                const stock = await response.json();

                if (!response.ok) {
                    throw new Error(
                        "Unable to load blood stock"
                    );
                }

                let filteredStock = stock;

                // If a blood group is selected,
                // show only that blood group
                if (selectedGroup !== "") {

                    filteredStock = stock.filter(
                        item =>
                            item.blood_group ===
                            selectedGroup
                    );
                }

                if (filteredStock.length === 0) {

                    stockContainer.innerHTML =
                        "<p>No blood stock found.</p>";

                    message.innerText =
                        "No blood group found.";

                    return;
                }

                stockContainer.innerHTML =
                    filteredStock.map(item => {

                        return `
                            <div class="blood-card">

                                <h3>
                                    ${item.blood_group}
                                </h3>

                                <p>
                                    Available:
                                    <strong>
                                        ${item.quantity}
                                    </strong>
                                    units
                                </p>

                            </div>
                        `;

                    }).join("");

                if (selectedGroup !== "") {

                    const selectedBlood =
                        filteredStock[0];

                    if (selectedBlood.quantity > 0) {

                        message.innerText =
                            `${selectedGroup} blood is available: ${selectedBlood.quantity} unit(s).`;

                    } else {

                        message.innerText =
                            `${selectedGroup} blood is currently not available.`;
                    }

                } else {

                    message.innerText =
                        "Showing all blood groups.";
                }

            } catch (error) {

                console.log(
                    "Blood Search Error:",
                    error
                );

                message.innerText =
                    "Unable to search blood stock.";

            }

        }
    );

}
// =====================================
// DONOR BLOOD STOCK SEARCH
// =====================================

const donorSearchBloodButton =
    document.getElementById("donorSearchBloodButton");

if (donorSearchBloodButton) {

    donorSearchBloodButton.addEventListener(
        "click",
        async function () {

            const selectedGroup =
                document.getElementById(
                    "donorSearchBloodGroup"
                ).value;

            const message =
                document.getElementById(
                    "donorBloodSearchMessage"
                );

            const stockContainer =
                document.getElementById(
                    "bloodStock"
                );

            try {

                const response = await fetch(
                    "/api/blood/stock"
                );

                const stock = await response.json();

                if (!response.ok) {
                    throw new Error(
                        "Unable to load blood stock"
                    );
                }

                let filteredStock = stock;

                // Show selected blood group
                if (selectedGroup !== "") {

                    filteredStock = stock.filter(
                        item =>
                            item.blood_group ===
                            selectedGroup
                    );
                }

                if (filteredStock.length === 0) {

                    stockContainer.innerHTML =
                        "<p>No blood stock found.</p>";

                    message.innerText =
                        "No blood group found.";

                    return;
                }

                stockContainer.innerHTML =
                    filteredStock.map(item => {

                        return `
                            <div class="blood-card">

                                <h3>
                                    ${item.blood_group}
                                </h3>

                                <p>
                                    Available:
                                    <strong>
                                        ${item.quantity}
                                    </strong>
                                    units
                                </p>

                            </div>
                        `;

                    }).join("");

                if (selectedGroup !== "") {

                    const selectedBlood =
                        filteredStock[0];

                    if (selectedBlood.quantity > 0) {

                        message.innerText =
                            `${selectedGroup} blood is available: ${selectedBlood.quantity} unit(s).`;

                    } else {

                        message.innerText =
                            `${selectedGroup} blood is currently not available.`;
                    }

                } else {

                    message.innerText =
                        "Showing all blood groups.";
                }

            } catch (error) {

                console.log(
                    "Donor Blood Search Error:",
                    error
                );

                message.innerText =
                    "Unable to search blood stock.";
            }
        }
    );
}