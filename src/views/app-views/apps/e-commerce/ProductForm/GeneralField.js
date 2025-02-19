import React from 'react'
import { Input, Row, Col, Card, Form, Upload, InputNumber, message, Select, Button } from 'antd';
import { ImageSvg } from 'assets/svg/icon';
import CustomIcon from 'components/util-components/CustomIcon'
import { LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Option } = Select;

const rules = {
	name: [{ required: true, message: 'Please enter product name' }],
	description: [{ required: true, message: 'Please enter product description' }],
	price: [{ required: true, message: 'Please enter product price' }],
	code: [],
	taxRate: [{ required: true, message: 'Please enter tax rate' }],
	cost: [{ required: true, message: 'Please enter item cost' }]
};

const imageUploadProps = {
	name: 'file',
	multiple: true,
	listType: "picture-card",
	showUploadList: false,
};

const thumbnailUploadProps = {
	name: 'file',
	multiple: false,
	showUploadList: false,
};

const beforeUpload = file => {
	const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
	if (!isJpgOrPng) {
		message.error('You can only upload JPG/PNG file!');
	}
	const isLt2M = file.size / 1024 / 1024 < 2;
	if (!isLt2M) {
		message.error('Image must be smaller than 2MB!');
	}
	return isJpgOrPng && isLt2M;
};

const categories = ['Cloths', 'Bags', 'Shoes', 'Watches', 'Devices'];
const tags = ['Cotton', 'Nike', 'Sales', 'Sports', 'Outdoor', 'Toys', 'Hobbies'];

const GeneralField = props => {
	// Function to remove an image from uploadedImg array
	const onRemoveImage = (index) => {
		const updatedImages = [...props.uploadedImg];
		updatedImages.splice(index, 1);
		props.setImage(updatedImages)
	};

	return (
		<>
			<Row gutter={16}>
				<Col xs={24} sm={24} md={17}>
					<Card title="Basic Info">
						<Form.Item name="title" label="Product name" rules={rules.title}>
							<Input placeholder="Product Name" />
						</Form.Item>
						<Form.Item name="description" label="Description" rules={rules.description}>
							<Input.TextArea rows={4} />
						</Form.Item>
					</Card>

					<Card title="Pricing">
						<Row gutter={16}>
							<Col xs={24} sm={24} md={12}>
								<Form.Item name="price" label="Price" rules={rules.price}>
									<InputNumber
										className="w-100"
										formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
										parser={value => value.replace(/\$\s?|(,*)/g, '')}
									/>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item name="code" label="Product Code" rules={rules.code}>
									<Input />
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item name="cost" label="Cost per item" rules={rules.cost}>
									<InputNumber
										className="w-100"
										formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
										parser={value => value.replace(/\$\s?|(,*)/g, '')}
									/>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item name="taxRate" label="Tax rate" rules={rules.taxRate}>
									<InputNumber
										className="w-100"
										min={0}
										max={100}
										formatter={value => `${value}%`}
										parser={value => value.replace('%', '')}
									/>
								</Form.Item>
							</Col>
						</Row>
					</Card>

					<Card title="Uploaded Images">
						<div className="uploaded-images" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
							{props.uploadedImg && props.uploadedImg.map((image, index) => (
								<div key={index} style={{ position: "relative", display: "inline-block" }}>
									<img
										src={image}
										alt={`uploaded-${index}`}
										style={{
											width: "200px",
											height: "200px",
											objectFit: "cover",
											borderRadius: "8px"
										}}
									/>
									<Button
										type="text"
										icon={<CloseCircleOutlined style={{ fontSize: "20px", color: "red" }} />}
										onClick={() => onRemoveImage(index)}
										style={{
											position: "absolute",
											top: "-5px",
											right: "-5px",
											background: "white",
											borderRadius: "50%"
										}}
									/>
								</div>
							))}
						</div>
					</Card>
				</Col>

				<Col xs={24} sm={24} md={7}>
					<Card title="Thumbnail">
						<Dragger {...thumbnailUploadProps} beforeUpload={beforeUpload} onChange={e => props.handleThumbnailUploadChange(e)}>
							{props.thumbnail ? (
								<img src={props.thumbnail} alt="thumbnail" className="img-fluid" />
							) : (
								<div>
									{props.uploadLoading ? (
										<div>
											<LoadingOutlined className="font-size-xxl text-primary" />
											<div className="mt-3">Uploading</div>
										</div>
									) : (
										<div>
											<CustomIcon className="display-3" svg={ImageSvg} />
											<p>Click or drag file to upload</p>
										</div>
									)}
								</div>
							)}
						</Dragger>
					</Card>

					<Card title="Media">
						<Dragger {...imageUploadProps} beforeUpload={beforeUpload} onChange={e => props.handleUploadChange(e)}>
							{props.uploadedImg.length > 0 ? (
								<span style={{ fontWeight: 'bold' }}>Total {props.uploadedImg.length} Media Images<br />Scroll Down To Show Images</span>
							) : (
								<div>
									<span style={{ fontWeight: 'bold' }}>Click and Drag and Drop Images</span>
								</div>
							)}
						</Dragger>
					</Card>

					<Card title="Organization">
						<Form.Item name="category" label="Category">
							<Select className="w-100" placeholder="Category">
								{categories.map(elm => (
									<Option key={elm} value={elm}>{elm}</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item name="tags" label="Tags">
							<Select mode="tags" style={{ width: '100%' }} placeholder="Tags">
								{tags.map(elm => <Option key={elm}>{elm}</Option>)}
							</Select>
						</Form.Item>
					</Card>
				</Col>
			</Row>
		</>
	);
};

export default GeneralField;
