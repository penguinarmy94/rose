class Robot():
    id = ""
    userid = ""
    name = ""
    battery = 0
    connection = 0
    detect_behavior = None
    idle_behavior = None
    num_of_videos = 0
    power = True
    light = False
    camera_angle = 7
    videos = []
    charging = False
    manualPicture = False

    def isInitialized(self):
        if self.detect_behavior == None or self.idle_behavior == None:
            return False
        else:
            return True

    def from_dict(self, map):
        if not map["name"] == None:
            self.name = map["name"]
        if not map["id"] and type(map["id"] == "String"):
            self.id = map["id"]
        if not map["userid"] == None:
            self.userid = map["userid"]
        if not map["battery"] == None:
            self.battery = map["battery"]
        if not map["connection"] == None:
            self.connection = map["connection"]
        if not map["detect_behavior"] == None:
            self.detect_behavior = map["detect_behavior"]
        if not map["idle_behavior"] == None:
            self.idle_behavior = map["idle_behavior"]
        if not map["num_of_videos"] == None:
            self.num_of_videos = map["num_of_videos"]
        if not map["power"] == None:
            self.power = map["power"]
        if not map["light"] == None:
            self.light = map["light"]
        if not map["camera_angle"] == None:
            self.camera_angle = map["camera_angle"]
        if not map["manual_picture"] == None:
            self.manualPicture = map["manual_picture"]
        if not map["videos"] == None:
            self.videos = map["videos"]

    def to_dict(self):
        map = {
            u'id': self.id,
            u'userid': self.userid,
            u'name': self.name,
            u'battery': self.battery,
            u'connection': self.connection,
            u'detect_behavior': self.detect_behavior,
            u'idle_behavior': self.idle_behavior,
            u'num_of_videos': self.num_of_videos,
            u'power': self.power,
            u'light': self.light,
            u'camera_angle': self.camera_angle,
            u'videos': self.videos
        }

        return map


