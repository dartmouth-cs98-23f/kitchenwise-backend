# Purpose
This module takes an image file (jpg, png, heic, etc.) of a reciept and returns the food items and quantities of such items. There are two implementations of this function for receipt reader, naiveReader and smartReader.

Both functions start with basic image processing to prepare the image. This includes converting the image into a usable format like png, greyscaling, and brightening contrasts between black and white.

Afterwards, naiveReader uses an OCR api called ocrSpace to read the text. NaiveReader is fairly unimpressive and only reads the text without understanding it. So, work from the user is required beforehand to get the best result. They would need to crop the reciept image to include only the food items before they send the image, and this returns a dictionary of the food items with the quantities coming from any duplicate food items. If they do not crop, then the function returns a lot of gibberish as it reads text and returns a dictionary of the whole receipt.

SmartReader does not do this. It calls on OpenAI's Vision API to read and process the image. Essentially, the function calls on chatGPT to extract the food items and quantities from the receipt. Each call costs about 7/10 of a cent to a cent, but the price is worth it since the accuracy of the api is quite high. The function can process complex receipts and returns a dictionary with the food items and quantities.


## Required Python Dependencies
- opencv-python (pip)
- pillow (pip)
- numpy (pip)
- pillow-heif (pip)
- requests
- tempfile
- json
- io
- re (naiveReader)
- base64 (smartReader)
- os (smartReader)
- dotenv (pip; smartReader)


## Usage
When you call the function,

1. [input]: image file (jpg, png, heic, etc.; can support most file types)
2. [output]: dictionary(food items, quantities)


## Example
### Input
testfile = 'images\weirdReceipt2.jpg'

result = parseData(testfile)

for key, value in result.items():
    print(f"Key: {key}, Value: {value}")

### Output
- Key: Qty, Value: 1
- Key: Item, Value: 1
- Key: TYRI, Value: 1
- Key: VINGR SEA, Value: 1
- Key: M+MS, Value: 1
- Key: PEANUT, Value: 1
- Key: JUCY WATER, Value: 1
- Key: LMN/L, Value: 1
- Key: SPRTS, Value: 1
- Key: CHOE BROWNTE, Value: 1
- Key: CPL BEANG EHEESE:, Value: 1
- Key: CP CARRIER BAG, Value: 1

---

### Input
testfile = 'images/grocery-receipt-3.jpg'

result = parseData(testfile)

for key, value in result.items():
    print(f"Key: {key}, Value: {value}")

### Output
- Key: AN 9 GRAIN BREAD, Value: 1
- Key: ND HONEY CURED HAM, Value: 2.54
- Key: TOI TURKEY, Value: 7.06
- Key: DAN 8PK ACTIVA ST/BL, Value: 4.49
- Key: EGGLND LG WHT EGG, Value: 3.59
- Key: ANG TOP RD LND BRL, Value: 5.49
- Key: TOTE GALA APPLES, Value: 4.80 lb
- Key: BANANAS, Value: 2.18 lb
- Key: GREEN CUCUMBERS, Value: 2
- Key: BULK GARLIC, Value: 1
- Key: RED TOMATOES ON VINE, Value: 1.33 lb
- Key: YELLOW ONIONS, Value: 1.63 lb
- Key: GREEN BELL PEPPERS, Value: 0.63 lb
- Key: FRESH TILAPIA FILLET, Value: 4.13

<br>

*SmartReader is a lot more robust.*
