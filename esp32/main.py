from machine import Pin, I2C
import ssd1306
from time import sleep
import network
import urequests
import time
import connectWIFI
import ubluetooth
import gc

def beacon():
    ble = ubluetooth.BLE()
    ble.active(True)
    ble.gap_advertise(100)
    print("BLE Beacon started")
    
def printQR(matrix):
    for y in range(len(matrix)*2):
        for x in range(len(matrix[0])*2):
            value = not matrix[int(y/2)][int(x/2)]
            screen.pixel(x, y, value)


connectWIFI.connect()


# ESP32 Pin assignment
i2c = I2C(-1, scl=Pin(22), sda=Pin(21))

# ESP8266 Pin assignment
#i2c = I2C(-1, scl=Pin(5), sda=Pin(4))



mat = urequests.get("https://starlordb.pythonanywhere.com/getMatrix")

matrix = mat.json()["matrix"]
mat.close()

oled_width = 128
oled_height = 64
screen = ssd1306.SSD1306_I2C(oled_width, oled_height, i2c)
screen.poweron()
screen.contrast(10)



printQR(matrix)
screen.show()
gc.collect()
beacon()

