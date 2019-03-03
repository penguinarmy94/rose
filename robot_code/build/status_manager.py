import subprocess, re, random, datetime

current_date = datetime.datetime.now()
battery_level = 100
os = "windows"

def get_wifi_signal_strength():
    global os

    try:
        if os == "linux":
            return _get_linux_wifi_signal_strength()
        else:
            return _get_windows_wifi_signal_strength()           
    except Exception as e:
            return (-1, str(e))

def _get_linux_wifi_signal_strength():
    cmd_output = str(subprocess.check_output(['iwconfig', 'wlan0', '|', 'grep', '-i', '--color', 'signal']))
    info = re.search('[0-9]+/[0-9]+', cmd_output)

    if info:
        signal_divisor = info.split("/")
        signal = 100*(int(signal_divisor[0]) / int(signal_divisor[1]))
        return (1, signal)
    else:                
        return (0, "none")

def _get_windows_wifi_signal_strength():
    cmd_output = str(subprocess.check_output(['netsh', 'wlan', 'show', 'interfaces']))
    info = re.search('[0-9]+%', cmd_output)

    if info:
        signal = int(info.group(0)[:-1])
        return (1, signal)
    else:
        return (0, "none")

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