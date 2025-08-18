# -*- coding: utf-8 -*-
"""
@文件: dataset_api.py
@說明: 數據集API
@時間: 2025-08-08
@作者: LiDong
"""

from flask import request
from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import get_jwt_identity, jwt_required

from common.common_method import fail_response_result, response_result
from controllers.dataset_controller import DatasetController
from serializes.response_serialize import (RspBaseSchema, RspMsgDictSchema, RspMsgListSchema, RspMsgSchema)
from serializes.dataset_serialize import (DatasetCreateSchema, DatasetDetailSchema, DatasetFilesSchema, DatasetUpdateSchema,
                                         DatasetQuerySchema, DatasetUploadFilesSchema, DatasetDownloadSchema)

blp = Blueprint("dataset_api", __name__)


@blp.route("/api/projects/<int:project_id>/datasets")
class DatasetListApi(MethodView):
    """
    數據集列表API
    """

    def __init__(self) -> None:
        super().__init__()
        self.dc = DatasetController()

    # @jwt_required(optional=True)
    @blp.arguments(DatasetCreateSchema, location="form")
    @blp.response(200, RspMsgSchema)
    def post(self, payload, project_id):
        """創建數據集"""
        # username = get_jwt_identity()
        # payload["created_by"] = username["empid"]
        payload["created_by"] = "admin"
        files = request.files.getlist("files")
        
        result, flag = self.dc.create(payload, files, project_id)
        if flag:
            return response_result(content=str(result), msg="數據集創建成功")
        return fail_response_result(content=result)

    # @jwt_required(optional=True)
    @blp.arguments(DatasetQuerySchema, location="query")
    @blp.response(200, RspMsgDictSchema)
    def get(self, args, project_id):
        """獲取數據集列表"""
        
        page = args.get('page', 1)
        size = args.get('size', 10)
        
        result, flag = self.dc.get_list(args, project_id, page, size)
        if flag:
            rsp_result = response_result(content=result)
        else:
            rsp_result = fail_response_result(msg=result)
        return rsp_result


@blp.route("/api/projects/<int:project_id>/datasets/<int:dataset_id>")
class DatasetDetailApi(MethodView):
    """
    數據集詳情API
    """

    def __init__(self) -> None:
        super().__init__()
        self.dc = DatasetController()

    @blp.arguments(DatasetDetailSchema, location="query")
    @blp.response(200, RspMsgDictSchema)
    def get(self, args, project_id, dataset_id):
        """獲取數據集詳情"""
        
        result, flag = self.dc.get_dataset_files(dataset_id, project_id, args)
        if flag:
            rsp_result = response_result(content=result)
        else:
            rsp_result = fail_response_result(msg=result)
        return rsp_result

    # @jwt_required(optional=True)
    @blp.arguments(DatasetUpdateSchema)
    @blp.response(200, RspMsgSchema)
    def put(self, payload, project_id, dataset_id):
        """更新數據集"""
        result, flag = self.dc.update(dataset_id, payload, project_id)
        if flag:
            rsp_result = response_result(msg="數據集更新成功")
        else:
            rsp_result = fail_response_result(msg=result)
        return rsp_result


@blp.route("/api/projects/<int:project_id>/datasets/<int:dataset_id>/files")
class DatasetFilesURLApi(MethodView):
    """
    數據集文档预览链接API
    """

    def __init__(self) -> None:
        super().__init__()
        self.dc = DatasetController()

    @blp.arguments(DatasetFilesSchema, location="query")
    @blp.response(200, RspMsgListSchema)
    def get(self, args, project_id, dataset_id):
        """獲取數據集文档预览链接"""
        
        result, flag = self.dc.get_dataset_files_url(dataset_id, project_id, args)
        if flag:
            rsp_result = response_result(content=result)
        else:
            rsp_result = fail_response_result(msg=result)
        return rsp_result


@blp.route("/api/projects/<int:project_id>/datasets/<int:dataset_id>/version")
class DatasetVersionHistoryApi(MethodView):
    """
    数据集版本历史API
    """

    def __init__(self) -> None:
        super().__init__()
        self.dc = DatasetController()

    @blp.response(200, RspMsgDictSchema)
    def get(self, project_id, dataset_id):
        """獲取數據集版本历史"""
        
        result, flag = self.dc.get_dataset_version_history(dataset_id, project_id)
        if flag:
            rsp_result = response_result(content=result)
        else:
            rsp_result = fail_response_result(msg=result)
        return rsp_result


@blp.route("/api/projects/<int:project_id>/datasets/<int:dataset_id>/upload")
class DatasetUploadFilesApi(MethodView):
    """
    數據集文件上傳API
    """

    def __init__(self) -> None:
        super().__init__()
        self.dc = DatasetController()

    # @jwt_required(optional=True)
    @blp.arguments(DatasetUploadFilesSchema, location="form")
    @blp.response(200, RspBaseSchema)
    def post(self, payload, project_id, dataset_id):
        """上傳數據集文件"""
        # username = get_jwt_identity()
        # payload["created_by"] = username["empid"]
        payload["created_by"] = "admin"
        files = request.files.getlist("files")
        result, flag = self.dc.upload_dataset_files(dataset_id, project_id, files, payload)
        if flag:
            return response_result(content=result, msg="文件上傳成功")
        return fail_response_result(msg=result)


# @blp.route("/api/projects/<int:project_id>/datasets/download")
# class DatasetDownloadApi(MethodView):
#     """
#     數據集批量下載API
#     """

#     def __init__(self) -> None:
#         super().__init__()
#         self.dc = DatasetController()

#     @blp.arguments(DatasetDownloadSchema)
#     @blp.response(200, RspBaseSchema)
#     def post(self, args, project_id):
#         """批量下載數據集文件"""
        
#         result, flag = self.dc.download_dataset_files(project_id, args)
#         if flag:
#             rsp_result = response_result(content=result)
#         else:
#             rsp_result = fail_response_result(msg=result)
#         return rsp_result