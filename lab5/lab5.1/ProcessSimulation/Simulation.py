import serial  # 导入串口通信模块
import time  # 导入时间模块
from datetime import datetime  # 导入日期时间模块

# 打开串口连接
ser = serial.Serial('COM9', 9600, timeout=1)  # 根据实际串口名称调整，设置波特率为9600，超时时间为1秒


# 发送获取数据的命令
def send_command():
    hex_command = '01 04 00 00 00 08 F1 CC'  # 设定要发送的16进制命令
    command_bytes = bytes.fromhex(hex_command.replace(' ', ''))  # 将16进制命令转换为字节
    ser.write(command_bytes)  # 通过串口发送命令
    response_data = ser.read(21)  # 读取设备响应，21个字节
    return response_data  # 返回响应数据


# 解析温度数据
def parse_temperature(responseForParse):
    if len(responseForParse) < 21:
        raise ValueError("返回数据长度非法")  # 如果返回数据长度不足21字节，抛出异常
    data = responseForParse[3:5]  # 提取温度数据部分
    channel_data = int.from_bytes(data, byteorder='big')  # 将提取的数据转换为整数
    parsed_temperature = channel_data * (100.0 - 0.0) / 65535 + 8.3  # 计算温度值
    return parsed_temperature  # 返回解析后的温度值


# 控制风扇
def control_fan(state):
    if state == 'on':
        command = '03 06 00 02 00 01 E8 28'  # 风扇启动命令
    elif state == 'off':
        command = '03 06 00 03 00 01 B9 E8'  # 风扇关闭命令
    else:
        raise ValueError("非法指令")  # 如果状态不是'on'或'off'，抛出异常
    command_bytes = bytes.fromhex(command.replace(' ', ''))  # 将命令转换为字节
    ser.write(command_bytes)  # 通过串口发送命令
    ser.read(8)  # 读取风扇控制的响应


# 写入数据到文件
def save(result):
    with open('惠欣宇-21030031009.txt', 'a') as file:  # 以追加模式打开文件
        current_time = datetime.now().strftime("%Y-%m-%d,%H:%M:%S")  # 获取当前时间并格式化
        file.write(f"{current_time}; {result:.2f}°C\n")  # 将时间和温度值写入文件


# 主程序循环
try:
    while True:
        response = send_command()  # 发送获取数据的命令并接收响应
        time.sleep(1)  # 等待设备响应1秒
        if response:
            temperature = parse_temperature(response)  # 解析温度数据
            print(f"当前温度值: {temperature:.2f} °C", end=" ")  # 打印当前温度值
            save(temperature)  # 将温度数据保存到文件
            if temperature > 10:
                control_fan('on')  # 如果温度大于10度，打开风扇
                print("打开风扇")
            else:
                control_fan('off')  # 否则，关闭风扇
                print("关闭风扇")

        time.sleep(1)  # 每秒采集一次数据

except KeyboardInterrupt:
    print("程序终止")  # 捕获键盘中断异常，打印终止信息
finally:
    ser.close()  # 关闭串口连接
