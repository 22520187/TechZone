import React, { useState } from "react";
import { Table, Tag, Space, Button, Modal, Form, Input, DatePicker, InputNumber, message } from "antd";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const PromotionsContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const columns = [
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            render: (text) => <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">{text}</span>,
        },
        {
            title: "Discount",
            dataIndex: "discount",
            key: "discount",
            render: (val, record) => <span>{val}{record.type === 'percentage' ? '%' : '$'} OFF</span>,
        },
        {
            title: "Usage",
            dataIndex: "usage",
            key: "usage",
            render: (val, record) => <span>{val} / {record.limit}</span>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
            ),
        },
        {
            title: "Expiry",
            dataIndex: "expiry",
            key: "expiry",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    <Button type="text" icon={<Pencil size={16} />} className="text-blue-600" />
                    <Button type="text" icon={<Trash2 size={16} />} className="text-red-600" />
                </Space>
            ),
        },
    ];

    const data = [
        { key: '1', code: 'WELCOME20', discount: 20, type: 'percentage', usage: 45, limit: 100, status: 'Active', expiry: '2024-12-31' },
        { key: '2', code: 'SUMMER50', discount: 50, type: 'fixed', usage: 12, limit: 50, status: 'Expired', expiry: '2024-08-31' },
    ];

    const handleAdd = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            console.log(values);
            message.success("Promotion created successfully");
            setIsModalOpen(false);
        });
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

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <Table columns={columns} dataSource={data} />
            </div>

            <Modal
                title="Create Promotion"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="code" label="Coupon Code" rules={[{ required: true }]}>
                        <Input placeholder="e.g. SAVE20" />
                    </Form.Item>
                    <div className="flex gap-4">
                        <Form.Item name="discount" label="Discount Value" className="flex-1" rules={[{ required: true }]}>
                            <InputNumber className="w-full" min={0} />
                        </Form.Item>
                        <Form.Item name="type" label="Type" className="flex-1" initialValue="percentage">
                            <Input disabled value="Percentage" />
                        </Form.Item>
                    </div>
                    <Form.Item name="expiry" label="Expiry Date" rules={[{ required: true }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PromotionsContent;
