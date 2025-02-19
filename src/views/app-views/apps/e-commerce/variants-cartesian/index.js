import { Button, Card, Col, Form, Input, Row, Select, Space, Switch, Table, message } from "antd";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addVariants, fetchVariants, updateVariants, deleteVariant } from "store/slices/VariantCartesianSlice";
import Search from "antd/es/input/Search";

const { Option } = Select;

const Cartesian = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { variants, loading } = useSelector((state) => state.variants);
    const [parentVariant, setParentVariant] = useState(null);
    const [editingKey, setEditingKey] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchData, setSearchData] = useState({});
    const [normalizedVariants, setNormalizedVariants] = useState([]);

    useEffect(() => {
        dispatch(fetchVariants());
    }, [dispatch]);

    const handleParentChange = (value) => {
        setParentVariant(value);
        form.resetFields(["name", "colorCode"]);
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    const onFinish = async (values) => {
        const name = values.name?.trim()?.toLowerCase();

        const newEntry = {
            name: values.name || values.colorCode,
            parent: values.parent || "N/A",
            status: true,
            isParent: values.parent === "N/A" ? 1 : 0,  // Ensure isParent is set properly
        };

        try {
            const result = await dispatch(addVariants(newEntry));
            if (addVariants.fulfilled.match(result)) {
                message.success("Variant added successfully!");
                dispatch(fetchVariants());
            } else {
                message.error("Failed to add variant!");
            }
        } catch (error) {
            message.error("An error occurred!");
        }

        form.resetFields();
        setEditingKey(null);
    };

    const handleEdit = (record) => {
        setEditingKey(record._id);
        setParentVariant(record.parent);
        form.setFieldsValue({
            parent: record.parent,
            name: record.name,
            colorCode: record.parent === 'color' ? record.name : undefined,
        });
    };

    const toggleStatus = async (id) => {
        const variant = variants.find(v => v._id === id);
        if (!variant) return message.error("Variant not found!");

        const updatedStatus = !variant.status;

        try {
            const result = await dispatch(updateVariants({
                id: id,
                data: { ...variant, status: updatedStatus }
            }));

            if (updateVariants.fulfilled.match(result)) {
                message.success("Status updated successfully!");
                dispatch(fetchVariants());
            } else {
                message.error("Failed to update status!");
            }
        } catch (error) {
            message.error("An error occurred while updating status!");
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await dispatch(deleteVariant(id));
            if (deleteVariant.fulfilled.match(result)) {
                message.success("Variant deleted successfully!");
                dispatch(fetchVariants());
            } else {
                message.error("Failed to delete variant!");
            }
        } catch (error) {
            message.error("An error occurred while deleting!");
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.trim();
        setSearchData((prevData) => ({
            ...prevData,
            query: query
        }));
    };

    // Filter variants when searchData or variants change
    useEffect(() => {
        const filteredVariants = variants.filter((variant) => {
            const query = searchData.query?.toLowerCase() || "";
            return (
                variant.name.toLowerCase().includes(query) ||
                variant.parent.toLowerCase().includes(query) ||
                (variant.status && `active`.includes(query)) ||
                (!variant.status && `inactive`.includes(query)) ||
                (variant.updateAt && new Date(variant.updateAt).toLocaleString().toLowerCase().includes(query))
            );
        });
        setNormalizedVariants(filteredVariants);
    }, [searchData, variants]);

    const columns = [
        {
            title: "SRNO",
            dataIndex: "key",
            key: "srno",
            render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "ACTION",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button
                        shape="circle"
                        icon={<FaEdit />}
                        style={{ background: "#1890ff", color: "white" }}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        shape="circle"
                        icon={<MdDeleteForever size={20} />}
                        style={{ background: "#ff4d4f", color: "white" }}
                        onClick={() => handleDelete(record._id)}
                    />
                </Space>
            ),
        },
        {
            title: "NAME",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "PARENT",
            dataIndex: "parent",
            key: "parent",
            render: (text) => <span style={{ color: text === "N/A" ? "gray" : "blue" }}>{text}</span>,
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            render: (status, record) => (
                <Switch
                    checked={Boolean(status)}
                    onChange={() => toggleStatus(record._id)}
                />
            ),
        },
        {
            title: "UPDATED DATE",
            dataIndex: "updateAt",
            key: "updateAt",
            render: (text) => text ? new Date(text).toLocaleString() : "N/A",
        },
    ];

    return (
        <Row gutter={16} style={{ margin: "20px" }}>
            {/* FORM SECTION */}
            <Col xs={24} md={8} style={{
                position: "sticky",
                top: '15%',
                height: "fit-content",
                zIndex: 1000,
                padding: "10px",
                paddingTop: '0px'
            }}>
                <Card title={editingKey ? "Edit Variant" : "Add Variant"} bordered={false}>
                    <Form layout="vertical" form={form} onFinish={onFinish}>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={24}>
                                <Form.Item label="Parent Variant" name="parent">
                                    <Select placeholder="Select..." onChange={handleParentChange}>
                                        {loading ? (
                                            <Option value="">Loading...</Option>
                                        ) : (
                                            variants?.filter(p => p.isParent === 1).map((parent, index) => (
                                                <Option key={index} value={parent.name}>{parent.name}</Option>
                                            ))
                                        )}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12} md={24}>
                                <Form.Item label="Name" name="name">
                                    <Input placeholder={`Enter ${parentVariant ? parentVariant : ''} name`} />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12} md={24}>
                                <Form.Item label="Color Code" name="colorCode">
                                    <Input placeholder="Enter color code" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Button type="primary" htmlType="submit">
                            {editingKey ? "Update" : "Submit"}
                        </Button>
                        <Button
                            style={{ marginLeft: "10px" }}
                            onClick={() => {
                                form.resetFields();
                                setEditingKey(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </Form>
                </Card>
            </Col>

            {/* TABLE SECTION */}
            <Col xs={24} md={16} style={{ marginLeft: "auto" }}>
                <Card title="Variant Listings">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Search placeholder="Search variant use (name, parent, update date, status -- active / inactive)" onChange={handleSearch} className="mt-0" style={{width: '75%'}} />
                        <span style={{fontWeight: 'bold', fontSize: '16px'}}>Total Variants: {normalizedVariants.length}</span>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={normalizedVariants}
                        pagination={{ pageSize: pagination.pageSize, current: pagination.current }}
                        loading={loading}
                        onChange={handleTableChange}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default Cartesian;
