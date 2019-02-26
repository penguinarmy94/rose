import subprocess, re, random, datetime

current_date = datetime.datetime.now()
battery_level = 100

def get_wifi_signal_strength():
    try:
        cmd_output = str(subprocess.check_output(['netsh', 'wlan', 'show', 'interfaces']))
        info = re.search('[0-9]+%', cmd_output)

        if info:
            signal = int(info.group(0)[:-1])
            return (1, signal)
        else:
            return (0, "none")
    except Exception as e:
        return (-1, str(e))

def get_battery_level():
    global current_date
    global battery_level

    if current_date.hour == datetime.datetime.now().hour:
        if current_date.minute + 1 <= datetime.datetime.now().minute:
            current_date = datetime.datetime.now()
            battery_level = battery_level - 1
            return battery_level
        else:
            return battery_level
    else:
        return battery_level