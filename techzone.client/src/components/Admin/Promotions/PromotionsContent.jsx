import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Button, Modal, Form, Input, DatePicker, InputNumber, message, Select, Switch } from "antd";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPromotion, addPromotion, updatePromotion, deletePromotion } from "../../../features/Admin/Promotions/Promotion";
import { fetchAllProduct } from "../../../features/Admin/Products/Product";
import dayjs from "dayjs";

const PromotionsContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [originalIsActive, setOriginalIsActive] = useState(null);
    const [form] = Form.useForm();
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const dispatch = useDispatch();
    const { promotionItems, status, error } = useSelector((state) => state.promotion);
    const { productItems } = useSelector((state) => state.product);

    useEffect(() => {
        dispatch(fetchAllPromotion());
        fetchProducts();
    }, [dispatch]);

    const fetchProducts = async () => {
        try {
            setProductsLoading(true);
            const result = await dispatch(fetchAllProduct()).unwrap();
            setProducts(
                result.map((product) => ({
                    value: product.productId.toString(),
                    label: `${product.productId} - ${product.name}`,
                }))
            );
        } catch (err) {
            message.error("Failed to fetch products");
        } finally {
            setProductsLoading(false);
        }
    };

    // Filter promotions based on search query
    const filteredPromotions = promotionItems?.filter((promotion) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            promotion.name?.toLowerCase().includes(query) ||
            promotion.promotionCode?.toLowerCase().includes(query) ||
            promotion.description?.toLowerCase().includes(query)
        );
    }) || [];

    const columns = [
        {
            title: "Code",
            dataIndex: "promotionCode",
            key: "promotionCode",
            render: (text) => <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">{text}</span>,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Discount",
            dataIndex: "discountPercentage",
            key: "discountPercentage",
            render: (val) => <span>{val ? `${val}%` : 'N/A'}</span>,
        },
        {
            title: "Start Date",
            dataIndex: "startDate",
            key: "startDate",
            render: (date) => date ? dayjs(date).format("YYYY-MM-DD") : "N/A",
        },
        {
            title: "End Date",
            dataIndex: "endDate",
            key: "endDate",
            render: (date) => date ? dayjs(date).format("YYYY-MM-DD") : "N/A",
        },
        {
            title: "Status",
            key: "status",
            render: (_, record) => {
                const now = new Date();
                const startDate = new Date(record.startDate);
                const endDate = new Date(record.endDate);
                const isActive = startDate <= now && endDate >= now;
                return (
                    <Tag color={isActive ? 'green' : 'red'}>
                        {isActive ? 'Active' : endDate < now ? 'Expired' : 'Upcoming'}
                    </Tag>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        type="text" 
                        icon={<Pencil size={16} />} 
                        className="text-blue-600"
                        onClick={() => handleEdit(record)}
                    />
                    <Button 
                        type="text" 
                        icon={<Trash2 size={16} />} 
                        className="text-red-600"
                        onClick={() => handleDelete(record.promotionId)}
                    />
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingPromotion(null);
        setOriginalIsActive(null);
        form.resetFields();
        form.setFieldsValue({
            isActive: true, // Default to active for new promotions
        });
        setIsModalOpen(true);
    };

    const handleEdit = (promotion) => {
        setEditingPromotion(promotion);
        const now = dayjs();
        const startDate = promotion.startDate ? dayjs(promotion.startDate) : null;
        const endDate = promotion.endDate ? dayjs(promotion.endDate) : null;
        
        // Calculate isActive: promotion is active if current time is between startDate and endDate
        let isActive = false;
        if (startDate && endDate) {
            isActive = startDate.isBefore(now) && endDate.isAfter(now);
        }
        
        // Store original isActive state to detect changes
        setOriginalIsActive(isActive);
        
        form.setFieldsValue({
            name: promotion.name,
            description: promotion.description,
            promotionCode: promotion.promotionCode,
            discountPercentage: promotion.discountPercentage,
            startDate: startDate,
            endDate: endDate,
            productIDs: promotion.productIDs || [],
            isActive: isActive,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (promotionId) => {
        Modal.confirm({
            title: "Are you sure you want to delete this promotion?",
            content: "This action cannot be undone.",
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    const result = await dispatch(deletePromotion(promotionId)).unwrap();
                    message.success("Promotion deleted successfully");
                    // Refresh the list
                    dispatch(fetchAllPromotion());
                } catch (error) {
                    const errorMessage = error?.message || error || "Failed to delete promotion";
                    message.error(errorMessage);
                    console.error("Delete error:", error);
                }
            },
        });
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            let endDate = values.endDate;
            const now = dayjs();
            
            // Only adjust endDate if user explicitly changed isActive status
            if (editingPromotion && originalIsActive !== null) {
                const currentIsActive = values.isActive;
                
                // If user toggled from active to inactive
                if (originalIsActive === true && currentIsActive === false) {
                    // Set end date to now to deactivate immediately
                    endDate = now.subtract(1, 'minute');
                }
                // If user toggled from inactive to active
                else if (originalIsActive === false && currentIsActive === true) {
                    // Ensure end date is in the future
                    if (endDate.isBefore(now) || endDate.isSame(now)) {
                        // If current endDate is in the past, extend it to 30 days from now
                        endDate = now.add(30, 'days');
                    }
                    // If startDate is in the future, set it to now
                    if (values.startDate.isAfter(now)) {
                        values.startDate = now;
                    }
                }
                // If status didn't change, keep the dates as user entered them
            }
            
            const promotionData = {
                name: values.name,
                description: values.description,
                promotionCode: values.promotionCode,
                discountPercentage: values.discountPercentage,
                startDate: values.startDate.toISOString(),
                endDate: endDate.toISOString(),
                productIDs: values.productIDs || [],
            };

            if (editingPromotion) {
                promotionData.promotionId = editingPromotion.promotionId;
                await dispatch(updatePromotion(promotionData)).unwrap();
                message.success("Promotion updated successfully");
            } else {
                await dispatch(addPromotion(promotionData)).unwrap();
                message.success("Promotion created successfully");
            }
            
            setIsModalOpen(false);
            form.resetFields();
            setEditingPromotion(null);
            setOriginalIsActive(null);
            dispatch(fetchAllPromotion());
        } catch (error) {
            const errorMessage = error?.message || error || "Failed to save promotion";
            message.error(errorMessage);
            console.error("Save error:", error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Promotions</h1>
                    <p className="text-gray-500">Manage discount codes and coupons</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Create Promotion</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <Input
                    placeholder="Search by name, code, or description..."
                    prefix={<Search size={16} className="text-gray-400" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                    allowClear
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <Table 
                    columns={columns} 
                    dataSource={filteredPromotions.map(item => ({ ...item, key: item.promotionId }))}
                    loading={status === 'loading'}
                />
            </div>

            <Modal
                title={editingPromotion ? "Edit Promotion" : "Create Promotion"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingPromotion(null);
                    setOriginalIsActive(null);
                }}
                okText={editingPromotion ? "Update" : "Create"}
                confirmLoading={status === 'loading'}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="name" label="Promotion Name" rules={[{ required: true, message: "Please enter promotion name" }]}>
                        <Input placeholder="e.g. Summer Sale 2024" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} placeholder="Enter promotion description" />
                    </Form.Item>
                    <Form.Item name="promotionCode" label="Promotion Code" rules={[{ required: true, message: "Please enter promotion code" }]}>
                        <Input placeholder="e.g. SAVE20" />
                    </Form.Item>
                    <Form.Item name="discountPercentage" label="Discount Percentage (%)" rules={[{ required: true, message: "Please enter discount percentage" }]}>
                        <InputNumber className="w-full" min={0} max={100} placeholder="e.g. 20" />
                    </Form.Item>
                    <div className="flex gap-4">
                        <Form.Item name="startDate" label="Start Date" className="flex-1" rules={[{ required: true, message: "Please select start date" }]}>
                            <DatePicker className="w-full" />
                        </Form.Item>
                        <Form.Item name="endDate" label="End Date" className="flex-1" rules={[{ required: true, message: "Please select end date" }]}>
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </div>
                    {editingPromotion && (
                        <Form.Item 
                            name="isActive" 
                            label="Promotion Status" 
                            valuePropName="checked"
                            tooltip="Toggle to activate or deactivate this promotion. When deactivated, the end date will be set to now."
                        >
                            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.isActive !== currentValues.isActive}>
                                {({ getFieldValue }) => (
                                    <div className="flex items-center gap-3">
                                        <Switch 
                                            checkedChildren="Active" 
                                            unCheckedChildren="Inactive"
                                            style={{ minWidth: '60px' }}
                                        />
                                        <span className="text-sm text-gray-600 font-medium">
                                            {getFieldValue('isActive') ? '✓ Promotion is active' : '✗ Promotion is inactive'}
                                        </span>
                                    </div>
                                )}
                            </Form.Item>
                        </Form.Item>
                    )}
                    <Form.Item
                        name="productIDs"
                        label="Products (Optional)"
                        help="Select products to apply this promotion to. Leave empty for a global promotion."
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select products"
                            loading={productsLoading}
                            options={products}
                            optionFilterProp="label"
                            className="w-full"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PromotionsContent;
