import requests
import json
import re
TEST_FILENAME = 'images\walmartReceipt_cropped.png'


# API
# The api key is free to get, so just sign up on ocr space to get yours.
def ocr_space_file(filename, overlay=False, api_key='K85707808888957', language='eng'):
    """ OCR.space API request with local file.
    :param filename: Your file path & name.
    :param overlay: Is OCR.space overlay required in your response.
                    Defaults to False.
    :param api_key: OCR.space API key.
                    Defaults to 'helloworld'.
    :param language: Language code to be used in OCR.
                    List of available language codes can be found on https://ocr.space/OCRAPI
                    Defaults to 'en'.
    :return: Result in JSON format.
    """

    payload = {'isOverlayRequired': False,
               'apikey': api_key,
               'detectOrientation': True,               
               'scale': True,
               'isTable': True,
               'OCREngine': 2,
               'language': language,
               }
    
    with open(filename, 'rb') as f:
        r = requests.post('https://api.ocr.space/parse/image',
                          files={filename: f},
                          data=payload,
                          )
        
    return r.content.decode()


# Results
def parseData(filename):
    filename = ocr_space_file(filename=TEST_FILENAME)

    try:
        data = json.loads(filename)
    except json.JSONDecodeError as e:
        print(f"Error occurred: {e}")

    result = data['ParsedResults'][0]['ParsedText']

    # Split on any combination of \t, \r, and \n characters
    # This also filters out empty strings automatically
    words = re.split(r'[\t\r\n]+', result)

    # Filter out words that begin with a digit
    filtered_words = [word for word in words if word and not word[0].isdigit()]

    # Count occurrences of each word in a dictionary
    word_counts = {}
    for word in filtered_words:
        if word in word_counts:
            word_counts[word] += 1
        else:
            word_counts[word] = 1

    # The word_counts dictionary now contains the words (excluding those that begin with a digit) as keys,
    # and the number of occurrences as values.
    print(word_counts)


parseData(TEST_FILENAME)
