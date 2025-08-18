from cache import redis_client


class OperRedis:
    def __init__(self) -> None:
        self.pipe = redis_client.pipeline()

    def set(self, key, value, expire=None):
        if expire:
            self.pipe.set(key, value, ex=expire)
        else:
            self.pipe.set(key, value)

    def get(self, *args):
        for key in args:
            self.pipe.get(key)

    def hset(self, name, key, value, expire=None):
        self.pipe.hset(name, key, value)
        if expire:
            self.pipe.expire(name, expire)

    def hmset(self, name, data_dict, expire=None):
        self.pipe.hset(name, mapping=data_dict)
        if expire:
            self.pipe.expire(name, expire)

    def hget(self, name, *args):
        for key in args:
            self.pipe.hget(name, key)

    def hmget(self, name, key_list):
        self.pipe.hmget(name, key_list)

    def hgetall(self, name):
        self.pipe.hgetall(name)

    def hdelete(self, name):
        self.pipe.delete(name)

    def execute(self):
        datalist = self.pipe.execute()
        result = list()
        for data in datalist:
            if data and isinstance(data, bytes):
                result.append(data.decode("utf-8"))
            else:
                result.append(data)
        return result

    def close(self):
        self.pipe.close()
