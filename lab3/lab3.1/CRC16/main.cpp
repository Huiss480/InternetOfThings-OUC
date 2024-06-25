#include <cstdio>
#include <cstdlib>

// 反转8位数据的位序
void InvertUint8(unsigned char *dBuf, const unsigned char *srcBuf) {
    int i;
    unsigned char tmp[4];
    tmp[0] = 0;
    for (i = 0; i < 8; i++) {  // 遍历8位数据
        if (srcBuf[0] & (1 << i))  // 如果srcBuf的当前位为1，则将对应的tmp位设置为1
            tmp[0] |= 1 << (7 - i);
    }
    dBuf[0] = tmp[0];
}

// 反转16位数据的位序
void InvertUint16(unsigned short *dBuf, const unsigned short *srcBuf) {
    int i;
    unsigned short tmp[4];
    tmp[0] = 0;
    for (i = 0; i < 16; i++)  {  // 遍历16位数据
        if (srcBuf[0] & (1 << i))  // 如果srcBuf的当前位为1，则将对应的tmp位设置为1
            tmp[0] |= 1 << (15 - i);
    }
    dBuf[0] = tmp[0];
}

// 计算CRC16_MODBUS校验码
unsigned char* CRC16_MODBUS(unsigned char *puchMsg, unsigned int usDataLen) {
    unsigned short wCRCin = 0xFFFF;  // 初始寄存器使用全1
    unsigned short wCPoly = 0x8005;  // 多项式
    unsigned char wChar = 0;
    while (usDataLen--) {  // 遍历数据长度
        wChar = *(puchMsg++);
        InvertUint8(&wChar, &wChar);  // 反转8位数据的位序
        wCRCin ^= (wChar << 8);  // 左移八位扩充至十六位
        int i = 0;
        for (; i < 8; i++) {  // 循环8次，对CRC进行计算
            if (wCRCin & 0x8000)
                wCRCin = (wCRCin << 1) ^ wCPoly;  // 左移一位并进行异或运算
            else
                wCRCin = wCRCin << 1;  // 左移一位
        }
    }
    InvertUint16(&wCRCin, &wCRCin);  // 反转16位数据的位序
    // unsigned char result[2];
    auto *result = (unsigned char *)malloc(2 * sizeof(unsigned char));  // 分配内存
    if (result == nullptr) {  // 内存分配失败提示
        printf("内存分配失败！\n");
        exit(1);
    }
    result[1] = wCRCin >> 8;  // 高8位
    result[0] = wCRCin;       // 低8位
    return result;
}

// 主函数
int main()
{
    setbuf(stdout, nullptr);  // 设置输出缓冲区
    while (true)              // 循环直到用户选择退出
    {
        printf("---------------------\n");
        printf("生成CRC16校验码\n");
        printf("---------------------\n");
        printf("选择要校验字符的格式\n");
        printf("1、普通字符串校验\n");
        printf("2、16进制字符串校验\n");
        printf("---------------------\n");
        printf("请选择1或者2:");
        int flag;
        scanf_s("%d", &flag);  // 获取用户选择

        if (flag == 1)
        {
            printf("\t《普通字符串校验！》\n");
            unsigned char str[1024];
            int i = 0;
            getchar();  // 清除缓冲区
            printf("请输入需要校验的字符串，以回车结束:\n");
            // 读取用户输入的字符串
            while ((str[i] = getchar()) != '\n')
            {
                i++;
            }
            // 计算CRC16_MODBUS校验码并打印结果
            unsigned char *a = CRC16_MODBUS(str, i);
            printf("CRC16 result is:%X %X\n\n", a[0], a[1]);
            free(a);  // 释放内存
        }
        else if (flag == 2)
        {
            printf("\t《16进制字符串校验！》\n");
            unsigned char a[100];
            int n, i;
            printf("请输入字节的数量: ");
            scanf_s("%d", &n);  // 获取字节数量
            printf("请输入需要校验的字节，以空格分开，回车结束：\n");
            // 读取用户输入的16进制字节
            for (i = 0; i < n; i++)
                scanf_s("%x", &a[i]);
            // 计算CRC16_MODBUS校验码并打印结果
            printf("CRC16 result is: %X %X\n\n", CRC16_MODBUS(a, n)[0], CRC16_MODBUS(a, n)[1]);
        }
        else
        {
            printf("选择有误\n");  // 提示选择错误
        }
    }
    return 0;  // 程序正常结束
}
