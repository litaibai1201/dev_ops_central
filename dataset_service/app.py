# -*- coding: utf-8 -*-
"""
@文件: app.py
@說明: server啟動文件
@時間: 2023/10/19 19:09:13
@作者: LiDong
"""
import json
from datetime import timedelta
from flask import Flask, request
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_smorest import Api
from flask_jwt_extended import JWTManager

from cache import redis_client
from common.common_method import fail_response_result
from configs.app_config import REDIS_DATABASE_URI, SQLALCHEMY_DATABASE_URI
from dbs.mysql_db import db
from loggers import logger
from views.dataset_api import blp as dataset_blp

# from waitress import serve


app = Flask(__name__)
jwt = JWTManager()
jwt.init_app(app)


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return fail_response_result(msg="Token is expired")


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return fail_response_result(msg="Token is invalid")


@jwt.unauthorized_loader
def missing_token_callback(error):
    return fail_response_result(msg="Missing Authentication Token")


def create_app(app):
    CORS(app, supports_credentials=True)
    app.config["Access-Control-Allow-Origin"] = "*"
    app.config["API_TITLE"] = "ALARM SERVER REST API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.3"
    app.config["OPENAPI_URL_PREFIX"] = "/"
    app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
    app.config[
        "OPENAPI_SWAGGER_UI_URL"
    ] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ECHO"] = False
    app.config["REDIS_URL"] = REDIS_DATABASE_URI
    app.config["REDIS_RESPONSE"] = True
    app.config["PROPAGATE_EXCEPTIONS"] = True
    app.config["JSON_AS_ASCII"] = False
    app.config["CORS_HEADERS"] = "Content-Type"
    app.config["KEEP_ALIVE"] = False
    app.config["JWT_ALGORITHM"] = "HS256"
    app.config["JWT_SECRET_KEY"] = "Avary88!"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(weeks=4)

    app.logger = logger
    migrate = Migrate()
    migrate.init_app(app)
    db.init_app(app)
    with app.app_context():
        db.create_all()
    redis_client.init_app(app)
    marsh = Marshmallow()
    marsh.init_app(app)

    api = Api(app)
    api.register_blueprint(dataset_blp)
    return app


@app.after_request
def after_request(resp):
    """统一错误响应处理 (优化版本)"""
    try:
        if request.method == "OPTIONS":
            return resp
            
        # 只处理JSON响应
        if resp.content_type and 'application/json' in resp.content_type:
            data = json.loads(resp.data)
            
            # 处理验证错误(422)
            if data.get("code", 200) == 422:
                error_msg = "請求參數驗證失敗"
                
                # 提取第一个错误信息
                errors = data.get("errors", {}).get("json", {})
                if errors:
                    for field, messages in errors.items():
                        if isinstance(messages, list) and messages:
                            error_msg = f"{field}: {messages[0]}"
                            break
                        elif isinstance(messages, dict):
                            for sub_field, sub_messages in messages.items():
                                if isinstance(sub_messages, list) and sub_messages:
                                    error_msg = f"{sub_field}: {sub_messages[0]}"
                                    break
                            break
                
                resp.data = json.dumps(
                    fail_response_result(msg=error_msg),
                    ensure_ascii=False,
                )
                resp.status_code = 200  # 统一返回200状态码
                
    except (json.JSONDecodeError, AttributeError, KeyError) as e:
        # 记录解析错误但不影响正常响应
        logger.warning(f"響應後處理警告: {str(e)}")
    except Exception as e:
        # 记录未知错误
        logger.error(f"響應後處理錯誤: {str(e)}")
        
    return resp


if __name__ == "__main__":
    app = create_app(app)
    print("===================server starting============================")
    # serve(app, host="0.0.0.0", port=19999, threads=30)
    app.run("0.0.0.0", 19998, debug=True)
