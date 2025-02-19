import React, { useState, useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import { Tabs, Form, Button, message } from 'antd';
import Flex from 'components/shared-components/Flex'
import GeneralField from './GeneralField'
import VariationField from './VariationField'
import ShippingField from './ShippingField'
import ProductListData from "assets/data/product-list.data.json"
import { addProduct, getProducts, updateProduct, uploadImages } from 'store/slices/ProductSlice';
import { useDispatch, useSelector } from 'react-redux';

const getBase64 = (img, callback) => {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

const ADD = 'ADD'
const EDIT = 'EDIT'

const ProductForm = props => {

	const { mode = ADD, param } = props


	const dispatch = useDispatch()

	const [form] = Form.useForm();
	const [thumbnail, setThumbnail] = useState(null)
	const [uploadedImg, setImage] = useState([])
	const [uploadLoading, setUploadLoading] = useState(false)
	const [submitLoading, setSubmitLoading] = useState(false)
	const [variantTable, setVariantTable] = useState([])
	const [tableData, setTableData] = useState([]);
	const [selectedVariants, setSelectedVariants] = useState([]);

	useEffect(() => {
		console.log("variantTable updated in ProductForm:", variantTable);
	}, [variantTable]);


	useEffect(() => {
		dispatch(getProducts())
	}, [dispatch])

	const data = useSelector((state) => state.ecommerce.data);

	useEffect(() => {
		if (mode === EDIT) {
			console.log('is edit');

			const { id } = param; // Get the id from params
			const product = data.find((item) => item._id === id); // Match _id as a string
			console.log(product);

			const extractValueAndUnit = (str, defaultUnit) => {
				if (!str) return { value: 0, unit: defaultUnit };
				const match = str.match(/^([\d.]+)\s*(\w+)$/); // Extract number & unit
				return match ? { value: parseFloat(match[1]), unit: match[2] } : { value: parseFloat(str), unit: defaultUnit };
			};

			// Extract width, height, weight
			const widthData = extractValueAndUnit(product.shipping?.width, "cm");
			const heightData = extractValueAndUnit(product.shipping?.height, "cm");
			const weightData = extractValueAndUnit(product.shipping?.weight, "kg");

			if (product) {  // Check if product exists	
				const { tableData, selectedVariants } = transformVariationsForTable(product.variations);
				console.log('table data: ', tableData);
				console.log('select varints: ', selectedVariants);

				setTableData(tableData);
				setSelectedVariants(selectedVariants);


				form.setFieldsValue({
					comparePrice: product.comparePrice,
					cost: product.cost,
					code: product.code.toString(),
					taxRate: product.taxRate,
					description: product.description,
					category: product.category ? product.category.name : "null",
					title: product.title,
					price: product.price,
					tags: product.tags?.[0]?.tags || [],
					variants: selectedVariants,
					width: widthData.value,
					widthUnit: widthData.unit,
					height: heightData.value,
					heightUnit: heightData.unit,
					weight: weightData.value,
					weightUnit: weightData.unit,
					shippingFees: product.shipping?.shippingFees || 0,
				});
				setThumbnail(product.thumbnail || "/default-image.jpg"); // Handle missing images
				setImage(product.images);
				onVariantTable(tableData)
			} else {
				console.error("Product not found for ID:", id);
			}
		}
	}, [form, mode, param, data]);

	const onVariantTable = (newData) => {
		// console.log('Received new variant data:', newData);
		setVariantTable(newData);
	}

	const transformVariationsForTable = (variations) => {
		console.log("calling transformVariationsForTable")
		// console.log('Transformting variants', variations[0].variants);
		if (!variations || variations.length === 0) return { tableData: [], selectedVariants: [] };

		// Extract unique variant labels (e.g., ["size", "color", "material"])
		const selectedVariants = [...new Set(variations[0].variants.flatMap(v => v.data.map(d => d.label)))];
		
		// Transform variants into tableData format
		const tableData = variations[0].variants.map((variant, index) => {
			const row = { key: index + 1 };
			variant.data.forEach(({ label, value }) => {
				row[label] = value;
			});
			row.price = variant.price;
			row.stock = variant.stock;
			return row;
		});
		
		return { tableData, selectedVariants };
	};


	const handleUploadChange = info => {
		if (info.file.status === 'done' || info.file.status === 'uploading') {
			const file = info.file.originFileObj;
			if (file) {
				getBase64(file, base64 => {
					console.log("Image (Base64):", base64);
					setImage(prevFiles => {
						const newFiles = [...prevFiles, base64];
						return Array.from(new Set(newFiles)); // Remove duplicates
					});
				});
			}
		}
	};

	const handleThumbnailUploadChange = info => {
		if (info.file.status === 'done' || info.file.status === 'uploading') {
			const file = info.file.originFileObj;
			if (file) {
				getBase64(file, base64 => {
					console.log("Thumbnail (Base64):", base64);
					setThumbnail(base64);
				});
			}
		}
	};


	const onFinish = async () => {
		try {
		  setSubmitLoading(true);
		  const values = await form.validateFields();
		  
		  // Create the product data using the current variantTable state
		  const productData = {
			...values,
			_id: param ? param.id : undefined,
			images: uploadedImg.length > 0 ? [...new Set(uploadedImg)] : [],
			thumbnail: thumbnail || '',
			variations: variantTable // Use the current state directly
		  };
	  
		  console.log("Submitting product data:", productData); // Debug log
	  
		  // Dispatch action based on mode
		  if (mode === ADD) {
			await dispatch(addProduct(productData));
			message.success(`Created ${values.name} in product list`);
		  } else if (mode === EDIT) {
			await dispatch(updateProduct(productData));
			message.success(`Product saved`);
		  }
		} catch (error) {
		  console.error('Form submission error:', error);
		  message.error('Please enter all required fields');
		} finally {
		  setSubmitLoading(false);
		}
	  };





	return (
		<>
			<Form
				layout="vertical"
				form={form}
				name="advanced_search"
				className="ant-advanced-search-form"
				initialValues={{
					heightUnit: 'cm',
					widthUnit: 'cm',
					weightUnit: 'kg'
				}}
			>
				<PageHeaderAlt className="border-bottom" overlap>
					<div className="container">
						<Flex className="py-2" mobileFlex={false} justifyContent="space-between" alignItems="center">
							<h2 className="mb-3">{mode === 'ADD' ? 'Add New Product' : `Edit Product`} </h2>
							<div className="mb-3">
								<Button className="mr-2">Discard</Button>
								<Button type="primary" onClick={onFinish} htmlType="submit" loading={submitLoading} >
									{mode === 'ADD' ? 'Add' : `Save`}
								</Button>
							</div>
						</Flex>
					</div>
				</PageHeaderAlt>
				<div className="container">
					<Tabs
						defaultActiveKey="1"
						style={{ marginTop: 30 }}
						items={[
							{
								label: 'General',
								key: '1',
								children: <GeneralField
									uploadedImg={uploadedImg}
									uploadLoading={uploadLoading}
									handleUploadChange={handleUploadChange}
									handleThumbnailUploadChange={handleThumbnailUploadChange} // Pass new function
									thumbnail={thumbnail} // Pass thumbnail state
									setImage={setImage}
								/>
								,
							},
							{
								label: 'Variation',
								key: '2',
								children: <VariationField
									onVariantTable={onVariantTable}
									initialTableData={tableData} // Pass initial tableData
									initialSelectedVariants={selectedVariants} // Pass initial selectedVariants
								/>,
							},
							{
								label: 'Shipping',
								key: '3',
								children: <ShippingField />,
							},
						]}
					/>
				</div>
			</Form>
		</>
	)
}

export default ProductForm
