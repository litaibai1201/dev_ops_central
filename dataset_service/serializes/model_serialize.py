# -*- coding: utf-8 -*-
'''
@文件: model_serializes.py
@說明:
@時間: 2024/08/28 11:25:35
@作者: LiDong
'''

from dbs.mysql_db import CommonModelDbSchema
from dbs.mysql_db.model_tables import DatasetModel, DatasetFileModel, ProjectDatasetModel
from marshmallow import post_load


class DatasetModelSchema(CommonModelDbSchema):

    __modelclass__ = DatasetModel

    @post_load
    def post_load(self, instance, **kwargs):
        return DatasetModel(**instance)


class DatasetFileModelSchema(CommonModelDbSchema):

    __modelclass__ = DatasetFileModel

    @post_load
    def post_load(self, instance, **kwargs):
        return DatasetFileModel(**instance)
    

class ProjectDatasetModelSchema(CommonModelDbSchema):

    __modelclass__ = ProjectDatasetModel

    @post_load
    def post_load(self, instance, **kwargs):
        return ProjectDatasetModel(**instance)