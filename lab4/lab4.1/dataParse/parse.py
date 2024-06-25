def data_parse(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()  # 逐行读取文件，存入lines
    i = 1
    for line in lines:
        line = line.split()
        hexstring = line[3]+line[4]
        num = hex_string_to_hex_number(hexstring)
        I = (num * 16) / 65535 + 4
        T = (num * 100) / 65535 + 0
        print(f"组号{i}")
        print("通道数据为：0x" + hexstring)
        print("电流值为：" + '{:.3f}'.format(I))
        print("温度值为：" + '{:.3f}'.format(T))
        print()
        i = i + 1

def hex_string_to_hex_number(hex_string):
    hex_number = 0
    power = len(hex_string) - 1
    for digit in hex_string:
        if digit.isdigit():
            hex_number += int(digit) * (16 ** power)
        else:
            # 将字符转换为对应的十六进制数字
            hex_number += (ord(digit.upper()) - ord('A') + 10) * (16 ** power)
        power -= 1
    return hex_number


file_path = "E:\ouc\IoT\lab4\lab4.1\dataParse\PT100数据返回.txt"
data_parse(file_path)
