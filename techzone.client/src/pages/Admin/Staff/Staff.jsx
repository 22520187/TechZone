import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Filter,
    ChevronLeft,
    ChevronRight,
    Search,
    ChevronDown,
    Eye,
    Pencil,
    Trash2,
    Plus,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { message, Spin, Modal, Form, Input, Select, Popconfirm } from "antd";
import {
    fetchAllStaff,
    addStaff,
    updateStaff,
    deleteStaff,
} from "../../../features/Admin/Staff/Staff";
import dayjs from "dayjs";
import useDebounce from "../../../hooks/useDebounce";

const StaffAvatar = ({ name }) => {
    const initials = name && name.trim()
        ? name
            .split(" ")
            .filter(n => n.length > 0)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : "?";

    return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
            {initials}
        </div>
    );
};

export default function Staff() {
    const dispatch = useDispatch();
    const { staffItems, status, error } = useSelector((state) => state.staff);

    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            await dispatch(fetchAllStaff()).unwrap();
        } catch (err) {
            message.error(
                "Failed to fetch staff: " + (err.message || "Unknown error")
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [dispatch]);

    const staffData = staffItems.map((staff) => ({
        id: staff.userId,
        name: staff.fullName || "",
        email: staff.email || "",
        phone: staff.phone || "",
        city: staff.city || "",
        district: staff.district || "",
        ward: staff.ward || "",
        avatar: staff.avatarImageUrl || "",
        created: staff.createdAt
            ? dayjs(staff.createdAt).format("DD-MM-YYYY")
            : "Unknown",
    }));

    const filteredStaffData = staffData.filter((row) => {
        if (debouncedSearchQuery.trim() === "") {
            return true;
        }
        return (
            row.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            row.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            row.phone.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
    });

    const totalItems = filteredStaffData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getPaginationNumbers = () => {
        const pages = [];
        const maxDisplayedPages = 5;

        if (totalPages <= maxDisplayedPages) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(
                0,
                currentPage - Math.floor(maxDisplayedPages / 2)
            );
            let endPage = Math.min(
                totalPages - 1,
                startPage + maxDisplayedPages - 1
            );

            if (endPage - startPage < maxDisplayedPages - 1) {
                startPage = Math.max(0, endPage - maxDisplayedPages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    const toggleSelectAll = () => {
        if (selectedStaff.length === staffData.length) {
            setSelectedStaff([]);
        } else {
            setSelectedStaff(staffData.map((staff) => staff.id));
        }
    };

    const toggleSelectStaff = (staffId) => {
        if (selectedStaff.includes(staffId)) {
            setSelectedStaff(selectedStaff.filter((id) => id !== staffId));
        } else {
            setSelectedStaff([...selectedStaff, staffId]);
        }
    };

    const showAddModal = () => {
        setIsEditMode(false);
        setCurrentStaff(null);
        setIsModalOpen(true);
        form.resetFields();
    };

    const showEditModal = (staff) => {
        setIsEditMode(true);
        setCurrentStaff(staff);
        setIsModalOpen(true);

        const staffData = staffItems.find((s) => s.userId === staff.id);
        form.setFieldsValue({
            fullName: staffData.fullName || "",
            phone: staffData.phone || "",
            city: staffData.city || "",
            district: staffData.district || "",
            ward: staffData.ward || "",
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            const staffData = {
                fullName: values.fullName,
                email: values.email || "",
                password: values.password || "",
                phone: values.phone || "",
                city: values.city || "",
                district: values.district || "",
                ward: values.ward || "",
            };

            if (isEditMode && currentStaff) {
                const updateData = {
                    fullName: staffData.fullName,
                    phone: staffData.phone,
                    city: staffData.city,
                    district: staffData.district,
                    ward: staffData.ward,
                };
                await dispatch(
                    updateStaff({
                        userId: currentStaff.id,
                        ...updateData,
                    })
                ).unwrap();
                message.success("Staff updated successfully");
            } else {
                await dispatch(addStaff(staffData)).unwrap();
                message.success("Staff added successfully");
            }

            setIsModalOpen(false);
            form.resetFields();
            await fetchStaff();
        } catch (err) {
            console.error("Error in handleSubmit:", err);
            const errorMessage = typeof err === "string" 
                ? err 
                : err.message || `Unable to ${isEditMode ? "update" : "add"} staff. Please try again.`;
            message.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteStaff = async (staffId) => {
        try {
            await dispatch(deleteStaff(staffId)).unwrap();
            message.success("Staff deleted successfully");
            await fetchStaff();
        } catch (err) {
            console.error("Error deleting staff:", err);
            const errorMessage = typeof err === "string" 
                ? err 
                : err.message || "Unable to delete staff. Please try again.";
            message.error(errorMessage, 5);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedStaff.length === 0) {
            message.warning("Please select staff to delete");
            return;
        }

        Modal.confirm({
            title: `Delete ${selectedStaff.length} staff member${selectedStaff.length > 1 ? 's' : ''}?`,
            content: 'Are you sure you want to delete the selected staff members? This action cannot be undone.',
            okText: 'Yes, Delete',
            cancelText: 'Cancel',
            okButtonProps: { danger: true },
            onOk: async () => {
                let successCount = 0;
                let errorCount = 0;
                const errors = [];

                for (const staffId of selectedStaff) {
                    try {
                        await dispatch(deleteStaff(staffId)).unwrap();
                        successCount++;
                    } catch (err) {
                        errorCount++;
                        const staffName = staffData.find(s => s.id === staffId)?.name || `ID ${staffId}`;
                        errors.push(staffName);
                    }
                }

                if (successCount > 0) {
                    message.success(`Successfully deleted ${successCount} staff member${successCount > 1 ? 's' : ''}`);
                }

                if (errorCount > 0) {
                    message.error(`Failed to delete ${errorCount} staff member${errorCount > 1 ? 's' : ''}: ${errors.join(', ')}`);
                }

                setSelectedStaff([]);
                await fetchStaff();
            },
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-gray-800">Staff Management</h1>

            {/* Bulk Action Bar - Show when items are selected */}
            {selectedStaff.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between"
                >
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-900">
                            {selectedStaff.length} staff member{selectedStaff.length > 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setSelectedStaff([])}
                            className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Clear Selection
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 text-sm cursor-pointer font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1"
                        >
                            <Trash2 size={16} />
                            <span>Delete Selected</span>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Search and Add Button */}
            <div className="flex justify-between">
                <div
                    className={`relative ${
                        searchQuery.length > 0 ? "w-64" : "w-44"
                    } focus-within:w-64 hover:w-64 hover:duration-300 duration-300`}
                >
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        className="pl-10 pr-4 py-2 w-full border rounded-full text-sm focus:outline-none focus:border-primary-600"
                        placeholder="Search staff"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(0);
                        }}
                    />
                </div>

                <button
                    className="flex items-center cursor-pointer py-2 px-5 text-white bg-primary rounded-lg font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-100"
                    onClick={showAddModal}
                >
                    <Plus size={16} className="mr-1" />
                    <span className="cursor-pointer">Add Staff</span>
                </button>
            </div>

            {/* Table */}
            {loading || status === "loading" ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" tip="Loading staff..." />
                </div>
            ) : error && error !== "Email already exists" ? (
                <div className="text-red-500 text-center">
                    Error loading staff: {error}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="ps-4 py-3 text-left">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedStaff.length === staffData.length}
                                                onChange={toggleSelectAll}
                                            />
                                            <span className="ml-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Staff Name
                                            </span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        City
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <motion.tbody
                                key={`staff-table-${debouncedSearchQuery}-${currentPage}`}
                                className="bg-white divide-y divide-gray-200"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {filteredStaffData
                                    .slice(
                                        currentPage * itemsPerPage,
                                        (currentPage + 1) * itemsPerPage
                                    )
                                    .map((staff) => (
                                        <motion.tr
                                            key={staff.id}
                                            variants={itemVariants}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="ps-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={selectedStaff.includes(staff.id)}
                                                        onChange={() => toggleSelectStaff(staff.id)}
                                                    />
                                                    <StaffAvatar name={staff.name} />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {staff.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {staff.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {staff.phone}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {staff.city}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {staff.created}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button
                                                    onClick={() => showEditModal(staff)}
                                                    className="text-blue-600 hover:text-blue-900 mr-2 cursor-pointer"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <Popconfirm
                                                    title="Delete staff"
                                                    description="Are you sure you want to delete this staff member?"
                                                    onConfirm={() => handleDeleteStaff(staff.id)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                >
                                                    <button className="text-red-600 hover:text-red-900 cursor-pointer">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </Popconfirm>
                                            </td>
                                        </motion.tr>
                                    ))}
                            </motion.tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Previous
                            </button>
                            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {currentPage * itemsPerPage + 1}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {Math.min(
                                            (currentPage + 1) * itemsPerPage,
                                            totalItems
                                        )}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">{totalItems}</span>{" "}
                                    results
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                    aria-label="Pagination"
                                >
                                    <button
                                        onClick={() =>
                                            setCurrentPage(
                                                Math.max(0, currentPage - 1)
                                            )
                                        }
                                        disabled={currentPage === 0}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    {getPaginationNumbers().map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                currentPage === pageNum
                                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() =>
                                            setCurrentPage(
                                                Math.min(totalPages - 1, currentPage + 1)
                                            )
                                        }
                                        disabled={currentPage >= totalPages - 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                title={isEditMode ? "Edit Staff" : "Add New Staff"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="mt-4"
                >
                    <Form.Item
                        label="Full Name"
                        name="fullName"
                        rules={[{ required: true, message: "Please enter full name" }]}
                    >
                        <Input placeholder="Enter full name" />
                    </Form.Item>

                    {!isEditMode && (
                        <>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: "Please enter email" },
                                    { type: "email", message: "Please enter a valid email" },
                                ]}
                            >
                                <Input placeholder="Enter email" />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    { required: true, message: "Please enter password" },
                                    { min: 6, message: "Password must be at least 6 characters" },
                                ]}
                            >
                                <Input.Password placeholder="Enter password" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item label="Phone" name="phone">
                        <Input placeholder="Enter phone number" />
                    </Form.Item>

                    <Form.Item label="City" name="city">
                        <Input placeholder="Enter city" />
                    </Form.Item>

                    <Form.Item label="District" name="district">
                        <Input placeholder="Enter district" />
                    </Form.Item>

                    <Form.Item label="Ward" name="ward">
                        <Input placeholder="Enter ward" />
                    </Form.Item>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 cursor-pointer border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 cursor-pointer bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : isEditMode ? "Update" : "Add"}
                        </button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
