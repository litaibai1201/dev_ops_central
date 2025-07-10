"""
入组申请模块 - 数据模型
"""

from sqlalchemy.orm import joinedload
from sqlalchemy import and_, or_
from datetime import datetime, timezone

from apps import db
from apps.models import JoinRequest, Group, User, group_members

class JoinRequestModel:
    """入组申请相关数据操作"""
    
    @staticmethod
    def get_join_request_by_id(request_id):
        """通过ID获取申请"""
        return JoinRequest.query.get(request_id)
    
    @staticmethod
    def get_join_request_with_relations(request_id):
        """获取包含关联数据的申请"""
        return JoinRequest.query.options(
            joinedload(JoinRequest.user),
            joinedload(JoinRequest.group)
        ).get(request_id)
    
    @staticmethod
    def get_join_requests_for_user(current_user, group_id=None, user_id=None, status=None):
        """获取用户相关的入组申请列表"""
        query = JoinRequest.query.options(
            joinedload(JoinRequest.user),
            joinedload(JoinRequest.group)
        )
        
        # 权限过滤
        if current_user.role != 'system_admin':
            # 普通用户只能查看自己的申请或自己能管理的群组的申请
            user_groups = []
            
            # 获取用户拥有的群组
            owned_groups = Group.query.filter_by(owner_id=current_user.id).all()
            user_groups.extend([g.id for g in owned_groups])
            
            # 获取用户有审批权限的群组
            member_records = db.session.query(group_members).filter(
                and_(
                    group_members.c.user_id == current_user.id,
                    group_members.c.permissions.op('->>')('can_approve_members').astext.cast(db.Boolean) == True
                )
            ).all()
            user_groups.extend([m.group_id for m in member_records])
            
            # 过滤条件：自己的申请或有权限管理的群组的申请
            query = query.filter(
                or_(
                    JoinRequest.user_id == current_user.id,
                    JoinRequest.group_id.in_(user_groups)
                )
            )
        
        # 应用其他过滤条件
        if group_id:
            query = query.filter(JoinRequest.group_id == group_id)
        
        if user_id:
            query = query.filter(JoinRequest.user_id == user_id)
        
        if status:
            query = query.filter(JoinRequest.status == status)
        
        return query.order_by(JoinRequest.created_at.desc())
    
    @staticmethod
    def create_join_request(user_id, group_id, message=''):
        """创建入组申请"""
        join_request = JoinRequest(
            user_id=user_id,
            group_id=group_id,
            message=message,
            status='pending'
        )
        return join_request
    
    @staticmethod
    def check_existing_request(user_id, group_id, status='pending'):
        """检查是否已有待处理的申请"""
        return JoinRequest.query.filter(
            and_(
                JoinRequest.user_id == user_id,
                JoinRequest.group_id == group_id,
                JoinRequest.status == status
            )
        ).first()
    
    @staticmethod
    def handle_join_request(join_request, action, reviewer_id, review_message=''):
        """处理入组申请"""
        join_request.status = 'approved' if action == 'approve' else 'rejected'
        join_request.reviewed_by = reviewer_id
        join_request.review_message = review_message
        join_request.reviewed_at = datetime.now(timezone.utc)
        return join_request
    
    @staticmethod
    def batch_handle_requests(request_ids, action, reviewer_id, review_message=''):
        """批量处理入组申请"""
        join_requests = JoinRequest.query.options(
            joinedload(JoinRequest.user),
            joinedload(JoinRequest.group)
        ).filter(JoinRequest.id.in_(request_ids)).all()
        
        processed_requests = []
        failed_requests = []
        
        for join_request in join_requests:
            if join_request.status != 'pending':
                failed_requests.append({
                    'id': join_request.id,
                    'reason': '申请已被处理'
                })
                continue
            
            processed_requests.append(join_request)
        
        return processed_requests, failed_requests
    
    @staticmethod
    def add_user_to_group(user_id, group_id):
        """添加用户到群组"""
        # 检查用户是否已经是成员
        existing_member = db.session.query(group_members).filter(
            and_(
                group_members.c.user_id == user_id,
                group_members.c.group_id == group_id
            )
        ).first()
        
        if not existing_member:
            db.session.execute(
                group_members.insert().values(
                    user_id=user_id,
                    group_id=group_id,
                    role='member',
                    permissions={
                        'can_approve_members': False,
                        'can_edit_project': False,
                        'can_manage_members': False
                    }
                )
            )
    
    @staticmethod
    def delete_join_request(join_request):
        """删除入组申请"""
        db.session.delete(join_request)
    
    @staticmethod
    def get_user_join_history(user_id):
        """获取用户入组申请历史"""
        return JoinRequest.query.filter_by(user_id=user_id).order_by(
            JoinRequest.created_at.desc()
        ).all()
    
    @staticmethod
    def get_group_pending_requests(group_id):
        """获取群组待处理申请"""
        return JoinRequest.query.filter(
            and_(
                JoinRequest.group_id == group_id,
                JoinRequest.status == 'pending'
            )
        ).order_by(JoinRequest.created_at.asc()).all()
    
    @staticmethod
    def get_requests_statistics(group_id=None, user_id=None):
        """获取申请统计信息"""
        base_query = JoinRequest.query
        
        if group_id:
            base_query = base_query.filter(JoinRequest.group_id == group_id)
        
        if user_id:
            base_query = base_query.filter(JoinRequest.user_id == user_id)
        
        total = base_query.count()
        pending = base_query.filter(JoinRequest.status == 'pending').count()
        approved = base_query.filter(JoinRequest.status == 'approved').count()
        rejected = base_query.filter(JoinRequest.status == 'rejected').count()
        
        return {
            'total': total,
            'pending': pending,
            'approved': approved,
            'rejected': rejected
        }
