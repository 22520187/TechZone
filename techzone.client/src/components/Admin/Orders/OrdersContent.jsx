import React, { useState } from "react";
import { Table, Tag, Space, Button, Input } from "antd";
import { Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrdersContent = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");

    const columns = [
        {
            title: "Order ID",
            dataIndex: "id",
            key: "id",
            render: (text) => <span className="font-medium">#{text}</span>,
        },
        {
            title: "Customer",
            dataIndex: "customer",
            key: "customer",
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total",
            render: (total) => <span className="font-semibold">${total.toFixed(2)}</span>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "default";
                if (status === "Completed") color = "green";
                if (status === "Pending") color = "gold";
                if (status === "Cancelled") color = "red";
                if (status === "Processing") color = "blue";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<Eye size={16} />}
                        onClick={() => navigate(`/orders/${record.id}`)}
                    >
                        View
                    </Button>
                </Space>
            ),
        },
    ];

    const data = [
        { id: "1001", customer: "John Doe", date: "2024-11-20", total: 1299.00, status: "Completed" },
        { id: "1002", customer: "Jane Smith", date: "2024-11-21", total: 89.50, status: "Processing" },
        { id: "1003", customer: "Bob Johnson", date: "2024-11-22", total: 450.00, status: "Pending" },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                    <p className="text-gray-500">Manage customer orders</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <Input
                        prefix={<Search size={18} className="text-gray-400" />}
                        placeholder="Search orders..."
                        className="max-w-md"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
};

export default OrdersContent;
