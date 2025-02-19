import { Card, Select, Table } from 'antd';
import Search from 'antd/es/input/Search';
import Flex from 'components/shared-components/Flex';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProducts } from 'store/slices/ProductSlice';

const { Option } = Select;

const Variants = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = ['Cloths', 'Bags', 'Shoes', 'Watches', 'Devices'];

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [list, setList] = useState([]);
  const [tableLabels, setTableLabels] = useState([]);
  const [searchData, setSearchData] = useState({});
  const [filterData, setFilterData] = useState([])

  const data = useSelector((state) => state.ecommerce.data || []);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    let filteredData = [...data];
    if (selectedCategory) {
      filteredData = filteredData.filter(item => item.category?.name === selectedCategory);
    }
    if (selectedProduct) {
      filteredData = filteredData.filter(item => item._id === selectedProduct);
    }

    const excludeVariants = !selectedProduct;
    let uniqueLabels = new Set();
    let formattedList = formatTableData(filteredData, excludeVariants, uniqueLabels);

    setList(formattedList);
    setTableLabels(Array.from(uniqueLabels));
  }, [selectedCategory, selectedProduct, data]);

  const formatTableData = (products, excludeVariants, uniqueLabels) => {
    let idCounter = 1;
    return products.flatMap((product) => {
      if (excludeVariants || !Array.isArray(product.variations) || product.variations.length === 0) {
        const totalStock = product.variations?.[0]?.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;

        const colors = product.variations?.[0]?.variants?.flatMap(variant =>
          variant.data.filter(item => item.label === "color").map(item => item.value)
        ) || [];
        const totalColors = new Set(colors).size;

        const sizes = product.variations?.[0]?.variants?.flatMap(variant =>
          variant.data.filter(item => item.label === "size").map(item => item.value)
        ) || [];
        sizes.sort((a, b) => a - b);
        const sizeRange = sizes.length > 0 ? `${sizes[0]}-${sizes[sizes.length - 1]}` : "";

        return [{
          id: idCounter++,
          _id: product._id,
          name: product.title,
          category: product.category?.name || "Uncategorized",
          code: product.code || '--',
          cost: product.cost,
          price: product.price,
          stock: totalStock,
          size: sizeRange,
          color: totalColors,
          shippingFees: product.shipping?.shippingFees || 0,
        }];
      }

      return product.variations[0].variants.map((variant) => {
        let variantData = {};
        variant.data.forEach((item) => {
          uniqueLabels.add(item.label);
          variantData[item.label] = item.value;
        });

        return {
          id: idCounter++,
          _id: product._id,
          name: product.title,
          category: product.category?.name || "Uncategorized",
          varCode: product.code || '--',
          cost: product.cost,
          price: variant.price || 0,
          stock: variant.stock || 0,
          // size: variantData.size || "",
          // color: variantData.color || "",
          ...variantData,
          shippingFees: product.shipping?.shippingFees || 0,
        };
      });
    });
  };

  const tableColumns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Category', dataIndex: 'category' },
    {
      title: selectedProduct ? 'Variant Code' : 'Product Code',
      dataIndex: selectedProduct ? 'varCode' : 'code',
      render: (text) => text || '--',
    },
    { title: 'Purchase Price', dataIndex: 'cost' },
    { title: 'Sell Price', dataIndex: 'price' },
    { title: 'Stock', dataIndex: 'stock' },
    ...(!selectedProduct
      ? [
        { title: 'Size', dataIndex: 'size' },
        {
          title: 'Color',
          dataIndex: 'color',
          render: (text) => `${text} colors`,
        },
      ]
      : []),
    ...tableLabels.map((label) => ({
      title: label.charAt(0).toUpperCase() + label.slice(1),
      dataIndex: label,
      render: (text) => text || '--',
    })),
    { title: 'Shipping Fees', dataIndex: 'shippingFees' },
  ];

  const handleSearch = (e) => {
    setSearchData((prevData) => ({
      ...prevData, query: e.target.value
    }))
  }


  useEffect(() => {
    if (!searchData.query) {
      setFilterData(list);
      return;
    }

    const query = searchData.query.toLowerCase();

    const filteredData = list.filter((item) => {
      return (
        String(item.id || '').includes(query) ||
        String(item.name || '').toLowerCase().includes(query) ||
        String(item.category || '').toLowerCase().includes(query) ||
        String(item.code || '').includes(query) ||
        String(item.varCode || '').includes(query) ||
        String(item.cost || '').includes(query) ||
        String(item.price || '').includes(query) ||
        String(item.stock || '').includes(query) ||
        String(item.size || '').includes(query) ||
        String(item.color || '').includes(query) ||
        String(item.shippingFees || '').includes(query)
      );
    });

    setFilterData(filteredData);
  }, [searchData.query, list, selectedProduct]);


  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
        <Flex className="mb-1" mobileFlex={true}>
          <div className='mb-3 mx-1'>
            <Search style={{ width: '280px' }} placeholder='Search any data from table...' onChange={handleSearch} />
          </div>
          <div className="mb-3 mx-1">
            <Select
              value={selectedCategory}
              className="w-100"
              style={{ minWidth: 180 }}
              onChange={setSelectedCategory}
              placeholder="Select Product Category"
              allowClear
            >
              {categories.map((category) => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </div>
          <div className="mb-3 mx-1">
            <Select
              value={selectedProduct}
              className="w-100"
              style={{ minWidth: 180 }}
              onChange={setSelectedProduct}
              placeholder="Select Product Variants"
              allowClear
              disabled={!selectedCategory}
            >
              {data.filter(item => !selectedCategory || item.category?.name === selectedCategory)
                .map((product) => (
                  <Option key={product._id} value={product._id}>{product.title}</Option>
                ))}
            </Select>
          </div>
        </Flex>
      </Flex>
      <div className="table-responsive">
        <Table columns={tableColumns} dataSource={filterData} rowKey="id" />
      </div>
    </Card>
  );
};

export default Variants;
