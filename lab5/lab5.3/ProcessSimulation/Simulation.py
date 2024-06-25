import serial  # 串口模块
import datetime
import tkinter as tk

root = tk.Tk()  # 创建GUI主窗口
root.title("数据采集")  # 设置主窗口标题为"数据采集"

# 创建框架来显示原始数据和解析后的数据
raw_frame = tk.Frame(root)  # 创建框架用于容纳原始数据
raw_frame.pack(pady=5)
parsed_frame = tk.Frame(root)  # 创建框架用于容纳解析后的数据
parsed_frame.pack(pady=5)

# 原始数据文本框
raw_label = tk.Label(raw_frame, text="WT310返回数据：")
raw_label.grid(row=0, column=0)
raw_data_textbox = tk.Text(raw_frame, height=11, width=113)  # 创建文本框，用于显示原始数据
raw_data_textbox.grid(row=1, column=0)

# 解析后的数据文本框
parsed_label = tk.Label(parsed_frame, text="解析后的数据：")
parsed_label.grid(row=0, column=0)
data_textbox = tk.Text(root, height=11, width=113)  # 创建文本框，用于显示解析后的数据
data_textbox.pack()


# 串口通信设置
ser = serial.Serial('COM6', 9600, timeout=1)  # 打开串口'COM5'，波特率设置为9600，超时时间设置为1秒

# 定义采集次数的超参数，报告中要求采集10次
COLLECTIONS_TIMES = 10


# 从串口获取数据并更新 GUI 的函数
def update_data(count):
    if count <= COLLECTIONS_TIMES:  # 当计数小于等于10时执行以下操作
        data = get_data()  # 获取数据
        raw_data_textbox.insert(tk.END, data + '\n')  # 将原始数据插入原始数据文本框中
        parsed_data = parse_data(data)  # 解析数据
        save_data(parsed_data, data)  # 保存原始数据与解析数据
        data_textbox.insert(tk.END, parsed_data + '\n')  # 将解析后的数据插入解析后的数据文本框中
        data_textbox.see(tk.END)  # 滚动解析后的数据文本框到末尾
        root.after(1000, update_data, count + 1)  # 1秒后递归调用update_data函数，计数加1
    else:
        ser.close()  # 当达到10次后关闭串口


# 从串口获取数据的函数
def get_data():
    ser.write(b'NUMeric:NORMal:VALue?\r\n')  # 发送命令获取数据
    response = ser.readline().decode('utf-8').strip()  # 从串口读取数据并解码为UTF-8格式的字符串，去除两侧空白字符
    print(response)
    print(ser.readline())
    return response  # 返回获取的数据


# 解析数据的函数
def parse_data(data):
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
def save_data(parsed_data, raw_data):
    try:  # 尝试保存数据到文件
        with open('raw_data.txt', 'a') as file:
            file.write(f"{raw_data}\n")  # 写入原始数据
        with open('21030031009.txt', 'a') as file:
            file.write(f"{parsed_data}\n")  # 写入解析后的数据
    except ValueError:  # 如果保存错误
        with open('21030031009.txt', 'a') as file:
            file.write("解析数据时出错.\n")  # 写入错误信息


# 开始数据采集
update_data(1)  # 从1开始计数
root.mainloop()
