import React, { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Modal, Form, Input, Button, Upload, message, Popconfirm } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import api from "../../../features/AxiosInstance/AxiosInstance";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState("");

    // Mock data for now until API is confirmed
    const mockCategories = [
        { id: 1, name: "Laptops", description: "High performance laptops", image: "https://placehold.co/300x200?text=Laptops" },
        { id: 2, name: "Smartphones", description: "Latest smartphones", image: "https://placehold.co/300x200?text=Smartphones" },
        { id: 3, name: "Accessories", description: "Tech accessories", image: "https://placehold.co/300x200?text=Accessories" },
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            // const response = await api.get("/categories");
            // setCategories(response.data);
            setCategories(mockCategories); // Using mock data for initial setup
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            message.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        form.setFieldsValue(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            // await api.delete(`/categories/${id}`);
            message.success("Category deleted successfully");
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            message.error("Failed to delete category");
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // Handle form submission (API call)
            console.log("Form values:", values);

            if (editingCategory) {
                // Update logic
                setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...values } : c));
                message.success("Category updated successfully");
            } else {
                // Create logic
                const newCategory = { id: Date.now(), ...values, image: "https://placehold.co/300x200?text=New" };
                setCategories([...categories, newCategory]);
                message.success("Category added successfully");
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                    <p className="text-gray-500">Manage your product categories</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Category</span>
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                    >
                        <div className="h-40 bg-gray-100 relative overflow-hidden group">
                            <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-semibold text-lg text-gray-800 mb-1">{category.name}</h3>
                            <p className="text-gray-500 text-sm mb-4 flex-1">{category.description}</p>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                >
                                    <Pencil size={18} />
                                </button>
                                <Popconfirm
                                    title="Delete Category"
                                    description="Are you sure you want to delete this category?"
                                    onConfirm={() => handleDelete(category.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </Popconfirm>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Modal
                title={editingCategory ? "Edit Category" : "Add Category"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                okText={editingCategory ? "Save Changes" : "Create Category"}
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input placeholder="e.g. Laptops" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} placeholder="Category description..." />
                    </Form.Item>
                    {/* Image upload would go here */}
                </Form>
            </Modal>
        </div>
    );
};

export default Categories;