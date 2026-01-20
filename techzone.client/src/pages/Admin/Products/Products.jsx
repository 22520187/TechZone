import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "../../../components/Admin/Products/ProductCard";
import { Search, Plus, Upload as UploadIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { message, Spin, Modal, Form, Input, Select, InputNumber, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { fetchAllProduct, addProduct, updateProduct, deleteProduct } from "../../../features/Admin/Products/Product";
import { fetchAllBrand } from "../../../features/Admin/Brands/Brand";
import { fetchAllCategory } from "../../../features/Admin/Categories/Category";
import api from "../../../features/AxiosInstance/AxiosInstance";
import useDebounce from "../../../hooks/useDebounce";

export default function Products() {
  const dispatch = useDispatch();
  const { productItems, status, error } = useSelector((state) => state.product);
  const { brandItems } = useSelector((state) => state.brand);
  const { categoryItems } = useSelector((state) => state.category);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Color state
  const [colors, setColors] = useState([{ color: "", colorCode: "#000000", stockQuantity: 0 }]);

  // Image URLs state
  const [imageUrls, setImageUrls] = useState([]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Function to fetch products data
  const fetchProducts = async () => {
    try {
      setLoading(true);
      await dispatch(fetchAllProduct()).unwrap();
    } catch (err) {
      message.error("Unable to fetch products. Please try again.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch brands data
  const fetchBrands = async () => {
    try {
      await dispatch(fetchAllBrand()).unwrap();
    } catch (err) {
      message.error("Unable to fetch brands. Please try again.");
      console.error("Error fetching brands:", err);
    }
  };

  // Function to fetch categories data
  const fetchCategories = async () => {
    try {
      await dispatch(fetchAllCategory()).unwrap();
    } catch (err) {
      message.error("Unable to fetch categories. Please try again.");
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchProducts(),
        fetchBrands(),
        fetchCategories()
      ]);
    };

    fetchData();
  }, [dispatch]);

  // Map API response data to the format expected by the component
  const products = productItems.map(product => ({
    id: product.productId,
    name: product.name,
    price: product.price,
    // Use the first image from productImages if available
    image: product.productImages && product.productImages.length > 0
      ? product.productImages[0].imageUrl
      : (product.imageUrl || `https://picsum.photos/300/300?random=${product.productId}`),
    rating: (product.rating === 0 && product.reviewCount == 0) ? 5 : product.rating, // Default rating
    reviews: product.reviewCount, // Default reviews
    brand: product.brand?.brandName || "Unknown Brand",
    category: product.category?.categoryName || "Unknown Category",
    description: product.description || "",
    stockQuantity: product.stockQuantity || 0,
    brandId: product.brand?.brandId,
    categoryId: product.category?.categoryId,
  }));

  const filterProductsData = products.filter(row =>
    row.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  // Modal handling functions
  const showAddModal = () => {
    setIsEditMode(false);
    setCurrentProduct(null);
    setIsModalOpen(true);
    setColors([{ color: "", colorCode: "#000000", stockQuantity: 0 }]);
    setImageUrls([]);
    setImagePreviews([]);
    setSelectedFiles([]);
    form.resetFields();
  };

  const showEditModal = (product) => {
    setIsEditMode(true);
    setCurrentProduct(product);
    setIsModalOpen(true);
    setSelectedFiles([]);

    // Find the original product data
    const productData = productItems.find(p => p.productId === product.id);

    // Set form values
    form.setFieldsValue({
      name: product.name,
      price: product.price,
      description: product.description,
      brandId: product.brandId,
      categoryId: product.categoryId,
    });

    // Set colors and images if available
    if (productData && productData.productColors) {
      setColors(productData.productColors.map(color => ({
        color: color.color,
        colorCode: color.colorCode,
        stockQuantity: color.stockQuantity
      })));
    } else {
      setColors([{ color: "", colorCode: "#000000", stockQuantity: 0 }]);
    }

    if (productData && productData.productImages && productData.productImages.length > 0) {
      const urls = productData.productImages.map(img => img.imageUrl);
      setImageUrls(urls);
      setImagePreviews(urls);
    } else {
      setImageUrls([]);
      setImagePreviews([]);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setImagePreviews([]);
    setSelectedFiles([]);
    form.resetFields();
  };

  // Handle color changes
  const addColor = () => {
    setColors([...colors, { color: "", colorCode: "#000000", stockQuantity: 0 }]);
  };

  const removeColor = (index) => {
    const newColors = [...colors];
    newColors.splice(index, 1);
    setColors(newColors);
  };

  const updateColor = (index, field, value) => {
    const newColors = [...colors];
    newColors[index][field] = value;
    setColors(newColors);
  };

  // Handle image URL changes
  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageUrl = (index) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
  };

  const updateImageUrl = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      // Validate colors
      if (colors.length === 0 || colors.some(c => !c.color || c.stockQuantity < 0)) {
        message.error("Please provide valid colors and stock quantities");
        setSubmitting(false);
        return;
      }

      let updatedImageUrls = [];
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        const uploadedUrls = await handleMultipleImageUpload(selectedFiles);
        if (uploadedUrls.length > 0) {
          if (isEditMode) {
            updatedImageUrls = [...imageUrls.filter(url => url !== ""), ...uploadedUrls];
            console.log("Combined images (existing + new):", updatedImageUrls);
          } else {
            updatedImageUrls = uploadedUrls;
            console.log("Using new images:", updatedImageUrls);
          }
        }
        setUploadingImages(false);
      } else {
        updatedImageUrls = [...imageUrls.filter(url => url !== "")];
        console.log("Keeping existing images:", updatedImageUrls);
      }

      const productData = {
        name: values.name,
        description: values.description || "",
        longDescription: values.longDescription || values.description || "",
        price: values.price,
        brandId: values.brandId,
        categoryId: values.categoryId,
        colors: colors,
        imageUrls: updatedImageUrls
      };

      if (isEditMode && currentProduct) {
        // Update existing product
        await dispatch(updateProduct({
          productId: currentProduct.id,
          ...productData
        })).unwrap();
        message.success("Product updated successfully");
      } else {
        // Add new product
        await dispatch(addProduct(productData)).unwrap();
        message.success("Product added successfully");
      }

      setIsModalOpen(false);
      setImagePreviews([]);
      setSelectedFiles([]);
      form.resetFields();
    } catch (err) {
      console.error("Error submitting product:", err);
      const action = isEditMode ? "update" : "add";
      message.error(`Unable to ${action} product. Please try again.`);
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      message.success("Product deleted successfully");

      // Refresh data after successful deletion
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      
      // Hiển thị message chi tiết từ server
      const errorMessage = err?.message || err || "Unable to delete product. Please try again.";
      message.error(errorMessage, 5); // Hiển thị 5 giây để user đọc được
    }
  };

  const handleMultipleImageUpload = async (files) => {
    const uploadedUrls = [];
    const totalFiles = files.length;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);

        console.log(`Uploading file ${i + 1}/${totalFiles}:`, file.name);
        message.loading(`Uploading image ${i + 1}/${totalFiles}...`, 0);

        const response = await api.post('/api/Image/upload/product', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000,
        });

        const imageUrl = response.data.imageUrl;
        console.log("Uploaded image URL:", imageUrl);
        uploadedUrls.push(imageUrl);
        
        message.destroy();
        message.success(`Image ${i + 1}/${totalFiles} uploaded successfully`);
      } catch (error) {
        message.destroy();
        console.error(`Error uploading image ${i + 1}:`, error);
        
        let errorMessage = `Failed to upload image ${i + 1}`;
        if (error.code === 'ECONNABORTED') {
          errorMessage = `Upload timeout for image ${i + 1}. Please try with a smaller image.`;
        } else if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        message.error(errorMessage, 3);
      }
    }
    
    return uploadedUrls;
  };

  const handleRemoveImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    if (index < imageUrls.length) {
      const newUrls = [...imageUrls];
      newUrls.splice(index, 1);
      setImageUrls(newUrls);
    }
    
    const newFilesIndex = index - imageUrls.length;
    if (newFilesIndex >= 0 && newFilesIndex < selectedFiles.length) {
      const newFiles = [...selectedFiles];
      newFiles.splice(newFilesIndex, 1);
      setSelectedFiles(newFiles);
    }
  };

  return (
    <div className='space-y-6'>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>

        <button
          className="flex items-center py-2 px-5 text-white bg-primary rounded-lg font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-100 cursor-pointer"
          onClick={showAddModal}
        >
          <Plus size={16} className="mr-1" />
          <span className="cursor-pointer">Add Product</span>
        </button>
      </div>

      <div className={`relative ${searchQuery.length > 0 ? "w-64" : "w-40"} focus-within:w-64 hover:w-64 hover:duration-300 duration-300`}>
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          className="pl-10 pr-4 py-2 w-full border rounded-full text-sm focus:outline-none focus:border-primary-600"
          placeholder="Search product"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
          }}
        />
      </div>

      {loading || status === "loading" ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Loading products..." />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          Error loading products: {error}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {filterProductsData.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              No products found. Try a different search or add a new product.
            </div>
          ) : (
            filterProductsData.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => showEditModal(product)}
                onDelete={handleDeleteProduct}
              />
            ))
          )}
        </motion.div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        title={isEditMode ? "Edit Product" : "Add New Product"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Product Name"
              rules={[
                {
                  required: true,
                  message: "Please enter the product name",
                },
              ]}
            >
              <Input placeholder="Enter product name" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price"
              rules={[
                {
                  required: true,
                  message: "Please enter the price",
                },
              ]}
            >
              <InputNumber
                min={0}
                step={1000}
                precision={0}
                style={{ width: '100%' }}
                placeholder="Enter price"
                formatter={(value) =>
                  value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                parser={(value) => value.replace(/,/g, "")}
                addonAfter="đ"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="brandId"
              label="Brand"
              rules={[
                {
                  required: true,
                  message: "Please select a brand",
                },
              ]}
            >
              <Select placeholder="Select brand">
                {brandItems.map(brand => (
                  <Select.Option key={brand.brandId} value={brand.brandId}>
                    {brand.brandName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="Category"
              rules={[
                {
                  required: true,
                  message: "Please select a category",
                },
              ]}
            >
              <Select placeholder="Select category">
                {categoryItems.map(category => (
                  <Select.Option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter product description" />
          </Form.Item>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colors and Stock
            </label>
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input
                  placeholder="Color name (e.g., Red)"
                  value={color.color}
                  onChange={(e) => updateColor(index, 'color', e.target.value)}
                  style={{ width: '40%' }}
                />
                <Input
                  type="color"
                  value={color.colorCode}
                  onChange={(e) => updateColor(index, 'colorCode', e.target.value)}
                  style={{ width: '15%' }}
                />
                <InputNumber
                  min={0}
                  placeholder="Stock"
                  value={color.stockQuantity}
                  onChange={(value) => updateColor(index, 'stockQuantity', value)}
                  style={{ width: '25%' }}
                />
                <Button
                  danger
                  onClick={() => removeColor(index)}
                  disabled={colors.length <= 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="dashed" onClick={addColor} block icon={<PlusOutlined />}>
              Add Color
            </Button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (Multiple)
            </label>
            
            {/* Display existing and new images */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-24 h-24 rounded border border-gray-200 overflow-hidden group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/300x300?text=No+Image";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* Upload button */}
              <div
                onClick={() => document.getElementById("productImageUpload").click()}
                className="w-24 h-24 rounded border-2 border-dashed border-gray-300 cursor-pointer flex items-center justify-center hover:bg-gray-50 transition"
              >
                <div className="text-gray-400 text-sm text-center flex flex-col items-center justify-center">
                  <UploadIcon size={20} className="mb-1" />
                  <span>Add</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col text-sm text-gray-500">
              <span className="font-medium">Upload product images</span>
              <span className="text-xs">JPG, JPEG or PNG. Max 5MB per image. You can select multiple files.</span>
            </div>

            <input
              type="file"
              id="productImageUpload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const validFiles = [];
                
                for (const file of files) {
                  if (file.size > 5 * 1024 * 1024) {
                    message.error(`${file.name} exceeds 5MB limit`);
                    continue;
                  }
                  validFiles.push(file);
                }
                
                if (validFiles.length > 0) {
                  setSelectedFiles([...selectedFiles, ...validFiles]);
                  
                  validFiles.forEach(file => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreviews(prev => [...prev, reader.result]);
                    };
                    reader.readAsDataURL(file);
                  });
                }
                
                e.target.value = '';
              }}
            />
          </div>

          <Form.Item className="mb-0 flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark cursor-pointer"
              disabled={submitting}
            >
              {submitting
                ? (isEditMode ? "Updating..." : "Adding...")
                : (isEditMode ? "Update Product" : "Add Product")
              }
            </button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
