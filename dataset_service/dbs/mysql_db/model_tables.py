# -*- coding: utf-8 -*-
"""
@文件: all_db.py
@說明: 模型類
@時間: 2023/10/26 16:54:19
@作者: LiDong
"""

from common.common_tools import CommonTools
from dbs.mysql_db import db


class BaseModel(db.Model):
    __abstract__ = True

    status = db.Column(db.Integer, default=1, comment="状态")
    created_at = db.Column(
        db.String(19), default=CommonTools.get_now, nullable=False,
        comment="創建時間"
    )
    status_update_at = db.Column(db.String(19), comment="状态更新時間")


class BaseMixinModel(BaseModel):
    __abstract__ = True

    updated_at = db.Column(db.String(19), comment="更新時間")


class DatasetModel(BaseMixinModel):
    __tablename__ = "dataset_form"

    id = db.Column(db.BigInteger, nullable=False, primary_key=True, comment="數據集ID")
    dataset_nm = db.Column(db.String(100), nullable=False, comment="數據集名稱")
    description = db.Column(db.Text, comment="數據集描述")
    version = db.Column(db.String(8), comment="数据集版本")
    created_by = db.Column(db.String(16), comment="數據集创建人工号")


class ProjectDatasetModel(BaseModel):
    __tablename__ = "project_dataset_form"

    id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True, comment="ID")
    project_id = db.Column(db.BigInteger, nullable=False, comment="專案ID")
    dataset_id = db.Column(db.BigInteger, nullable=False, comment="數據集ID")


class DatasetFileModel(BaseModel):
    __tablename__ = "dataset_file_form"

    id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True, comment="ID")
    file_nm = db.Column(db.String(255), nullable=False, comment="文件名")
    file_id = db.Column(db.String(32), comment="文件ID")
    file_version_id = db.Column(db.String(36), comment="文件版本ID")
    dataset_id = db.Column(db.BigInteger, nullable=False, comment="數據集ID")
    dataset_version = db.Column(db.String(8), comment="數據集版本")
    created_by = db.Column(db.String(16), comment="創建人")
