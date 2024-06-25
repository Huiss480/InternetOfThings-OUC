import datetime

# 解析主调函数
def data_parse(fpath):
    with open(fpath, 'r') as file:
        lines = file.readlines()  # 逐行读取文件，存入lines
    for dataLine in lines:
        parsed_data = line_parse(dataLine)  # 解析数据
        save(parsed_data)  # 保存原始数据与解析数据


# 解析数据的函数
def line_parse(data):
    try:  # 尝试解析数据
        voltage, current, power, consumption, frequency, power_factor = map(float, data.split(','))  # 将数据按逗号分割并转换为浮点数
        current_time = datetime.datetime.now().strftime('%Y-%m-%d, %H:%M:%S')  # 获取当前时间
        parsed_data = (
            f"{current_time}: 电压: {voltage} V; 电流: {current} A; 功率: {power} W; 耗电量: {consumption} Wh; 频率: {frequency} Hz; 功率因数: {power_factor}"
        )  # 格式化解析后的数据
        return parsed_data  # 返回解析后的数据
    except ValueError:  # 如果解析错误
        return "解析数据时出错."  # 返回错误信息


# 保存数据到文件的函数
def save(parsed_data):
    try:  # 保存数据
        with open('解析后的数据.txt', 'a') as file:
            file.write(f"{parsed_data}\n")  # 写入解析后的数据
    except ValueError:  # 如果保存错误
        with open('解析后的数据.txt', 'a') as file:
            file.write("解析数据时出错.\n")  # 写入错误信息


file_path = "E:\ouc\IoT\lab4\lab4.3\dataParse\WT310返回数据.txt"
data_parse(file_path)
