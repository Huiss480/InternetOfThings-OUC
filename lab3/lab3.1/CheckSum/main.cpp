#include <cstdio>
#include <cstdlib>


unsigned char *getCheckSum(const unsigned char *string, int length) {
    int sum = 0;  // 字符的ASCII码值的总和
    int i = 0;
    for (; i<length; i++) {  // 计算总和部分
        sum += string[i];
    }
    unsigned short result = sum % 65536;  // 对字符总和模65536得到一个16位中间结果 result
    result = result ^ 0xFFFF;  // 将中间结果与 0xFFFF 进行异或操作
    result += 1;  // 再将中间结果加 1
    // unsigned char checkSum[2];
    auto *checkSum = (unsigned char *)malloc(2 * sizeof(unsigned char));  // 这里更改校验和的定义，静态变量以保持其在函数调用后的值
    if (checkSum == nullptr) {  // 检查内存分配是否成功，失败则执行
        printf("内存分配失败！\n");
        exit(1);
    }
    checkSum[0] = result >> 8;  // 将16位中间结果的高 8 位存储在检验和的第一个字节
    checkSum[1] = result;  // 将16位中间结果的低 8 位存储在校验和的第二个字节
    return checkSum;  // 返回指向校验和数组的指针
}

int main() {
    setbuf(stdout,nullptr);  // Debug时显示printf
    while (true) {
        printf("---------------------\n");
        printf("生成校验和\n");
        printf("---------------------\n");
        printf("选择要校验字符的格式\n");
        printf("1、普通字符串校验\n");
        printf("2、16进制字符串校验\n");
        printf("---------------------\n");
        printf("请选择1或者2:");
        int flag;
        scanf_s("%d", &flag);
        if (flag == 1) {
            printf("\t《普通字符串校验！》\n");
            unsigned char str[1024];
            int i = 0;
            getchar();
            printf("请输入需要校验的字符串，以回车结束:\n");
            while ((str[i] = getchar()) != '\n') {
                i++;
            }
            unsigned char *a = getCheckSum(str, i);  // 计算校验和
            printf("CheckSum result is:%X %X\n\n", a[0], a[1]);
            free(a);
        } else if (flag == 2) {
            printf("\t《16进制字符串校验！》\n");
            unsigned char a[100];
            int n, i;
            printf("请输入字节的数量: ");
            scanf_s("%d", &n);//输入个数
            printf("请输入需要校验的字节，以空格分开，回车结束：\n");
            for (i = 0; i<n; i++)
                scanf_s("%x", &a[i]);
            printf("CheckSum result is: %X %X\n\n", getCheckSum(a, n)[0], getCheckSum(a, n)[1]);
        } else {
            printf("选择有误\n");
        }
    }
    return 0;
}

