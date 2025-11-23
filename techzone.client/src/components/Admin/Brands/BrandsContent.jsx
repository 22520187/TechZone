import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Modal, Form, Input, message, Popconfirm } from "antd";

const BrandsContent = () => {
    const [brands, setBrands] = useState([
        { id: 1, name: "Apple", country: "USA", logo: "https://placehold.co/100x100?text=Apple" },
        { id: 2, name: "Samsung", country: "South Korea", logo: "https://placehold.co/100x100?text=Samsung" },
        { id: 3, name: "Dell", country: "USA", logo: "https://placehold.co/100x100?text=Dell" },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [form] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState("");

    const handleAdd = () => {
        setEditingBrand(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (brand) => {
        setEditingBrand(brand);
        form.setFieldsValue(brand);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setBrands(brands.filter(b => b.id !== id));
        message.success("Brand deleted successfully");
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingBrand) {
                setBrands(brands.map(b => b.id === editingBrand.id ? { ...b, ...values } : b));
                message.success("Brand updated successfully");
            } else {
                const newBrand = { id: Date.now(), ...values, logo: "https://placehold.co/100x100?text=New" };
                setBrands([...brands, newBrand]);
                message.success("Brand added successfully");
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Brands</h1>
                    <p className="text-gray-500">Manage your product brands</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Brand</span>
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search brands..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBrands.map((brand) => (
                    <motion.div
                        key={brand.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex flex-col items-center text-center"
                    >
                        <div className="w-20 h-20 mb-4 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                            <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-800">{brand.name}</h3>
                        <p className="text-gray-500 text-sm mb-4">{brand.country}</p>

                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={() => handleEdit(brand)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                                <Pencil size={16} />
                            </button>
                            <Popconfirm
                                title="Delete Brand"
                                description="Are you sure you want to delete this brand?"
                                onConfirm={() => handleDelete(brand.id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </Popconfirm>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Modal
                title={editingBrand ? "Edit Brand" : "Add Brand"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="name" label="Brand Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Apple" />
                    </Form.Item>
                    <Form.Item name="country" label="Country">
                        <Input placeholder="e.g. USA" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BrandsContent;
