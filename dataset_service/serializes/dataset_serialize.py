# -*- coding: utf-8 -*-
"""
@文件: dataset_serialize.py  
@說明: 數據集序列化器
@時間: 2025-08-08
@作者: LiDong
"""

from marshmallow import Schema, fields, validate


class DatasetCreateSchema(Schema):
    """創建數據集請求參數"""
    dataset_nm = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100),
        metadata={"description": "數據集名稱"}
    )
    description = fields.String(
        missing="",
        validate=validate.Length(max=500),
        metadata={"description": "數據集描述"}
    )


class DatasetUpdateSchema(Schema):
    """更新數據集請求參數"""
    dataset_nm = fields.String(
        validate=validate.Length(min=1, max=100),
        metadata={"description": "數據集名稱"}
    )
    description = fields.String(
        validate=validate.Length(max=500),
        metadata={"description": "數據集描述"}
    )
    created_by = fields.String(validate=validate.Length(min=1, max=16))
    status = fields.Integer(validate=validate.Range(0, 3))


class DatasetQuerySchema(Schema):
    """查詢數據集請求參數"""
    keyword = fields.String()
    page = fields.Integer(missing=1, validate=validate.Range(min=1))
    size = fields.Integer(missing=10, validate=validate.Range(min=1, max=100))


class DatasetFilesSchema(Schema):
    """查詢数据集文档url參數"""
    version = fields.String(required=True)
    page = fields.Integer(missing=1, validate=validate.Range(min=1))
    size = fields.Integer(missing=10, validate=validate.Range(min=1, max=100))


class DatasetDetailSchema(DatasetFilesSchema):
    """查詢数据集详情參數"""
    keyword = fields.String()


class DatasetUploadFilesSchema(Schema):
    """數據集上傳文件請求參數"""
    files = fields.List(fields.Raw(type="files"))


class FilesSchema(Schema):
    """数据集文件参数"""
    dataset_id = fields.Integer(
        required=True,
        metadata={"description": "数据集ID"}
    )
    version = fields.String(
        required=True,
        metadata={"description": "數據集版本"}
    )
    file_ids = fields.List(
        fields.String(),
        missing=[],
        metadata={"description": "指定文件ID列表，為空則下載所有文件"}
    )


class DatasetDownloadSchema(Schema):
    """數據集批量下載請求參數"""
    dataset_list = fields.List(fields.Nested(FilesSchema), required=True)
    