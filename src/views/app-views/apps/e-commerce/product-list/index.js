import React, { useEffect, useState } from 'react'
import { Card, Table, Select, Input, Button, Badge, Menu } from 'antd';
import list from "assets/data/product-list.data.json"
import { EyeOutlined, DeleteOutlined, SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';
import Flex from 'components/shared-components/Flex'
import NumberFormat from 'react-number-format';
import { useNavigate } from "react-router-dom";
import utils from 'utils'
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct, getProducts } from 'store/slices/ProductSlice';

const { Option } = Select

const getStockStatus = stockCount => {
	if (stockCount >= 10) {
		return <><Badge status="success" /><span>In Stock</span></>
	}
	if (stockCount < 10 && stockCount > 0) {
		return <><Badge status="warning" /><span>Limited Stock</span></>
	}
	if (stockCount === 0) {
		return <><Badge status="error" /><span>Out of Stock</span></>
	}
	return null
}

const categories = ['Cloths', 'Bags', 'Shoes', 'Watches', 'Devices']

const ProductList = () => {
	const navigate = useNavigate();
	const [list, setList] = useState([]);
	const [filteredList, setFilteredList] = useState([]);
	const [selectedRows, setSelectedRows] = useState([])
	const [selectedRowKeys, setSelectedRowKeys] = useState([])
	const [searchData, setSearchData] = useState()
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(getProducts());
	}, [dispatch]); // ✅ Dependency array should not include 'list'

	const data = useSelector((state) => state.ecommerce.data)

	useEffect(() => {
		if (Array.isArray(data)) {
			const formattedData = data.map(({ _id, title, category, price, thumbnail, variations }, index) => {
				// Calculate the total stock for all variants
				const totalStock = variations[0].variants.reduce((total, variant) => total + (variant.stock || 0), 0);

				console.log("total: ", totalStock)
				return {
					id: index + 1,
					_id: _id,
					name: title,
					category: category ? category.name : "Uncategorized",
					price,
					stock: totalStock,  // Use the calculated total stock
					image: thumbnail || "/default-image.jpg"
				};
			});
			setList(formattedData);
			setFilteredList(formattedData); // Initialize filteredList with the full list
		}
	}, [data]);


	const dropdownMenu = row => (
		<Menu>
			<Menu.Item onClick={() => viewDetails(row)}>
				<Flex alignItems="center">
					<EyeOutlined />
					<span className="ml-2">View Details</span>
				</Flex>
			</Menu.Item>
			<Menu.Item onClick={() => deleteRow(row)}>
				<Flex alignItems="center">
					<DeleteOutlined />
					<span className="ml-2">{selectedRows.length > 0 ? `Delete (${selectedRows.length})` : 'Delete'}</span>
				</Flex>
			</Menu.Item>
		</Menu>
	);

	const addProduct = () => {
		navigate(`/app/apps/ecommerce/add-product`)
	}

	const viewDetails = row => {
		navigate(`/app/apps/ecommerce/edit-product/${row._id}`)
	}

	const deleteRow = row => {
		const objKey = 'id'
		let data = list
		if (selectedRows.length > 1) {
			selectedRows.forEach(elm => {
				data = utils.deleteArrayRow(data, objKey, elm.id)
				setList(data)
				setSelectedRows([])
			})
		} else {
			data = utils.deleteArrayRow(data, objKey, row._id);
			dispatch(deleteProduct(row._id))
			setList(data)
		}
	}

	const tableColumns = [
		{
			title: 'ID',
			dataIndex: 'id'
		},
		{
			title: 'Product',
			dataIndex: 'name',
			render: (_, record) => (
				<div className="d-flex">
					<AvatarStatus size={60} type="square" src={record.image} name={record.name} />
				</div>
			),
			sorter: (a, b) => utils.antdTableSorter(a, b, 'name')
		},
		{
			title: 'Category',
			dataIndex: 'category',
			sorter: (a, b) => utils.antdTableSorter(a, b, 'category')
		},
		{
			title: 'Price',
			dataIndex: 'price',
			render: price => (
				<div>
					<NumberFormat
						displayType={'text'}
						value={(Math.round(price * 100) / 100)}
						prefix={''}
						thousandSeparator={true}
					/>
				</div>
			),
			sorter: (a, b) => utils.antdTableSorter(a, b, 'price')
		},
		{
			title: 'Stock',
			dataIndex: 'stock',
			sorter: (a, b) => utils.antdTableSorter(a, b, 'stock')
		},
		{
			title: 'Status',
			dataIndex: 'stock',
			render: stock => (
				<Flex alignItems="center">{getStockStatus(stock)}</Flex>
			),
			sorter: (a, b) => utils.antdTableSorter(a, b, 'stock')
		},
		{
			title: '',
			dataIndex: 'actions',
			render: (_, elm) => (
				<div className="text-right">
					<EllipsisDropdown menu={dropdownMenu(elm)} />
				</div>
			)
		}
	];

	const rowSelection = {
		onChange: (key, rows) => {
			setSelectedRows(rows)
			setSelectedRowKeys(key)
		}
	};

	const onSearch = (e) => {
		const query = e.target.value.toLowerCase();
		setSearchData(query);
	};

	useEffect(() => {
		if (!searchData) {
			setFilteredList(list); // Reset filtered list if search is empty
		} else {
			const filterData = list.filter((data) =>
				data?.name?.toLowerCase().includes(searchData) // Use 'name' instead of 'title'
			);
			setFilteredList(filterData);
		}
	}, [searchData, list]);

	const handleShowCategory = (value) => {
		if (value === 'All') {
			setFilteredList(list); // Reset to full list
		} else {
			setFilteredList(list.filter(item => item.category === value)); // Filter without modifying original list
		}
	};



	return (
		<Card>
			<Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
				<Flex className="mb-1" mobileFlex={false}>
					<div className="mr-md-3 mb-3">
						<Input placeholder="Search" prefix={<SearchOutlined />} onChange={e => onSearch(e)} />
					</div>
					<div className="mb-3">
						<Select
							defaultValue="All"
							className="w-100"
							style={{ minWidth: 180 }}
							onChange={handleShowCategory}
							placeholder="Category"
						>
							<Option value="All">All</Option>
							{
								categories.map(elm => (
									<Option key={elm} value={elm}>{elm}</Option>
								))
							}
						</Select>
					</div>
				</Flex>
				<div>
					<Button onClick={addProduct} type="primary" icon={<PlusCircleOutlined />} block>Add product</Button>
				</div>
			</Flex>
			<div className="table-responsive">
				<Table
					columns={tableColumns}
					dataSource={filteredList}
					rowKey='id'
					rowSelection={{
						selectedRowKeys: selectedRowKeys,
						type: 'checkbox',
						preserveSelectedRowKeys: false,
						...rowSelection,
					}}
				/>
			</div>
		</Card>
	)
}

export default ProductList
