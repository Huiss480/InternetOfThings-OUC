import socket
import time


# 解析传感器数据的函数
def parse_sensor_data(response):
    temp = int.from_bytes(response[11:13], byteorder='big') / 10.0
    humidity = int.from_bytes(response[15:17], byteorder='big') / 10.0
    light = int.from_bytes(response[19:21], byteorder='big')
    soil_temp = int.from_bytes(response[23:25], byteorder='big') / 10.0
    co2 = int.from_bytes(response[27:29], byteorder='big')
    return temp, humidity, light, soil_temp, co2


# 写入文件的函数
def write_to_file(data, filename):
    with open(filename, 'a') as file:
        file.write(data + '\n')


def send_control_command(temperature, humidity, illumination, co2_concentration):
    commands = []
    if temperature > 21.9:  # 温度高于21.9打开风机
        commands.append('A1 40 FF FF')  # 打开风扇
    else:
        commands.append('A1 40 00 00')  # 关闭风扇

    if humidity > 45.3:  # 湿度高于45.3%关闭水龙头
        commands.append('A2 40 00 00')  # 关闭水龙头
    else:
        commands.append('A2 40 FF FF')  # 打开水龙头

    if illumination > 5000:  # 照度高于5000开灯
        commands.append('A3 40 FF FF')  # 开灯
    else:
        commands.append('A3 40 00 00')  # 关灯

    if co2_concentration > 425:  # CO2浓度高于425关闭发生器
        commands.append('A4 40 00 00')  # 关闭CO2发生器
    else:
        commands.append('A4 40 FF FF')  # 打开CO2发生器

    command = '15 01 00 00 00 0B 01 10 00 00 00 08 10'
    for i in commands:
        command += i.replace(' ', '')
    s.sendall(bytes.fromhex(command))


# 主函数
ip_address = "192.168.2.3"
port = 10005
filename = "惠欣宇-21030031009.txt"
query_command_hex = "15 01 00 00 00 06 01 03 00 00 00 0A"
query_command = bytes.fromhex(query_command_hex.replace(" ", ""))
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((ip_address, port))
    for i in range(10):
        s.sendall(query_command)
        response = s.recv(1024)
        print(f"返回数据: {response.hex()}")
        temp, humidity, light, soil_temp, co2 = parse_sensor_data(response)
        timestamp = time.strftime("%Y-%m-%d,%H:%M:%S", time.localtime())
        data_line = f"{timestamp}; 温度:{temp}°C; 湿度:{humidity}%RH; 照度:{light}Lux; 土壤温度:{soil_temp}°C; CO2浓度{co2}PPm"
        print(f"{timestamp}; 温度:{temp}°C; 湿度:{humidity}%RH; 照度:{light}Lux; 土壤温度:{soil_temp}°C; CO2浓度{co2}PPm")
        write_to_file(data_line, filename)
        send_control_command(temp, humidity, light, soil_temp, co2)
        time.sleep(1)
