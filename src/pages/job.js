import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage"; // Import Firebase Storage related functions
import './transactions.css';
import logo from '../assets/logo.png';
import notification from '../assets/icons/Notification.png';
import Sidebar from "../components/sidebar";
import { FaSearch } from 'react-icons/fa'; // Import icons
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { onSnapshot } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAsIqHHA8727cGeTjr0dUQQmttqJ2nW_IE",
    authDomain: "muniserve-4dc11.firebaseapp.com",
    projectId: "muniserve-4dc11",
    storageBucket: "muniserve-4dc11.appspot.com",
    messagingSenderId: "874813480248",
    appId: "1:874813480248:web:edd1ff1f128b5bb4a2b5cd",
    measurementId: "G-LS66HXR3GT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

function App() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [tableVisible, setTableVisible] = useState(true);

    const [searchQuery, setSearchQuery] = useState(""); // New state for the search query 
    const [selectedYearFilter, setSelectedYearFilter] = useState("");
    const [selectedMonthFilter, setSelectedMonthFilter] = useState("");
    const [selectedDayFilter, setSelectedDayFilter] = useState("");
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

    const storage = getStorage();

    useEffect(() => {
        setLoading(true);

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(collection(firestore, "job"), async (querySnapshot) => {
            try {
                const items = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                for (const item of items) {
                    if (item.imagePath) {
                        const imageUrl = await getDownloadURL(ref(storage, item.imagePath));
                        item.imageUrl = imageUrl;
                    }
                }

                setData(items);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data: ", error);
                setLoading(false);
            }
        });

        return () => {
            // Unsubscribe when the component unmounts
            unsubscribe();
        };
    }, []);

    const openDetailsModal = async (item) => {
        setSelectedItem(item);
        setTableVisible(false); // Set the table to hide
    };

    const closeDetailsModal = () => {
        setSelectedItem(null);
        setTableVisible(true); // Set the table to show
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const appointmentRef = doc(firestore, "deathCert", id);
            await updateDoc(appointmentRef, {
                status: newStatus,
            });

            setSelectedItem((prevItem) => ({
                ...prevItem,
                status: newStatus,
            }));
        } catch (error) {
            console.error("Error updating status: ", error);
        }
    };

    const filteredData = data.filter((item) => {
        const getMonthName = (monthNumber) => {
            const monthNames = [
                "January", "February", "March", "April",
                "May", "June", "July", "August",
                "September", "October", "November", "December"
            ];
            return monthNames[monthNumber - 1];
        };

        return (
            item.name &&
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedYearFilter !== "" ? (item.createdAt && item.createdAt.toDate && typeof item.createdAt.toDate === 'function' && item.createdAt.toDate().getFullYear().toString() === selectedYearFilter) : true) &&
            (selectedMonthFilter !== "" ? (item.createdAt && item.createdAt.toDate && typeof item.createdAt.toDate === 'function' && getMonthName(item.createdAt.toDate().getMonth() + 1).toLowerCase() === selectedMonthFilter.toLowerCase()) : true) &&
            (selectedDayFilter !== "" ? (item.createdAt && item.createdAt.toDate && typeof item.createdAt.toDate === 'function' && item.createdAt.toDate().getDate().toString() === selectedDayFilter) : true) &&
            (selectedStatusFilter !== "" ? item.status.toLowerCase().includes(selectedStatusFilter.toLowerCase()) : true)
        );
    });

    const handleYearFilterChange = (event) => {
        setSelectedYearFilter(event.target.value);
    };

    const handleMonthFilterChange = (event) => {
        setSelectedMonthFilter(event.target.value);
    };

    const handleDayFilterChange = (event) => {
        setSelectedDayFilter(event.target.value);
    };

    const handleStatusFilterChange = (event) => {
        setSelectedStatusFilter(event.target.value);
    };

    const sortedData = [...filteredData].sort((a, b) => {
        const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA;
    });

    return (
        <div>
            <div className="sidebar">
                <Sidebar />
            </div>

            <div className='container'>
                <div className="header">
                    <div className='icons'>
                        <h1>Transactions</h1>
                        <img src={notification} alt="Notification.png" className='notif' />
                        <img src={logo} alt="logo" className='account-img' />
                        <div className='account-name'><h1>Admin</h1></div>
                    </div>
                </div>

                <div className='screen'>
                    <div className="categories-container">
                        <Link to="/birthreg" className="link">
                            <button className="categories1">
                                <h5>Certificate of Live Birth</h5>
                            </button>
                        </Link>

                        <Link to="/marriageCert" className="link">
                            <button className="categories1">
                                <h5>Certificate of Marriage </h5>
                            </button>
                        </Link>

                        <Link to="/deathCert" className="link">
                            <button className="categories1">
                                <h5>Certificate of Death</h5>
                            </button>
                        </Link>

                        <Link to="/businessPermit" className="link">
                            <button className="categories1">
                                <h5>Business Permit</h5>
                            </button>
                        </Link>

                        <Link to="/job" className="link">
                            <button className="categories1">
                                <h5>Job Application</h5>
                            </button>
                        </Link>
                    </div>
                </div>

                <div>
                    <h1>Job Applications</h1>
                </div>

                <div className="searches">
                    <FaSearch className="search-icons"></FaSearch>
                    <input
                        type="text"
                        placeholder="Search by Name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <div className="filter-container">
                        <label>Filter:</label>
                        <select value={selectedYearFilter} onChange={handleYearFilterChange} className="filter">
                            <option value="">Year</option>
                            <option value="2031">2031</option>
                            <option value="2030">2030</option>
                            <option value="2029">2029</option>
                            <option value="2028">2028</option>
                            <option value="2027">2027</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>

                        </select>
                        <select value={selectedMonthFilter} onChange={handleMonthFilterChange} className="filter">
                            <option value="">Month</option>
                            <option value="January">January</option>
                            <option value="February">February</option>
                            <option value="March">March</option>
                            <option value="April">April</option>
                            <option value="May">May</option>
                            <option value="June">June</option>
                            <option value="July">July</option>
                            <option value="August">August</option>
                            <option value="September">September</option>
                            <option value="October">October</option>
                            <option value="November">November</option>
                            <option value="December">December</option>
                        </select>
                        <select value={selectedDayFilter} onChange={handleDayFilterChange} className="filter">
                            <option value="">Day</option>
                            <option value="1">1</option>
                            <option value="2">2</option>\
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="13">13</option>
                            <option value="14">14</option>
                            <option value="15">15</option>
                            <option value="16">16</option>
                            <option value="17">17</option>
                            <option value="18">18</option>
                            <option value="19">19</option>
                            <option value="20">20</option>
                            <option value="21">21</option>
                            <option value="22">22</option>
                            <option value="23">23</option>
                            <option value="24">24</option>
                            <option value="25">25</option>
                            <option value="26">26</option>
                            <option value="27">27</option>
                            <option value="28">28</option>
                            <option value="29">29</option>
                            <option value="30">30</option>
                            <option value="31">31</option>

                        </select>

                        <select
                            value={selectedStatusFilter}
                            onChange={handleStatusFilterChange}
                            className="filter"
                        >
                            <option value="">Status</option>
                            <option value="Completed">Completed</option>
                            <option value="On Process">On Process</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>

                {tableVisible && (
                    <div className="table-container">
                        <table className="custom-table" style={{ border: "1px solid black", marginBottom: "30px" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid black" }}>
                                    <th style={{ borderBottom: "1px solid black" }}>#</th>
                                    <th style={{ borderBottom: "1px solid black" }}>Name of Applicant</th>
                                    <th style={{ borderBottom: "1px solid black" }}>Residency</th>
                                    <th style={{ borderBottom: "1px solid black" }}>Mobile No.</th>
                                    <th style={{ borderBottom: "1px solid black" }}>Email</th>
                                    <th style={{ borderBottom: "1px solid black" }}>Date of Application</th>
                                    <th style={{ borderBottom: "1px solid black" }}>Status</th>
                                    <th style={{ borderBottom: "1px solid black" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center" }}>
                                            No matching records found.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedData.map((item, index) => (
                                        <tr key={item.id}>
                                            <td style={{ padding: "8px", border: "1px solid black" }}>{index + 1}</td>
                                            <td style={{ padding: "8px", border: "1px solid black" }}>{item.userName}</td>
                                            <td style={{ padding: "8px", border: "1px solid black" }}>{item.userBarangay}</td>
                                            <td style={{ padding: "8px", border: "1px solid black" }}>{item.userContact}</td>
                                            <td style={{ padding: "8px", border: "1px solid black" }}>{item.userEmail}</td>                                         
                                            <td style={{ padding: "8px", border: "1px solid black" }}>
                                                {item.createdAt && item.createdAt.toDate
                                                    ? item.createdAt.toDate().toLocaleString()
                                                    : "Invalid Date"}
                                            </td>
                                            <td style={{ padding: "8px", border: "1px solid black" }}>{item.status}</td>
                                            <td style={{ padding: "8px", border: "1px solid black" }}>
                                                <button onClick={() => openDetailsModal(item)} className="view-btn">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedItem && (
                    <div className="details-modal">
                        <div className="details-content">
                            <div className="subheads">
                                <div className="request-item">
                                    <button className="close-button" onClick={closeDetailsModal}>
                                        x
                                    </button>
                                    <div className="title">
                                        <h6>Full Details</h6>
                                    </div>
                                    <p>This application form is requested by {selectedItem.name}.</p>

                                    {/* Child's Information */}
                                    <div className="section">
                                        <div className="form-grid">

                                            <div className="form-group">
                                                <label>Complete name</label>
                                                <div className="placeholder">{selectedItem.name}</div>
                                            </div>

                                            <div className="form-group">
                                                <label>Age</label>
                                                <div className="placeholder">
                                                    {selectedItem.age}
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Sex</label>
                                                <div className="placeholder">
                                                    {selectedItem.sex}
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Address</label>
                                                <div className="placeholder">
                                                    {selectedItem.address}
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Phone Number</label>
                                                <div className="placeholder">
                                                    {selectedItem.phoneNum}
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Educational Attainment</label>
                                                <div className="placeholder">
                                                    {selectedItem.educ}
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="section">
                                        <h3>2x2 Picture</h3>
                                        <div className="proof">
                                            {selectedItem.pictures ? (
                                                <img
                                                    src={selectedItem.pictures}
                                                    alt="Proof of Payment"
                                                    className="proof-image"
                                                />
                                            ) : (
                                                <p>No payment proof available</p>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label>Status of Appointment</label>
                                            <div className="placeholder">{selectedItem.status}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;