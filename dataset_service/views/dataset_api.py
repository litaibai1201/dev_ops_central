# -*- coding: utf-8 -*-
"""
@文件: dataset_api.py
@說明: 數據集API (优化版本)
@時間: 2025-08-08
@作者: LiDong
"""

from flask import request, g
from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import get_jwt_identity, jwt_required

from common.common_method import fail_response_result, response_result
from controllers.dataset_controller import DatasetController
from serializes.response_serialize import (RspBaseSchema, RspMsgDictSchema, RspMsgListSchema, RspMsgSchema)
from serializes.dataset_serialize import (DatasetCreateSchema, DatasetDetailSchema, DatasetFilesSchema, DatasetUpdateSchema,
                                         DatasetQuerySchema, DatasetUploadFilesSchema, DatasetDownloadSchema)
from loggers import logger

blp = Blueprint("dataset_api", __name__)


class BaseDatasetView(MethodView):
    """数据集API基类 - 统一控制器管理和错误处理"""
    
    def __init__(self):
        super().__init__()
        # 使用单例模式的控制器，避免重复初始化
        if not hasattr(g, 'dataset_controller'):
            g.dataset_controller = DatasetController()
        self.dc = g.dataset_controller
    
    def _get_current_user(self):
        """获取当前用户信息 - 统一用户信息处理"""
        # TODO: 集成真实的JWT用户认证
        # username = get_jwt_identity()
        # return username.get("empid", "admin") if username else "admin"
        return "admin"
    
    def _build_response(self, result, flag, success_msg="操作成功", error_prefix=""):
        """统一响应构建"""
        if flag:
            return response_result(content=result, msg=success_msg)
        error_msg = f"{error_prefix}{result}" if error_prefix else str(result)
        logger.warning(f"API操作失败: {error_msg}")
        return fail_response_result(msg=error_msg)


@blp.route("/api/projects/<int:project_id>/datasets")
class DatasetListApi(BaseDatasetView):
    """數據集列表API (优化版本)"""

    # @jwt_required(optional=True)
    @blp.arguments(DatasetCreateSchema, location="form")
    @blp.response(200, RspMsgSchema)
    def post(self, payload, project_id):
        """創建數據集"""
        try:
            payload["created_by"] = self._get_current_user()
            files = request.files.getlist("files")
            
            result, flag = self.dc.create(payload, files, project_id)
            return self._build_response(str(result), flag, "數據集創建成功")
        except Exception as e:
            logger.error(f"創建數據集異常: {str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")

    # @jwt_required(optional=True)
    @blp.arguments(DatasetQuerySchema, location="query")
    @blp.response(200, RspMsgDictSchema)
    def get(self, args, project_id):
        """獲取數據集列表"""
        try:
            page = args.get('page', 1)
            size = args.get('size', 10)
            
            result, flag = self.dc.get_list(args, project_id, page, size)
            return self._build_response(result, flag)
        except Exception as e:
            logger.error(f"獲取數據集列表異常: {str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


@blp.route("/api/projects/<int:project_id>/datasets/<int:dataset_id>")
class DatasetDetailApi(BaseDatasetView):
    """數據集詳情API (优化版本)"""

    @blp.arguments(DatasetDetailSchema, location="query")
    @blp.response(200, RspMsgDictSchema)
    def get(self, args, project_id, dataset_id):
        """獲取數據集詳情"""
        try:
            result, flag = self.dc.get_dataset_files(dataset_id, project_id, args)
            return self._build_response(result, flag)
        except Exception as e:
            logger.error(f"獲取數據集詳情異常: dataset_id={dataset_id}, error={str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")

    # @jwt_required(optional=True)
    @blp.arguments(DatasetUpdateSchema)
    @blp.response(200, RspMsgSchema)
    def put(self, payload, project_id, dataset_id):
        """更新數據集"""
        try:
            result, flag = self.dc.update(dataset_id, payload, project_id)
            return self._build_response(result, flag, "數據集更新成功")
        except Exception as e:
            logger.error(f"更新數據集異常: dataset_id={dataset_id}, error={str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


@blp.route("/api/projects/<int:project_id>/datasets/<int:dataset_id>/files")
class DatasetFilesURLApi(BaseDatasetView):
    """數據集文档预览链接API (优化版本)"""

    @blp.arguments(DatasetFilesSchema, location="query")
    @blp.response(200, RspMsgListSchema)
    def get(self, args, project_id, dataset_id):
        """獲取數據集文档预览链接"""
        try:
            result, flag = self.dc.get_dataset_files_url(dataset_id, project_id, args)
            return self._build_response(result, flag)
        except Exception as e:
            logger.error(f"獲取文件預覽鏈接異常: dataset_id={dataset_id}, error={str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


@blp.route("/api/projects/<int:project_id>/datasets/<int:dataset_id>/version")
class DatasetVersionHistoryApi(BaseDatasetView):
    """数据集版本历史API (优化版本)"""

    @blp.response(200, RspMsgDictSchema)
    def get(self, project_id, dataset_id):
        """獲取數據集版本历史"""
        try:
            result, flag = self.dc.get_dataset_version_history(dataset_id, project_id)
            return self._build_response(result, flag)
        except Exception as e:
            logger.error(f"獲取版本歷史異常: dataset_id={dataset_id}, error={str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


@blp.route("/api/projects/<int:project_id>/datasets/<int:dataset_id>/upload")
class DatasetUploadFilesApi(BaseDatasetView):
    """數據集文件上傳API (优化版本)"""

    # @jwt_required(optional=True)
    @blp.arguments(DatasetUploadFilesSchema, location="form")
    @blp.response(200, RspBaseSchema)
    def post(self, payload, project_id, dataset_id):
        """上傳數據集文件"""
        try:
            payload["created_by"] = self._get_current_user()
            files = request.files.getlist("files")
            
            result, flag = self.dc.upload_dataset_files(dataset_id, project_id, files, payload)
            return self._build_response(result, flag, "文件上傳成功")
        except Exception as e:
            logger.error(f"上傳文件異常: dataset_id={dataset_id}, error={str(e)}")
            return fail_response_result(msg="系統內部錯誤，請稍後重試")


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