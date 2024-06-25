import serial  # 导入串口通信模块
import time  # 导入时间模块
from datetime import datetime  # 导入日期时间模块

# 打开串口连接，配置端口为 'COM9'，波特率为 9600，超时时间为 1 秒
ser = serial.Serial('COM9', 9600, timeout=1)


# 发送获取光照度数据的命令
def send_sensor_command():
    hex_command = '02 03 00 03 00 02 34 38'  # 定义传感器命令的十六进制字符串
    command_bytes = bytes.fromhex(hex_command.replace(' ', ''))  # 转换为字节数据
    ser.write(command_bytes)  # 向传感器发送命令
    response_data = ser.read(100)  # 读取传感器返回的数据
    return response_data  # 返回读取的数据


# 解析光照度数据
def parse_illumination(data):
    if len(data) < 9:  # 检查返回数据的长度是否合法
        raise ValueError("返回数据长度不合法")  # 数据长度不合法，抛出异常
    data_ge = int(data[6:10], 16)  # 提取并解析低位光照度数据
    data_ten = int(data[10:14], 16)  # 提取并解析高位光照度数据
    parsed_illumination = data_ge + data_ten * 10  # 计算光照度值
    return parsed_illumination  # 返回解析后的光照度值


# 控制灯泡
def control_bulb(state):
    if state == 'on':  # 如果状态是 'on'
        command = '03 06 00 00 00 01 49 E8'  # 定义灯泡启动命令
    elif state == 'off':  # 如果状态是 'off'
        command = '03 06 00 01 00 01 18 28'  # 定义灯泡关闭命令
    else:
        raise ValueError("Invalid state")  # 状态无效，抛出异常

    command_bytes = bytes.fromhex(command.replace(' ', ''))  # 转换为字节数据
    ser.write(command_bytes)  # 向灯泡发送命令
    ser.read(100)  # 读取设备返回的数据，防止影响下一次对光照数据的解析


# 写入数据到文件
def save(result):
    with open('惠欣宇-21030031009.txt', 'a') as file:  # 以追加模式打开文件
        current_time = datetime.now().strftime("%Y-%m-%d,%H:%M:%S")  # 获取当前时间
        file.write(f"{current_time}; {result}lux\n")  # 写入时间和光照度值


# 主程序循环
try:
    while True:
        response = send_sensor_command()  # 发送获取光照度数据的命令
        time.sleep(1)  # 等待设备响应 1 秒
        response = response.hex()  # 将响应数据转换为十六进制字符串
        if response:  # 如果有响应数据
            try:
                illumination = parse_illumination(response)  # 解析光照度数据
                print(f"当前光照度: {illumination} Lux", end=" ")  # 打印当前光照度
                save(illumination)  # 保存光照度数据到文件
                if illumination < 5000:  # 如果光照度小于 5000
                    control_bulb('on')  # 打开灯泡
                    print("打开灯泡")  # 打印灯泡状态
                elif illumination >= 5000:  # 如果光照度大于或等于 5000
                    control_bulb('off')  # 关闭灯泡
                    print("关闭灯泡")  # 打印灯泡状态
            except ValueError as e:  # 捕捉数据解析异常
                print(f"分析错误: {e}")  # 打印错误信息
        time.sleep(1)  # 每秒采集一次数据

except KeyboardInterrupt:  # 捕捉到键盘中断信号
    print("程序终止")  # 打印程序终止信息
finally:
    ser.close()  # 关闭串口连接
