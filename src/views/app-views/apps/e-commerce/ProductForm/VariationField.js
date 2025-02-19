import React, { useEffect, useState } from 'react';
import { Input, Row, Col, Card, Form, InputNumber, Select, Table, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVariants, getParents } from 'store/slices/VariantCartesianSlice';

const { Option } = Select;

const VariationField = ({ onVariantTable, initialTableData = [], initialSelectedVariants = [] }) => {
	const dispatch = useDispatch();
	const [form] = Form.useForm();
	const [selectedVariants, setSelectedVariants] = useState(initialSelectedVariants || []);
	const [variantValues, setVariantValues] = useState({});
	const [tableData, setTableData] = useState([]);
	const [variantColumns, setVariantColumns] = useState({});

	useEffect(() => {
		dispatch(fetchVariants());
	}, [dispatch]);

	const { variants, loading } = useSelector((state) => state.variants);

	useEffect(() => {
		// console.log("Received tableData in VariationField:", initialTableData);
		// console.log("Received selectedVariants in VariationField:", initialSelectedVariants);

		if (initialTableData.length > 0) {
			setTableData(initialTableData);
		}

		if (initialSelectedVariants.length > 0) {
			setSelectedVariants(initialSelectedVariants);
			// console.log("Selected selectedVariants", selectedVariants);
		}
	}, [initialTableData, initialSelectedVariants]);

	useEffect(() => {
		if (initialTableData.length > 0) {
			const variantValues = {};
			selectedVariants.forEach((variant) => {
				const uniqueValues = [...new Set(initialTableData.map((row) => row[variant]))];
				variantValues[variant] = uniqueValues;
			});
			setVariantValues(variantValues);
			form.setFieldsValue(variantValues);
			form.setFieldsValue({ variantName: initialSelectedVariants })
		}
	}, [initialTableData, selectedVariants, form]);

	useEffect(() => {
		const updatedColumns = {};
		variants.forEach((v) => {
			if (selectedVariants.includes(v.parent) && v.status === true) {
				if (!updatedColumns[v.parent]) {
					updatedColumns[v.parent] = [];
				}
				updatedColumns[v.parent].push(v.name);
			}
		});
		setVariantColumns(updatedColumns);
	}, [variants, selectedVariants]);


	const handleVariantChange = (selected) => {
		if (JSON.stringify(selected) !== JSON.stringify(selectedVariants)) {
			const updatedVariantValues = Object.fromEntries(
				Object.entries(variantValues).filter(([key]) => selected.includes(key))
			);
			setSelectedVariants([...selected]);
			setVariantValues(updatedVariantValues);
			if (Object.keys(updatedVariantValues).length > 0) {
				generateTableData(updatedVariantValues);
			} else {
				setTableData([]);
			}
		}
	};

	const handleVariantValueChange = (variant, values) => {
		setVariantValues((prevValues) => {
			const updatedValues = { ...prevValues, [variant]: values };
			generateTableData(updatedValues);
			return updatedValues;
		});
	};

	const generateTableData = (values = variantValues) => {
		// console.log("values: ", values);

		const selectedVariantValues = Object.entries(values).map(([variant, values]) => ({
			variant,
			values,
		}));

		const combinations = selectedVariantValues.reduce((acc, { variant, values }) => {
			if (!acc.length) {
				return values.map((value) => ({ [variant]: value }));
			}
			return acc.flatMap((combination) =>
				values.map((value) => ({ ...combination, [variant]: value }))
			);
		}, []);

		const newTableData = combinations.map((combination, index) => {
			const existingRow = tableData.find((row) => {
				return Object.keys(combination).every(
					(key) => row[key] === combination[key]
				);
			});

			return {
				key: index + 1,
				...combination,
				price: existingRow ? existingRow.price : 0, // Ensure this is correct
				stock: existingRow ? existingRow.stock : 0, // Ensure this is correct
			};
		});

		console.log("newTableData: ", newTableData);

		setTableData(newTableData);
		onVariantTable(newTableData);
	};


	// In VariationField component
	const handleTableChange = (key, field, value) => {
		setTableData((prevData) => {
			const updatedData = prevData.map((row) =>
				row.key === key ? { ...row, [field]: Number(value) || 0 } : row // Ensure value is a number
			);
			console.log("Updated Table Data: ", updatedData);
			onVariantTable(updatedData); // Pass updated data to parent
			return updatedData;
		});
	};

	const columns = [
		...selectedVariants.map((variant) => ({
			title: variant,
			dataIndex: variant,
			key: variant,
			render: (text) => <span>{text}</span>,
		})),
		{
			title: 'Price',
			dataIndex: 'price',
			key: 'price',
			render: (text, record) => (
				<InputNumber
					min={0}
					value={text}
					onChange={(value) => handleTableChange(record.key, 'price', value)}
				/>
			),
		},
		{
			title: 'Stock',
			dataIndex: 'stock',
			key: 'stock',
			render: (text, record) => (
				<InputNumber
					min={0}
					value={text}
					onChange={(value) => handleTableChange(record.key, 'stock', value)}
				/>
			),
		},
	];

	const showdata = () => {
		console.log('show data')
		console.log(tableData);
	}

	return (
		<Card title="Product Variants">
			{/* <Button onClick={showdata}>Check</Button> */}

			<p>Select variants (e.g., Size, Color), then choose their values to add rows.</p>
			<Form form={form} name="variant_form">
				<Row gutter={[16, 16]} align="middle">
					<Col xs={24} md={12}>
						<Form.Item label="Variants" name="variantName" rules={[{ required: true, message: 'Select variant name' }]}>
							<Select
								mode="multiple"
								placeholder="Select Variants"
								value={selectedVariants}
								onChange={handleVariantChange}
								disabled={loading}
							>
								{loading ? (
									<Option value="">Loading...</Option>
								) : (
									variants?.filter(p => p.isParent === 1 && p.status === true).map((parent, index) => ( // Only show isParent items
										<Option key={index} value={parent.name}>{parent.name}</Option>
									))
								)}
							</Select>
						</Form.Item>
					</Col>
				</Row>

				<Row className='mt-4' gutter={[16, 16]}>
					{selectedVariants.map((variant) => (
						<Col key={variant} xs={24} md={12}>
							<Form.Item className='pb-2' label={variant} name={variant}>
								<Select
									className='mb-3'
									mode="multiple"
									placeholder={`Select ${variant} options`}
									onChange={(values) => handleVariantValueChange(variant, values)}
								>
									{variantColumns[variant]?.map((option, idx) => (
										<Option key={idx} value={option}>{option}</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					))}
				</Row>
			</Form>

			{selectedVariants.length > 0 &&
				<Table
					columns={columns}
					dataSource={tableData}
					pagination={false}
					rowKey="key"
					style={{ marginTop: '50px' }}
				/>
			}
		</Card>
	);
};

export default VariationField;
