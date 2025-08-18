# -*- coding: utf-8 -*-
"""
@文件: common_tools.py
@說明: 公共方法模塊
@時間: 2023/10/19 14:14:33
@作者: LiDong
"""
import re
import os
import time
import traceback
from datetime import datetime, timedelta

import requests
import yaml
from flask import current_app as app


def get_time(f):

    def inner(*arg, **kwarg):
        s_time = time.time()
        res = f(*arg, **kwarg)
        e_time = time.time()
        print("耗时：{}秒，函式：{}".format(round(e_time - s_time, 3), f))
        return res

    return inner


class ReadConf:
    def __init__(self, yaml_file):
        self.yaml_file = yaml_file

    def read_yaml(self):
        with open(self.yaml_file, encoding='utf-8')as f:
            value = yaml.load(f, Loader=yaml.FullLoader)
            return value


class TryExcept:
    def __init__(self, default_error=""):
        self.default_error = default_error
        self.errors = (Exception,)

    def __call__(self, func):
        def inner(*args, **kwargs):
            try:
                return func(*args, **kwargs), True
            except self.errors:
                app.logger.error(f"{args}: {self.default_error}")
                app.logger.error(traceback.format_exc())
                return self.default_error, False

        return inner


class CommonTools:

    @TryExcept("請求失敗")
    @staticmethod
    def send_request(url, *args):
        res = requests.get(url, timeout=2).json()
        if res.get("code", 400) == 200:
            return True
        return False

    @TryExcept("請求失敗")
    @staticmethod
    def send_post_request(url, data):
        res = requests.post(url, json=data, timeout=30)
        result = res.json()
        if result.get("code") == "S10000":
            return True
        return False

    @staticmethod
    def get_now(data=None, days=0, seconds=0):
        """
        獲取時間字符
        """

        now_time = datetime.now() + timedelta(
            days=days, seconds=seconds
        )
        if data == "date":
            return now_time.strftime("%Y-%m-%d")
        elif data == "time":
            return now_time.strftime("%H:%M:%S")
        elif data == "datetime":
            return now_time
        elif data == "datetime_nums":
            return now_time.strftime("%Y%m%d%H%M%S")
        elif data == "date_nums":
            return now_time.strftime("%Y%m%d")
        else:
            return now_time.strftime("%Y-%m-%d %H:%M:%S")

    @staticmethod
    def get_timestmp():
        return int(datetime.now().timestamp() * 1000)

    @staticmethod
    def get_total_page(count, total_count):
        total_page = int(total_count / count)
        if total_count / count > total_page:
            total_page += 1
        return total_page

    @staticmethod
    def extract_req_files(files):
        files_dict = {}
        for key in files:
            files_dict[key] = files.get(key)
        return files_dict

    @staticmethod
    def remove_file(folder_path):
        if not os.path.exists(folder_path):
            return
        files = os.listdir(folder_path)
        for file in files:
            file_path = os.path.join(folder_path, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
            elif os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                CommonTools.remove_file(file_path)
                os.removedirs(file_path)

    @staticmethod
    def time_trans(times):
        # 假设你已经有了一个带有UTC时区信息的datetime对象
        utc_time = times

        # 将UTC时间转换为北京时间（UTC+8）
        beijing_time = utc_time + timedelta(hours=8)
        return beijing_time.strftime("%Y-%m-%d %H:%M:%S")

    @staticmethod
    def normalize_string(input_str):
        """
        过滤并规范化字符串：
        1. 只保留中文、英文字母、数字和下划线
        2. 下划线不能开头
        3. 英文字母一律转为小写
        
        参数:
            input_str (str): 要处理的输入字符串
            
        返回:
            str: 处理后的字符串
        """
        if not isinstance(input_str, str):
            raise ValueError("输入必须是字符串类型")
        
        # 第一步：过滤掉不允许的字符（只保留中文、英文、数字和下划线）
        # 中文Unicode范围：\u4e00-\u9fa5
        filtered = re.sub(r'[^a-zA-Z0-9_\u4e00-\u9fa5]', '', input_str)
        
        # 第二步：将所有英文字母转为小写
        filtered = filtered.lower()

        # 第三步：移除开头的下划线
        filtered = re.sub(r'^_+', '', filtered)
        
        return filtered
