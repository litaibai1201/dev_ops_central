"""
入组申请模块 - 业务逻辑控制器
"""

from apps import db
from apps.utils import (
    success_response, error_response, forbidden_response, not_found_response,
    conflict_response, is_group_member, check_group_approve_members_permission
)
from .models import JoinRequestModel

class JoinRequestController:
    """入组申请相关业务逻辑"""
    
    @staticmethod
    def get_join_requests(current_user, query_args):
        """获取入组申请列表"""
        group_id = query_args.get('group_id')
        user_id = query_args.get('user_id')
        status = query_args.get('status')
        
        # 获取申请列表
        requests = JoinRequestModel.get_join_requests_for_user(
            current_user, group_id, user_id, status
        ).all()
        
        from apps.schemas.models_schema import JoinRequestSchema
        request_schema = JoinRequestSchema(many=True)
        requests_data = request_schema.dump(requests)
        
        return success_response(requests_data, '获取成功')
    
    @staticmethod
    def create_join_request(current_user, request_data):
        """提交入组申请"""
        group_id = request_data['group_id']
        message = request_data.get('message', '')
        
        # 检查群组是否存在
        from apps.models import Group
        group = Group.query.get(group_id)
        if not group:
            return not_found_response('群组')
        
        # 检查是否已经是成员
        if is_group_member(current_user.id, group_id) or group.owner_id == current_user.id:
            return conflict_response('已经是群组成员')
        
        # 检查是否已有待处理的申请
        existing_request = JoinRequestModel.check_existing_request(
            current_user.id, group_id
        )
        
        if existing_request:
            return conflict_response('已有待处理的申请')
        
        # 创建申请
        try:
            join_request = JoinRequestModel.create_join_request(
                user_id=current_user.id,
                group_id=group_id,
                message=message
            )
            db.session.add(join_request)
            db.session.commit()
            
            # 重新查询以获取完整数据
            join_request = JoinRequestModel.get_join_request_with_relations(join_request.id)
            
            from apps.schemas.models_schema import JoinRequestSchema
            request_schema = JoinRequestSchema()
            request_data = request_schema.dump(join_request)
            
            return success_response(request_data, '申请提交成功', 201)
            
        except Exception as e:
            db.session.rollback()
            return error_response('申请提交失败，请重试', 500)
    
    @staticmethod
    def handle_join_request(current_user, request_id, handle_data):
        """处理入组申请"""
        join_request = JoinRequestModel.get_join_request_with_relations(request_id)
        
        if not join_request:
            return not_found_response('申请')
        
        if join_request.status != 'pending':
            return error_response('申请已被处理')
        
        group = join_request.group
        action = handle_data['action']
        review_message = handle_data.get('review_message', '')
        
        # 检查权限
        if not check_group_approve_members_permission(current_user.id, group.id):
            return forbidden_response('无审批权限')
        
        # 处理申请
        try:
            JoinRequestModel.handle_join_request(
                join_request, action, current_user.id, review_message
            )
            
            # 如果通过申请，添加用户到群组
            if action == 'approve':
                JoinRequestModel.add_user_to_group(
                    join_request.user_id, group.id
                )
            
            db.session.commit()
            
            from apps.schemas.models_schema import JoinRequestSchema
            request_schema = JoinRequestSchema()
            request_data = request_schema.dump(join_request)
            
            return success_response(request_data, '处理成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('处理失败，请重试', 500)
    
    @staticmethod
    def batch_handle_requests(current_user, handle_data):
        """批量处理入组申请"""
        request_ids = handle_data['request_ids']
        action = handle_data['action']
        review_message = handle_data.get('review_message', '')
        
        # 获取所有申请并进行权限检查
        processed_requests, failed_requests = JoinRequestModel.batch_handle_requests(
            request_ids, action, current_user.id, review_message
        )
        
        successful_requests = []
        
        for join_request in processed_requests:
            try:
                group = join_request.group
                
                # 检查权限
                if not check_group_approve_members_permission(current_user.id, group.id):
                    failed_requests.append({
                        'id': join_request.id,
                        'reason': '无审批权限'
                    })
                    continue
                
                # 处理申请
                JoinRequestModel.handle_join_request(
                    join_request, action, current_user.id, review_message
                )
                
                # 如果通过申请，添加用户到群组
                if action == 'approve':
                    JoinRequestModel.add_user_to_group(
                        join_request.user_id, group.id
                    )
                
                successful_requests.append(join_request)
                
            except Exception as e:
                failed_requests.append({
                    'id': join_request.id,
                    'reason': '处理失败'
                })
        
        try:
            db.session.commit()
            
            from apps.schemas.models_schema import JoinRequestSchema
            request_schema = JoinRequestSchema(many=True)
            processed_data = request_schema.dump(successful_requests)
            
            result = {
                'processed': processed_data,
                'failed': failed_requests,
                'total_processed': len(successful_requests),
                'total_failed': len(failed_requests)
            }
            
            return success_response(result, '批量处理完成')
            
        except Exception as e:
            db.session.rollback()
            return error_response('批量处理失败，请重试', 500)
    
    @staticmethod
    def get_join_request(current_user, request_id):
        """获取申请详情"""
        join_request = JoinRequestModel.get_join_request_with_relations(request_id)
        
        if not join_request:
            return not_found_response('申请')
        
        # 检查权限
        if (join_request.user_id != current_user.id and 
            join_request.group.owner_id != current_user.id and
            current_user.role != 'system_admin'):
            # 检查是否有审批权限
            if not check_group_approve_members_permission(current_user.id, join_request.group_id):
                return forbidden_response('权限不足')
        
        from apps.schemas.models_schema import JoinRequestSchema
        request_schema = JoinRequestSchema()
        request_data = request_schema.dump(join_request)
        
        return success_response(request_data, '获取成功')
    
    @staticmethod
    def cancel_join_request(current_user, request_id):
        """撤销入组申请"""
        join_request = JoinRequestModel.get_join_request_by_id(request_id)
        if not join_request:
            return not_found_response('申请')
        
        # 只有申请人本人可以撤销申请
        if join_request.user_id != current_user.id:
            return forbidden_response('只能撤销自己的申请')
        
        # 只能撤销待处理的申请
        if join_request.status != 'pending':
            return error_response('只能撤销待处理的申请')
        
        try:
            JoinRequestModel.delete_join_request(join_request)
            db.session.commit()
            
            return success_response(None, '撤销成功')
            
        except Exception as e:
            db.session.rollback()
            return error_response('撤销失败，请重试', 500)
    
    @staticmethod
    def get_user_join_history(current_user, user_id):
        """获取用户入组申请历史"""
        # 用户只能查看自己的申请历史，除非是系统管理员
        if current_user.id != user_id and current_user.role != 'system_admin':
            return forbidden_response('权限不足')
        
        join_requests = JoinRequestModel.get_user_join_history(user_id)
        
        from apps.schemas.models_schema import JoinRequestSchema
        request_schema = JoinRequestSchema(many=True)
        requests_data = request_schema.dump(join_requests)
        
        return success_response(requests_data, '获取成功')
    
    @staticmethod
    def get_group_pending_requests(current_user, group_id):
        """获取群组待处理申请"""
        # 检查权限
        if not check_group_approve_members_permission(current_user.id, group_id):
            return forbidden_response('无审批权限')
        
        requests = JoinRequestModel.get_group_pending_requests(group_id)
        
        from apps.schemas.models_schema import JoinRequestSchema
        request_schema = JoinRequestSchema(many=True)
        requests_data = request_schema.dump(requests)
        
        return success_response(requests_data, '获取成功')
    
    @staticmethod
    def get_requests_statistics(current_user, group_id=None, user_id=None):
        """获取申请统计信息"""
        # 权限检查
        if group_id and not check_group_approve_members_permission(current_user.id, group_id):
            return forbidden_response('无权限查看群组统计')
        
        if user_id and current_user.id != user_id and current_user.role != 'system_admin':
            return forbidden_response('无权限查看用户统计')
        
        stats = JoinRequestModel.get_requests_statistics(group_id, user_id)
        
        return success_response(stats, '获取成功')
