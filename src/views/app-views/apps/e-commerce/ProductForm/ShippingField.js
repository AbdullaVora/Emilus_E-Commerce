import React from 'react';
import { InputNumber, Row, Col, Card, Form, Select } from 'antd';

const { Option } = Select;
const lengthUnit = ['cm', 'mm', 'm'];
const weightUnit = ['kg', 'g', 'mg'];

const ShippingField = () => {
	return (
		<Card title="Shipping">
			<Row gutter={16}>
				<Col xs={24} sm={12}>
					<Form.Item name="width" label="Width" rules={[{ required: true, message: "Please enter width" }]}>
						<InputNumber
							className="w-100"
							min={0}
							addonAfter={
								<Form.Item name="widthUnit" noStyle initialValue="cm">
									<Select style={{ minWidth: 70 }}>
										{lengthUnit.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
									</Select>
								</Form.Item>
							}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item name="height" label="Height" rules={[{ required: true, message: "Please enter height" }]}>
						<InputNumber
							className="w-100"
							min={0}
							addonAfter={
								<Form.Item name="heightUnit" noStyle initialValue="cm">
									<Select style={{ minWidth: 70 }}>
										{lengthUnit.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
									</Select>
								</Form.Item>
							}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item name="weight" label="Weight" rules={[{ required: true, message: "Please enter weight" }]}>
						<InputNumber
							className="w-100"
							min={0}
							addonAfter={
								<Form.Item name="weightUnit" noStyle initialValue="kg">
									<Select style={{ minWidth: 70 }}>
										{weightUnit.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
									</Select>
								</Form.Item>
							}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item name="shippingFees" label="Shipping Fees" rules={[{ required: true, message: "Please enter shipping fees" }]}>
						<InputNumber
							className="w-100"
							min={0}
							formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
							parser={value => value.replace(/\$\s?|(,*)/g, '')}
						/>
					</Form.Item>
				</Col>
			</Row>
		</Card>
	);
};

export default ShippingField;
