import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Truck, CheckCircle } from "lucide-react";
import { Tag, Steps } from "antd";

const OrderDetailContent = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data
    const order = {
        id: id,
        date: "2024-11-20",
        status: "Processing",
        customer: {
            name: "John Doe",
            email: "john@example.com",
            phone: "+1 234 567 890",
            address: "123 Tech Street, Silicon Valley, CA 94025"
        },
        items: [
            { id: 1, name: "MacBook Pro 14\"", price: 1999.00, quantity: 1, image: "https://placehold.co/100x100" },
            { id: 2, name: "Magic Mouse", price: 79.00, quantity: 1, image: "https://placehold.co/100x100" }
        ],
        subtotal: 2078.00,
        shipping: 20.00,
        total: 2098.00
    };

    return (
        <div className="p-6">
            <button
                onClick={() => navigate("/orders")}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back to Orders</span>
            </button>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    {/* Order Header */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
                                <p className="text-gray-500">Placed on {order.date}</p>
                            </div>
                            <Tag color="blue" className="text-sm px-3 py-1">{order.status}</Tag>
                        </div>

                        <Steps
                            current={1}
                            items={[
                                { title: 'Order Placed', icon: <Package size={20} /> },
                                { title: 'Processing', icon: <CheckCircle size={20} /> },
                                { title: 'Shipped', icon: <Truck size={20} /> },
                                { title: 'Delivered', icon: <CheckCircle size={20} /> },
                            ]}
                        />
                    </div>

                    {/* Order Items */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">${item.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>${order.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2">
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Customer</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{order.customer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{order.customer.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{order.customer.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                        <p className="text-gray-600 leading-relaxed">{order.customer.address}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailContent;
