a = [x for x in range(2000,3201) if (x%7==0 and x%5!=0)]
print(",".join(str(x)for x in a))
x = int(input("nhap 1 so"))
for i in range(1,11):
    print(f'{x}x{i}={x*i}')